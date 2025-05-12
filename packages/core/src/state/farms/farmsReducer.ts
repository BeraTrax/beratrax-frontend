import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Address, erc20Abi, getAddress, getContract } from "viem";
import { RootState } from "..";
import { getPricesOfLpByTimestamp } from "../tokens/tokensReducer";
import { getEarnings, getEarningsForPlatforms } from "./../../api/farms";
import farmFunctions from "./../../api/pools";
import VaultAbi from "./../../assets/abis/vault.json";
import { IS_LEGACY } from "./../../config/constants";
import { CHAIN_ID } from "./../../types/enums";
import { FarmOriginPlatform, FarmTransactionType } from "./../../types/enums";
import { sleep, toEth } from "./../../utils/common";
import {
	Earnings,
	FarmDetailInputOptions,
	FarmDetails,
	FetchEarningsAction,
	FetchFarmDetailsAction,
	StateInterface,
	VaultEarnings,
	VaultEarningsProp,
} from "./types";

const initialState: StateInterface = {
	farmDetails: {},
	isLoading: true,
	isFetched: false,
	account: "",
	earnings: {},
	earningsUsd: null,
	vaultEarnings: [],
	isLoadingEarnings: false,
	isLoadingVaultEarnings: false,
	isVaultEarningsFirstLoad: true,
	farmDetailInputOptions: {
		transactionType: FarmTransactionType.Deposit,
		showInUsd: true,
		currencySymbol: "BERA",
		bestFunctionNameForArberaHoney: "",
		simulatedSlippage: 0,
	},
	error: null,
};

export const updateFarmDetails = createAsyncThunk(
	"farms/updateFarmDetails",
	async ({ currentWallet, farms, totalSupplies, balances, prices, decimals, getPublicClient }: FetchFarmDetailsAction, thunkApi) => {
		if (!currentWallet) return;
		try {
			const data: FarmDetails = {};
			farms
				.filter((farm) => farm.originPlatform !== FarmOriginPlatform.Core)
				.forEach((farm) => {
					data[farm.id] = farmFunctions[farm.id]?.getProcessedFarmData(
						balances,
						prices,
						decimals,
						totalSupplies[farm.chainId][farm.vault_addr]?.supplyWei
					);
				});

			return { data, currentWallet };
		} catch (error) {
			console.error(error);
			return thunkApi.rejectWithValue(error instanceof Error ? error.message : "Failed to fetch farm details");
		}
	}
);

export const updateEarnings = createAsyncThunk(
	"farms/updateEarnings",
	async ({ currentWallet, farms, decimals, prices, balances, totalSupplies, getPublicClient }: FetchEarningsAction, thunkApi) => {
		try {
			await sleep(6000);
			const earnHistory = await getEarnings(currentWallet);
			if (!earnHistory) {
				// throw new Error("No data");
				return thunkApi.rejectWithValue("");
			}

			const calculatedEarnings: Earnings = {};
			const balancesPromises: Promise<bigint>[] = [];
			const withdrawableLpAmount: { [farmId: number]: string } = {};
			farms.forEach((farm) => {
				balancesPromises.push(
					getContract({
						address: farm.vault_addr as Address,
						abi: VaultAbi.abi,
						client: {
							public: getPublicClient(farm.chainId),
						},
					}).read.totalAssets() as Promise<bigint>
				);

				balancesPromises.push(
					getContract({
						address: farm.lp_address as Address,
						abi: erc20Abi,
						client: {
							public: getPublicClient(farm.chainId),
						},
					}).read.balanceOf([farm.vault_addr as Address]) as Promise<bigint>
				);
			});
			const vaultBalancesResponse = await Promise.all(balancesPromises);
			for (let i = 0; i < vaultBalancesResponse.length; i += 2) {
				const balance = vaultBalancesResponse[i];
				const lpTokenBalance = vaultBalancesResponse[i + 1];

				let expectedLpAmount = balance * BigInt(balances[farms[i / 2].chainId][farms[i / 2].vault_addr].valueWei);

				if (totalSupplies[farms[i / 2].chainId][farms[i / 2].vault_addr]?.supplyWei !== "0")
					expectedLpAmount = expectedLpAmount / BigInt(totalSupplies[farms[i / 2].chainId][farms[i / 2].vault_addr]?.supplyWei);
				if (lpTokenBalance < expectedLpAmount) {
					const withdrawableAmount = expectedLpAmount - lpTokenBalance;
					const balanceAfterWithdraw = lpTokenBalance + withdrawableAmount;
					const actualWithdrawDiff = balanceAfterWithdraw - lpTokenBalance;
					if (actualWithdrawDiff < withdrawableAmount) {
						expectedLpAmount = lpTokenBalance + actualWithdrawDiff;
					}
				}
				withdrawableLpAmount[farms[i / 2].id] = expectedLpAmount.toString();
			}
			earnHistory.forEach((item) => {
				const farm = farms.find((farm) => farm.id === Number(item.tokenId));
				if (farm) {
					const earnedTokens = BigInt(item.withdraw) + BigInt(withdrawableLpAmount[farm.id]) - BigInt(item.deposit);
					calculatedEarnings[farm.id] =
						Number(toEth(earnedTokens, decimals[farm.chainId][farm.lp_address])) * prices[farm.chainId][farm.lp_address]!;
					if (calculatedEarnings[farm.id] < 0.0001) calculatedEarnings[farm.id] = 0;
				}
			});

			thunkApi.dispatch(getPricesOfLpByTimestamp({ farms, lpData: earnHistory }));
			return { calculatedEarnings, currentWallet };
		} catch (error) {
			console.error(error);
			return thunkApi.rejectWithValue(error instanceof Error ? error.message : "Failed to fetch earnings");
		}
	}
);

