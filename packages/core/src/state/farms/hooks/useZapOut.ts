import { useIsMutating, useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { Address } from "viem";
import useWallet from "../../../hooks/useWallet";
import { toWei } from "../../../utils/common";
import { isETFVault, isRegularPool } from "../../../utils/farmTypeGuards";
import useTokens from "../../tokens/useTokens";
import farmFunctions from "./../../../api/pools";
import { ZapOutBaseFn, ZapOutBaseETFFn, SlippageOutBaseFn, SlippageOutBaseETFFn } from "./../../../api/pools/types";
import { PoolDef, ETFVaultDef } from "./../../../config/constants/pools_json";
import { FARM_ZAP_OUT } from "./../../../config/constants/query";
import { useAppDispatch } from "./../../../state";

export interface ZapOut {
	withdrawAmt: number;
	max?: boolean;
	token: Address;
	bridgeChainId?: number;
	txId: string;
}

const useZapOut = (farm: PoolDef | ETFVaultDef) => {
	const { currentWallet, getClients, getPublicClient, isSocial, estimateTxGas, getWalletClient } = useWallet();
	const { reloadBalances, balances, decimals, prices, reloadSupplies } = useTokens();
	const dispatch = useAppDispatch();

	const _zapOut = async ({ withdrawAmt, max, token, txId, bridgeChainId }: ZapOut) => {
		if (!currentWallet) return;
		let amountInWei = 0n;
		if (max) {
			amountInWei = BigInt(balances[farm.chainId][farm.vault_addr].valueWei);
		} else {
			amountInWei = toWei(withdrawAmt, farm.decimals);
		}

		if (isRegularPool(farm)) {
			const zapOutFn = farmFunctions[farm.id].zapOut as ZapOutBaseFn;
			await zapOutFn({
				id: txId,
				amountInWei,
				getPublicClient,
				getWalletClient,
				estimateTxGas,
				decimals,
				currentWallet,
				isSocial,
				getClients,
				max,
				prices,
				token,
				bridgeChainId,
				farm,
			});
		} else if (isETFVault(farm)) {
			const zapOutFn = farmFunctions[farm.id].zapOut as ZapOutBaseETFFn;
			await zapOutFn({
				id: txId,
				amountInWei,
				getPublicClient,
				getWalletClient,
				estimateTxGas,
				decimals,
				currentWallet,
				isSocial,
				getClients,
				max,
				prices,
				token,
				bridgeChainId,
				farm,
			});
		}

		reloadBalances();
		reloadSupplies();
	};

	const slippageZapOut = async ({ withdrawAmt, max, token }: Omit<ZapOut, "txId">) => {
		if (!currentWallet) return;
		let amountInWei = toWei(withdrawAmt, farm.decimals);

		let result;

		if (isRegularPool(farm)) {
			const slippageFn = farmFunctions[farm.id]?.zapOutSlippage as SlippageOutBaseFn;
			result = await slippageFn({
				id: "",
				currentWallet,
				amountInWei,
				farm,
				balances,
				decimals,
				getClients,
				isSocial,
				max,
				estimateTxGas,
				getPublicClient,
				prices,
				getWalletClient,
				token,
			});
		} else if (isETFVault(farm)) {
			const slippageFn = farmFunctions[farm.id]?.zapOutSlippage as SlippageOutBaseETFFn;
			result = await slippageFn({
				id: "",
				currentWallet,
				amountInWei,
				farm,
				balances,
				decimals,
				getClients,
				isSocial,
				max,
				estimateTxGas,
				getPublicClient,
				prices,
				getWalletClient,
				token,
			});
		}

		if (!result) throw new Error("Failed to get slippage result");

		const { receviedAmt, afterTxAmount, beforeTxAmount, slippage, bestFunctionName } = result;

		return { afterWithdrawAmount: afterTxAmount, beforeWithdrawAmount: beforeTxAmount, slippage, bestFunctionName };
	};

	const {
		mutate: zapOut,
		mutateAsync: zapOutAsync,
		status,
	} = useMutation({
		mutationFn: _zapOut,
		mutationKey: FARM_ZAP_OUT(currentWallet!, farm?.id || 0),
	});

	const zapOutIsMutating = useIsMutating({ mutationKey: FARM_ZAP_OUT(currentWallet!, farm?.id || 0) });

	/**
	 * True if any zap function is runnning
	 */
	const isLoading = useMemo(() => {
		return zapOutIsMutating > 0;
	}, [zapOutIsMutating]);

	return { isLoading, zapOut, zapOutAsync, status, slippageZapOut };
};

export default useZapOut;
