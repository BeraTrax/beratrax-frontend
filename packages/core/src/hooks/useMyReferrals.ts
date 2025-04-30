import { useQuery } from "@tanstack/react-query";
import { fetchReferrals } from "./../api/referrals";
import { REFFERED_ACCOUNTS } from "./../config/constants/query";
import useWallet from "./useWallet";

export const useMyReferrals = () => {
	const { currentWallet } = useWallet();

	const { isLoading, error, data, isFetching } = useQuery({
		queryKey: REFFERED_ACCOUNTS(currentWallet!),
		queryFn: () => fetchReferrals(currentWallet!),
		enabled: !!currentWallet,
	});

	return { referrals: data?.data.data.accounts, isLoading: isLoading || isFetching, error, currentWallet };
};
