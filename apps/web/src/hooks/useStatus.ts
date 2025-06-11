import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { AutoCompoundResult } from "src/api/stats";
import { fetchVaultStats } from "src/api/stats";

export const useStatus = () => {
    const {
        data: autoCompoundData,
        refetch: refetchAutoCompoundStats,
        isRefetching: isRefetchingAutoCompoundStats,
        isLoading: isLoadingAutoCompoundStats,
        error: autoCompoundStatsError,
    } = useQuery<{ vaults: any[]; autoCompound: AutoCompoundResult[] }>({
        queryKey: ["stats/tvl/vaults"],
        // limit of 720 is due to the fact that our autocompound script runs every 2 minutes
        // and we want to get the latest 6 hours of data
        queryFn: () => fetchVaultStats(1, 720, true),
    });

    return useMemo(() => {
        return {
            autoCompoundStats: autoCompoundData?.autoCompound || [],
            refetchAutoCompoundStats,
            isRefetchingAutoCompoundStats,
            isLoadingAutoCompoundStats,
            autoCompoundStatsError: autoCompoundStatsError as unknown as string,
        };
    }, [
        autoCompoundData,
        refetchAutoCompoundStats,
        isRefetchingAutoCompoundStats,
        isLoadingAutoCompoundStats,
        autoCompoundStatsError,
    ]);
};