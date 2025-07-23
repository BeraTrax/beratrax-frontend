import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";
import { fetchETFComposition } from "../api/stats";

export const useETFVault = (etfVaultAddress: Address) => {
	const {
		data: etfComposition,
		isLoading,
		isError,
		error,
		isFetched,
		refetch,
	} = useQuery({
		queryKey: ["etf-composition", etfVaultAddress],
		queryFn: () => fetchETFComposition(etfVaultAddress),
	});

	return {
		etfComposition: etfComposition?.data.composition,
		isLoading,
		isError,
		error,
		isFetched,
		refetch,
	};
};
