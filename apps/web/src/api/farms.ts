import axios from "axios";
import {
    BURRBEAR_EARNINGS_GRAPH_URL,
    EARNINGS_GRAPH_URL,
    KODIAK_EARNINGS_GRAPH_URL,
    STEER_PROTOCOL_EARNINGS_GRAPH_URL,
} from "src/config/constants";
import { getPricesByTime, getTokenPricesBackend } from "src/api/token";
import { CHAIN_ID, FarmOriginPlatform } from "src/types/enums";
import { toEth, toWei } from "src/utils/common";
import store from "src/state";
import { getContract, createPublicClient, http, PublicClient } from "viem";
import vaultAbi from "src/assets/abis/vault.json";
import pools_json from "src/config/constants/pools_json";
import { berachain } from "viem/chains";
import { VaultEarnings } from "src/state/farms/types";
import { tokenNamesAndImages } from "src/config/constants/pools_json";

interface Response {
    deposit: string;
    vaultAddress: string;
    withdraw: string;
    blockNumber: string;
    blockTimestamp: string;
    userBalance: string;
    tokenId: string;
    chainId: number;
}

interface CalculateChangeInAssetsParams {
    vault_addr: `0x${string}`;
    client: PublicClient;
    balances: any;
    chainId: number;
    lastTransactionAssets: bigint;
}

const calculateChangeInAssets = async ({
    vault_addr,
    client,
    balances,
    chainId,
    lastTransactionAssets,
}: CalculateChangeInAssetsParams): Promise<bigint> => {
    const contract = getContract({
        address: vault_addr,
        abi: vaultAbi.abi,
        client,
    });
    const currentShares = balances[chainId][vault_addr]?.valueWei || BigInt(0);
    const currentAssets = (await contract.read.convertToAssets([currentShares])) as bigint;
    return currentAssets - lastTransactionAssets;
};

export const getEarnings = async (userAddress: string) => {
    try {
        const res = await axios.post(EARNINGS_GRAPH_URL, {
            query: `query MyQuery {
                user(id: \"${userAddress.toLowerCase()}\") {
                  earn {
                    vaultAddress                    
                    deposit
                    withdraw
                    blockNumber
                    tokenId
                    blockTimestamp
                    userBalance
                  }
                }
              }`,
        });

        let responseDataArb =
            (res.data.data.user?.earn.map((item: any) => ({
                ...item,
                chainId: CHAIN_ID.BERACHAIN,
            })) as Response[]) || [];

        return responseDataArb;
    } catch (err: any) {
        console.error(err);
        return undefined;
    }
};

const fetchAllTransactions = async (query: string, variables: any) => {
    let allResults: any[] = [];
    let hasMore = true;
    let skip = 0;
    const pageSize = 1000;

    while (hasMore) {
        const response = await axios.post(EARNINGS_GRAPH_URL, {
            query,
            variables: {
                ...variables,
                first: pageSize,
                skip,
            },
        });

        const results = response.data.data[query.includes("deposits") ? "deposits" : "withdraws"];
        allResults = [...allResults, ...results];

        hasMore = results.length === pageSize;
        skip += pageSize;
    }

    return allResults;
};

