import { addressesByChainId } from "src/config/constants/contracts";
import useWallet from "src/hooks/useWallet";
import { pointsStakingAndClaimAbi } from "../../assets/abis/pointsStakingAndClaim";
import { useMutation } from "@tanstack/react-query";
import { Address, getContract } from "viem";
import { CHAIN_ID } from "src/types/enums";
import { encodeFunctionData, parseEther, formatEther } from "viem";
import { awaitTransaction } from "src/utils/common";
import { useEffect, useState, useCallback } from "react";
import { customCommify } from "src/utils/common";
import { IoInformationCircle } from "react-icons/io5";
import { ImSpinner8 } from "react-icons/im";
import { dismissNotify, notifyError, notifyLoading, notifySuccess } from "src/api/notify";
import { getAirdropClaim } from "src/api/account";

interface WarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    type: "claim" | "stake" | "withdraw";
    isLoading: boolean;
}

const WarningModal = ({ isOpen, onClose, onConfirm, type, isLoading }: WarningModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-bgSecondary rounded-3xl p-6 max-w-lg w-full mx-4 border border-borderDark">
                <div className="w-full mb-4">
                    <div className="overflow-y-auto pr-2 pt-4 text-justify normal-case text-sm font-league-spartan">
                        <p className="text-2xl font-bold text-center text-textWhite">Important Notice!</p>
                        <p className="text-base text-textWhite">
                            {type === "claim"
                                ? "You are choosing to claim your TRAX tokens. You understand that after this transaction, you will receive your TRAX tokens immediately. You recognize that you won't be able to stake these tokens later in the 2000% APR pool."
                                : "You are choosing to withdraw your staked TRAX tokens. You understand that after this transaction, you will receive your staked tokens and any pending rewards. You recognize that you won't be able to stake these tokens again in this pool after withdrawal."}
                        </p>
                    </div>
                </div>
                <div className="flex justify-end gap-4">
                    <button
                        className="bg-gray-500 p-4 rounded-xl w-32 font-league-spartan text-textWhite"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-bgPrimary p-4 rounded-xl w-32 font-league-spartan text-textWhite"
                        disabled={isLoading}
                        onClick={onConfirm}
                    >
                        {isLoading ? <ImSpinner8 className="animate-spin mx-auto" /> : "I understand"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const AirdropClaim = () => {
    const airdropAddress = addressesByChainId[CHAIN_ID.BERACHAIN].airdropAddress;
    const { getClients, currentWallet } = useWallet();
    const [isClaimed, setIsClaimed] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [airdropClaim, setAirdropClaim] = useState<{ account: Address; signature: Address; amount: string } | null>(
        null
    );
    const [stakeInfo, setStakeInfo] = useState<bigint>(0n);
    const [pendingRewards, setPendingRewards] = useState<bigint>(0n);
    const [isLoading, setIsLoading] = useState(false);
    const [isWithdrawLoading, setIsWithdrawLoading] = useState(false);
    const [isClaimRewardsLoading, setIsClaimRewardsLoading] = useState(false);
    const [isStakeLoading, setIsStakeLoading] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [warningType, setWarningType] = useState<"claim" | "stake" | "withdraw">("claim");

    const fetchStakeInfo = useCallback(async () => {
        if (!airdropAddress || !currentWallet) return;

        try {
            if (!airdropClaim) {
                const response = await getAirdropClaim(currentWallet);
                setAirdropClaim(response.data);
            }

            const clients = await getClients(CHAIN_ID.BERACHAIN);
            const contract = getContract({
                address: airdropAddress,
                abi: pointsStakingAndClaimAbi,
                client: clients.public,
            });

            const [amount, pendingRewards, claimed] = await Promise.all([
                contract.read.stakes([currentWallet]),
                contract.read.pendingRewards([currentWallet]),
                contract.read.isClaimed([currentWallet]),
            ]);

            setStakeInfo(amount[0]);
            setPendingRewards(pendingRewards);
            setIsClaimed(claimed);
        } finally {
            setIsInitialLoading(false);
        }
    }, [airdropAddress, currentWallet, getClients, getAirdropClaim]);

    useEffect(() => {
        fetchStakeInfo();
    }, [fetchStakeInfo]);

    const { mutateAsync: claimAirdrop } = useMutation({
        mutationFn: async (claim: boolean) => {
            if (!airdropClaim) throw new Error("Airdrop claim not found");

            const clients = await getClients(CHAIN_ID.BERACHAIN);

            const response = await awaitTransaction(
                clients.wallet.sendTransaction({
                    to: airdropAddress,
                    data: encodeFunctionData({
                        abi: pointsStakingAndClaimAbi,
                        functionName: "claimAirdrop",
                        args: [BigInt(airdropClaim.amount), airdropClaim.signature, claim],
                    }),
                }),
                clients
            );
            return response;
        },
    });

    const { mutateAsync: withdrawAirdrop } = useMutation({
        mutationFn: async (amount: bigint) => {
            const clients = await getClients(CHAIN_ID.BERACHAIN);

            const response = await awaitTransaction(
                clients.wallet.sendTransaction({
                    to: airdropAddress,
                    data: encodeFunctionData({
                        abi: pointsStakingAndClaimAbi,
                        functionName: "withdraw",
                        args: [amount],
                    }),
                }),
                clients
            );
            return response;
        },
    });

    const { mutateAsync: claimRewards } = useMutation({
        mutationFn: async () => {
            const clients = await getClients(CHAIN_ID.BERACHAIN);

            const response = await awaitTransaction(
                clients.wallet.sendTransaction({
                    to: airdropAddress,
                    data: encodeFunctionData({
                        abi: pointsStakingAndClaimAbi,
                        functionName: "claimRewards",
                        args: [],
                    }),
                }),
                clients
            );
            return response;
        },
    });

    const handleClaim = async () => {
        let id: string | undefined = undefined;
        try {
            setIsLoading(true);
            id = notifyLoading({
                title: "Claiming TRAX...",
                message: "Processing your claim transaction...",
            });

            const response = await claimAirdrop(true);

            if (!response.status) {
                throw new Error(response.error || "Failed to claim TRAX");
            }

            id && dismissNotify(id);
            notifySuccess({
                title: "Success!",
                message: "TRAX tokens claimed successfully",
            });

            // Refresh data after successful claim
            await fetchStakeInfo();
        } catch (error) {
            console.error(error);
            id && dismissNotify(id);
            notifyError({
                title: "Error",
                message: error.message || "Failed to claim TRAX tokens",
            });
        } finally {
            setIsLoading(false);
            setShowWarningModal(false);
        }
    };

    const handleStake = async () => {
        let id: string | undefined = undefined;
        try {
            setIsStakeLoading(true);
            id = notifyLoading({
                title: "Staking TRAX...",
                message: "Processing your stake transaction...",
            });

            const response = await claimAirdrop(false);

            if (!response.status) {
                throw new Error(response.error || "Failed to stake TRAX");
            }

            id && dismissNotify(id);
            notifySuccess({
                title: "Success!",
                message: "TRAX tokens staked successfully for 5X rewards",
            });

            // Refresh data after successful stake
            await fetchStakeInfo();
        } catch (error) {
            console.error(error);
            id && dismissNotify(id);
            notifyError({
                title: "Error",
                message: error.message || "Failed to stake TRAX tokens",
            });
        } finally {
            setIsStakeLoading(false);
        }
    };

    const handleWithdraw = async () => {
        let id: string | undefined = undefined;
        try {
            setIsWithdrawLoading(true);
            id = notifyLoading({
                title: "Withdrawing stake...",
                message: "Processing your withdrawal transaction...",
            });

            const response = await withdrawAirdrop(stakeInfo);

            if (!response.status) {
                throw new Error(response.error || "Failed to withdraw stake");
            }

            id && dismissNotify(id);
            notifySuccess({
                title: "Success!",
                message: "Stake withdrawn successfully",
            });

            // Refresh data after successful withdraw
            await fetchStakeInfo();
        } catch (error) {
            console.error(error);
            id && dismissNotify(id);
            notifyError({
                title: "Error",
                message: error.message || "Failed to withdraw stake",
            });
        } finally {
            setIsWithdrawLoading(false);
        }
    };

    const handleClaimRewards = async () => {
        let id: string | undefined = undefined;
        try {
            setIsClaimRewardsLoading(true);
            id = notifyLoading({
                title: "Claiming rewards...",
                message: "Processing your rewards claim...",
            });

            const response = await claimRewards();

            if (!response.status) {
                throw new Error(response.error || "Failed to claim rewards");
            }

            id && dismissNotify(id);
            notifySuccess({
                title: "Success!",
                message: "Rewards claimed successfully",
            });

            // Refresh data after successful claim
            await fetchStakeInfo();
        } catch (error) {
            console.error(error);
            id && dismissNotify(id);
            notifyError({
                title: "Error",
                message: error.message || "Failed to claim rewards",
            });
        } finally {
            setIsClaimRewardsLoading(false);
        }
    };

    const showWarning = (type: "claim" | "stake" | "withdraw") => {
        setWarningType(type);
        setShowWarningModal(true);
    };

    const shouldRenderAirdropSection =
        !isInitialLoading && airdropClaim && BigInt(airdropClaim.amount) > 0n && (!isClaimed || stakeInfo > 0n);

    return (
        <div className="w-full p-4">
            {shouldRenderAirdropSection ? (
                <div
                    className="w-full rounded-3xl border border-borderDark p-6 text-textWhite"
                    style={{
                        background:
                            "radial-gradient(circle at 45% 151%, var(--new-color_primary) -40%, var(--new-background_dark) 75%)",
                    }}
                >
                    <h2 className="font-league-spartan font-bold text-3xl mb-6">TRAX Season 1 & 2 Airdrops</h2>

                    {!isClaimed && (
                        <div className="mb-6 p-4 bg-bgPrimary/50 backdrop-blur-sm rounded-2xl border border-borderDark">
                            <h3 className="font-arame-mono font-normal text-base text-textWhite/80 mb-2">
                                Available TRAX to Claim
                            </h3>
                            <p className="font-league-spartan font-bold text-3xl text-textWhite">
                                {customCommify(formatEther(BigInt(airdropClaim?.amount || 0)), {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 2,
                                    showDollarSign: false,
                                })}{" "}
                                <span className="text-textWhite/80">TRAX</span>
                            </p>
                        </div>
                    )}

                    {stakeInfo > 0n ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-bgPrimary/50 backdrop-blur-sm rounded-2xl border border-borderDark">
                                    <h3 className="font-arame-mono font-normal text-base text-textWhite/80 mb-2">
                                        Staked Amount
                                    </h3>
                                    <p className="font-league-spartan font-bold text-2xl text-textWhite">
                                        {customCommify(formatEther(stakeInfo), {
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 2,
                                            showDollarSign: false,
                                        })}{" "}
                                        <span className="text-textWhite/80">TRAX</span>
                                    </p>
                                </div>
                                <div className="p-4 bg-bgPrimary/50 backdrop-blur-sm rounded-2xl border border-borderDark">
                                    <h3 className="font-arame-mono font-normal text-base text-textWhite/80 mb-2">
                                        Rewards
                                    </h3>
                                    <p className="font-league-spartan font-bold text-2xl text-textWhite">
                                        {customCommify(formatEther(pendingRewards), {
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 4,
                                            showDollarSign: false,
                                        })}{" "}
                                        <span className="text-textWhite/80">TRAX</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => showWarning("withdraw")}
                                    disabled={isWithdrawLoading || isClaimRewardsLoading || !currentWallet}
                                    className={`flex-1 py-3 px-4 rounded-xl font-league-spartan font-bold text-lg
                                        ${
                                            isWithdrawLoading || isClaimRewardsLoading || !currentWallet
                                                ? "bg-buttonDisabled cursor-not-allowed"
                                                : "bg-buttonPrimary hover:bg-buttonPrimaryLight text-black"
                                        }`}
                                >
                                    {isWithdrawLoading ? "Processing..." : "Withdraw Stake"}
                                </button>
                                {pendingRewards > 0n && (
                                    <button
                                        onClick={handleClaimRewards}
                                        disabled={isWithdrawLoading || isClaimRewardsLoading || !currentWallet}
                                        className={`flex-1 py-3 px-4 rounded-xl font-league-spartan font-bold text-lg
                                            ${
                                                isWithdrawLoading || isClaimRewardsLoading || !currentWallet
                                                    ? "bg-buttonDisabled cursor-not-allowed"
                                                    : "bg-buttonPrimary hover:bg-buttonPrimaryLight text-black"
                                            }`}
                                    >
                                        {isClaimRewardsLoading ? "Processing..." : "Claim Rewards"}
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-center gap-4">
                                <button
                                    onClick={() => showWarning("claim")}
                                    disabled={isLoading || isStakeLoading || !currentWallet}
                                    className={`flex-1 py-3 px-4 rounded-xl font-league-spartan font-bold text-lg
                                        ${
                                            isLoading || isStakeLoading || !currentWallet
                                                ? "bg-buttonDisabled cursor-not-allowed"
                                                : "bg-buttonPrimary hover:bg-buttonPrimaryLight text-black"
                                        }`}
                                >
                                    {isLoading ? "Processing..." : "Claim TRAX without staking"}
                                </button>

                                <span className="text-textWhite/80 font-league-spartan">OR</span>

                                <button
                                    onClick={handleStake}
                                    disabled={isLoading || isStakeLoading || !currentWallet}
                                    className={`flex-1 py-3 px-4 rounded-xl font-league-spartan font-bold text-lg
                                        ${
                                            isLoading || isStakeLoading || !currentWallet
                                                ? "bg-buttonDisabled cursor-not-allowed"
                                                : "bg-buttonPrimary hover:bg-buttonPrimaryLight text-black"
                                        }`}
                                >
                                    {isStakeLoading ? "Processing..." : "Claim and stake for 2000% APY"}
                                </button>
                            </div>

                            <div className="p-4 bg-bgPrimary/50 backdrop-blur-sm rounded-2xl border border-borderDark">
                                <div className="flex items-start gap-3">
                                    <IoInformationCircle className="text-xl text-textWhite/80 mt-1" />
                                    <p className="font-league-spartan text-sm text-textWhite/80">
                                        Choose between claiming your TRAX tokens immediately or staking to earn 2000%
                                        APR and multiply your rewards by upto 5X. You can only stake once at the time of
                                        claim.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : null}

            <WarningModal
                isOpen={showWarningModal}
                onClose={() => setShowWarningModal(false)}
                onConfirm={
                    warningType === "claim" ? handleClaim : warningType === "stake" ? handleStake : handleWithdraw
                }
                type={warningType}
                isLoading={isLoading}
            />
        </div>
    );
};

