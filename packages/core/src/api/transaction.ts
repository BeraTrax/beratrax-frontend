import { Address } from "viem";
import { backendApi } from ".";
import { Transaction } from "../state/transactions/types";

export const getWithdrawChainForFarm = async (from: Address, farmId: number) => {
	const res = await backendApi.get<{ data: number }>(`/transaction/get-withdraw-chain-for-farm/${farmId}/${from}`);
	return res.data.data;
};

export const getFarmTxHistory = async (farmId?: number, walletAddress?: Address, limit?: number) => {
	if (!walletAddress) return [];

	const res = await backendApi.get<{ data: Transaction[] }>(
		`transaction/farm-tx-history?${farmId ? `farmId=${farmId}&` : ""}from=${walletAddress}${limit ? `&limit=${limit}` : ""}&sort=-date`
	);
	return res.data.data;
};
