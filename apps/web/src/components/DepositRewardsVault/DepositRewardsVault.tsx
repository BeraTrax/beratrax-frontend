import { dismissNotify, notifyError, notifyLoading, notifySuccess } from "src/api/notify";
import { useState } from "react";
import useWallet from "src/hooks/useWallet";
import useTokens from "src/state/tokens/useTokens";
import { awaitTransaction } from "src/utils/common";
import useFarmDetails from "src/state/farms/hooks/useFarmDetails";
import { CgSpinner } from "react-icons/cg";
import { PoolDef } from "src/config/constants/pools_json";
import rewardVaultAbi from "src/assets/abis/rewardVaultAbi";
import { encodeFunctionData } from "viem";
import { approveErc20 } from "src/api/token";

interface DepositToRewardsVaultProps {
    rewardsVaultsData: PoolDef[];
    onDepositComplete: () => void;
}

export const DepositToRewardsVault = ({ rewardsVaultsData, onDepositComplete }: DepositToRewardsVaultProps) => {
    const { reloadFarmData } = useFarmDetails();
    const { balances } = useTokens();
    const { getClients, currentWallet, getPublicClient, getWalletClient } = useWallet();
    const [isDepositing, setIsDepositing] = useState(false);

    const depositToRewardsVault = async () => {
        let id: string | undefined = undefined;
        try {
            setIsDepositing(true);
            for (let index = 0; index < rewardsVaultsData.length; index++) {
                const vault = rewardsVaultsData[index];
                const client = await getClients(vault.chainId);
                try {
                    setIsDepositing(true);
                    const balance =
                        BigInt(balances[vault.chainId][vault.vault_addr].valueWei) -
                        BigInt(balances[vault.chainId][vault.vault_addr].valueRewardVaultWei || 0);
                    id = notifyLoading({
                        title: `Depositing to ${vault.name} reward vault...`,
                        message: `Depositing to ${index + 1}/${rewardsVaultsData.length} ...`,
                    });

                    if (
                        !(
                            await approveErc20(
                                vault.vault_addr,
                                vault.rewardVault!,
                                balance,
                                currentWallet!,
                                vault.chainId,
                                getPublicClient,
                                getWalletClient
                            )
                        ).status
                    )
                        throw new Error("Error approving vault!");

                    const tx = await awaitTransaction(
                        client.wallet.sendTransaction({
                            to: vault.rewardVault,
                            data: encodeFunctionData({
                                abi: rewardVaultAbi,
                                functionName: "stake",
                                args: [balance],
                            }),
                        }),
                        client
                    );

                    if (!tx.status) {
                        throw new Error(tx.error);
                    } else {
                        id && dismissNotify(id);
                    }
                    reloadFarmData();
                } catch (error) {
                    // Handle error for individual vault
                    console.error(`Error processing vault ${vault.name}:`, error);
                    id && dismissNotify(id);
                    notifyError({
                        title: `Error`,
                        message: error.message,
                    });
                    return false;
                }
            }
            onDepositComplete();
            notifySuccess({
                title: "Deposited successfully",
                message: `Deposited to BGT Earning`,
            });
        } catch (e) {
            console.log(e);
            id && dismissNotify(id);
            notifyError({
                title: "Error",
                message: e.message,
            });
        } finally {
            setIsDepositing(false);
        }
    };

    return (
        <button
            className={`px-4 py-2 rounded-md transition-all transform duration-200 flex items-center justify-center gap-2 min-w-[160px] ${
                isDepositing
                    ? "bg-buttonDisabled cursor-not-allowed"
                    : "bg-buttonPrimary hover:bg-buttonPrimaryLight hover:scale-105 active:scale-95"
            } text-black`}
            onClick={depositToRewardsVault}
            disabled={isDepositing}
        >
            {isDepositing && <CgSpinner className="animate-spin text-xl" />}
            <span>{isDepositing ? "Depositing..." : "Deposit all to BGT Earning"}</span>
        </button>
    );
};
