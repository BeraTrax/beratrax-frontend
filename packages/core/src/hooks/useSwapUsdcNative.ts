import { BigNumber } from "ethers";
import { useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
import useTokens from "core/src/state/tokens/useTokens";
import { buildTransaction, getRoute } from "core/src/api/bridge";
import { dismissNotify, notifyError, notifyLoading, notifySuccess } from "core/src/api/notify";
import { approveErc20 } from "core/src/api/token";
import { addressesByChainId } from "core/src/config/constants/contracts";
import { CHAIN_ID } from "core/src/types/enums";
import { awaitTransaction, toEth } from "core/src/utils/common";
import useWallet from "core/src/hooks/useWallet";

const usdcAddr = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
const usdceAddress = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8";

const useSwapUsdcNative = () => {
  const { currentWallet, getClients, getPublicClient, getWalletClient } = useWallet();
  const { balances, reloadBalances } = useTokens();
  const [loading, setLoading] = useState(false);

  const initateSwap = async (swapAmount?: BigNumber) => {
    if (!currentWallet) return;
    const client = await getClients(CHAIN_ID.ARBITRUM);
    const notiId = uuid();
    setLoading(true);
    try {
      notifyLoading({ title: "Swapping", message: `Getting swap route` }, { id: notiId });
      const { approvalData, route } = await getRoute(
        CHAIN_ID.ARBITRUM,
        CHAIN_ID.ARBITRUM,
        usdceAddress,
        usdcAddr,
        swapAmount ? swapAmount.toString() : balances[CHAIN_ID.ARBITRUM][usdceAddress]!.valueWei,
        currentWallet,
      );
      notifyLoading({ title: "Swapping", message: `Approving USDC.e - 1/3` }, { id: notiId });
      console.log("approvalData", approvalData);
      await approveErc20(
        approvalData.approvalTokenAddress,
        approvalData.allowanceTarget,
        BigInt(approvalData.minimumApprovalAmount),
        currentWallet,
        CHAIN_ID.ARBITRUM,
        getPublicClient,
        getWalletClient,
      );
      notifyLoading({ title: "Swapping", message: "Creating transaction - 2/3" }, { id: notiId });
      const buildTx = await buildTransaction(route);
      const tx = {
        to: buildTx?.txTarget,
        data: buildTx?.txData,
        value: buildTx?.value,
        chainId: buildTx?.chainId,
      };
      notifyLoading({ title: "Swapping", message: `Sending swap transaction - 3/3` }, { id: notiId });
      const { error, status } = await awaitTransaction(
        client.wallet!.sendTransaction({
          to: tx.to,
          data: tx.data,
          value: BigInt(tx.value || "0"),
        }),
        client,
      );
      if (status) {
        notifySuccess({ title: "Success!", message: "USDC.e converted to USDC" });
      } else {
        notifyError({ title: "Error!", message: error || "Transaction failed!" });
      }
    } catch (error: any) {
      notifyError({ title: "Error!", message: error.message });
    } finally {
      setLoading(false);
      dismissNotify(notiId);
      reloadBalances();
    }
  };

  const formattedBalance = useMemo(
    () =>
      Number(
        toEth(
          BigInt(
            balances[CHAIN_ID.ARBITRUM][addressesByChainId[CHAIN_ID.ARBITRUM].bridgedUsdAddress!]!.valueWei || "0",
          ),
          6,
        ),
      ),
    [balances],
  );
  return { initateSwap, formattedBalance, loading };
};

export default useSwapUsdcNative;
