import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import useFarms from "@beratrax/core/src/state/farms/hooks/useFarms";
import {
	fetchCountActiveUsers,
	fetchUserTVLs,
	fetchVaultStats,
	fetchTotalBtxPoints,
	fetchFacetUsersCount,
	fetchAccountConnectorsStats,
	VaultStatsResponse,
	VaultStat,
	AutoCompoundResult,
} from "@beratrax/core/src/api/stats";
import { UsersTableColumns } from "@beratrax/core/src/types/enums";
import useWallet from "@beratrax/core/src/hooks/useWallet";
import { PoolDef } from "@beratrax/core/src/config/constants/pools_json";

export const useStats = (forGalxe?: boolean) => {
	const [page, setPage] = useState<number>(1);
	const [vaultStatsPage, setVaultStatsPage] = useState<number>(1);
	const [vaultStatsLimit, setVaultStatsLimit] = useState<number>(20);
	const [onlyAutoCompound, setOnlyAutoCompound] = useState<boolean>(false);
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

	const {
		data: vaultStatsTemp,
		refetch: refetchVaultStats,
		isRefetching: isRefetchingVaultStats,
	} = useQuery<VaultStatsResponse["data"]>({
		queryKey: ["stats/tvl/vaults", vaultStatsPage, vaultStatsLimit, onlyAutoCompound],
		queryFn: () => fetchVaultStats(vaultStatsPage, vaultStatsLimit, onlyAutoCompound),
		enabled: window.location.pathname === "/stats",
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
		enabled: window.location.pathname === "/stats",
	});

	const vaultStats = useMemo(() => {
		if (!vaultStatsTemp) return [];

		return vaultStatsTemp.vaults.flatMap((vault) => {
			const farm = farms.find((farm) => farm.vault_addr === vault.address) as PoolDef;
			if (!farm || farm.isETFVault) return []; // Skips this vault
			const autoCompoundResult = vaultStatsTemp.autoCompound?.[0];
			const autoCompoundFarmResult = autoCompoundResult?.data?.[farm?.id];
			const vaultStatsRecord = {
				...vault,
				name: farm.name,
				originPlatform: farm.originPlatform,
				secondaryPlatform: farm.secondary_platform,
				isDeprecated: farm.isDeprecated,
				id: farm.id,
			};
			let autoCompoundStats = {};
			//because not every vault has is auto compounded
			if (autoCompoundResult && autoCompoundFarmResult) {
				autoCompoundStats = {
					autoCompoundLastRunAt: autoCompoundResult.lastFinishedAt,
					autoCompoundStatus: autoCompoundResult.status,
					autoCompoundRunTime: autoCompoundResult.runTime,
					autoCompoundHarvestSuccess: autoCompoundFarmResult.harvestSuccess,
					autoCompoundHarvestStatus: autoCompoundFarmResult.harvestSuccess ? "-" : autoCompoundFarmResult.harvestStatus,
					autoCompoundHarvestReturnData: autoCompoundFarmResult.harvestSuccess ? "-" : autoCompoundFarmResult.harvestReturnData,
					autoCompoundEarnSuccess: autoCompoundFarmResult.earnSuccess,
					autoCompoundEarnStatus: autoCompoundFarmResult.earnSuccess ? "-" : autoCompoundFarmResult.earnStatus,
					autoCompoundEarnReturnData: autoCompoundFarmResult.earnSuccess ? "-" : autoCompoundFarmResult.earnReturnData,
				};
			}
			return {
				...vaultStatsRecord,
				...autoCompoundStats,
			} as VaultStat;
		});
	}, [vaultStatsTemp, farms]);

	return {
		...data?.data,
		userTVLs: data?.data.data,
		userPosition: userPosition?.data.data?.[0],
		userTvlsForLeaderBoard: userTvlsForLeaderBoard?.data.data,
		accountConnectorsStats,
		totalBtxPoints: totalBtxPoints?.totalBTXPoints[0].totalBTXPoints,
		facetUserCount,
		vaultStats,
		vaultStatsPage,
		setVaultStatsPage,
		vaultStatsLimit,
		setVaultStatsLimit,
		refetchVaultStats,
		isRefetchingVaultStats,
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
