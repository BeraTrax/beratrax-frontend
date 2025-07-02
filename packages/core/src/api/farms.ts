import axios from "axios";
import { createPublicClient, getContract, PublicClient } from "viem";
import vaultAbi from "@beratrax/core/src/assets/abis/vault.json";
import { getPublicClientConfiguration } from "@beratrax/core/src/utils/common";
import {
	EARNINGS_GRAPH_URL,
	STEER_PROTOCOL_EARNINGS_GRAPH_URL,
	KODIAK_EARNINGS_GRAPH_URL,
	BURRBEAR_EARNINGS_GRAPH_URL,
} from "@beratrax/core/src/config/constants";
import pools_json, { activePoolIdsOfAllPlatforms } from "@beratrax/core/src/config/constants/pools_json";
import store from "@beratrax/core/src/state";
import { VaultEarnings } from "@beratrax/core/src/state/farms/types";
import { CHAIN_ID, FarmOriginPlatform } from "@beratrax/core/src/types/enums";
import { toEth, toWei } from "@beratrax/core/src/utils/common";
import { getPricesByTime } from "@beratrax/core/src/api/token";
import { getApyByTime } from "@beratrax/core/src/api/stats";
import { IClients } from "@beratrax/mobile/config/mobileWalletConfig";
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

interface CalculateFinalPositionAssetsParams {
	vault_addr: `0x${string}`;
	client: PublicClient;
	balances: any;
	chainId: number;
}

