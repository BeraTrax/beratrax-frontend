import { useIsMutating, useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import useWallet from "../../../hooks/useWallet";
import farmFunctions from "./../../../api/pools";
import { StCoreFarmFunctions } from "./../../../api/pools/types";
import { FARM_REDEEM } from "./../../../config/constants/query";

const farmId = 301;
const useStCoreRedeem = () => {
	const { currentWallet, getPublicClient, getWalletClient, estimateTxGas } = useWallet();
	const _redeem = async () => {
		if (!currentWallet) return;
		await (farmFunctions[farmId] as StCoreFarmFunctions).redeem({
			currentWallet,
			getPublicClient,
			getWalletClient,
			estimateTxGas,
		});
	};

	const {
		mutate: redeem,
		mutateAsync: redeemAsync,
		status,
	} = useMutation({
		mutationFn: _redeem,
		mutationKey: FARM_REDEEM(currentWallet!, farmId || 0),
	});

	const redeemIsMutating = useIsMutating({ mutationKey: FARM_REDEEM(currentWallet!, farmId) });

	/**
	 * True if any zap function is runnning
	 */
	const isLoading = useMemo(() => {
		return redeemIsMutating > 0;
	}, [redeemIsMutating]);

	return { isLoading, redeem: redeemAsync };
};

export default useStCoreRedeem;
