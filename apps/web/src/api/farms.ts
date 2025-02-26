import axios from "axios";
import { EARNINGS_GRAPH_URL } from "src/config/constants";
import { getPricesByTime, getTokenPricesBackend } from "src/api/token";
import { CHAIN_ID, FarmOriginPlatform } from "src/types/enums";
import { toEth, toWei } from "src/utils/common";
import store from "src/state";
import { getContract, createPublicClient, http } from "viem";
import vaultAbi from "src/assets/abis/vault.json";
import pools_json from "src/config/constants/pools_json";
import { berachain } from "viem/chains";

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

export const getEarningsForInfrared = async (userAddress: string) => {
    try {
        const client = createPublicClient({
            chain: berachain,
            transport: http(),
        });

        const infraredPools = pools_json
            .filter((pool) => !pool.isUpcoming && !pool.isDeprecated)
            .filter((pool) => pool.originPlatform === FarmOriginPlatform.Infrared)
            .map((pool) => ({
                vault_addr: pool.vault_addr,
                lp_addr: pool.lp_address,
                chainId: pool.chainId,
                farmId: pool.id,
            }));

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

        const depositsByTokenId = deposits.reduce((acc: any, deposit: any) => {
            const tokenId = deposit.tokenId;
            const matchingPool = infraredPools.find((pool) => pool.farmId.toString() === tokenId);
            if (!matchingPool) return acc;

            if (!acc[tokenId]) {
                acc[tokenId] = {
                    totalShares: BigInt(0),
                    totalValue: BigInt(0),
                    lpAddress: matchingPool.lp_addr || "",
                    tokenName: deposit.tokenName,
                    platformName: deposit.platformName,
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

        lpTokensPerShareResults.forEach((result) => {
            if (withdrawsByTokenId[result.tokenId]) {
                withdrawsByTokenId[result.tokenId].lpTokensPerShare = result.lpTokensPerShare;
            }
        });

        const earningsDifferences = Object.keys(withdrawsByTokenId).map((tokenId: string) => {
            const withdrawData = withdrawsByTokenId[tokenId];
            const vaultAddress = withdrawData.vaultAddress;
            const currentShares = balances[80094][vaultAddress].valueWei;
            const currentLpTokens = Number(toEth(withdrawData.lpTokensPerShare)) * Number(toEth(BigInt(currentShares)));
            const earnings =
                withdrawData.totalValue + toWei(currentLpTokens, 18) - depositsByTokenId[tokenId]?.totalValue;
            return {
                tokenId,
                earnings: earnings.toString(),
            };
        });
        return earningsDifferences;
    } catch (err: any) {
        console.error(err);
        return {};
    }
};