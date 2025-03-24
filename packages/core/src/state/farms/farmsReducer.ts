import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Address, erc20Abi, getContract } from "viem";
import { RootState } from "..";
import { getPricesOfLpByTimestamp } from "../tokens/tokensReducer";
import { getEarnings, getEarningsForPlatforms } from "./../../api/farms";
import farmFunctions from "./../../api/pools";
import VaultAbi from "./../../assets/abis/vault.json";
import { IS_LEGACY } from "./../../config/constants";
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
} from "./types";

const initialState: StateInterface = {
  farmDetails: {},
  isLoading: true,
  isFetched: false,
  account: "",
  earnings: {},
  vaultEarnings: [],
  isLoadingEarnings: false,
  isLoadingVaultEarnings: false,
  isVaultEarningsFirstLoad: false,
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
  async (
    { currentWallet, farms, totalSupplies, balances, prices, decimals, getPublicClient }: FetchFarmDetailsAction,
    thunkApi,
  ) => {
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
            totalSupplies[farm.chainId][farm.vault_addr].supplyWei,
          );
        });

      return { data, currentWallet };
    } catch (error) {
      console.error(error);
      return thunkApi.rejectWithValue(error instanceof Error ? error.message : "Failed to fetch farm details");
    }
  },
);

export const updateEarnings = createAsyncThunk(
  "farms/updateEarnings",
  async (
    { currentWallet, farms, decimals, prices, balances, totalSupplies, getPublicClient }: FetchEarningsAction,
    thunkApi,
  ) => {
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
          }).read.totalAssets() as Promise<bigint>,
        );

        balancesPromises.push(
          getContract({
            address: farm.lp_address as Address,
            abi: erc20Abi,
            client: {
              public: getPublicClient(farm.chainId),
            },
          }).read.balanceOf([farm.vault_addr as Address]) as Promise<bigint>,
        );
      });
      const vaultBalancesResponse = await Promise.all(balancesPromises);
      for (let i = 0; i < vaultBalancesResponse.length; i += 2) {
        const balance = vaultBalancesResponse[i];
        const lpTokenBalance = vaultBalancesResponse[i + 1];

        let expectedLpAmount = balance * BigInt(balances[farms[i / 2].chainId][farms[i / 2].vault_addr].valueWei);

        if (totalSupplies[farms[i / 2].chainId][farms[i / 2].vault_addr].supplyWei !== "0")
          expectedLpAmount =
            expectedLpAmount / BigInt(totalSupplies[farms[i / 2].chainId][farms[i / 2].vault_addr].supplyWei);
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
            Number(toEth(earnedTokens, decimals[farm.chainId][farm.lp_address])) *
            prices[farm.chainId][farm.lp_address]!;
          if (calculatedEarnings[farm.id] < 0.0001) calculatedEarnings[farm.id] = 0;
        }
      });

      thunkApi.dispatch(getPricesOfLpByTimestamp({ farms, lpData: earnHistory }));
      return { calculatedEarnings, currentWallet };
    } catch (error) {
      console.error(error);
      return thunkApi.rejectWithValue(error instanceof Error ? error.message : "Failed to fetch earnings");
    }
  },
);

export const selectBalances = (state: RootState) => state.tokens.balances;

export const getVaultEarnings = createAsyncThunk("farms/getVaultEarnings", async (currentWallet: string, thunkApi) => {
  try {
    let balances = selectBalances(thunkApi.getState() as RootState);
    if (
      !balances ||
      Object.keys(balances).length === 0 ||
      Object.values(balances).some((chain) => Array.isArray(chain) && chain.length === 0)
    )
      return;

    const earnings = await getEarningsForPlatforms(currentWallet);
    return earnings;
  } catch (error) {
    console.error(error);
    return thunkApi.rejectWithValue(error instanceof Error ? error.message : "Failed to fetch vault earnings");
  }
});

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
      state.vaultEarnings = action.payload as VaultEarnings[];
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

export const {
  reset,
  setAccount,
  setFarmDetailInputOptions,
  setCurrencySymbol,
  setBestFunctionNameForArberaHoney,
  setSimulatedSlippage,
} = farmsSlice.actions;

export default farmsSlice.reducer;
