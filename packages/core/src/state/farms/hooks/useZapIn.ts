import { useIsMutating, useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { Address } from "viem";
import useWallet from "../../../hooks/useWallet";
import { toEth, toWei } from "../../../utils/common";
import useTokens from "../../tokens/useTokens";
import farmFunctions from "./../../../api/pools";
import { PoolDef } from "./../../../config/constants/pools_json";
import { FARM_ZAP_IN } from "./../../../config/constants/query";
import { useAppDispatch } from "./../../../state";

export interface ZapIn {
	zapAmount: number;
	max?: boolean;
	token: Address;
	bridgeChainId?: number;
	txId: string;
}

const useZapIn = (farm: PoolDef) => {
	const { currentWallet, getClients, getPublicClient, getWalletClient, isSocial, estimateTxGas } = useWallet();
	const { reloadBalances, balances, decimals, prices, reloadSupplies } = useTokens();
	const dispatch = useAppDispatch();

	const _zapIn = async ({ zapAmount, max, token, bridgeChainId, txId }: ZapIn) => {
		if (!currentWallet) return;
		let amountInWei = toWei(zapAmount, decimals[farm.chainId][token]);

		await farmFunctions[farm.id].zapIn({
			id: txId,
			currentWallet,
			isSocial,
			amountInWei,
			balances,
			max,
			getClients,
			estimateTxGas,
			token,
			prices,
			decimals,
			getPublicClient,
			getWalletClient,
			bridgeChainId,
		});

		reloadBalances();
		reloadSupplies();
	};

	const slippageZapIn = async ({ zapAmount, max, token }: Omit<ZapIn, "txId">) => {
		if (!currentWallet) return;
		let amountInWei = toWei(zapAmount, decimals[farm.chainId][token]);
		if (!farmFunctions[farm.id]?.zapInSlippage) throw new Error("No zapInSlippage function");
		const {
			receviedAmt: difference,
			slippage,
			afterTxAmount,
			beforeTxAmount,
			bestFunctionName,
			// @ts-expect-error
		} = await farmFunctions[farm.id].zapInSlippage({
			currentWallet,
			amountInWei,
			balances,
			getClients,
			isSocial,
			farm,
			max,
			estimateTxGas,
			token,
			prices,
			decimals,
			getPublicClient,
			getWalletClient,
		});

		console.log({
			vaultPrice: prices[farm.chainId][farm.vault_addr],
			lpPrice: prices[farm.chainId][farm.lp_address],
			lpAddr: farm.lp_address,
			tokenPrice: prices[farm.chainId][token],
			tokenAddr: token,
			zapAmount,
			difference,
			differenceEth: toEth(difference),
			afterDepositAmount: afterTxAmount,
			beforeDepositAmount: beforeTxAmount,
			slippage,
		});
		return { afterDepositAmount: afterTxAmount, beforeDepositAmount: beforeTxAmount, slippage, bestFunctionName };
	};

	const {
		mutate: zapIn,
		mutateAsync: zapInAsync,
		status,
	} = useMutation({
		mutationFn: _zapIn,
		mutationKey: FARM_ZAP_IN(currentWallet!, farm?.id || 0),
	});

	const zapInIsMutating = useIsMutating({ mutationKey: FARM_ZAP_IN(currentWallet!, farm?.id || 0) });

	/**
	 * True if any zap function is runnning
	 */
	const isLoading = useMemo(() => {
		return zapInIsMutating > 0;
	}, [zapInIsMutating]);

	return { isLoading, zapIn, zapInAsync, status, slippageZapIn };
};

export default useZapIn;
