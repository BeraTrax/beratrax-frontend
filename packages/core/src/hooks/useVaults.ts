import { useMemo } from "react";
import { Vault } from "./../types";
import { useFarmApys } from "../state/farms/hooks/useFarmApy";
import useFarms from "../state/farms/hooks/useFarms";
import useTokens from "../state/tokens/useTokens";
import { useQuery } from "@tanstack/react-query";
import { fetchSpecificVaultTvl, fetchSpecificVaultApy } from "../api/stats";
import { isETFVault, isRegularPool } from "../utils/farmTypeGuards";

export const useVaults = (): { vaults: Vault[]; isLoading: boolean; isFetched: boolean } => {
	const { farms } = useFarms();
	const {
		balances: usersVaultBalances,
		isBalancesLoading: isLoadingUserBalances,
		isBalancesFetched: isFetchedUserBalances,
		prices: priceOfSingleToken,
		isPricesLoading: isLoadingPricesOfSingleToken,
		isPricesFetched: isFetchedPricesOfSingleToken,
	} = useTokens();

	const { apys, isLoading: isLoadingApys, isFetched: isFetchedApys } = useFarmApys();

	const vaults = useMemo(() => {
		return farms
			// .filter(isRegularPool)
			.map((farm) => {
				return {
					...farm,
					userVaultBalance: usersVaultBalances[farm.chainId]?.[farm.vault_addr]?.value || 0,
					priceOfSingleToken: priceOfSingleToken[farm.chainId]?.[farm.vault_addr] || (farm.stableCoin ? 1 : 0),
					apys: apys[farm.id],
				};
			})
			.filter((farm) => farm?.userVaultBalance && farm?.priceOfSingleToken && farm.userVaultBalance * farm.priceOfSingleToken >= 0.01);
	}, [apys, usersVaultBalances, priceOfSingleToken]);

	const etfVaults = useMemo(() => {
		return farms.filter(isETFVault).map((farm) => {
			return {
				...farm,
				userVaultBalance: usersVaultBalances[farm.chainId]?.[farm.vault_addr]?.value || 0,
				priceOfSingleToken: priceOfSingleToken[farm.chainId]?.[farm.vault_addr] || 0,
				apys: apys[farm.id],
			};
		});
	}, [apys, usersVaultBalances, priceOfSingleToken]);

	return {
		vaults,
		isLoading: isLoadingPricesOfSingleToken || isLoadingApys || isLoadingUserBalances,
		isFetched: isFetchedPricesOfSingleToken && isFetchedApys && isFetchedUserBalances,
	};
};

export const useSpecificVaultTvl = (id: number) => {
	const {
		data: vaultTvl,
		isLoading: isLoadingVaultTvl,
		isFetched: isFetchedVaultTvl,
	} = useQuery({
		queryKey: ["stats/vault/tvl/30d", id],
		queryFn: () => fetchSpecificVaultTvl(id),
	});

	return {
		vaultTvl,
		isLoading: isLoadingVaultTvl,
		isFetched: isFetchedVaultTvl,
	};
};

export const useSpecificVaultApy = (id: number) => {
	const {
		data: vaultApy,
		isLoading: isLoadingVaultApy,
		isFetched: isFetchedVaultApy,
	} = useQuery({
		queryKey: ["stats/apy/30d", id],
		queryFn: () => fetchSpecificVaultApy(id),
	});

	return {
		vaultApy,
		isLoading: isLoadingVaultApy,
		isFetched: isFetchedVaultApy,
	};
};
