import { backendApi } from ".";
import { Order, AccountDetails } from "src/types";
import { UsersTableColumns } from "src/types/enums";

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

interface VaultStatsResponse {
    data: {
        vaults: VaultStats[];
    };
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

interface VaultStats {
    address: string;
    name?: string;
    averageDeposit: number;
    depositedTvl: number;
    numberOfDeposits: number;
    _id: string;
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

export const fetchUserTVLs = async (
    page: number,
    sortBy: UsersTableColumns | undefined,
    order: Order,
    search: string,
    sortBySum: boolean = false,
    sortBySumForGalxe: boolean = false
) => {
    return backendApi.get<UserStatsResponse>(
        `stats/tvl?page=${page}&limit=20&sort=${
            order + sortBy
        }&address=${search}&sortBySum=${sortBySum}&sortBySumForGalxe=${sortBySumForGalxe}`
    );
};

export const fetchTVLsBasicInfo = async () => {
    return backendApi.get<UserStatsResponse>(`stats/tvl/basic-info`);
};

export const fetchCountActiveUsers = async () => {
    const res = await backendApi.get<{ data: { activeUsers: number } }>(`stats/count/active-users`);
    return res.data.data.activeUsers;
};

export const fetchVaultStats = async () => {
    const res = await backendApi.get<VaultStatsResponse>(`stats/tvl/vaults`);
    return res.data.data.vaults;
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

