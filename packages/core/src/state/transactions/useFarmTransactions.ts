import { useInfiniteQuery } from "@tanstack/react-query";
import { getFarmTxHistory } from "./../../api/transaction";
import useWallet from "./../../hooks/useWallet";
import { Transaction } from "./../../state/transactions/types";
import { useMemo } from "react";

export const useFarmTransactions = (farmId?: number, limit: number = 20) => {
	const { currentWallet } = useWallet();

	const { data, isLoading, error, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery<Transaction[]>({
		queryKey: ["transaction/farm-tx-history", currentWallet, farmId, limit],
		queryFn: ({ pageParam }) => {
			return getFarmTxHistory(farmId, currentWallet, limit, pageParam as Transaction | undefined);
		},
		getNextPageParam: (lastPage) => {
			// If the last page has fewer items than the limit, we've reached the end
			if (!lastPage || lastPage.length < limit) {
				return undefined;
			}
			// Return the last transaction to use as cursor for next page
			return lastPage[lastPage.length - 1];
		},
		initialPageParam: undefined,
		enabled: !!currentWallet,
	});

	// Flatten all pages into a single array
	const transactions = useMemo(() => {
		if (!data?.pages) return [];
		return data.pages.flat();
	}, [data?.pages]);

	// Check if all data has been fetched
	const fetchedAll = !hasNextPage;

	// Function to fetch more transactions
	const fetchTransactions = async () => {
		if (hasNextPage && !isFetchingNextPage) {
			await fetchNextPage();
		}
	};

	return {
		data: transactions,
		isLoading,
		isFetching: isFetching || isFetchingNextPage,
		error: error as unknown as string,
		fetchTransactions,
		fetchedAll,
		hasNextPage,
	};
};
