import { formatEther } from "viem";
import { useEffect, useCallback } from "react";
import { customCommify } from "src/utils/common";
import { IoInformationCircle } from "react-icons/io5";
import { ImSpinner8 } from "react-icons/im";
import { dismissNotify, notifyError, notifyLoading, notifySuccess } from "src/api/notify";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "src/state";
import { fetchAirdropData, claimAirdrop } from "src/state/account/accountReducer";
import { useState } from "react";
import useWallet from "src/hooks/useWallet";

interface WarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    type: "claim" | "stake";
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
                            You are choosing to claim your TRAX tokens. You understand that after this transaction, you
                            will receive your TRAX tokens immediately. You recognize that you won't be able to stake
                            these tokens later in the 2000% APR pool.
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
    const dispatch = useAppDispatch();
    const { getClients, currentWallet } = useWallet();
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [warningType, setWarningType] = useState<"claim" | "stake">("claim");

    // Get airdrop state from Redux
    const airdropState = useSelector((state: RootState) => state.account.airdrop);

    const {
        isClaimed = false,
        isInitialLoading = true,
        claimData = null,
        stakeInfo = 0n,
        isLoading = false,
        isStakeLoading = false,
    } = airdropState || {};

    const fetchAirdropInfo = useCallback(async () => {
        if (!currentWallet) return;

        try {
            await dispatch(fetchAirdropData({ address: currentWallet, getClients })).unwrap();
        } catch (error) {
            console.error("Failed to fetch airdrop data:", error);
        }
    }, [currentWallet, getClients, dispatch]);

    useEffect(() => {
        fetchAirdropInfo();
    }, [fetchAirdropInfo]);

    const handleClaim = async () => {
        if (!claimData) return;

        let id: string | undefined = undefined;
        try {
            id = notifyLoading({
                title: "Claiming TRAX...",
                message: "Processing your claim transaction...",
            });

            await dispatch(claimAirdrop({ claim: true, getClients })).unwrap();

            id && dismissNotify(id);
            notifySuccess({
                title: "Success!",
                message: "TRAX tokens claimed successfully",
            });
        } catch (error: any) {
            console.error(error);
            id && dismissNotify(id);
            notifyError({
                title: "Error",
                message: error.message || "Failed to claim TRAX tokens",
            });
        } finally {
            setShowWarningModal(false);
        }
    };

    const handleStake = async () => {
        if (!claimData) return;

        let id: string | undefined = undefined;
        try {
            id = notifyLoading({
                title: "Staking TRAX...",
                message: "Processing your stake transaction...",
            });

            await dispatch(claimAirdrop({ claim: false, getClients })).unwrap();

            id && dismissNotify(id);
            notifySuccess({
                title: "Success!",
                message: "TRAX tokens staked successfully for 5X rewards",
            });
        } catch (error: any) {
            console.error(error);
            id && dismissNotify(id);
            notifyError({
                title: "Error",
                message: error.message || "Failed to stake TRAX tokens",
            });
        }
    };

    const showWarning = (type: "claim" | "stake") => {
        setWarningType(type);
        setShowWarningModal(true);
    };

    const shouldRenderAirdropSection = !isInitialLoading && claimData && BigInt(claimData.amount) > 0n && !isClaimed;

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

                    <div className="mb-6 p-4 bg-bgPrimary/50 backdrop-blur-sm rounded-2xl border border-borderDark">
                        <h3 className="font-arame-mono font-normal text-base text-textWhite/80 mb-2">
                            Available TRAX to Claim
                        </h3>
                        <p className="font-league-spartan font-bold text-3xl text-textWhite">
                            {customCommify(formatEther(BigInt(claimData?.amount || 0)), {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2,
                                showDollarSign: false,
                            })}{" "}
                            <span className="text-textWhite/80">TRAX</span>
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={() => showWarning("claim")}
                                disabled={isLoading || isStakeLoading || !currentWallet}
                                className={`flex-1 py-3 px-4 rounded-xl font-league-spartan font-medium text-base
                                    ${
                                        isLoading || isStakeLoading || !currentWallet
                                            ? "bg-buttonDisabled cursor-not-allowed"
                                            : "bg-gray-600 hover:bg-gray-500 text-textWhite"
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
                                    You can either claim your TRAX tokens now or stake them to earn 2000% APR for 3
                                    months. Staking is non-locking, so you can withdraw at any time. However, if you
                                    choose to claim your tokens now, you WILL NOT be able to stake them in this vault
                                    again.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            <WarningModal
                isOpen={showWarningModal}
                onClose={() => setShowWarningModal(false)}
                onConfirm={warningType === "claim" ? handleClaim : handleStake}
                type={warningType}
                isLoading={warningType === "claim" ? isLoading : isStakeLoading}
            />
        </div>
    );
};

