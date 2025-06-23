import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Abi, Address, erc20Abi, getAddress, getContract } from "viem";
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
				.filter((farm) => farm.originPlatform !== FarmOriginPlatform.Core.name)
				.forEach((farm) => {
					data[farm.id] = farmFunctions[farm.id]?.getProcessedFarmData(
						balances,
						prices,
						decimals,
						totalSupplies[farm.chainId][farm.vault_addr].supplyWei
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
			const earnHistory = await getEarnings(currentWallet);

			if (!earnHistory) return thunkApi.rejectWithValue("");
			if (!farms || farms.length === 0) return { calculatedEarnings: {}, currentWallet };

			const calculatedEarnings: Earnings = {};
			const withdrawableLpAmount: { [farmId: number]: string } = {};

			// --- Refactor using multicall ---
			// Assuming all farms in the 'farms' array are for the same chain,
			// or getPublicClient handles the context appropriately.
			// If farms can be on different chains, grouping by chainId and making separate multicalls is needed.
			const representativeChainId = farms[0].chainId; // Use chainId from the first farm for the client
			const publicClient = getPublicClient(representativeChainId);

			const multicallContracts = farms.flatMap(
				(farm) =>
					[
						{
							address: farm.vault_addr,
							abi: VaultAbi.abi as Abi, // This will now use the 'as const' typed ABI
							functionName: "totalAssets",
						},
						{
							address: farm.lp_address,
							abi: erc20Abi as Abi, // erc20Abi from viem is already correctly typed
							functionName: "balanceOf",
							args: [farm.vault_addr],
						},
					] as const
			); // Added 'as const' here too for the array of contract calls, ensuring readonly properties

			const multicallResults = await publicClient.multicall({
				contracts: multicallContracts, // This should now satisfy the type checker
				allowFailure: true, // Important: allows individual calls to fail without failing the whole batch
			});

			// Process multicall results
			for (let i = 0; i < farms.length; i++) {
				const farm = farms[i];
				const totalAssetsResult = multicallResults[i * 2];
				const balanceOfVaultResult = multicallResults[i * 2 + 1];

				if (totalAssetsResult.status === "success" && balanceOfVaultResult.status === "success") {
					const balance = totalAssetsResult.result as bigint; // totalAssets
					const lpTokenBalance = balanceOfVaultResult.result as bigint; // balanceOf vault in LP token

					let expectedLpAmount = balance * BigInt(balances[farm.chainId][farm.vault_addr].valueWei);

					const totalSupplyWei = totalSupplies[farm.chainId][farm.vault_addr]?.supplyWei;
					if (totalSupplyWei && totalSupplyWei !== "0") {
						expectedLpAmount = expectedLpAmount / BigInt(totalSupplyWei);
					} else if (totalSupplyWei === "0") {
						// Handle division by zero if supplyWei is "0"
						// This case might imply that expectedLpAmount should be 0 or handled differently
						// For now, let's assume if supply is 0, expectedLpAmount remains as calculated before division,
						// or set it to 0 if that makes more sense in your logic.
						// This depends on the exact meaning of totalSupplies and its use.
						// If totalAssets is non-zero but totalSupply is zero, it's an odd state.
						// Let's assume for now if supply is 0, expectedLpAmount is effectively the 'balance' itself
						// if valueWei represents a 1:1 share, or it might mean 0 if no shares exist.
						// The original code implies division, so if supplyWei is "0", this needs careful thought.
						// For safety, if totalSupplyWei is "0", let's avoid division by zero.
						// If balance is also 0, expectedLpAmount is 0. If balance > 0 but supply is 0,
						// this is an edge case. Let's assume expectedLpAmount is 0 if supply is 0 and balance > 0.
						if (balance > 0n && totalSupplyWei === "0") {
							expectedLpAmount = 0n; // Or handle as per your business logic for this edge case
						} else if (balance === 0n) {
							expectedLpAmount = 0n;
						}
						// If balance > 0 and totalSupplyWei is undefined or not "0", the division happens above.
					}

					if (lpTokenBalance < expectedLpAmount) {
						const withdrawableAmount = expectedLpAmount - lpTokenBalance;
						// The following logic seems to adjust expectedLpAmount based on a potential withdrawal.
						// This part of your original logic is preserved:
						const balanceAfterWithdraw = lpTokenBalance + withdrawableAmount;
						const actualWithdrawDiff = balanceAfterWithdraw - lpTokenBalance;
						if (actualWithdrawDiff < withdrawableAmount) {
							expectedLpAmount = lpTokenBalance + actualWithdrawDiff;
						}
					}
					withdrawableLpAmount[farm.id] = expectedLpAmount.toString();
				} else {
					console.error(`Failed to fetch data for farm ${farm.id} (Vault: ${farm.vault_addr}).`);
					if (totalAssetsResult.status === "failure") {
						console.error(` - totalAssets call failed:`, totalAssetsResult.error);
					}
					if (balanceOfVaultResult.status === "failure") {
						console.error(` - balanceOf(vault) call failed:`, balanceOfVaultResult.error);
					}
					// Decide how to handle this farm: skip, set earnings to 0, etc.
					// For now, if data is missing, withdrawableLpAmount won't be set,
					// and thus this farm might not appear in calculatedEarnings or have 0.
					withdrawableLpAmount[farm.id] = "0"; // Default to 0 if calls failed
				}
			}
			// --- End of multicall refactor ---

			earnHistory.forEach((item) => {
				const farm = farms.find((farm) => farm.id === Number(item.tokenId));
				if (farm) {
					const farmWithdrawableLp = withdrawableLpAmount[farm.id];
					if (farmWithdrawableLp === undefined) {
						// This case should ideally be handled above by defaulting to "0" or skipping.
						console.warn(`Withdrawable LP amount not found for farm ${farm.id}, skipping earnings calculation.`);
						calculatedEarnings[farm.id] = 0;
						return;
					}

					const earnedTokens = BigInt(item.withdraw) + BigInt(farmWithdrawableLp) - BigInt(item.deposit);
					const farmDecimals = decimals[farm.chainId]?.[farm.lp_address];
					const farmPrice = prices[farm.chainId]?.[farm.lp_address];

					if (farmDecimals !== undefined && farmPrice !== undefined) {
						calculatedEarnings[farm.id] = Number(toEth(earnedTokens, farmDecimals)) * farmPrice;
						if (calculatedEarnings[farm.id] < 0.0001) {
							calculatedEarnings[farm.id] = 0;
						}
					} else {
						console.warn(`Decimals or price not found for farm ${farm.id} (LP: ${farm.lp_address}), setting earnings to 0.`);
						calculatedEarnings[farm.id] = 0;
					}
				}
			});

			// Existing dispatch
			thunkApi.dispatch(getPricesOfLpByTimestamp({ farms, lpData: earnHistory }));

			return { calculatedEarnings, currentWallet };
		} catch (error) {
			console.error("Error in updateEarnings thunk:", error);
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
