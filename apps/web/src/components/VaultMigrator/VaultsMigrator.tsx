import { backendApi } from "src/api";
import { dismissNotify, notifyError, notifyLoading } from "src/api/notify";
import { notifySuccess } from "src/api/notify";
import useTokens from "src/state/tokens/useTokens";
import { encodeFunctionData, erc20Abi } from "viem";
import { useState } from "react";
import useWallet from "src/hooks/useWallet";
import { awaitTransaction } from "src/utils/common";
import { useVaults } from "src/hooks/useVaults";
import useFarmDetails from "src/state/farms/hooks/useFarmDetails";
import { updatePoints } from "src/state/account/accountReducer";
import { useAppDispatch } from "src/state";
import { CgSpinner } from "react-icons/cg";

export const VaultsMigrator = () => {
    const dispatch = useAppDispatch();
    const { reloadFarmData } = useFarmDetails();
    const { balances } = useTokens();
    const { getClients, currentWallet } = useWallet();
    const [isMigrating, setIsMigrating] = useState(false);
    const { vaults } = useVaults();
    const deprecatedVaults = vaults.filter((vault) => vault.isDeprecated);

    const migrate = async () => {
        let id: string | undefined = undefined;
        try {
            setIsMigrating(true);
            for (const [index, vault] of deprecatedVaults.entries()) {
                try {
                    const balance = balances[vault.chainId]?.[vault.vault_addr];
                    id = notifyLoading({
                        title: `Upgrading ${vault.name}...`,
                        message: `Upgrading ${index + 1}/${deprecatedVaults.length} ...`,
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
                        id && dismissNotify(id);
                        notifySuccess({
                            title: "Upgraded successfully",
                            message: `Upgraded ${vault.name} Vault`,
                        });
                    } else {
                        throw new Error(response.data.message);
                    }
                } catch (error) {
                    // Handle error for individual vault
                    console.error(`Error processing vault ${vault.name}:`, error);
                    id && dismissNotify(id);
                    notifyError({
                        title: `Timeout from Berachain ${vault.name}`,
                        message: "Berachain network is congested at the moment, please try again later.",
                    });
                    break;
                }
            }
            reloadFarmData();
            setTimeout(() => {
                dispatch(updatePoints(currentWallet!));
            }, 2000);
        } catch (e) {
            console.log(e);
            id && dismissNotify(id);
            notifyError({
                title: "Timeout from Berachain",
                message: "Berachain network is congested at the moment, please try again later.",
            });
        } finally {
            setIsMigrating(false);
        }
    };

    return (
        <button
            className={`px-4 py-2 my-2 rounded-md transition-all transform duration-200 flex items-center justify-center gap-2 min-w-[160px] ${
                isMigrating
                    ? "bg-buttonDisabled cursor-not-allowed"
                    : "bg-buttonPrimary hover:bg-buttonPrimaryLight hover:scale-105 active:scale-95"
            } text-black`}
            onClick={migrate}
            disabled={isMigrating}
        >
            {isMigrating && <CgSpinner className="animate-spin text-xl" />}
            <span>{isMigrating ? "Upgrading..." : "Upgrade All Vaults"}</span>
        </button>
    );
};
