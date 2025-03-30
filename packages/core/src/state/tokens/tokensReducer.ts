import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Address, erc20Abi, formatUnits, getAddress, getContract, parseAbi, zeroAddress } from "viem";
import { getPricesByTime, getTokenPricesBackend } from "core/src/api/token";
import rewardVaultAbi from "core/src/assets/abis/rewardVaultAbi";
import { Common_Chains_State, pools_chain_ids } from "core/src/config/constants/pools_json";
import tokens from "core/src/config/constants/tokens";
import { RootState } from "core/src/state";
import { CHAIN_ID } from "core/src/types/enums";
import { formatCurrency } from "core/src/utils/common";
import {
  Balances,
  Decimals,
  GetOldPricesActionPayload,
  StateInterface,
  TotalSupplies,
  UpdateBalancesActionPayload,
  UpdateDecimalsActionPayload,
  UpdateTotalSuppliesActionPayload,
} from "./types";

const initialState: StateInterface = {
  // Chain-specific data
  prices: Common_Chains_State,
  balances: Common_Chains_State,
  totalSupplies: Common_Chains_State,
  decimals: Common_Chains_State,
  oldPrices: {},

  // Prices states
  isPricesLoading: false,
  isPricesFetched: false,
  isFetchingOldPrices: false,
  isLoadedOldPrices: false,
  pricesError: null,
  oldPricesError: null,

  // Balances states
  isBalancesLoading: false,
  isBalancesFetched: false,
  balancesError: null,

  // Total supplies states
  isTotalSuppliesLoading: false,
  isTotalSuppliesFetched: false,
  totalSuppliesError: null,

  // Decimals states
  isDecimalsLoading: false,
  isDecimalsFetched: false,
  decimalsError: null,
};

export const updatePrices = createAsyncThunk("prices/updatePrices", async (_, thunkApi) => {
  try {
    const data = await getTokenPricesBackend();
    // ----------------- Fix BeraChain price of zero address -----------------
    // TODO: fix this on backend
    if (
      data &&
      data?.[CHAIN_ID.BERACHAIN] &&
      data?.[CHAIN_ID.BERACHAIN]?.["0x6969696969696969696969696969696969696969"]
    ) {
      // wBERA
      data[CHAIN_ID.BERACHAIN]["0x0000000000000000000000000000000000000000"] =
        data?.[CHAIN_ID.BERACHAIN]?.["0x6969696969696969696969696969696969696969"];
      // BGT
      data[CHAIN_ID.BERACHAIN]["0x656b95E550C07a9ffe548bd4085c72418Ceb1dba"] =
        data?.[CHAIN_ID.BERACHAIN]?.["0x6969696969696969696969696969696969696969"];
      // BTX
      data[CHAIN_ID.BERACHAIN]["0xAE24e5B7E669E87D88c5CD02Bcbb7DeF001A2612"] = 0.000001;
    }
    return data;
  } catch (error) {
    console.log("Price unable to fetch");
    console.error(error);
    return thunkApi.rejectWithValue(error instanceof Error ? error.message : "Failed to fetch prices");
  }
});

export const getPricesOfLpByTimestamp = createAsyncThunk(
  "prices/getOldPrices",
  async ({ lpData, farms }: GetOldPricesActionPayload, thunkApi) => {
    try {
      // ----------------- Find Lp Addresses of given lpData -----------------
      const lps = lpData
        .map((lp) => ({
          ...lp,
          address: farms.find((farm) => farm.id === Number(lp.tokenId))?.vault_addr!,
          chainId: farms.find((farm) => farm.id === Number(lp.tokenId))?.chainId!,
        }))
        .filter((item) => !!item.chainId);

      const res = await getPricesByTime(
        lps.map((item) => ({
          address: item.address,
          chainId: item.chainId,
          timestamp: Number(item.blockTimestamp),
        })),
      );
      return res;
    } catch (error) {
      console.error("Error in getPricesOfLpByTimestamp", error);
      return thunkApi.rejectWithValue(error instanceof Error ? error.message : "Failed to fetch old prices");
    }
  },
);

// Selector to get prices
export const selectPrices = (state: RootState) => state.tokens.prices;

