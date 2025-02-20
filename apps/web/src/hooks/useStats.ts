import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UsersTableColumns } from "src/types/enums";
import {
    fetchBoostedApy,
    fetchCountActiveUsers,
    fetchUserTVLs,
    fetchVaultStats,
    fetchTVLsBasicInfo,
    fetchTotalBtxPoints,
    fetchFacetUsersCount,
    fetchAccountConnectorsStats,
} from "src/api/stats";
import useFarms from "../state/farms/hooks/useFarms";
import useWallet from "./useWallet";

export const useStats = (forGalxe?: boolean) => {
    const [page, setPage] = useState<number>(1);
    // @ts-ignore
    const [sortBy, setSortBy] = useState<UsersTableColumns>(UsersTableColumns.TraxEarned);
    const [order, setOrder] = useState<"" | "-">("-");
    const [search, setSearch] = useState("");
    const { farms } = useFarms();
    const { currentWallet, isConnecting } = useWallet();

    const { isLoading, error, data, isFetching } = useQuery({
        queryKey: ["stats/tvl", page, sortBy, order, search],
        queryFn: () => fetchUserTVLs(page, sortBy, order, search),
    });

    const { data: userPosition, isLoading: isLoadingUserPosition } = useQuery({
        queryKey: ["stats/user-position" + forGalxe, page, sortBy, order, search],
        queryFn: () => fetchUserTVLs(page, sortBy, order, currentWallet!, true, Boolean(forGalxe)),
        enabled: !!currentWallet,
    });

    const { data: userTvlsForLeaderBoard, isLoading: isLoadingUserTvlsForLeaderBoard } = useQuery({
        queryKey: ["stats/tvl-for-leaderboard" + forGalxe, page, sortBy, order, search],
        queryFn: () => fetchUserTVLs(page, sortBy, order, search, true, Boolean(forGalxe)),
    });

    const { data: activeUsers } = useQuery({
        queryKey: ["stats/count/active-users"],
        queryFn: () => fetchCountActiveUsers(),
    });

    const { data: vaultStatsTemp } = useQuery({
        queryKey: ["stats/tvl/vaults"],
        queryFn: () => fetchVaultStats(),
    });

    // const { data: tvlBasicInfo } = useQuery({
    //     queryKey: ["stats/tvl/basic-info"],
    //     queryFn: () => fetchTVLsBasicInfo(),
    // });

    const { data: totalBtxPoints } = useQuery({
        queryKey: ["stats/total-btx-points"],
        queryFn: () => fetchTotalBtxPoints(),
    });

    // const { data: aprBoost } = useQuery({
    //     queryKey: ["stats/arb"],
    //     queryFn: () => fetchBoostedApy(),
    // });

    const { isLoading: isFacetUsersLoading, data: facetUserCount } = useQuery({
        queryKey: ["stats/facet-users-count"],
        queryFn: () => fetchFacetUsersCount(),
    });

    const { data: accountConnectorsStats } = useQuery({
        queryKey: ["stats/account-connectors"],
        queryFn: () => fetchAccountConnectorsStats(),
    });

    const vaultStats = useMemo(
        () =>
            vaultStatsTemp?.map((vault) => ({
                ...vault,
                name: farms.find((farm) => farm.vault_addr === vault.address)?.name,
                isDeprecated: farms.find((farm) => farm.vault_addr === vault.address)?.isDeprecated,
            })),
        [vaultStatsTemp, farms]
    );

    return {
        ...data?.data,
        userTVLs: data?.data.data,
        userPosition: userPosition?.data.data?.[0],
        userTvlsForLeaderBoard: userTvlsForLeaderBoard?.data.data,
        accountConnectorsStats,
        totalBtxPoints: totalBtxPoints?.totalBTXPoints[0].totalBTXPoints,
        facetUserCount,
        vaultStats,
        setPage,
        sortBy,
        setSortBy,
        activeUsers,
        apyBoost: 0, //aprBoost?.aprBoost,
        order,
        setOrder,
        search,
        setSearch,
        isLoading: isLoading || isFetching || isLoadingUserTvlsForLeaderBoard || isLoadingUserPosition || isConnecting,
        isFacetUsersLoading,
        error: error as unknown as string,
    };
};
