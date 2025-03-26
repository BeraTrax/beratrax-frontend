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

export const getEarningsForPlatforms = async (userAddress: string) => {
    try {
        const client = createPublicClient({
            chain: berachain,
            transport: http(),
        });

        const state = store.getState();
        const balances = state.tokens.balances;

        const depositsQuery = `
        query GetUserDeposits {
          deposits(where: { from: "${userAddress.toLowerCase()}" }) {
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
          }
        }`;
        const depositResponse = await axios.post(EARNINGS_GRAPH_URL, { query: depositsQuery });
        const deposits = depositResponse.data.data.deposits;

        const withdrawsQuery = `
        query GetUserWithdraws {
          withdraws(where: { from: "${userAddress.toLowerCase()}" }) {
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
          }
        }`;

        const withdrawResponse = await axios.post(EARNINGS_GRAPH_URL, { query: withdrawsQuery });
        const withdraws = withdrawResponse.data.data.withdraws;

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

        const burrbearEarnings = await getEarningsForBurrbear(combinedTransactions);
        const infraredEarnings = await getEarningsForInfrared(deposits, withdraws, client, balances);
        const steerEarnings = await getEarningsForSteer(combinedTransactions);
        const kodiakEarnings = await getEarningsForKodiak(combinedTransactions);
        return [...infraredEarnings, ...steerEarnings, ...kodiakEarnings, ...burrbearEarnings];
    } catch (err: any) {
        console.error(err);
        return [];
    }
};