export const fetchBalances = createAsyncThunk(
  "balances/fetchBalances",
  async ({ farms, getPublicClient, account }: UpdateBalancesActionPayload, thunkApi) => {
    try {
      // Get prices from state first
      let prices = selectPrices(thunkApi.getState() as RootState);

      // If prices aren't available or stale, fetch them
      if (!prices || Object.keys(prices).length === 0) {
        const pricesResult = await thunkApi.dispatch(updatePrices()).unwrap();
        if (!pricesResult) throw new Error("Failed to fetch prices");
        prices = pricesResult;
      }

      const addresses: Record<number, Set<Address>> = {};
      pools_chain_ids.forEach((chainId) => {
        addresses[chainId] = new Set();
      });
      farms.forEach((farm) => {
        addresses[farm.chainId].add(getAddress(farm.lp_address));
        addresses[farm.chainId].add(getAddress(farm.token1));
        addresses[farm.chainId].add(getAddress(farm.vault_addr));
        farm.token2 && addresses[farm.chainId].add(getAddress(farm.token2));
      });
      tokens.forEach((token) => {
        addresses[token.chainId]?.add(getAddress(token.address));
      });

      let balances: Balances = {};
      for await (const [chainId, set] of Object.entries(addresses)) {
        balances[Number(chainId)] = {};
        const arr = Array.from(set);

        // Fetch both balances and decimals in parallel
        const [balanceResults, decimalResults] = await Promise.all([
          Promise.all(
            arr.map((address) =>
              getContract({
                address,
                abi: erc20Abi,
                client: {
                  public: getPublicClient(Number(chainId)),
                },
              }).read.balanceOf([account]),
            ),
          ),
          Promise.all(
            arr.map(async (address) => {
              const contract = getContract({
                address,
                abi: erc20Abi,
                client: {
                  public: getPublicClient(Number(chainId)),
                },
              });

              const decimals = await contract.read.decimals();
              return decimals;
            }),
          ),
        ]);

        // Combine results into TokenValue objects
        balanceResults.forEach((balance, i) => {
          const address = arr[i];
          const decimals = decimalResults[i];
          const price = prices[Number(chainId)][address] || 0;
          const valueWei = balance.toString();
          const valueFormatted = formatUnits(balance, decimals);
          const valueUsd = Number(valueFormatted) * price;

          balances[Number(chainId)][address] = {
            valueWei,
            value: Number(valueFormatted),
            valueFormatted: formatCurrency(valueFormatted),
            valueUsd,
            valueUsdFormatted: formatCurrency(valueUsd),
          };
        });
      }

      // Handle native token balances
      await Promise.all(
        pools_chain_ids.map(async (chainId) => {
          const balance = await getPublicClient(chainId).getBalance({ address: account });
          const price = prices[chainId][zeroAddress] || 0;

          balances[chainId][zeroAddress] = {
            valueWei: balance.toString(),
            value: Number(formatUnits(balance, 18)),
            valueFormatted: formatCurrency(formatUnits(balance, 18)),
            valueUsd: Number(formatUnits(balance, 18)) * price,
            valueUsdFormatted: formatCurrency(Number(formatUnits(balance, 18)) * price),
          };
        }),
      );

      // Aggregating rewards vault balances
      const chainId = CHAIN_ID.BERACHAIN;
      await Promise.all(
        farms.map(async (vault) => {
          if (!vault.rewardVault) return;
          const balance = (await getContract({
            address: vault.rewardVault,
            abi: rewardVaultAbi,
            client: {
              public: getPublicClient(chainId),
            },
          }).read.balanceOf([account])) as bigint;
          balances[chainId][vault.vault_addr] = {
            valueWei: (
              BigInt(balances[chainId][vault.vault_addr]?.valueWei || "0") + BigInt(balance.toString())
            ).toString(),
            value: Number(balances[chainId][vault.vault_addr]?.value || 0) + Number(formatUnits(balance, 18)),
            valueFormatted: formatCurrency(
              Number(balances[chainId][vault.vault_addr]?.value || 0) + Number(formatUnits(balance, 18)),
            ),
            valueUsd:
              Number(balances[chainId][vault.vault_addr]?.valueUsd || 0) +
              Number(formatUnits(balance, 18)) * prices[chainId][vault.vault_addr],
            valueUsdFormatted: formatCurrency(
              Number(balances[chainId][vault.vault_addr]?.valueUsd || 0) +
                Number(formatUnits(balance, 18)) * prices[chainId][vault.vault_addr],
            ),
            valueRewardVaultWei: balance.toString(),
          };
        }),
      );
      thunkApi.dispatch(setAccount(account));
      return balances;
    } catch (error) {
      console.error("Error in fetchBalances", error);
      return thunkApi.rejectWithValue(error instanceof Error ? error.message : "Failed to fetch balances");
    }
  },
);