export const getEarningsForPlatforms = async (userAddress: string) => {
    try {
        const client = createPublicClient({
            chain: berachain,
            transport: http(),
        });

        const state = store.getState();
        const balances = state.tokens.balances;

        const depositsQuery = `
        query GetUserDeposits($first: Int!, $skip: Int!) {
          deposits(
            first: $first
            skip: $skip
            where: { from: "${userAddress.toLowerCase()}" }
            orderBy: blockTimestamp
            orderDirection: desc
          ) {
            id
            tokenId
            tokenName
            platformName
            from
            value
            shares
            userBalance
            blockTimestamp
            blockNumber
            userAssetBalance
          }
        }`;

        const withdrawsQuery = `
        query GetUserWithdraws($first: Int!, $skip: Int!) {
          withdraws(
            first: $first
            skip: $skip
            where: { from: "${userAddress.toLowerCase()}" }
            orderBy: blockTimestamp
            orderDirection: desc
          ) {
            id
            tokenId
            tokenName
            platformName
            from
            value
            shares
            userBalance
            blockTimestamp
            blockNumber
            userAssetBalance
          }
        }`;

        const [deposits, withdraws] = await Promise.all([
            fetchAllTransactions(depositsQuery, {}),
            fetchAllTransactions(withdrawsQuery, {}),
        ]);

        // Add type field to each deposit and withdrawal object
        const depositsWithType = deposits.map((deposit: any) => ({
            ...deposit,
            type: "deposit",
        }));

        const withdrawsWithType = withdraws.map((withdraw: any) => ({
            ...withdraw,
            type: "withdraw",
        }));

        // Concatenate the arrays
        const combinedTransactions = [...depositsWithType, ...withdrawsWithType];

        const burrbearEarnings = await getEarningsForBurrbear(combinedTransactions, client, balances);
        const infraredEarnings = await getEarningsForInfrared(combinedTransactions, client, balances);
        const steerEarnings = await getEarningsForSteer(combinedTransactions, client, balances);
        const kodiakEarnings = await getEarningsForKodiak(combinedTransactions, client, balances);
        return [...infraredEarnings, ...steerEarnings, ...kodiakEarnings, ...burrbearEarnings];
    } catch (err: any) {
        console.error(err);
        return [];
    }
};

const getEarningsForInfrared = async (
    combinedTransactions: any,
    client: PublicClient,
    balances: any
): Promise<VaultEarnings[]> => {
    try {
        const infraredPools = pools_json
            .filter((pool) => !pool.isUpcoming && !pool.isDeprecated)
            .filter((pool) => pool.originPlatform === FarmOriginPlatform.Infrared)
            .map((pool) => ({
                vault_addr: pool.vault_addr,
                lp_addr: pool.lp_address,
                chainId: pool.chainId,
                farmId: pool.id,
            }));

        const earnings = await Promise.all(
            infraredPools.map(async (pool) => {
                const filteredTransactions = combinedTransactions.filter(
                    (transaction: any) => pool.farmId.toString() === transaction.tokenId
                );

                // Sort the filtered transactions by blockTimestamp
                const sortedTransactions = filteredTransactions.sort(
                    (a: any, b: any) => Number(a.blockTimestamp) - Number(b.blockTimestamp)
                );

                // If no transactions, return zero earnings
                if (sortedTransactions.length === 0) {
                    return {
                        tokenId: pool.farmId.toString(),
                        earnings0: "0",
                        token0: pool.lp_addr,
                    };
                }

                const lifetimeEarnings = await calculateLifetimeLpEarnings(
                    sortedTransactions,
                    pool.vault_addr,
                    client,
                    balances
                );

                // Get only the last transaction
                const lastTransaction = sortedTransactions[sortedTransactions.length - 1];
                const lastTransactionAssets = BigInt(lastTransaction.userAssetBalance);

                const changeInAssets = await calculateChangeInAssets({
                    vault_addr: pool.vault_addr!,
                    client,
                    balances,
                    chainId: pool.chainId,
                    lastTransactionAssets,
                });

                // If user has no balance after the last transaction, return zero earnings
                if (changeInAssets <= 0) {
                    return {
                        tokenId: pool.farmId.toString(),
                        earnings0: "0",
                        token0: pool.lp_addr,
                    };
                }

                return {
                    tokenId: pool.farmId.toString(),
                    earnings0: "0",
                    token0: pool.lp_addr,
                    changeInAssets: changeInAssets.toString(),
                    lifetimeEarnings: lifetimeEarnings.toString(),
                };
            })
        );

        return earnings;
    } catch (err: any) {
        console.error(err);
        return [];
    }
};

