import { useQuery } from "@tanstack/react-query";
import { getFarmTxHistory } from "./../../api/transaction";
import useWallet from "./../../hooks/useWallet";
import { Transaction } from "./../../state/transactions/types";

export const useFarmTransactions = (farmId?: number, limit?: number) => {
	const { currentWallet } = useWallet();
	const { isLoading, error, data, isFetching } = useQuery<Transaction[]>({
		queryKey: ["transaction/farm-tx-history", currentWallet, farmId, limit],
		queryFn: () => getFarmTxHistory(farmId, currentWallet, limit),
	});

	return {
		data,
		isLoading,
		isFetching,
		error: error as unknown as string,
	};
};
