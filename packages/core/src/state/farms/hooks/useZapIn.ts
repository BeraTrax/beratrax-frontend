import { useIsMutating, useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { Address } from "viem";
import useWallet from "../../../hooks/useWallet";
import { toEth, toWei } from "../../../utils/common";
import { isETFVault, isRegularPool } from "../../../utils/farmTypeGuards";
import useTokens from "../../tokens/useTokens";
import farmFunctions from "./../../../api/pools";
import { ZapInBaseFn, ZapInBaseETFFn, SlippageInBaseFn, SlippageInBaseETFFn } from "./../../../api/pools/types";
import { PoolDef, ETFVaultDef } from "./../../../config/constants/pools_json";
import { FARM_ZAP_IN } from "./../../../config/constants/query";
import { useAppDispatch } from "./../../../state";

export interface ZapIn {
	zapAmount: number;
	max?: boolean;
	token: Address;
	bridgeChainId?: number;
	txId: string;
}

const useZapIn = (farm: PoolDef | ETFVaultDef) => {
	const { currentWallet, getClients, getPublicClient, getWalletClient, isSocial, estimateTxGas } = useWallet();
	const { reloadBalances, balances, decimals, prices, reloadSupplies } = useTokens();
	const dispatch = useAppDispatch();

	const _zapIn = async ({ zapAmount, max, token, bridgeChainId, txId }: ZapIn) => {
		if (!currentWallet) return;
		let amountInWei = toWei(zapAmount, decimals[farm.chainId][token]);

		if (isRegularPool(farm)) {
			const zapInFn = farmFunctions[farm.id].zapIn as ZapInBaseFn;
			await zapInFn({
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
				farm,
			});
		} else if (isETFVault(farm)) {
			const zapInFn = farmFunctions[farm.id].zapIn as ZapInBaseETFFn;
			await zapInFn({
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
				farm,
			});
		}

		reloadBalances();
		reloadSupplies();
	};

	const slippageZapIn = async ({ zapAmount, max, token }: Omit<ZapIn, "txId">) => {
		if (!currentWallet) return;
		let amountInWei = toWei(zapAmount, decimals[farm.chainId][token]);
		if (!farmFunctions[farm.id]?.zapInSlippage) throw new Error("No zapInSlippage function");

		let result;

		if (isRegularPool(farm)) {
			const slippageFn = farmFunctions[farm.id].zapInSlippage as SlippageInBaseFn;
			result = await slippageFn({
				id: "",
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
		} else if (isETFVault(farm)) {
			const slippageFn = farmFunctions[farm.id].zapInSlippage as SlippageInBaseETFFn;
			result = await slippageFn({
				id: "",
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
		}

		if (!result) throw new Error("Failed to get slippage result");

		const { receviedAmt: difference, slippage, afterTxAmount, beforeTxAmount, bestFunctionName } = result;

		console.log({
			vaultPrice: prices[farm.chainId][farm.vault_addr],
			lpPrice: isRegularPool(farm) ? prices[farm.chainId][farm.lp_address] : undefined,
			lpAddr: isRegularPool(farm) ? farm.lp_address : undefined,
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