const calculateFinalPositionAssets = async ({
	vault_addr,
	client,
	balances,
	chainId,
}: CalculateFinalPositionAssetsParams): Promise<bigint> => {
	const contract = getContract({
		address: vault_addr,
		abi: vaultAbi.abi,
		client,
	});
	const currentShares = balances[chainId][vault_addr]?.valueWei || BigInt(0);
	const currentAssets = (await contract.read.convertToAssets([currentShares])) as bigint;
	return currentAssets;
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

// @notice: for now, it is only possible to fetch 1000 transactions at a time
// no support for next page
const fetchAllTransactions = async (query: string, variables = {}) => {
	let skip = 0;
	const pageSize = 1000;

	const response = await axios.post(EARNINGS_GRAPH_URL, {
		query,
		variables: {
			...variables,
			first: pageSize,
			skip,
		},
	});
	return response.data.data as Record<keyof typeof FarmOriginPlatform | "iBERA", Record<string, any>[]>;
};

export const getEarningsForPlatforms = async (userAddress: string) => {
	try {
		const client = createPublicClient(getPublicClientConfiguration()) as IClients["public"];
		const earningsSubgraphQuery = prepareSubgraphQuery(activePoolIdsOfAllPlatforms);

		const balances = store.getState().tokens.balances;

		const transactionsByPlatform = await fetchAllTransactions(earningsSubgraphQuery, { userAddress: userAddress.toLowerCase() });

		const [
			infraredEarnings,
			steerEarnings,
			kodiakEarnings,
			burrbearEarnings,
			iberaEarnings,
			berapawEarnings,
			bearnEarnings,
			beratraxEarnings,
			apyBasedEarnings,
		] = await Promise.all([
			getEarningsForInfrared(transactionsByPlatform.Infrared, client, balances),
			getEarningsForSteer(transactionsByPlatform.Steer, client, balances),
			getEarningsForKodiak([...transactionsByPlatform.Kodiak, ...transactionsByPlatform.BeraPaw], client, balances),
			getEarningsForBurrbear(transactionsByPlatform.Burrbear, client, balances),
			calculateIBeraEarnings(transactionsByPlatform.iBERA),
			calculateBerapawEarnings(transactionsByPlatform.BeraPaw),
			getEarningsForBearn(transactionsByPlatform.Bearn, client, balances),
			getEarningsForBeraTrax(transactionsByPlatform.BeraTrax, client, balances),
			getApyBasedEarnings(Object.values(transactionsByPlatform).flat()),
		]);

		return [
			...infraredEarnings,
			...steerEarnings,
			...kodiakEarnings,
			...burrbearEarnings,
			iberaEarnings,
			...berapawEarnings,
			...bearnEarnings,
			...beratraxEarnings,
			...apyBasedEarnings,
		];
	} catch (err: any) {
		console.error(err);
		return [];
	}
};

const getEarningsForInfrared = async (infraredPoolsTxs: any, client: PublicClient, balances: any): Promise<VaultEarnings[]> => {
	try {
		const infraredPoolIds = activePoolIdsOfAllPlatforms[FarmOriginPlatform.Infrared.name];
		const infraredPools = pools_json
			.filter((pool) => infraredPoolIds.includes(pool.id))
			.map((pool) => ({
				vault_addr: pool.vault_addr,
				lp_addr: pool.lp_address,
				chainId: pool.chainId,
				farmId: pool.id,
			}));

		let filteredTransactions: any[] = [];
		let remainings = infraredPoolsTxs;

		const earnings = await Promise.all(
			infraredPools.map(async (pool) => {
				const picked = [];
				/**
				 * @dev: this loop will trim down the transactions to have only those pools which haven't been picked yet
				 * @description: those transaction which have been processed will be skipped in the next iteration.
				 * @example: if there are 4 transactions. 2 for pool1 and 2 for pool2. This loop will run on 4 transactions
				 * and pick 2 of them. In the next iteration, it will run on the remaining 2 transactions and pick 2 of them.
				 */
				for (const transaction of remainings) {
					if (transaction.tokenId === pool.farmId.toString()) {
						picked.push(transaction);
					} else {
						filteredTransactions.push(transaction);
					}
				}

				remainings = filteredTransactions;
				filteredTransactions = [];

				// If no transactions, return zero earnings
				if (picked.length === 0) {
					return {
						tokenId: pool.farmId.toString(),
						earnings0: "0",
						token0: pool.lp_addr,
					};
				}

				const { lifetimeEarnings, finalPositionAssets } = await calculateLifetimeLpEarnings(picked, pool.vault_addr, client, balances);

				// Get only the last transaction
				const lastTransaction = picked[picked.length - 1];
				const lastTransactionAssets = BigInt(lastTransaction.userAssetBalance);

				const changeInAssets = finalPositionAssets - lastTransactionAssets;

				// If user has no balance after the last transaction, return zero earnings
				if (changeInAssets <= 0) {
					return {
						tokenId: pool.farmId.toString(),
						earnings0: "0",
						token0: pool.lp_addr,
						lifetimeEarnings: lifetimeEarnings.toString(),
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

const getEarningsForSteer = async (steerPoolsTxs: any, client: PublicClient, balances: any): Promise<VaultEarnings[]> => {
	try {
		const steerPoolIds = activePoolIdsOfAllPlatforms[FarmOriginPlatform.Steer.name];

		const steerPools = pools_json
			.filter((pool) => steerPoolIds.includes(pool.id))
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

		let filteredTransactions: any[] = [];
		let remainings = steerPoolsTxs;

		const earnings = await Promise.all(
			steerPools.map(async (pool) => {
				const picked = [];
				let token0 = "";
				let token1 = "";

				/**
				 * @dev: this loop will trim down the transactions to have only those pools which haven't been picked yet
				 * @description: those transaction which have been processed will be skipped in the next iteration.
				 * @example: if there are 4 transactions. 2 for pool1 and 2 for pool2. This loop will run on 4 transactions
				 * and pick 2 of them. In the next iteration, it will run on the remaining 2 transactions and pick 2 of them.
				 */
				for (const transaction of remainings) {
					if (transaction.tokenId === pool.farmId.toString()) {
						picked.push(transaction);
					} else {
						filteredTransactions.push(transaction);
					}
				}

				remainings = filteredTransactions;
				filteredTransactions = [];

				// If no transactions, return zero earnings
				if (picked.length === 0) {
					return {
						tokenId: pool.farmId.toString(),
						earnings0: "0",
						earnings1: "0",
						token0: "",
						token1: "",
					};
				}

				// Get only the last transaction
				const lastTransaction = picked[picked.length - 1];

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

const getEarningsForKodiak = async (kodiakAndBerapawTxs: any, client: PublicClient, balances: any): Promise<VaultEarnings[]> => {
	try {
		// Although no need to check for berapaw, since initially kodiak pools have the berapaw ids.
		// see file://pools_json.js → GetActivePoolIdsOfAllPlatforms()
		const kodiakPoolsIds = [
			...activePoolIdsOfAllPlatforms[FarmOriginPlatform.Kodiak.name],
			// ...activePoolIdsOfAllPlatforms[FarmOriginPlatform.BeraPaw.name],
		];

		const kodiakPools = pools_json
			.filter((pool) => kodiakPoolsIds.includes(pool.id))
			.filter((pool) => pool.id !== 43 && pool.id !== 44)
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
		let filteredTransactions: any[] = [];
		let remainings = kodiakAndBerapawTxs;

		const earnings = await Promise.all(
			kodiakPools.map(async (pool) => {
				const picked = [];

				/**
				 * @dev: this loop will trim down the transactions to have only those pools which haven't been picked yet
				 * @description: those transaction which have been processed will be skipped in the next iteration.
				 * @example: if there are 4 transactions. 2 for pool1 and 2 for pool2. This loop will run on 4 transactions
				 * and pick 2 of them. In the next iteration, it will run on the remaining 2 transactions and pick 2 of them.
				 */
				for (const transaction of remainings) {
					if (transaction.tokenId === pool.farmId.toString()) {
						picked.push(transaction);
					} else {
						filteredTransactions.push(transaction);
					}
				}

				remainings = filteredTransactions;
				filteredTransactions = [];

				// @dev: no need for filteration, since these transactions are already sorted by blockTimestamp in the subgraph query
				// If no transactions, return zero earnings
				if (picked.length === 0) {
					return {
						tokenId: pool.farmId.toString(),
						earnings0: "0",
						token0: pool.lp_addr,
					};
				}

				const { lifetimeEarnings, finalPositionAssets } = await calculateLifetimeLpEarnings(picked, pool.vault_addr, client, balances);

				// Get only the last transaction
				const lastTransaction = picked[picked.length - 1];
				const lastTransactionAssets = BigInt(lastTransaction.userAssetBalance);

				const changeInAssets = finalPositionAssets - lastTransactionAssets;

				// If user has no balance after the last transaction, return zero earnings
				if (changeInAssets <= 0) {
					return {
						tokenId: pool.farmId.toString(),
						earnings0: "0",
						token0: pool.lp_addr,
						lifetimeEarnings: lifetimeEarnings.toString(),
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
						lifetimeEarnings: lifetimeEarnings.toString(),
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
						? (accumulatedFees0 * Number(toEth(finalPositionAssets, currentFeeData.outputToken.decimals))) /
							Number(toEth(currentFeeData.outputTokenSupply, currentFeeData.outputToken.decimals))
						: 0;

				// Calculate token prices
				const priceToken0 = currentFeeData.outputTokenPriceUSD;
				const earnings0 =
					priceToken0 > 0 ? toWei(userShareOfFees0 / priceToken0, Number(currentFeeData.outputToken.decimals)).toString() : "0";

				return {
					tokenId: pool.farmId.toString(),
					earnings0,
					token0: pool.lp_addr,
					changeInAssets: changeInAssets.toString(),
					lifetimeEarnings: (lifetimeEarnings + BigInt(earnings0)).toString(), // Added earnings0 to lifetimeEarnings to make sure lifetimeEarnings is atleast equal to current earnings
				};
			})
		);

		return earnings;
	} catch (err: any) {
		console.error(err);
		return [];
	}
};

const getEarningsForBurrbear = async (burrbearPoolsTxs: any, client: PublicClient, balances: any): Promise<VaultEarnings[]> => {
	try {
		const burrbearPoolIds = activePoolIdsOfAllPlatforms[FarmOriginPlatform.Burrbear.name];
		const burrbearPools = pools_json
			.filter((pool) => burrbearPoolIds.includes(pool.id))
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

		let filteredTransactions: any[] = [];
		let remainings = burrbearPoolsTxs;

		const earnings = await Promise.all(
			burrbearPools.map(async (pool) => {
				const picked = [];

				/**
				 * @dev: this loop will trim down the transactions to have only those pools which haven't been picked yet
				 * @description: those transaction which have been processed will be skipped in the next iteration.
				 * @example: if there are 4 transactions. 2 for pool1 and 2 for pool2. This loop will run on 4 transactions
				 * and pick 2 of them. In the next iteration, it will run on the remaining 2 transactions and pick 2 of them.
				 */
				for (const transaction of remainings) {
					if (transaction.tokenId === pool.farmId.toString()) {
						picked.push(transaction);
					} else {
						filteredTransactions.push(transaction);
					}
				}

				remainings = filteredTransactions;
				filteredTransactions = [];

				// If no transactions, return zero earnings
				if (picked.length === 0) {
					return {
						tokenId: pool.farmId.toString(),
						earnings0: "0",
						token0: pool.lp_addr,
					};
				}

				const { lifetimeEarnings, finalPositionAssets } = await calculateLifetimeLpEarnings(picked, pool.vault_addr, client, balances);

				// Get only the last transaction
				const lastTransaction = picked[picked.length - 1];
				const lastTransactionAssets = BigInt(lastTransaction.userAssetBalance);

				const changeInAssets = finalPositionAssets - lastTransactionAssets;

				// If user has no balance after the last transaction, return zero earnings
				if (changeInAssets <= 0) {
					return {
						tokenId: pool.farmId.toString(),
						earnings0: "0",
						token0: pool.lp_addr,
						lifetimeEarnings: lifetimeEarnings.toString(),
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
						lifetimeEarnings: lifetimeEarnings.toString(),
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
				let lpPrice = currentFeeData.tokens.find((token: any) => token.address === pool.lp_addr.toLowerCase())?.token.latestUSDPrice;

				if (lpPrice === undefined) {
					const priceData = await getPricesByTime([{ address: pool.lp_addr, timestamp: Math.floor(Date.now() / 1000), chainId: 80094 }]);
					lpPrice = priceData?.[80094][pool.lp_addr][0].price || 0;
				}

				// Calculate accumulated fees since last transaction
				const accumulatedFees = currentFeeData.totalSwapFee - lastFeeData.totalSwapFee;

				// Calculate user's share of these fees
				const userShareOfFees =
					currentFeeData.totalLiquidity > 0
						? (accumulatedFees * Number(toEth(finalPositionAssets))) / Number(currentFeeData.totalLiquidity / lpPrice)
						: 0;

				const earnings0 = lpPrice > 0 ? toWei(userShareOfFees / lpPrice).toString() : "0";

				return {
					tokenId: pool.farmId.toString(),
					earnings0,
					token0: pool.lp_addr,
					changeInAssets: changeInAssets.toString(),
					lifetimeEarnings: (lifetimeEarnings + BigInt(earnings0)).toString(), // Added earnings0 to lifetimeEarnings to make sure lifetimeEarnings is atleast equal to current earnings
				};
			})
		);
		return earnings;
	} catch (error) {
		console.error(error);
		return [];
	}
};

const calculateIBeraEarnings = async (iberaPool42: any): Promise<VaultEarnings> => {
	try {
		const iberaPool = pools_json.find((pool) => pool.id === 42);
		if (!iberaPool) {
			return {
				tokenId: "42",
				earnings0: "0",
				token0: "0x4D6f6580a78EEaBEE50f3ECefD19E17a3f4dB302",
				changeInAssets: "0",
				lifetimeEarnings: "0",
			};
		}

		if (iberaPool42.length === 0) {
			return {
				tokenId: "42",
				earnings0: "0",
				token0: iberaPool.lp_address,
				changeInAssets: "0",
				lifetimeEarnings: "0",
			};
		}

		const currentTimestamp = Math.floor(Date.now() / 1000);

		// Batch all timestamps for APY fetch
		const timestamps = iberaPool42.map((tx: any) => ({
			address: iberaPool.vault_addr,
			timestamp: Number(tx.blockTimestamp),
			chainId: iberaPool.chainId,
		}));

		const apyData = await getApyByTime(timestamps);

		let totalEarnings = BigInt(0);
		let lastEarnings = BigInt(0);

		for (let i = 0; i < iberaPool42.length; i++) {
			const tx = iberaPool42[i];
			const nextTx = iberaPool42[i + 1];
			const start = Number(tx.blockTimestamp);
			const end = nextTx ? Number(nextTx.blockTimestamp) : currentTimestamp;
			const timePeriod = end - start;
			const timeInYears = timePeriod / (365 * 24 * 60 * 60);

			const apyObj = apyData?.[iberaPool.chainId]?.[iberaPool.vault_addr]?.find(
				(entry) => Math.abs(entry.timestamp - start) < 3600 // within 1 hour
			);
			const apy = apyObj?.apy?.rewardsApr ?? 0;
			const apyPercent = Math.floor((apy / 100) * 1e18); // scaled for precision

			const userBalance = BigInt(tx.userAssetBalance || "0");
			const earnings = (userBalance * BigInt(apyPercent) * BigInt(Math.floor(timeInYears * 1e18))) / BigInt(1e36);

			totalEarnings += earnings;
			if (i === iberaPool42.length - 1) {
				lastEarnings = earnings;
			}
		}

		return {
			tokenId: "42",
			earnings0: lastEarnings.toString(),
			token0: iberaPool.lp_address,
			lifetimeEarnings: totalEarnings.toString(),
		};
	} catch (error) {
		console.error(error);
		return {
			tokenId: "42",
			earnings0: "0",
			token0: "0x4D6f6580a78EEaBEE50f3ECefD19E17a3f4dB302",
			changeInAssets: "0",
			lifetimeEarnings: "0",
		};
	}
};

const calculateBerapawEarnings = async (berapawPoolsTxs: any): Promise<VaultEarnings[]> => {
	try {
		const berapawPools = pools_json.filter(
			(pool) => pool.originPlatform === FarmOriginPlatform.BeraPaw.name && pool.secondary_platform === undefined
		);

		let filteredTransactions: any[] = [];
		let remainings = berapawPoolsTxs;

		const earnings = await Promise.all(
			berapawPools.map(async (pool) => {
				const picked = [];

				/**
				 * @dev: this loop will trim down the transactions to have only those pools which haven't been picked yet
				 * @description: those transaction which have been processed will be skipped in the next iteration.
				 * @example: if there are 4 transactions. 2 for pool1 and 2 for pool2. This loop will run on 4 transactions
				 * and pick 2 of them. In the next iteration, it will run on the remaining 2 transactions and pick 2 of them.
				 */
				for (const transaction of remainings) {
					if (transaction.tokenId === pool.id.toString()) {
						picked.push(transaction);
					} else {
						filteredTransactions.push(transaction);
					}
				}

				remainings = filteredTransactions;
				filteredTransactions = [];

				if (picked.length === 0) {
					return {
						tokenId: pool.id.toString(),
						earnings0: "0",
						token0: pool.lp_address,
						changeInAssets: "0",
						lifetimeEarnings: "0",
					};
				}

				const currentTimestamp = Math.floor(Date.now() / 1000);

				// Batch all timestamps for APY fetch
				const timestamps = picked.map((tx: any) => ({
					address: pool.vault_addr,
					timestamp: Number(tx.blockTimestamp),
					chainId: pool.chainId,
				}));

				const apyData = await getApyByTime(timestamps);
				let totalEarnings = BigInt(0);
				let lastEarnings = BigInt(0);

				for (let i = 0; i < picked.length; i++) {
					const tx = picked[i];
					const nextTx = picked[i + 1];
					const start = Number(tx.blockTimestamp);
					const end = nextTx ? Number(nextTx.blockTimestamp) : currentTimestamp;
					const timePeriod = end - start;
					const timeInYears = timePeriod / (365 * 24 * 60 * 60);

					const apyObj = apyData?.[pool.chainId]?.[pool.vault_addr]?.find(
						(entry) => Math.abs(entry.timestamp - start) < 3600 // within 1 hour
					);
					const apy = apyObj?.apy?.beratraxApr ?? 0;
					const apyPercent = Math.floor((apy / 100) * 1e18); // scaled for precision

					const userBalance = BigInt(tx.userAssetBalance || "0");
					const earnings = (userBalance * BigInt(apyPercent) * BigInt(Math.floor(timeInYears * 1e18))) / BigInt(1e36);

					totalEarnings += earnings;
					if (i === picked.length - 1) {
						lastEarnings = earnings;
					}
				}

				return {
					tokenId: pool.id.toString(),
					earnings0: lastEarnings.toString(),
					token0: pool.lp_address,
					lifetimeEarnings: totalEarnings.toString(),
				};
			})
		);
		return earnings;
	} catch (error) {
		console.error(error);
		return [];
	}
};

const getEarningsForBearn = async (bearnPoolsTxs: any, client: PublicClient, balances: any): Promise<VaultEarnings[]> => {
	try {
		const bearnPoolIds = activePoolIdsOfAllPlatforms[FarmOriginPlatform.Bearn.name];
		const bearnPools = pools_json
			.filter((pool) => bearnPoolIds.includes(pool.id))
			.map((pool) => ({
				vault_addr: pool.vault_addr,
				lp_addr: pool.lp_address,
				chainId: pool.chainId,
				farmId: pool.id,
			}));

		let filteredTransactions: any[] = [];
		let remainings = bearnPoolsTxs;

		const earnings = await Promise.all(
			bearnPools.map(async (pool) => {
				const picked = [];

				/**
				 * @dev: this loop will trim down the transactions to have only those pools which haven't been picked yet
				 * @description: those transaction which have been processed will be skipped in the next iteration.
				 * @example: if there are 4 transactions. 2 for pool1 and 2 for pool2. This loop will run on 4 transactions
				 * and pick 2 of them. In the next iteration, it will run on the remaining 2 transactions and pick 2 of them.
				 */
				for (const transaction of remainings) {
					if (transaction.tokenId === pool.farmId.toString()) {
						picked.push(transaction);
					} else {
						filteredTransactions.push(transaction);
					}
				}

				remainings = filteredTransactions;
				filteredTransactions = [];

				// If no transactions, return zero earnings
				if (picked.length === 0) {
					return {
						tokenId: pool.farmId.toString(),
						earnings0: "0",
						token0: pool.lp_addr,
					};
				}

				const lifetimeEarnings = await calculateLifetimeLpEarnings(picked, pool.vault_addr, client, balances);

				// Get only the last transaction
				const lastTransaction = picked[picked.length - 1];
				const lastTransactionAssets = BigInt(lastTransaction.userAssetBalance);

				const finalPositionAssets = await calculateFinalPositionAssets({
					vault_addr: pool.vault_addr!,
					client,
					balances,
					chainId: pool.chainId,
				});

				const changeInAssets = finalPositionAssets - lastTransactionAssets;

				// If user has no balance after the last transaction, return zero earnings
				if (changeInAssets <= 0) {
					return {
						tokenId: pool.farmId.toString(),
						earnings0: "0",
						token0: pool.lp_addr,
						lifetimeEarnings: lifetimeEarnings.toString(),
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

const getEarningsForBeraTrax = async (beratraxPoolsTxs: any, client: PublicClient, balances: any): Promise<VaultEarnings[]> => {
	try {
		const beratraxPoolIds = activePoolIdsOfAllPlatforms[FarmOriginPlatform.BeraTrax.name];
		const beratraxPools = pools_json
			.filter((pool) => beratraxPoolIds.includes(pool.id))
			.map((pool) => ({
				vault_addr: pool.vault_addr,
				lp_addr: pool.lp_address,
				chainId: pool.chainId,
				farmId: pool.id,
			}));

		let filteredTransactions: any[] = [];
		let remainings = beratraxPoolsTxs;
		/**
		 * @dev: this loop will trim down the transactions to have only those pools which haven't been picked yet
		 * @description: those transaction which have been processed will be skipped in the next iteration.
		 * @example: if there are 4 transactions. 2 for pool1 and 2 for pool2. This loop will run on 4 transactions
		 * and pick 2 of them. In the next iteration, it will run on the remaining 2 transactions and pick 2 of them.
		 */
		const earnings = await Promise.all(
			beratraxPools.map(async (pool) => {
				const picked = [];

				for (const transaction of remainings) {
					if (transaction.tokenId === pool.farmId.toString()) {
						picked.push(transaction);
					} else {
						filteredTransactions.push(transaction);
					}
				}

				remainings = filteredTransactions;
				filteredTransactions = [];

				// If no transactions, return zero earnings
				if (picked.length === 0) {
					return {
						tokenId: pool.farmId.toString(),
						earnings0: "0",
						token0: pool.lp_addr,
					};
				}

				const lifetimeEarnings = await calculateLifetimeLpEarnings(picked, pool.vault_addr, client, balances);

				// Get only the last transaction
				const lastTransaction = picked[picked.length - 1];
				const lastTransactionAssets = BigInt(lastTransaction.userAssetBalance);

				const finalPositionAssets = await calculateFinalPositionAssets({
					vault_addr: pool.vault_addr!,
					client,
					balances,
					chainId: pool.chainId,
				});

				const changeInAssets = finalPositionAssets - lastTransactionAssets;

				// If user has no balance after the last transaction, return zero earnings
				if (changeInAssets <= 0) {
					return {
						tokenId: pool.farmId.toString(),
						earnings0: "0",
						token0: pool.lp_addr,
						lifetimeEarnings: lifetimeEarnings.toString(),
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

const getApyBasedEarnings = async (combinedTransactions: any): Promise<VaultEarnings[]> => {
	try {
		const berapawPools = pools_json.filter((pool) => pool.apyBasedEarnings);

		const earnings = await Promise.all(
			berapawPools.map(async (pool) => {
				const filtered = combinedTransactions.filter((tx: any) => tx.tokenId === pool.id.toString());

				if (filtered.length === 0) {
					return {
						tokenId: pool.id.toString(),
						earnings0: "0",
						token0: pool.lp_address,
						changeInAssets: "0",
						lifetimeEarnings: "0",
					};
				}

				const currentTimestamp = Math.floor(Date.now() / 1000);

				// Batch all timestamps for APY fetch
				const timestamps = filtered.map((tx: any) => ({
					address: pool.vault_addr,
					timestamp: Number(tx.blockTimestamp),
					chainId: pool.chainId,
				}));

				timestamps.push({
					address: pool.vault_addr,
					timestamp: Number(currentTimestamp),
					chainId: pool.chainId,
				});

				const apyData = await getApyByTime(timestamps);
				let totalEarnings = BigInt(0);
				let lastEarnings = BigInt(0);

				for (let i = 0; i < filtered.length; i++) {
					const tx = filtered[i];
					const nextTx = filtered[i + 1];
					const start = Number(tx.blockTimestamp);
					const end = nextTx ? Number(nextTx.blockTimestamp) : currentTimestamp;
					const timePeriod = end - start;
					const timeInYears = timePeriod / (365 * 24 * 60 * 60);

					const apyObj = apyData?.[pool.chainId]?.[pool.vault_addr]?.find(
						(entry) => Math.abs(entry.timestamp - end) < 3600 // within 1 hour
					);
					const apy = apyObj?.apy?.beratraxApr ?? 0;
					const apyPercent = Math.floor((apy / 100) * 1e18); // scaled for precision

					const userBalance = BigInt(tx.userAssetBalance || "0");
					const earnings = (userBalance * BigInt(apyPercent) * BigInt(Math.floor(timeInYears * 1e18))) / BigInt(1e36);

					totalEarnings += earnings;
					if (i === filtered.length - 1) {
						lastEarnings = earnings;
					}
				}

				return {
					tokenId: pool.id.toString(),
					earnings0: lastEarnings.toString(),
					token0: pool.lp_address,
					lifetimeEarnings: totalEarnings.toString(),
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
): Promise<{ lifetimeEarnings: bigint; finalPositionAssets: bigint }> => {
	if (!transactions || transactions.length === 0) return { lifetimeEarnings: BigInt(0), finalPositionAssets: BigInt(0) };

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

	const positionValue = await calculateFinalPositionAssets({
		vault_addr: vault_addr as `0x${string}`,
		client,
		balances,
		chainId: 80094,
	});

	const lifetimeEarnings = totalWithdrawn + positionValue - totalDeposited;

	return { lifetimeEarnings, finalPositionAssets: positionValue };
};

const prepareSubgraphQuery = (tokenIdsGrouped: any) => {
	// Initialize the query string
	let query = `
	query GetUserTransactions($userAddress: Bytes!, $first: Int, $skip: Int) {
		iBERA: transactions(
			where: {from: $userAddress, tokenId: 42}
			orderBy: blockTimestamp
			orderDirection: asc
		) {
			type
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
		}`;

	// Iterate through each project's tokenIds and generate corresponding GraphQL queries
	Object.keys(tokenIdsGrouped).forEach((platformName) => {
		query += `
			${platformName}: transactions(
					first: $first
					skip: $skip
					where: {from: $userAddress, platformName: "${platformName}"}
					orderBy: blockTimestamp
					orderDirection: asc
			) {
					type
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
			}\n`;
	});
	query += `}`;

	return query;
};