const getEarningsForInfrared = async (
    deposits: any,
    withdraws: any,
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

        const depositsByTokenId = deposits.reduce((acc: any, deposit: any) => {
            const tokenId = deposit.tokenId;
            const matchingPool = infraredPools.find((pool) => pool.farmId.toString() === tokenId);
            if (!matchingPool) return acc;

            if (!acc[tokenId]) {
                acc[tokenId] = {
                    totalShares: BigInt(0),
                    totalValue: BigInt(0),
                    lpAddress: matchingPool.lp_addr || "",
                    vaultAddress: matchingPool.vault_addr || "",
                    tokenName: deposit.tokenName,
                    platformName: deposit.platformName,
                    chainId: matchingPool.chainId,
                };
            }

            acc[tokenId].totalShares += BigInt(deposit.shares);
            acc[tokenId].totalValue += BigInt(deposit.value);
            return acc;
        }, {});

        const withdrawsByTokenId = withdraws.reduce((acc: any, withdraw: any) => {
            const tokenId = withdraw.tokenId;
            const matchingPool = infraredPools.find((pool) => pool.farmId.toString() === tokenId);
            if (!matchingPool) return acc;

            if (!acc[tokenId]) {
                acc[tokenId] = {
                    totalShares: BigInt(0),
                    totalValue: BigInt(0),
                    lpAddress: matchingPool.lp_addr || "",
                    vaultAddress: matchingPool.vault_addr || "",
                    tokenName: withdraw.tokenName,
                    platformName: withdraw.platformName,
                    chainId: matchingPool.chainId,
                };
            }

            acc[tokenId].totalShares += BigInt(withdraw.shares);
            acc[tokenId].totalValue += BigInt(withdraw.value);
            return acc;
        }, {});

        const lpTokensPerSharePromises = infraredPools.map(async (pool) => {
            try {
                const contract = getContract({
                    address: pool.vault_addr!,
                    abi: vaultAbi.abi,
                    client,
                });
                const assetsPromise = contract.read.convertToAssets([toWei(1, 18)]);
                const assets = (await assetsPromise) as bigint;
                return {
                    tokenId: pool.farmId,
                    lpTokensPerShare: assets,
                };
            } catch (error) {
                console.error(`Error getting lpTokensPerShare for pool ${pool.farmId}:`, error);
                return {
                    tokenId: pool.farmId.toString(),
                    lpTokensPerShare: BigInt(0),
                };
            }
        });
        const lpTokensPerShareResults = await Promise.all(lpTokensPerSharePromises);

        // Create a map of lpTokensPerShare for all pools
        const lpTokensPerShareMap = lpTokensPerShareResults.reduce((acc: any, result) => {
            acc[result.tokenId] = result.lpTokensPerShare;
            return acc;
        }, {});

        // Calculate earnings for all pools that have deposits
        const earningsDifferences = Object.keys(depositsByTokenId).map((tokenId: string) => {
            const depositData = depositsByTokenId[tokenId];
            const withdrawData = withdrawsByTokenId[tokenId] || {
                totalValue: BigInt(0),
                vaultAddress: depositData.vaultAddress,
            };
            const vaultAddress = depositData.vaultAddress;
            const currentShares = balances[depositData.chainId][vaultAddress]?.valueWei || BigInt(0);
            const lpTokensPerShare = lpTokensPerShareMap[tokenId] || BigInt(0);
            const currentLpTokens = Number(toEth(lpTokensPerShare)) * Number(toEth(BigInt(currentShares)));
            const earnings = withdrawData.totalValue + toWei(currentLpTokens, 18) - depositData.totalValue;

            return {
                tokenId,
                earnings0: earnings.toString(),
                token0: depositData.lpAddress,
            };
        });
        return earningsDifferences;
    } catch (err: any) {
        console.error(err);
        return [];
    }
};
const getEarningsForSteer = async (combinedTransactions: any): Promise<VaultEarnings[]> => {
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

                // Initialize accumulator object
                let acc = {
                    currentBalance: BigInt(0),
                    earningsToken0: BigInt(0),
                    earningsToken1: BigInt(0),
                    lastFee0: BigInt(0),
                    lastFee1: BigInt(0),
                    tokenId: pool.farmId,
                };

                // Batch all transactions into a single GraphQL query
                if (sortedTransactions.length > 0) {
                    // Construct a batched query with aliases for each transaction
                    const batchedFeeQuery = `
                        query GetBatchedLPFees {
                            ${sortedTransactions
                                .map(
                                    (transaction: any, index: number) => `
                            vault${index}: vault(id: "${pool.underlyingVault}", block: {number: ${transaction.blockNumber}}) {
                                fees0
                                fees1
                                totalLPTokensIssued
                                token1
                                token0
                            }`
                                )
                                .join("\n")}
                        }`;

                    // Make a single API call for all transactions
                    const batchedFeeResponse = await axios.post(STEER_PROTOCOL_EARNINGS_GRAPH_URL, {
                        query: batchedFeeQuery,
                    });
                    const batchedFeeData = batchedFeeResponse.data.data;

                    // Process each transaction with the batched data
                    for (let i = 0; i < sortedTransactions.length; i++) {
                        const transaction = sortedTransactions[i];
                        const feeData = batchedFeeData[`vault${i}`];

                        if (!feeData) continue; // Skip if data is missing

                        token0 = feeData.token0;
                        token1 = feeData.token1;

                        const accumulatedFees0 = BigInt(feeData.fees0) - acc.lastFee0;
                        const accumulatedFees1 = BigInt(feeData.fees1) - acc.lastFee1;

                        // Calculate the user's share of fees based on their balance relative to total LP tokens
                        const userShareOfFees0 =
                            acc.currentBalance > 0 && BigInt(feeData.totalLPTokensIssued) > 0
                                ? (accumulatedFees0 * acc.currentBalance) / BigInt(feeData.totalLPTokensIssued)
                                : BigInt(0);

                        const userShareOfFees1 =
                            acc.currentBalance > 0 && BigInt(feeData.totalLPTokensIssued) > 0
                                ? (accumulatedFees1 * acc.currentBalance) / BigInt(feeData.totalLPTokensIssued)
                                : BigInt(0);

                        acc.earningsToken0 += userShareOfFees0;
                        acc.earningsToken1 += userShareOfFees1;

                        if (transaction.type === "deposit") {
                            acc.currentBalance += BigInt(transaction.value);
                        } else if (transaction.type === "withdraw") {
                            acc.currentBalance -= BigInt(transaction.value);
                        }

                        acc.lastFee0 = BigInt(feeData.fees0);
                        acc.lastFee1 = BigInt(feeData.fees1);
                    }
                }

                // Calculate earnings from last transaction to current time if user has a balance
                if (acc.currentBalance > 0) {
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
                    const finalAccumulatedFees0 = BigInt(currentFeeData.fees0) - acc.lastFee0;
                    const finalAccumulatedFees1 = BigInt(currentFeeData.fees1) - acc.lastFee1;

                    // Calculate user's share of these fees
                    const finalUserShareOfFees0 =
                        BigInt(currentFeeData.totalLPTokensIssued) > 0
                            ? (finalAccumulatedFees0 * acc.currentBalance) / BigInt(currentFeeData.totalLPTokensIssued)
                            : BigInt(0);

                    const finalUserShareOfFees1 =
                        BigInt(currentFeeData.totalLPTokensIssued) > 0
                            ? (finalAccumulatedFees1 * acc.currentBalance) / BigInt(currentFeeData.totalLPTokensIssued)
                            : BigInt(0);

                    // Add to total earnings
                    acc.earningsToken0 += finalUserShareOfFees0;
                    acc.earningsToken1 += finalUserShareOfFees1;
                }

                // Return only the required fields for VaultEarnings
                return {
                    tokenId: pool.farmId.toString(),
                    earnings0: acc.earningsToken0.toString(),
                    earnings1: acc.earningsToken1.toString(),
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

const getEarningsForKodiak = async (combinedTransactions: any): Promise<VaultEarnings[]> => {
    try {
        const kodiakPools = pools_json
            .filter((pool) => !pool.isUpcoming && !pool.isDeprecated)
            .filter((pool) => pool.originPlatform === FarmOriginPlatform.Kodiak)
            .map((pool) => {
                const underlyingVault = pool.source.match(/pools\/([^/?]+)/)?.[1] || "";

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

                let acc = {
                    currentBalance: BigInt(0),
                    earningsToken0: 0,
                    earningsToken1: 0,
                    lastFee0: 0,
                    lastFee1: 0,
                    tokenId: pool.farmId,
                };

                let lastToken0 = "";
                let lastToken1 = "";
                let priceToken0 = 0;
                let priceToken1 = 0;
                let decimalsToken0 = 18;
                let decimalsToken1 = 18;

                // Prepare a single batch query for all transactions
                let batchQuery = "query GetLPFees {";

                sortedTransactions.forEach((transaction: any, index: number) => {
                    batchQuery += `
                        tx${index}: kodiakVault(id: "${pool.underlyingVault}", block: {number: ${transaction.blockNumber}}) {
                            _token0 {
                                feesUSD
                                symbol
                                decimals
                            }
                            _token1 {
                                feesUSD
                                symbol
                                decimals
                            }
                            outputTokenSupply
                            outputToken {
                                decimals
                            }
                        }
                    `;
                });

                batchQuery += "}";

                // Execute the batch query
                const feeResponse = await axios.post(KODIAK_EARNINGS_GRAPH_URL, { query: batchQuery });
                const feeData = feeResponse.data.data;

                // Process each transaction with its corresponding response
                for (let i = 0; i < sortedTransactions.length; i++) {
                    const transaction = sortedTransactions[i];
                    const vaultData = feeData[`tx${i}`];

                    lastToken0 =
                        Object.keys(tokenNamesAndImages).find(
                            (address) =>
                                tokenNamesAndImages[address].name.toUpperCase() ===
                                vaultData._token0.symbol.toUpperCase()
                        ) || vaultData._token0.symbol;

                    lastToken1 =
                        Object.keys(tokenNamesAndImages).find(
                            (address) =>
                                tokenNamesAndImages[address].name.toUpperCase() ===
                                vaultData._token1.symbol.toUpperCase()
                        ) || vaultData._token1.symbol;

                    const accumulatedFees0 = vaultData._token0.feesUSD - acc.lastFee0;
                    const accumulatedFees1 = vaultData._token1.feesUSD - acc.lastFee1;

                    // Calculate the user's share of fees based on their balance relative to total LP tokens
                    const userShareOfFees0 =
                        acc.currentBalance > 0 && BigInt(vaultData.outputTokenSupply) > 0
                            ? (accumulatedFees0 * Number(toEth(acc.currentBalance, vaultData.outputToken.decimals))) /
                              Number(toEth(vaultData.outputTokenSupply, vaultData.outputToken.decimals))
                            : 0;

                    const userShareOfFees1 =
                        acc.currentBalance > 0 && BigInt(vaultData.outputTokenSupply) > 0
                            ? (accumulatedFees1 * Number(toEth(acc.currentBalance, vaultData.outputToken.decimals))) /
                              Number(toEth(vaultData.outputTokenSupply, vaultData.outputToken.decimals))
                            : 0;

                    acc.earningsToken0 += userShareOfFees0;
                    acc.earningsToken1 += userShareOfFees1;

                    if (transaction.type === "deposit") {
                        acc.currentBalance += BigInt(transaction.value);
                    } else if (transaction.type === "withdraw") {
                        acc.currentBalance -= BigInt(transaction.value);
                    }

                    acc.lastFee0 = vaultData._token0.feesUSD;
                    acc.lastFee1 = vaultData._token1.feesUSD;
                }

                // Calculate earnings from last transaction to current moment
                if (acc.currentBalance > 0) {
                    // Get current fees data
                    const currentFeeQuery = `
                        query GetCurrentLPFee {
                            kodiakVault(id: "${pool.underlyingVault}") {
                                _token0 {
                                    feesUSD
                                    symbol
                                    decimals
                                }
                                _token1 {
                                    feesUSD
                                    symbol
                                    decimals
                                }
                                _token0Amount
                                _token0AmountUSD
                                _token1Amount
                                _token1AmountUSD
                                outputTokenSupply
                                outputToken {
                                    decimals
                                }
                            }
                        }`;

                    const currentFeeResponse = await axios.post(KODIAK_EARNINGS_GRAPH_URL, { query: currentFeeQuery });

                    const currentFeeData = currentFeeResponse.data.data.kodiakVault;
                    priceToken0 =
                        currentFeeData._token0AmountUSD /
                        Number(toEth(currentFeeData._token0Amount, currentFeeData._token0.decimals));
                    priceToken1 =
                        currentFeeData._token1AmountUSD /
                        Number(toEth(currentFeeData._token1Amount, currentFeeData._token1.decimals));

                    decimalsToken0 = currentFeeData._token0.decimals;
                    decimalsToken1 = currentFeeData._token1.decimals;

                    // Calculate accumulated fees since last transaction
                    const currentAccumulatedFees0 = currentFeeData._token0.feesUSD - acc.lastFee0;
                    const currentAccumulatedFees1 = currentFeeData._token1.feesUSD - acc.lastFee1;

                    // Calculate user's share of current fees
                    const currentUserShareOfFees0 =
                        BigInt(currentFeeData.outputTokenSupply) > 0
                            ? (currentAccumulatedFees0 *
                                  Number(toEth(acc.currentBalance, currentFeeData.outputToken.decimals))) /
                              Number(toEth(currentFeeData.outputTokenSupply, currentFeeData.outputToken.decimals))
                            : 0;

                    const currentUserShareOfFees1 =
                        BigInt(currentFeeData.outputTokenSupply) > 0
                            ? (currentAccumulatedFees1 *
                                  Number(toEth(acc.currentBalance, currentFeeData.outputToken.decimals))) /
                              Number(toEth(currentFeeData.outputTokenSupply, currentFeeData.outputToken.decimals))
                            : 0;

                    // Add current earnings to accumulated earnings
                    acc.earningsToken0 += currentUserShareOfFees0;
                    acc.earningsToken1 += currentUserShareOfFees1;
                }

                return {
                    tokenId: pool.farmId.toString(),
                    earnings0:
                        priceToken0 > 0
                            ? toWei(acc.earningsToken0 / priceToken0, Number(decimalsToken0)).toString()
                            : "0",
                    earnings1:
                        priceToken1 > 0
                            ? toWei(acc.earningsToken1 / priceToken1, Number(decimalsToken1)).toString()
                            : "0",
                    token0: lastToken0,
                    token1: lastToken1,
                };
            })
        );

        return earnings;
    } catch (err: any) {
        console.error(err);
        return [];
    }
};

const getEarningsForBurrbear = async (combinedTransactions: any): Promise<VaultEarnings[]> => {
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

                let acc = {
                    currentBalance: BigInt(0),
                    earningsToken0: 0,
                    lastFee0: 0,
                    tokenId: pool.farmId,
                };

                let lastToken0 = pool.lp_addr;
                let lpPrice = 0;

                // Batch all transactions into a single GraphQL query
                if (sortedTransactions.length > 0) {
                    // Construct a batched query with aliases for each transaction
                    const batchedFeeQuery = `
                        query GetBatchedLPFees {
                            ${sortedTransactions
                                .map(
                                    (transaction: any, index: number) => `
                            pool${index}: pool(id: "${pool.underlyingVault}", block: {number: ${transaction.blockNumber}}) {
                                totalSwapFee
                                totalLiquidity
                                tokens {
                                    priceRate
                                    address
                                    token {
                                        latestUSDPrice
                                    }
                                }
                            }`
                                )
                                .join("\n")}
                        }`;

                    // Make a single API call for all transactions
                    const batchedFeeResponse = await axios.post(BURRBEAR_EARNINGS_GRAPH_URL, {
                        query: batchedFeeQuery,
                    });
                    const batchedFeeData = batchedFeeResponse.data.data;

                    // Process each transaction with the batched data
                    for (let i = 0; i < sortedTransactions.length; i++) {
                        const transaction = sortedTransactions[i];
                        const feeData = batchedFeeData[`pool${i}`];

                        if (!feeData) continue; // Skip if data is missing

                        const accumulatedFees0 = feeData.totalSwapFee - acc.lastFee0;
                        let lpPrice = feeData.tokens.find((token: any) => token.address === pool.lp_addr.toLowerCase())
                            ?.token.latestUSDPrice;

                        if (lpPrice === undefined) {
                            const priceData = await getPricesByTime([
                                {
                                    address: pool.lp_addr,
                                    timestamp: Number(transaction.blockTimestamp),
                                    chainId: 80094,
                                },
                            ]);
                            lpPrice = priceData?.[80094][pool.lp_addr][0].price;
                        }

                        // Calculate the user's share of fees based on their balance relative to total LP tokens
                        const userShareOfFees0 =
                            acc.currentBalance > 0 && feeData.totalLiquidity > 0
                                ? (accumulatedFees0 * Number(toEth(acc.currentBalance))) /
                                  Number(feeData.totalLiquidity / lpPrice)
                                : 0;

                        acc.earningsToken0 += userShareOfFees0;

                        if (transaction.type === "deposit") {
                            acc.currentBalance += BigInt(transaction.value);
                        } else if (transaction.type === "withdraw") {
                            acc.currentBalance -= BigInt(transaction.value);
                        }

                        acc.lastFee0 = feeData.totalSwapFee;
                    }
                }

                // Calculate earnings from last transaction to current moment
                if (acc.currentBalance > 0) {
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

                    const currentFeeResponse = await axios.post(BURRBEAR_EARNINGS_GRAPH_URL, {
                        query: currentFeeQuery,
                    });

                    const currentFeeData = currentFeeResponse.data.data.pool;
                    lpPrice = currentFeeData.tokens.find((token: any) => token.address === pool.lp_addr.toLowerCase())
                        ?.token.latestUSDPrice;

                    if (lpPrice === undefined) {
                        const priceData = await getPricesByTime([
                            { address: pool.lp_addr, timestamp: Math.floor(Date.now() / 1000), chainId: 80094 },
                        ]);
                        lpPrice = priceData?.[80094][pool.lp_addr][0].price || 0;
                    }

                    // Calculate accumulated fees since last transaction
                    const currentAccumulatedFees0 = currentFeeData.totalSwapFee - acc.lastFee0;

                    // Calculate user's share of current fees
                    const currentUserShareOfFees0 =
                        currentFeeData.totalLiquidity > 0
                            ? (currentAccumulatedFees0 * Number(toEth(acc.currentBalance))) /
                              Number(currentFeeData.totalLiquidity / lpPrice)
                            : 0;

                    // Add current earnings to accumulated earnings
                    acc.earningsToken0 += currentUserShareOfFees0;
                }

                return {
                    tokenId: pool.farmId.toString(),
                    earnings0: lpPrice > 0 ? toWei(acc.earningsToken0 / lpPrice).toString() : "0",
                    token0: lastToken0,
                };
            })
        );
        return earnings;
    } catch (error) {
        console.error(error);
        return [];
    }
};