const getEarningsForSteer = async (
    combinedTransactions: any,
    client: PublicClient,
    balances: any
): Promise<VaultEarnings[]> => {
    try {
        const steerPools = pools_json
            .filter((pool) => !pool.isUpcoming && !pool.isDeprecated)
            .filter((pool) => pool.originPlatform === FarmOriginPlatform.Steer)
            .map((pool) => {
                // Extract vault address from source field (last part of URL)
                const underlyingVault = pool.source.split("/").pop()?.toLowerCase() || "";

                return {
                    vault_addr: pool.vault_addr,
                    lp_addr: pool.lp_address,
                    chainId: pool.chainId,
                    farmId: pool.id,
                    underlyingVault,
                };
            });

        const earnings = await Promise.all(
            steerPools.map(async (pool) => {
                let token0 = "";
                let token1 = "";
                const filteredTransactions = combinedTransactions.filter((transaction: any) => {
                    return pool.farmId.toString() === transaction.tokenId;
                });

                // Sort the filtered transactions by blockTimestamp
                const sortedTransactions = filteredTransactions.sort(
                    (a: any, b: any) => Number(a.blockTimestamp) - Number(b.blockTimestamp)
                );

                // If no transactions, return zero earnings
                if (sortedTransactions.length === 0) {
                    return {
                        tokenId: pool.farmId.toString(),
                        earnings0: "0",
                        earnings1: "0",
                        token0: "",
                        token1: "",
                    };
                }

                // Get only the last transaction
                const lastTransaction = sortedTransactions[sortedTransactions.length - 1];

                // Get the fee data at the time of the last transaction
                const lastFeeQuery = `
                    query GetLastTransactionFee {
                        vault(id: "${pool.underlyingVault}", block: {number: ${lastTransaction.blockNumber}}) {
                            fees0
                            fees1
                            totalLPTokensIssued
                            token0
                            token1
                        }
                    }`;

                const lastFeeResponse = await axios.post(STEER_PROTOCOL_EARNINGS_GRAPH_URL, {
                    query: lastFeeQuery,
                });
                const lastFeeData = lastFeeResponse.data.data.vault;

                if (!lastFeeData) {
                    return {
                        tokenId: pool.farmId.toString(),
                        earnings0: "0",
                        earnings1: "0",
                        token0: "",
                        token1: "",
                    };
                }

                token0 = lastFeeData.token0;
                token1 = lastFeeData.token1;

                // Calculate current balance based on the last transaction
                let currentBalance = BigInt(0);
                const contract = getContract({
                    address: pool.vault_addr!,
                    abi: vaultAbi.abi,
                    client,
                });
                const assetsPromise = contract.read.convertToAssets([toWei(1, 18)]);
                const assets = (await assetsPromise) as bigint;
                const currentShares = balances[pool.chainId][pool.vault_addr]?.valueWei || BigInt(0);
                currentBalance = toWei(Number(toEth(assets)) * Number(toEth(currentShares)), 18);

                // If user has no balance after the last transaction, return zero earnings
                if (currentBalance <= 0) {
                    return {
                        tokenId: pool.farmId.toString(),
                        earnings0: "0",
                        earnings1: "0",
                        token0,
                        token1,
                    };
                }

                // Get current fees data
                const currentFeeQuery = `
                    query GetCurrentLPFee {
                        vault(id: "${pool.underlyingVault}") {
                            fees0
                            fees1
                            totalLPTokensIssued
                        }
                    }`;

                const currentFeeResponse = await axios.post(STEER_PROTOCOL_EARNINGS_GRAPH_URL, {
                    query: currentFeeQuery,
                });

                const currentFeeData = currentFeeResponse.data.data.vault;

                // Calculate accumulated fees since last transaction
                const accumulatedFees0 = BigInt(currentFeeData.fees0) - BigInt(lastFeeData.fees0);
                const accumulatedFees1 = BigInt(currentFeeData.fees1) - BigInt(lastFeeData.fees1);

                // Calculate user's share of these fees
                const userShareOfFees0 =
                    BigInt(currentFeeData.totalLPTokensIssued) > 0
                        ? (accumulatedFees0 * currentBalance) / BigInt(currentFeeData.totalLPTokensIssued)
                        : BigInt(0);

                const userShareOfFees1 =
                    BigInt(currentFeeData.totalLPTokensIssued) > 0
                        ? (accumulatedFees1 * currentBalance) / BigInt(currentFeeData.totalLPTokensIssued)
                        : BigInt(0);

                // Return only the required fields for VaultEarnings
                return {
                    tokenId: pool.farmId.toString(),
                    earnings0: userShareOfFees0.toString(),
                    earnings1: userShareOfFees1.toString(),
                    token0,
                    token1,
                };
            })
        );
        return earnings;
    } catch (err: any) {
        console.error(err);
        return [];
    }
};

