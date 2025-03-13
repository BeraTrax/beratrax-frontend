import { backendApi } from "src/api";
import { dismissNotify, notifyError, notifyLoading } from "src/api/notify";
import { notifySuccess } from "src/api/notify";
import useTokens from "src/state/tokens/useTokens";
import { Vault } from "src/types";
import { encodeFunctionData, erc20Abi, formatEther } from "viem";
import { usePublicClient } from "wagmi";
import { useState } from "react";
import { useWallet } from "@beratrax/core/hooks";
import { awaitTransaction } from "src/utils/common";
import { useAppDispatch } from "src/state";
import useFarmDetails from "src/state/farms/hooks/useFarmDetails";
import { updatePoints } from "src/state/account/accountReducer";

export const VaultMigrator = ({ vault }: { vault: Vault }) => {
  const dispatch = useAppDispatch();
  const { reloadFarmData } = useFarmDetails();

  const { balances } = useTokens();
  const balance = balances[vault.chainId]?.[vault.vault_addr];
  const { getClients, currentWallet } = useWallet();
  const [isMigrating, setIsMigrating] = useState(false);

  const migrate = async () => {
    let id: string | undefined = undefined;
    try {
      setIsMigrating(true);
      id = notifyLoading({
        title: `Upgrading ${vault.name}...`,
        message: "Please wait while we upgrade your vault...",
      });
      const client = await getClients(vault.chainId);
      const tx = await awaitTransaction(
        client.wallet.sendTransaction({
          to: vault.vault_addr,
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: "approve",
            args: ["0xBED86EC3A9B5092F1711f7cf19243c2fbF97C570", BigInt(balance.valueWei)],
          }),
        }),
        client
      );
      if (!tx.status) {
        throw new Error(tx.error);
      }
      const response = await backendApi.post("/migrate-vault", {
        txHash: tx.txHash,
      });
      if (response.data.success) {
        reloadFarmData();
        await dispatch(updatePoints(currentWallet!));
        notifySuccess({
          title: "Upgraded successfully",
          message: `Upgraded ${vault.name} Vault`,
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (e) {
      console.log(e);
      notifyError({
        title: "Timeout from Berachain",
        message: "Berachain network is congested at the moment, please try again later.",
      });
    } finally {
      setIsMigrating(false);
      id && dismissNotify(id);
    }
  };

  return (
    <button
      className={`px-4 py-2 rounded-md transition-colors ${
        isMigrating ? "bg-buttonDisabled cursor-not-allowed" : "bg-buttonPrimary hover:bg-buttonPrimaryLight"
      } text-textBlack`}
      onClick={migrate}
      disabled={isMigrating}
    >
      {isMigrating ? "Upgrading..." : "Upgrade Vault"}
    </button>
  );
};
