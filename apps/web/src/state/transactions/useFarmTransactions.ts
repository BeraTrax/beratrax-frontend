import { useQuery } from "@tanstack/react-query";
import { getFarmTxHistory } from "src/api/transaction";
import useWallet from "src/hooks/useWallet";

export const useFarmTransactions = (farmId?: number, limit?: number) => {
    const { currentWallet } = useWallet();
    const { isLoading, error, data, isFetching } = useQuery({
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

