import axios from "axios";
import { EARNINGS_GRAPH_URL } from "src/config/constants";
import { getPricesByTime, getTokenPricesBackend } from "src/api/token";
import { CHAIN_ID, FarmOriginPlatform } from "src/types/enums";
import { toEth, toWei } from "src/utils/common";
import store from "src/state";
import { getContract, createPublicClient, http, PublicClient } from "viem";
import vaultAbi from "src/assets/abis/vault.json";
import pools_json from "src/config/constants/pools_json";
import { berachain } from "viem/chains";
import { VaultEarnings } from "src/state/farms/types";

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
        const infraredEarnings = await getEarningsForInfrared(deposits, withdraws, client, balances);
        const steerEarnings = await getEarningsForSteer(deposits, withdraws, client, balances);
        return [...infraredEarnings, ...steerEarnings];
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
const getEarningsForSteer = async (
    deposits: any,
    withdraws: any,
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

                // Process transactions sequentially
                for (const transaction of sortedTransactions) {
                    const feeQuery = `
                        query GetLPFee {
                            vault(id: "${pool.underlyingVault}", block: {number: ${transaction.blockNumber}}) {
                                fees0
                                fees1
                                totalLPTokensIssued
                                totalAmount0
                                totalAmount1
                                token1Balance
                                token1
                                token0Symbol
                                token0Name
                                token0Decimals
                                token0Balance
                                token0
                            }
                        }`;

                    const feeResponse = await axios.post(
                        `https://api.goldsky.com/api/public/project_clohj3ta78ok12nzs5m8yag0b/subgraphs/steer-protocol-bera/prod/gn`,
                        { query: feeQuery }
                    );

                    const feeData = feeResponse.data.data.vault;
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
