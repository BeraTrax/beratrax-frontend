import { useMemo } from "react";
import useWallet from "../../../hooks/useWallet";
import { useIsMutating, useMutation } from "@tanstack/react-query";
import { FARM_ZAP_OUT } from "@core/config/constants/query";
import farmFunctions from "@core/api/pools";
import useTokens from "../../tokens/useTokens";
import { toEth, toWei } from "@core/utils/common";
import { Address } from "viem";
import { PoolDef } from "@core/config/constants/pools_json";
import { useAppDispatch } from "@core/state";
import { TransactionStatus } from "@core/state/transactions/types";
import { addTransactionDb } from "@core/state/transactions/transactionsReducer";

export interface ZapOut {
  withdrawAmt: number;
  max?: boolean;
  token: Address;
  bridgeChainId?: number;
  txId: string;
}

const useZapOut = (farm: PoolDef) => {
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

    await farmFunctions[farm.id].zapOut({
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
    });
    reloadBalances();
    reloadSupplies();
  };

  const slippageZapOut = async ({ withdrawAmt, max, token }: Omit<ZapOut, "txId">) => {
    if (!currentWallet) return;
    let amountInWei = toWei(withdrawAmt, farm.decimals);

    // @ts-expect-error
    const { receviedAmt, afterTxAmount, beforeTxAmount, slippage, bestFunctionName } = await farmFunctions[
      farm.id
    ]?.zapOutSlippage({
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
