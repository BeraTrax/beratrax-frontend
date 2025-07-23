import { backendApi } from ".";
import { Order, AccountDetails } from "@beratrax/core/src/types";
import { UsersTableColumns } from "@beratrax/core/src/types/enums";
import { Address } from "viem";

interface UserStatsResponse {
	data: AccountDetails[];
	limit: number;
	page: number;
	hasPrevPage: number;
	hasNextPage: number;
	totalPages: number;
	totalDocs: number;
	meanTvl: number;
	medianTvl: number;
	modeTvl: number;
	status: boolean;
}

interface ReferralDashboardResponse {
	data: ReferralStats[];
	status: boolean;
}

export interface ReferralStats {
	address: string;
	tvlFromReferrals: number;
	referreredAddresses: string[];
}

export interface AutoCompoundResult {
	data: {
		[farmId: number]: {
			harvestSuccess: boolean;
			earnSuccess: boolean;
			harvestStatus: string;
			earnStatus: string;
			earnReturnData: string;
			harvestReturnData: string;
		};
	};
	lastModifiedBy: string;
	lastFinishedAt: string;
	status: string;
	runTime: number;
}
interface AutoCompoundProcessed {
	autoCompoundLastRunAt: string;
	autoCompoundRunTime: string | number;
	autoCompoundHarvestSuccess: boolean;
	autoCompoundEarnSuccess: boolean;
	autoCompoundStatus: string;
	autoCompoundHarvestStatus: string;
	autoCompoundEarnStatus: string;
}
export interface BasicVaultStats {
	address: string;
	name?: string;
	averageDeposit: number;
	depositedTvl: number;
	numberOfDeposits: number;
	_id: string;
}

export interface VaultStat extends AutoCompoundProcessed, BasicVaultStats {
	id: number; //farm id
	isDeprecated?: boolean;
	originPlatform: string;
	secondaryPlatform?: string;
}
export interface VaultStatsResponse {
	data: {
		vaults: BasicVaultStats[];
		autoCompound: AutoCompoundResult[];
	};
	status: boolean;
}

interface VaultsApyResponse {
	data: {
		beratraxApy: VaultsApy[];
		underlyingApr: VaultsApy[];
	};
}

export interface VaultsApy {
	apy: number;
	timestamp: number;
}

export interface BoostedApy {
	aprBoost: number;
}

export interface LP_Prices {
	lp: number;
	timestamp: number;
}

interface LP_PricesResponse {
	data: LP_Prices[];
}

interface VaultTvlResponse {
	data: TVLHistory[];
}

export interface TVLHistory {
	tvl: number;
	timestamp: number;
}

interface FacetUsersCountResponse {
	data: {
		facetUsersCount: number;
	};
	status: boolean;
}

export interface AccountConnectorsStatsResponse {
	data: AccountConnectorsStats[];
	status: boolean;
}

export interface AccountConnectorsStats {
	connector: string;
	count: number;
}

export interface ETFCompositionResponse {
	status: boolean;
	data: {
		composition: ETFComposition[];
		etfVault: ETFVaultInfo;
	};
}

export interface ETFComposition {
	vaultAddress: Address;
	name: string;
	currentValueUSD: number;
}

export interface ETFVaultInfo {
	address: Address;
	id: number;
	name: string;
	numberOfUnderlyingVaults: number;
	timestamp: string;
	currentValueUSD: number;
	status: boolean;
}

export const fetchUserTVLs = async (
	page: number,
	sortBy: UsersTableColumns | undefined,
	order: Order,
	search: string,
	sortBySum: boolean = false,
	sortBySumForGalxe: boolean = false
) => {
	return backendApi.get<UserStatsResponse>(
		`stats/tvl?page=${page}&limit=20&sort=${order + sortBy}&address=${search}&sortBySum=${sortBySum}&sortBySumForGalxe=${sortBySumForGalxe}`
	);
};

export const fetchTVLsBasicInfo = async () => {
	return backendApi.get<UserStatsResponse>(`stats/tvl/basic-info`);
};

export const fetchCountActiveUsers = async () => {
	const res = await backendApi.get<{ data: { activeUsers: number } }>(`stats/count/active-users`);
	return res.data.data.activeUsers;
};

export const fetchVaultStats = async (page: number = 1, limit: number = 20, onlyAutoCompound: boolean = false) => {
	const res = await backendApi.get<VaultStatsResponse>(`stats/tvl/vaults?page=${page}&limit=${limit}&onlyAutoCompound=${onlyAutoCompound}`);
	return res.data.data;
};

export const fetchReferralDashboard = async () => {
	const res = await backendApi.get<ReferralDashboardResponse>(`stats/referral-dashboard`);
	return res.data.data;
};

export const fetchSpecificFarmApy = async (id: number) => {
	const res = await backendApi.get<VaultsApyResponse>(`stats/apy/30d?farmId=${id}`);
	return res.data.data;
};

export const fetchBoostedApy = async () => {
	const res = await backendApi.get<BoostedApy>(`stats/arb`);
	return res.data;
};

export const fetchSpecificLpPrice = async (id: number) => {
	const res = await backendApi.get<LP_PricesResponse>(`stats/lp/30d?farmId=${id}`);
	return res.data.data;
};

export const fetchSpecificVaultTvl = async (id: number) => {
	const res = await backendApi.get<VaultTvlResponse>(`stats/vault/tvl/30d?farmId=${id}`);
	return res.data.data;
};

export const fetchSpecificVaultApy = async (id: number) => {
	const res = await backendApi.get<VaultsApyResponse>(`stats/vault/apy/30d?farmId=${id}`);
	return res.data.data;
};

export const getApyByTime = async (data: { address: Address; timestamp: number; chainId: number }[]) => {
	try {
		const res = await backendApi.post<{
			data: {
				[chainId: string]: {
					[address: string]: {
						timestamp: number;
						apy: { rewardsApr: number; beratraxApr: number; feeApr: number };
					}[];
				};
			};
		}>("stats/vault/apy/time", { query: data }, { cache: true });
		return res.data.data;
	} catch (err) {
		return undefined;
	}
};

export const fetchTotalBtxPoints = async () => {
	const res = await backendApi.get(`stats/total-btx-points`);
	return res.data.data;
};

export const fetchFacetUsersCount = async () => {
	const res = await backendApi.get<FacetUsersCountResponse>(`stats/facet-users-count`);
	return res.data.data.facetUsersCount;
};

export const fetchAccountConnectorsStats = async () => {
	const res = await backendApi.get<AccountConnectorsStatsResponse>(`stats/account-connectors`);
	return res.data.data;
};

export const fetchETFComposition = async (etfVaultAddress: Address): Promise<ETFCompositionResponse> => {
	try {
		const response = await backendApi.get(`vault/etf-composition/${etfVaultAddress}`);
		return response.data;
	} catch (error) {
		console.error("Error fetching ETF composition:", error);
		throw error;
	}
};