const getEarningsForKodiak = async (
    combinedTransactions: any,
    client: PublicClient,
    balances: any
): Promise<VaultEarnings[]> => {
    try {
        const kodiakPools = pools_json
            .filter((pool) => !pool.isUpcoming && !pool.isDeprecated)
            .filter(
                (pool) =>
                    pool.originPlatform === FarmOriginPlatform.Kodiak ||
                    pool.originPlatform === FarmOriginPlatform.BeraPaw
            )
            .map((pool) => {
                const underlyingVault = pool.source.match(/pools\/([^/?]+)/)?.[1];
                if (!underlyingVault) {
                    throw new Error(`No underlying vault found for pool ${pool.id}`);
                }

                return {
                    vault_addr: pool.vault_addr,
                    lp_addr: pool.lp_address,
                    chainId: pool.chainId,
                    farmId: pool.id,
                    underlyingVault,
                };
            });

        const earnings = await Promise.all(
            kodiakPools.map(async (pool) => {
                const filteredTransactions = combinedTransactions.filter(
                    (transaction: any) => pool.farmId.toString() === transaction.tokenId
                );

                // Sort the filtered transactions by blockTimestamp
                const sortedTransactions = filteredTransactions.sort(
                    (a: any, b: any) => Number(a.blockTimestamp) - Number(b.blockTimestamp)
                );

                // If no transactions, return zero earnings
                if (sortedTransactions.length === 0) {
                    return {
                        tokenId: pool.farmId.toString(),
                        earnings0: "0",
                        token0: pool.lp_addr,
                    };
                }

                const lifetimeEarnings = await calculateLifetimeLpEarnings(
                    sortedTransactions,
                    pool.vault_addr,
                    client,
                    balances
                );

                // Get only the last transaction
                const lastTransaction = sortedTransactions[sortedTransactions.length - 1];
                const lastTransactionAssets = BigInt(lastTransaction.userAssetBalance);

                const changeInAssets = await calculateChangeInAssets({
                    vault_addr: pool.vault_addr!,
                    client,
                    balances,
                    chainId: pool.chainId,
                    lastTransactionAssets,
                });

                // If user has no balance after the last transaction, return zero earnings
                if (changeInAssets <= 0) {
                    return {
                        tokenId: pool.farmId.toString(),
                        earnings0: "0",
                        token0: pool.lp_addr,
                    };
                }

                // Get the fee data at the time of the last transaction
                const lastFeeQuery = `
                    query GetLastTransactionFee {
                        kodiakVault(id: "${pool.underlyingVault}", block: {number: ${lastTransaction.blockNumber}}) {
                            cumulativeTotalFeesUSD
                            outputTokenSupply
                            outputToken {
                                decimals
                            }
                        }
                    }`;

                const lastFeeResponse = await axios.post(KODIAK_EARNINGS_GRAPH_URL, { query: lastFeeQuery });
                const lastFeeData = lastFeeResponse.data.data.kodiakVault;

                if (!lastFeeData) {
                    return {
                        tokenId: pool.farmId.toString(),
                        earnings0: "0",
                        token0: pool.lp_addr,
                    };
                }

                // Get current fees data
                const currentFeeQuery = `
                    query GetCurrentLPFee {
                        kodiakVault(id: "${pool.underlyingVault}") {
                            cumulativeTotalFeesUSD
                            outputTokenPriceUSD
                            outputTokenSupply
                            outputToken {
                                decimals
                            }
                        }
                    }`;

                const currentFeeResponse = await axios.post(KODIAK_EARNINGS_GRAPH_URL, { query: currentFeeQuery });
                const currentFeeData = currentFeeResponse.data.data.kodiakVault;

                // Calculate accumulated fees since last transaction
                const accumulatedFees0 = currentFeeData.cumulativeTotalFeesUSD - lastFeeData.cumulativeTotalFeesUSD;

                // Calculate user's share of these fees
                const userShareOfFees0 =
                    BigInt(currentFeeData.outputTokenSupply) > 0
                        ? (accumulatedFees0 * Number(toEth(changeInAssets, currentFeeData.outputToken.decimals))) /
                          Number(toEth(currentFeeData.outputTokenSupply, currentFeeData.outputToken.decimals))
                        : 0;

                // Calculate token prices
                const priceToken0 = currentFeeData.outputTokenPriceUSD;
                return {
                    tokenId: pool.farmId.toString(),
                    earnings0:
                        priceToken0 > 0
                            ? toWei(
                                  userShareOfFees0 / priceToken0,
                                  Number(currentFeeData.outputToken.decimals)
                              ).toString()
                            : "0",
                    token0: pool.lp_addr,
                    changeInAssets: changeInAssets.toString(),
                    lifetimeEarnings: lifetimeEarnings.toString(),
                };
            })
        );

        return earnings;
    } catch (err: any) {
        console.error(err);
        return [];
    }
};