export const fetchTotalSupplies = createAsyncThunk(
  "supply/fetchTotalSupplies",
  async ({ farms, getPublicClient }: UpdateTotalSuppliesActionPayload, thunkApi) => {
    try {
      // Get prices from state first
      let prices = selectPrices(thunkApi.getState() as RootState);

      // If prices aren't available or stale, fetch them
      if (!prices || !Array.isArray(Object.keys(prices))) {
        const pricesResult = await thunkApi.dispatch(updatePrices()).unwrap();
        if (!pricesResult) throw new Error("Failed to fetch prices");
        prices = pricesResult;
      }

      const chainIds = farms.reduce((accum, farm) => {
        if (!accum?.includes(farm.chainId)) accum.push(farm.chainId);
        return accum;
      }, [] as number[]);
      const addresses: Record<number, Set<Address>> = {};
      chainIds.forEach((chainId) => {
        addresses[chainId] = new Set();
      });
      farms.forEach((farm) => {
        addresses[farm.chainId]?.add(getAddress(farm.vault_addr));
        addresses[farm.chainId]?.add(getAddress(farm.lp_address));
      });
      tokens.forEach((token) => {
        addresses[token.chainId]?.add(getAddress(token.address));
      });
      let totalSupplies: TotalSupplies = {};
      await Promise.all(
        Object.entries(addresses).map(async ([chainId, set]) => {
          totalSupplies[Number(chainId)] = {};
          const tokens = Array.from(set);
          const rawTotalSupplies = await Promise.all(
            tokens.map((item) =>
              getContract({
                address: item,
                abi: erc20Abi,
                client: {
                  public: getPublicClient(Number(chainId)),
                },
              }).read.totalSupply(),
            ),
          );

          rawTotalSupplies.forEach((item, i) => {
            totalSupplies[Number(chainId)][tokens[i]] = {
              supplyWei: item.toString(),
              supply: Number(formatUnits(item, 18)),
              supplyFormatted: formatCurrency(formatUnits(item, 18)),
              supplyUsd: Number(formatUnits(item, 18)) * prices[Number(chainId)][tokens[i]],
              supplyUsdFormatted: formatCurrency(Number(formatUnits(item, 18)) * prices[Number(chainId)][tokens[i]]),
            };
          });

          const stablePools = farms.filter((farm) => farm.isStablePool && farm.chainId === Number(chainId));
          await Promise.all(
            stablePools.map(async (pool) => {
              const actualTotalSupply = await getContract({
                address: pool.lp_address,
                abi: parseAbi(["function getActualSupply() view returns (uint256)"]),
                client: {
                  public: getPublicClient(Number(chainId)),
                },
              }).read.getActualSupply();

              totalSupplies[Number(chainId)][pool.lp_address] = {
                supplyWei: actualTotalSupply.toString(),
                supply: Number(formatUnits(actualTotalSupply, 18)),
                supplyFormatted: formatCurrency(formatUnits(actualTotalSupply, 18)),
                supplyUsd: Number(formatUnits(actualTotalSupply, 18)) * prices[Number(chainId)][pool.lp_address],
                supplyUsdFormatted: formatCurrency(
                  Number(formatUnits(actualTotalSupply, 18)) * prices[Number(chainId)][pool.lp_address],
                ),
              };
            }),
          );
        }),
      );

      return totalSupplies;
    } catch (error) {
      console.error("Error in fetchTotalSupplies", error);
      return thunkApi.rejectWithValue(error instanceof Error ? error.message : "Failed to fetch total supplies");
    }
  },
);

export const fetchDecimals = createAsyncThunk(
  "decimals/fetchDecimals",
  async ({ farms, getPublicClient }: UpdateDecimalsActionPayload, thunkApi) => {
    try {
      const chainIds = farms.reduce((accum, farm) => {
        if (!accum?.includes(farm.chainId)) accum.push(farm.chainId);
        return accum;
      }, [] as number[]);
      const addresses: Record<number, Set<Address>> = {};
      chainIds.forEach((chainId) => {
        addresses[chainId] = new Set();
      });
      farms.forEach((farm) => {
        addresses[farm.chainId].add(getAddress(farm.lp_address));
        addresses[farm.chainId].add(getAddress(farm.token1));
        addresses[farm.chainId].add(getAddress(farm.vault_addr));
        farm.token2 && addresses[farm.chainId].add(getAddress(farm.token2));
      });
      tokens.forEach((token) => {
        addresses[token.chainId]?.add(getAddress(token.address));
      });

      let decimals: Decimals = {};
      await Promise.all(
        Object.entries(addresses).map(async ([chainId, set]) => {
          decimals[Number(chainId)] = {};
          const arr = Array.from(set);
          const res = await Promise.all(
            arr.map((item) =>
              getContract({
                address: item,
                abi: erc20Abi,
                client: {
                  public: getPublicClient(Number(chainId)),
                },
              }).read.decimals(),
            ),
          );

          decimals[Number(chainId)][zeroAddress] = 18;
          res.forEach((item, i) => {
            decimals[Number(chainId)][arr[i]] = Number(item);
          });
        }),
      );

      return decimals;
    } catch (error) {
      console.error("Error in fetchDecimals", error);
      return thunkApi.rejectWithValue(error instanceof Error ? error.message : "Failed to fetch decimals");
    }
  },
);

