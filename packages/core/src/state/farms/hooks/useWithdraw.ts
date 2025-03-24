import { useIsMutating, useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { parseUnits } from "viem";
import useWallet from "../../../hooks/useWallet";
import farmFunctions from "./../../../api/pools";
import { PoolDef } from "./../../../config/constants/pools_json";
import { FARM_WITHDRAW } from "./../../../config/constants/query";
import useTokens from "./../../../state/tokens/useTokens";
import { toEth } from "./../../../utils/common";

const useWithdraw = (farm: PoolDef) => {
  const { currentWallet, getClients, getPublicClient, getWalletClient } = useWallet();

  const { reloadBalances, reloadSupplies } = useTokens();
  const { prices, decimals } = useTokens();

  const _withdraw = async ({ withdrawAmount, max }: { withdrawAmount: number; max?: boolean }) => {
    if (!currentWallet) return;
    let amountInWei = parseUnits(withdrawAmount.toString(), decimals[farm.chainId][farm.lp_address] || 18);
    await farmFunctions[farm.id].withdraw({ amountInWei, currentWallet, getPublicClient, getWalletClient, max });
    reloadBalances();
    reloadSupplies();
  };

  const slippageWithdraw = async ({ withdrawAmount, max }: { withdrawAmount: number; max?: boolean }) => {
    if (!currentWallet) return;
    let amountInWei = parseUnits(withdrawAmount.toString(), decimals[farm.chainId][farm.lp_address] || 18);
    //  @ts-expect-error
    const difference = await farmFunctions[farm.id]?.withdrawSlippage({
      amountInWei,
      currentWallet,
      getPublicClient,
      getWalletClient,
      max,
      farm,
    });

    const afterDepositAmount =
      Number(toEth(difference, decimals[farm.chainId][farm.lp_address])) * prices[farm.chainId][farm.lp_address];
    const beforeDepositAmount = withdrawAmount * prices[farm.chainId][farm.lp_address];
    let slippage = (1 - afterDepositAmount / beforeDepositAmount) * 100;
    if (slippage < 0) slippage = 0;
    return { afterDepositAmount, beforeDepositAmount, slippage };
  };

  const {
    mutate: withdraw,
    mutateAsync: withdrawAsync,
    status,
  } = useMutation({
    mutationFn: _withdraw,
    mutationKey: FARM_WITHDRAW(currentWallet!, farm?.id || 0),
  });

  const withdrawIsMutating = useIsMutating({
    mutationKey: FARM_WITHDRAW(currentWallet!, farm?.id || 0),
  });

  /**
   * True if any withdraw function is runnning
   */
  const isLoading = useMemo(() => {
    return withdrawIsMutating > 0;
  }, [withdrawIsMutating]);

  return { isLoading, withdraw, withdrawAsync, status, slippageWithdraw };
};

export default useWithdraw;