export const selectBalances = (state: RootState) => state.tokens.balances;

export const getVaultEarnings = createAsyncThunk(
	"farms/getVaultEarnings",
	async ({ currentWallet, prices, decimals }: VaultEarningsProp, thunkApi) => {
		try {
			let balances = selectBalances(thunkApi.getState() as RootState);
			if (
				!balances ||
				Object.keys(balances).length === 0 ||
				Object.values(balances).some((chain) => Array.isArray(chain) && chain.length === 0)
			)
				return;

			const earnings = await getEarningsForPlatforms(currentWallet);
			const earningsUsd = earnings
				.filter((earning) => Number(earning.earnings0) > 0 || Number(earning.changeInAssets) > 0)
				.reduce((acc, curr) => {
					const price0 = prices[CHAIN_ID.BERACHAIN][getAddress(curr.token0 as Address)];
					const earnings0 = Number(toEth(BigInt(curr.earnings0), decimals[CHAIN_ID.BERACHAIN][getAddress(curr.token0 as Address)]));
					let totalEarnings = earnings0 * price0;
					// Only calculate for token1 and earnings1 if they exist
					if (curr.token1 && curr.earnings1) {
						const price1 = prices[CHAIN_ID.BERACHAIN][getAddress(curr.token1 as Address)];
						const earnings1 = Number(toEth(BigInt(curr.earnings1), decimals[CHAIN_ID.BERACHAIN][getAddress(curr.token1 as Address)]));
						totalEarnings += earnings1 * price1;
					}
					if (curr.changeInAssets) {
						const changeAssetValue = Number(toEth(BigInt(curr.changeInAssets)));
						const assetPrice = prices[CHAIN_ID.BERACHAIN][getAddress(curr.token0 as Address)];
						totalEarnings += changeAssetValue * assetPrice;
					}

					return acc + totalEarnings;
				}, 0);

			return { earnings, earningsUsd };
		} catch (error) {
			console.error(error);
			return thunkApi.rejectWithValue(error instanceof Error ? error.message : "Failed to fetch vault earnings");
		}
	}
);

const farmsSlice = createSlice({
	name: "farms",
	initialState: initialState,
	reducers: {
		setAccount(state, action: { payload: string }) {
			state.account = action.payload;
		},
		setFarmDetailInputOptions(state, action: { payload: Partial<FarmDetailInputOptions> }) {
			state.farmDetailInputOptions = { ...state.farmDetailInputOptions, ...action.payload };
			if (IS_LEGACY) state.farmDetailInputOptions.transactionType = FarmTransactionType.Withdraw;
		},
		reset(state) {
			state.farmDetails = {};
			state.isLoading = false;
			state.isFetched = false;
			state.account = "";
		},
		setCurrencySymbol(state, action: { payload: string }) {
			state.farmDetailInputOptions.currencySymbol = action.payload;
		},
		setBestFunctionNameForArberaHoney(state, action: { payload: string }) {
			state.farmDetailInputOptions.bestFunctionNameForArberaHoney = action.payload;
		},
		setSimulatedSlippage(state, action: { payload: number }) {
			state.farmDetailInputOptions.simulatedSlippage = action.payload;
		},
	},
	extraReducers(builder) {
		builder.addCase(updateFarmDetails.pending, (state) => {
			state.isLoading = true;
		});
		builder.addCase(updateFarmDetails.fulfilled, (state, action) => {
			state.isLoading = false;
			state.isFetched = true;
			state.farmDetails = { ...action.payload!.data };
			state.account = action.payload!.currentWallet;
		});
		builder.addCase(updateFarmDetails.rejected, (state, action) => {
			state.isLoading = false;
			state.isFetched = false;
			state.farmDetails = {};
			state.error = action.payload as string;
		});
		builder.addCase(getVaultEarnings.pending, (state) => {
			if (!state.vaultEarnings.length) state.isVaultEarningsFirstLoad = true;
			state.isLoadingVaultEarnings = true;
		});
		builder.addCase(getVaultEarnings.fulfilled, (state, action) => {
			state.vaultEarnings = action.payload?.earnings as VaultEarnings[];
			state.earningsUsd = action.payload?.earningsUsd as number;
			state.isLoadingVaultEarnings = false;
			state.isVaultEarningsFirstLoad = false;
		});
		builder.addCase(getVaultEarnings.rejected, (state, action) => {
			state.vaultEarnings = [];
			state.isLoadingVaultEarnings = false;
			state.isVaultEarningsFirstLoad = false;
			state.error = action.payload as string;
		});
		builder.addCase(updateEarnings.pending, (state) => {
			state.isLoadingEarnings = true;
		});
		builder.addCase(updateEarnings.fulfilled, (state, action) => {
			state.earnings = { ...action.payload.calculatedEarnings };
			state.account = action.payload.currentWallet;
			state.isLoadingEarnings = false;
		});
		builder.addCase(updateEarnings.rejected, (state, action) => {
			state.earnings = {};
			state.isLoadingEarnings = false;
			state.error = action.payload as string;
		});
	},
});

export const { reset, setAccount, setFarmDetailInputOptions, setCurrencySymbol, setBestFunctionNameForArberaHoney, setSimulatedSlippage } =
	farmsSlice.actions;

export default farmsSlice.reducer;