const tokensSlice = createSlice({
  name: "prices",
  initialState: initialState,
  reducers: {
    setAccount(state, action: { payload: Address }) {
      state.account = action.payload;
    },
    setIsFetched(state, action: { payload: boolean }) {
      state.isBalancesFetched = action.payload;
    },
    reset(state) {
      state.balances = {};
      pools_chain_ids.forEach((chainId) => {
        state.balances[chainId] = [] as any;
      });
      state.isBalancesLoading = false;
      state.isBalancesFetched = false;
      state.account = undefined;
    },
  },
  extraReducers(builder) {
    builder.addCase(updatePrices.fulfilled, (state, action) => {
      state.prices = { ...action.payload };
      state.isPricesFetched = true;
      state.isPricesLoading = false;
    });
    builder.addCase(updatePrices.pending, (state, action) => {
      state.isPricesLoading = true;
    });
    builder.addCase(updatePrices.rejected, (state, action) => {
      state.isPricesLoading = false;
      state.isPricesFetched = false;
      state.pricesError = action.payload as string;
    });
    builder.addCase(getPricesOfLpByTimestamp.pending, (state) => {
      state.isFetchingOldPrices = true;
    });
    builder.addCase(getPricesOfLpByTimestamp.fulfilled, (state, action) => {
      state.isFetchingOldPrices = false;
      state.isLoadedOldPrices = true;
      Object.entries(action.payload || {}).forEach(([chainId, data]) => {
        if (!state.oldPrices[chainId]) state.oldPrices[chainId] = {};
        Object.entries(data).forEach(([tokenAddress, prices]) => {
          if (!state.oldPrices[chainId][tokenAddress]) state.oldPrices[chainId][tokenAddress] = [];
          // #region remove duplicates
          const uniqueMap = new Map();
          // Iterate through each item in the array
          state.oldPrices[chainId][tokenAddress].concat(prices).forEach((item) => {
            if (!uniqueMap.has(item.timestamp)) {
              uniqueMap.set(item.timestamp, item);
            }
          });
          // Convert the map back to an array
          state.oldPrices[chainId][tokenAddress] = Array.from(uniqueMap.values());
          // #endregion remove duplicates
        });
      });
      state.oldPrices = action.payload || {};
    });
    builder.addCase(getPricesOfLpByTimestamp.rejected, (state, action) => {
      state.isFetchingOldPrices = false;
      state.isLoadedOldPrices = false;
      state.oldPrices = {};
      state.oldPricesError = action.payload as string;
    });
    builder.addCase(fetchBalances.pending, (state) => {
      state.isBalancesLoading = true;
    });
    builder.addCase(fetchBalances.fulfilled, (state, action) => {
      state.isBalancesLoading = false;
      state.isBalancesFetched = true;
      state.balances = { ...action.payload };
    });
    builder.addCase(fetchBalances.rejected, (state, ...rest) => {
      state.isBalancesLoading = false;
      state.isBalancesFetched = false;
      state.balances = Common_Chains_State;
      state.balancesError = rest[0].payload as string;
    });
    builder.addCase(fetchTotalSupplies.pending, (state) => {
      state.isTotalSuppliesLoading = true;
    });
    builder.addCase(fetchTotalSupplies.fulfilled, (state, action) => {
      state.isTotalSuppliesLoading = false;
      state.isTotalSuppliesFetched = true;
      state.totalSupplies = { ...action.payload };
    });
    builder.addCase(fetchTotalSupplies.rejected, (state, action) => {
      state.isTotalSuppliesLoading = false;
      state.isTotalSuppliesFetched = false;
      state.totalSupplies = Common_Chains_State;
      state.totalSuppliesError = action.payload as string;
    });
    builder.addCase(fetchDecimals.pending, (state) => {
      state.isDecimalsLoading = true;
    });
    builder.addCase(fetchDecimals.fulfilled, (state, action) => {
      state.isDecimalsLoading = false;
      state.isDecimalsFetched = true;
      state.decimals = { ...action.payload };
    });
    builder.addCase(fetchDecimals.rejected, (state, action) => {
      state.isDecimalsLoading = false;
      state.isDecimalsFetched = false;
      state.decimals = Common_Chains_State;
      state.decimalsError = action.payload as string;
    });
  },
});
export const { setAccount, setIsFetched, reset } = tokensSlice.actions;
export default tokensSlice.reducer;
