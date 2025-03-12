import { backendApi } from ".";

interface ResponseDataType {
    data: number;
    status: boolean;
}

interface TransactionCountResponse {
    data: {
        transactionCount: number;
    };
    status: boolean;
}

interface PlatformTVLGraphResponse {
    data: {
        tvl: number;
        timestamp: number;
    }[];
}

export const fetchPlatformTVL = async () => {
    return await backendApi.get<ResponseDataType>(`stats/platform-tvl`);
};

export const fetchTransactionCount = async () => {
    const res = await backendApi.get<TransactionCountResponse>(`stats/transaction-count`);
    return res.data.data;
};

export const fetchPlatformTVLHistory = async () => {
    const res = await backendApi.get<PlatformTVLGraphResponse>(`stats/platform-tvl/history`);
    return res.data.data;
};