const getEarningsForBurrbear = async (
    combinedTransactions: any,
    client: PublicClient,
    balances: any
): Promise<VaultEarnings[]> => {
    try {
        const burrbearPools = pools_json
            .filter((pool) => !pool.isUpcoming && !pool.isDeprecated)
            .filter((pool) => pool.originPlatform === FarmOriginPlatform.Burrbear)
            .map((pool) => {
                const underlyingVault = pool.source.match(/pool\/([^/?#]+)/)?.[1] || "";

                return {
                    vault_addr: pool.vault_addr,
                    lp_addr: pool.lp_address,
                    chainId: pool.chainId,
                    farmId: pool.id,
                    underlyingVault,
                };
            });

        const earnings = await Promise.all(
            burrbearPools.map(async (pool) => {
                const filteredTransactions = combinedTransactions.filter(
                    (transaction: any) => pool.farmId.toString() === transaction.tokenId
                );

                // Sort the filtered transactions by blockTimestamp
                const sortedTransactions = filteredTransactions.sort(
                    (a: any, b: any) => Number(a.blockTimestamp) - Number(b.blockTimestamp)
                );

                // If no transactions, return zero earnings
                if (sortedTransactions.length === 0) {
                    return {
                        tokenId: pool.farmId.toString(),
                        earnings0: "0",
                        token0: pool.lp_addr,
                    };
                }

                const lifetimeEarnings = await calculateLifetimeLpEarnings(
                    sortedTransactions,
                    pool.vault_addr,
                    client,
                    balances
                );

                // Get only the last transaction
                const lastTransaction = sortedTransactions[sortedTransactions.length - 1];
                const lastTransactionAssets = BigInt(lastTransaction.userAssetBalance);

                const changeInAssets = await calculateChangeInAssets({
                    vault_addr: pool.vault_addr!,
                    client,
                    balances,
                    chainId: pool.chainId,
                    lastTransactionAssets,
                });

                // If user has no balance after the last transaction, return zero earnings
                if (changeInAssets <= 0) {
                    return {
                        tokenId: pool.farmId.toString(),
                        earnings0: "0",
                        token0: pool.lp_addr,
                    };
                }

                // Get the fee data at the time of the last transaction
                const lastFeeQuery = `
                    query GetLastTransactionFee {
                        pool(id: "${pool.underlyingVault}", block: {number: ${lastTransaction.blockNumber}}) {
                            totalSwapFee
                            totalLiquidity
                            tokens {
                                priceRate
                                address
                                token {
                                    latestUSDPrice
                                }
                            }
                        }
                    }`;

                const lastFeeResponse = await axios.post(BURRBEAR_EARNINGS_GRAPH_URL, { query: lastFeeQuery });
                const lastFeeData = lastFeeResponse.data.data.pool;

                if (!lastFeeData) {
                    return {
                        tokenId: pool.farmId.toString(),
                        earnings0: "0",
                        token0: pool.lp_addr,
                    };
                }

                // Get current fees data
                const currentFeeQuery = `
                    query GetCurrentLPFee {
                        pool(id: "${pool.underlyingVault}") {
                            totalSwapFee
                            totalLiquidity
                            tokens {
                                priceRate
                                address
                                token {
                                    latestUSDPrice
                                }
                            }
                        }
                    }`;

                const currentFeeResponse = await axios.post(BURRBEAR_EARNINGS_GRAPH_URL, { query: currentFeeQuery });
                const currentFeeData = currentFeeResponse.data.data.pool;

                // Get LP token price
                let lpPrice = currentFeeData.tokens.find((token: any) => token.address === pool.lp_addr.toLowerCase())
                    ?.token.latestUSDPrice;

                if (lpPrice === undefined) {
                    const priceData = await getPricesByTime([
                        { address: pool.lp_addr, timestamp: Math.floor(Date.now() / 1000), chainId: 80094 },
                    ]);
                    lpPrice = priceData?.[80094][pool.lp_addr][0].price || 0;
                }

                // Calculate accumulated fees since last transaction
                const accumulatedFees = currentFeeData.totalSwapFee - lastFeeData.totalSwapFee;

                // Calculate user's share of these fees
                const userShareOfFees =
                    currentFeeData.totalLiquidity > 0
                        ? (accumulatedFees * Number(toEth(changeInAssets))) /
                          Number(currentFeeData.totalLiquidity / lpPrice)
                        : 0;

                return {
                    tokenId: pool.farmId.toString(),
                    earnings0: lpPrice > 0 ? toWei(userShareOfFees / lpPrice).toString() : "0",
                    token0: pool.lp_addr,
                    changeInAssets: changeInAssets.toString(),
                    lifetimeEarnings: lifetimeEarnings.toString(),
                };
            })
        );
        return earnings;
    } catch (error) {
        console.error(error);
        return [];
    }
};

const calculateLifetimeLpEarnings = async (
    transactions: any[],
    vault_addr: string,
    client: PublicClient,
    balances: any
): Promise<bigint> => {
    if (!transactions || transactions.length === 0) return BigInt(0);

    let totalDeposited = BigInt(0);
    let totalWithdrawn = BigInt(0);
    let lastUserAssetBalance = BigInt(0);

    for (const tx of transactions) {
        const value = BigInt(tx.value ?? "0");
        const userAssetBalance = BigInt(tx.userAssetBalance ?? "0");

        if (tx.type === "deposit") {
            totalDeposited += value;
        } else if (tx.type === "withdraw") {
            totalWithdrawn += value;
        }

        lastUserAssetBalance = userAssetBalance;
    }
    const positionValue =
        (await calculateChangeInAssets({
            vault_addr: vault_addr as `0x${string}`,
            client,
            balances,
            chainId: 80094,
            lastTransactionAssets: lastUserAssetBalance,
        })) + lastUserAssetBalance;

    if (vault_addr === "0x4D6f6580a78EEaBEE50f3ECefD19E17a3f4dB302") {
        console.log("totalDeposited", totalDeposited);
        console.log("totalWithdrawn", totalWithdrawn);
        console.log("positionValue", positionValue);
    }

    const lifetimeEarnings = totalWithdrawn + positionValue - totalDeposited;

    return lifetimeEarnings;
};

