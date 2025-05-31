import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "src/state";
import { withdrawAirdrop, claimAirdropRewards, fetchAirdropData } from "src/state/account/accountReducer";
import useWallet from "src/hooks/useWallet";
import useTokens from "src/state/tokens/useTokens";
import { formatEther } from "viem";
import { customCommify } from "src/utils/common";
import { dismissNotify, notifyError, notifyLoading, notifySuccess } from "src/api/notify";
import { CgSpinner } from "react-icons/cg";
import { ImSpinner8 } from "react-icons/im";
import FarmRowChip from "src/components/FarmItem/components/FarmRowChip/FarmRowChip";
import { CHAIN_ID } from "src/types/enums";

interface WarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
}

const WithdrawWarningModal = ({ isOpen, onClose, onConfirm, isLoading }: WarningModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-bgSecondary rounded-3xl p-6 max-w-lg w-full mx-4 border border-borderDark">
                <div className="w-full mb-4">
                    <div className="overflow-y-auto pr-2 pt-4 text-justify normal-case text-sm font-league-spartan">
                        <p className="text-2xl font-bold text-center text-textWhite">Important Notice!</p>
                        <p className="text-base text-textWhite">
                            You are choosing to withdraw your staked TRAX tokens. You understand that after this
                            transaction, you will receive your staked tokens and any pending rewards. You recognize that
                            you won't be able to stake these tokens again in this pool after withdrawal.
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

export const TraxAirdropVault = () => {
    const dispatch = useAppDispatch();
    const { getClients, currentWallet } = useWallet();
    const { prices } = useTokens();
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);

    // Get airdrop state from Redux
    const airdropState = useSelector((state: RootState) => state.account.airdrop);

    const {
        stakeInfo = 0n,
        pendingRewards = 0n,
        isWithdrawLoading = false,
        isClaimRewardsLoading = false,
    } = airdropState || {};

    // TRAX token address
    const TRAX_TOKEN_ADDRESS = "0xeaB9814BD2bf57F284368Bcbe9EB5A8394032ca8";
    const traxPrice = prices[CHAIN_ID.BERACHAIN]?.[TRAX_TOKEN_ADDRESS] || 0;

    // Calculate USD values
    const stakeAmountFormatted = formatEther(stakeInfo);
    const rewardsAmountFormatted = formatEther(pendingRewards);
    const stakeUsdValue = Number(stakeAmountFormatted) * traxPrice;
    const rewardsUsdValue = Number(rewardsAmountFormatted) * traxPrice;

    const handleWithdraw = async () => {
        let id: string | undefined = undefined;
        try {
            id = notifyLoading({
                title: "Withdrawing stake...",
                message: "Processing your withdrawal transaction...",
            });

            await dispatch(withdrawAirdrop({ amount: stakeInfo, getClients })).unwrap();

            id && dismissNotify(id);
            notifySuccess({
                title: "Success!",
                message: "Stake withdrawn successfully",
            });

            await dispatch(fetchAirdropData({ address: currentWallet!, getClients })).unwrap();
        } catch (error: any) {
            console.error(error);
            id && dismissNotify(id);
            notifyError({
                title: "Error",
                message: error.message || "Failed to withdraw stake",
            });
        } finally {
            setShowWithdrawModal(false);
        }
    };

    const handleClaimRewards = async () => {
        let id: string | undefined = undefined;
        try {
            id = notifyLoading({
                title: "Claiming rewards...",
                message: "Processing your rewards claim...",
            });

            await dispatch(claimAirdropRewards({ getClients })).unwrap();

            id && dismissNotify(id);
            notifySuccess({
                title: "Success!",
                message: "Rewards claimed successfully",
            });

            await dispatch(fetchAirdropData({ address: currentWallet!, getClients })).unwrap();
        } catch (error: any) {
            console.error(error);
            id && dismissNotify(id);
            notifyError({
                title: "Error",
                message: error.message || "Failed to claim rewards",
            });
        }
    };

    const showWithdrawWarning = () => {
        setShowWithdrawModal(true);
    };

    return (
        <div
            className={`
                rounded-3xl border border-borderDark p-6 text-textWhite shadow-md
                min-w-[calc(25%-12px)]
                max-[2000px]:min-w-[calc(33.33%-10.66px)]
                max-[1300px]:min-w-[calc(50%-8px)]
                max-[768px]:min-w-full
            `}
            style={{
                background:
                    "radial-gradient(circle at 45% 151%, var(--new-color_primary) -40%, var(--new-background_dark) 75%)",
            }}
        >
            {/* Header */}
            <div className="flex justify-between align-top gap-2 mb-6">
                <div className="flex flex-col gap-2 font-league-spartan text-lg">
                    <div className="flex items-center relative">
                        <img
                            className="w-9 h-9 rounded-full"
                            alt="TRAX"
                            src="https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/btx/logo.png"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-lg text-textWhite">TRAX Airdrop Vault</p>
                    </div>
                </div>
                <div className="flex-col gap-1">
                    <div className="flex items-center gap-1 mb-2 justify-end">
                        <FarmRowChip text={"BeraTrax"} color="invert" />
                        <div className="flex">
                            <img alt="Beratrax" className="w-4 rounded-full border border-bgDark" src="beratrax.png" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Earnings (Rewards) */}
                <div className="text-textSecondary border-r border-bgPrimary">
                    <div className="font-arame-mono mb-2 text-textPrimary text-lg normal-case">
                        <p className="flex items-center gap-2">Earnings</p>
                    </div>
                    <div className="text-textWhite text-lg font-league-spartan leading-5">
                        <p className="text-green-500">
                            +$
                            {customCommify(rewardsUsdValue, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                                showDollarSign: false,
                            })}
                        </p>
                        <p className="text-textWhite/60 text-sm">
                            +
                            {customCommify(rewardsAmountFormatted, {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 4,
                                showDollarSign: false,
                            })}{" "}
                            TRAX
                        </p>
                        {/* {pendingRewards > 0n && (
                            <button
                                onClick={handleClaimRewards}
                                disabled={isClaimRewardsLoading || !currentWallet}
                                className={`mt-2 px-3 py-1 rounded-md transition-all transform duration-200 flex items-center justify-center gap-2 text-sm ${
                                    isClaimRewardsLoading || !currentWallet
                                        ? "bg-buttonDisabled cursor-not-allowed"
                                        : "bg-buttonPrimary hover:bg-buttonPrimaryLight hover:scale-105 active:scale-95"
                                } text-black`}
                            >
                                {isClaimRewardsLoading && <CgSpinner className="animate-spin text-lg" />}
                                <span>{isClaimRewardsLoading ? "Claiming..." : "Claim Rewards"}</span>
                            </button>
                        )} */}
                    </div>
                </div>

                {/* APR */}
                <div className="text-textSecondary text-sm ml-4">
                    <div className="uppercase font-arame-mono mb-2 text-textPrimary text-lg">
                        <p>APR</p>
                    </div>
                    <div className="text-textWhite text-lg font-league-spartan leading-5">
                        <p>2000%</p>
                    </div>
                </div>
            </div>

            {/* Bottom Section - Withdraw Button and Your Stake */}
            <div className="flex justify-between items-center">
                {/* Withdraw Button - Left Side */}
                <button
                    onClick={showWithdrawWarning}
                    disabled={isWithdrawLoading || !currentWallet}
                    className={`px-4 py-2 rounded-md transition-all transform duration-200 flex items-center justify-center gap-2 min-w-[140px] ${
                        isWithdrawLoading || !currentWallet
                            ? "bg-buttonDisabled cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95"
                    } text-white`}
                >
                    {isWithdrawLoading && <CgSpinner className="animate-spin text-xl" />}
                    <span>{isWithdrawLoading ? "Processing..." : "Withdraw Early"}</span>
                </button>

                {/* Your Stake - Right Side */}
                <div className="inline-flex items-end gap-2 bg-white/5 backdrop-blur-sm rounded-lg p-3">
                    <div className="uppercase font-arame-mono text-textPrimary text-md">
                        <p>Your Stake</p>
                    </div>
                    <div className="text-textWhite text-md font-league-spartan">
                        <p>
                            $
                            {customCommify(stakeUsdValue, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                                showDollarSign: false,
                            })}{" "}
                            (
                            {customCommify(stakeAmountFormatted, {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2,
                                showDollarSign: false,
                            })}{" "}
                            TRAX)
                        </p>
                    </div>
                </div>
            </div>

            <WithdrawWarningModal
                isOpen={showWithdrawModal}
                onClose={() => setShowWithdrawModal(false)}
                onConfirm={handleWithdraw}
                isLoading={isWithdrawLoading}
            />
        </div>
    );
};

