import { useMemo } from "react";
import { Vault } from "./../types";
import { useFarmApys } from "../state/farms/hooks/useFarmApy";
import useFarms from "../state/farms/hooks/useFarms";
import useTokens from "../state/tokens/useTokens";

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

	return {
		vaults,
		isLoading: isLoadingPricesOfSingleToken || isLoadingApys || isLoadingUserBalances,
		isFetched: isFetchedPricesOfSingleToken && isFetchedApys && isFetchedUserBalances,
	};
};
