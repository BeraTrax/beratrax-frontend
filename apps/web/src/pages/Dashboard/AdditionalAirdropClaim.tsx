import { formatEther, getAddress } from "viem";
import { useEffect, useCallback } from "react";
import { customCommify } from "src/utils/common";
import { IoInformationCircle } from "react-icons/io5";
import { ImSpinner8 } from "react-icons/im";
import { dismissNotify, notifyError, notifyLoading, notifySuccess } from "src/api/notify";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "src/state";
import { fetchAdditionalAirdropData, claimAdditionalAirdrop } from "src/state/account/accountReducer";
import { useState } from "react";
import useWallet from "src/hooks/useWallet";
import useTokens from "src/state/tokens/useTokens";
import useTransfer from "src/hooks/useTransfer";
import { CHAIN_ID } from "src/types/enums";
import { DEAD_ADDRESS, TRAX_TOKEN_ADDRESS } from "src/config/constants";
import { TokenActionType } from "./AirdropClaim";

const top20 = [
    "0xa8E6fC2F1E92D0005A4dbee8f8d698748D3B334F",
    "0x6f73C41DCb658a15e2FAA14D2f575960586fE462",
    "0x4CCB124ecFf78f707a91077b269b329d5077dDa1",
    "0x6D3B90747dbf5883bF88fF7Eb5fCC86f408b5409",
    "0x8A474fD1b929306a6827630AEFEaDE443128eC68",
    "0xF283487B5476eE22b0a0908d7dE4010FD08307B1",
    "0xfD9E6FD73a0694057B632D8D3D4925D99c374306",
    "0xBFaA278d37420DA2cDA6650D867a575Cf667eF4d",
    "0x492A4a63f72ec04a3DA1Ec25084c492d5B520E8E",
    "0x910b26B9156F52580C831e6fB37B64554Fb79EbB",
    "0x2e32935bfD5B2718f99BC8FDf8B37c16811f7D97",
    "0x9E96F07eCF9E9326eE3696934e9666fdFf9B2712",
    "0xdc35A1bBB14c944430Ab6Cf21c3075417535fAb8",
    "0xd186828FEDc6200616D47477DeD790984462FC81",
    "0xc749c8501E662830bA74D93D5043B2AC08655f43",
    "0xf270F123d12B1FBD15dD197c0745506687F2503e",
    "0xBAE5B5556dd10Af04Cb4d4c4df5fC0a4e3a1f929",
    "0x4e937183B50f506e2D954948c588722dA0B2032E",
    "0xcE0112f58f50bb2728A0063B7c8eA1d3a829510e",
    "0x810E30271Cdbd01769a7a4Aade0d22Eda193558d",
    "0x9dEfF269B22849889cAE9A965769f576a1e72d27",
];

type TokenActionTypeModified = "claim" | "stake" | "burn";
interface WarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    type: TokenActionTypeModified;
    isLoading: boolean;
}

const WarningModal = ({ isOpen, onClose, onConfirm, type, isLoading }: WarningModalProps) => {
    if (!isOpen) return null;

    const getModalContent = () => {
        switch (type) {
            case "burn":
                return {
                    title: "🗑️ Burn Your TRAX Tokens!",
                    message: "Don't want your airdrop? Burn it and we'll match you!",
                    buttonText: "Trashhhhhh it!",
                };
            default:
                return {
                    title: "Important Notice!",
                    message:
                        "You are choosing to claim your TRAX tokens. You understand that after this transaction, you will receive your TRAX tokens immediately. You recognize that you won't be able to stake these tokens later in the 2000% APR pool.",
                    buttonText: "I understand",
                };
        }
    };

    const content = getModalContent();

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="gap-4 items-center justify-center bg-bgSecondary rounded-3xl p-6 max-w-lg w-full mx-4 border border-borderDark">
                <div className="flex flex-col gap-4 items-center w-full mb-4">
                    <p className="normal-case font-league-spartan text-2xl font-bold text-center text-textWhite">
                        {content.title}
                    </p>
                    <p className="normal-case font-league-spartan text-base text-textWhite">{content.message}</p>
                </div>
                <div className="flex  gap-4">
                    <button
                        className="bg-gray-500 p-4 rounded-xl w-full font-league-spartan text-textWhite"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className={`p-4 rounded-xl w-full font-league-spartan text-textWhite ${
                            type === "burn" ? "bg-red-600 hover:bg-red-700" : "bg-bgPrimary"
                        }`}
                        disabled={isLoading}
                        onClick={onConfirm}
                    >
                        {isLoading ? <ImSpinner8 className="animate-spin mx-auto" /> : content.buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const AdditionalAirdropClaim = () => {
    const dispatch = useAppDispatch();
    const { reloadBalances } = useTokens();
    const { getClients, currentWallet } = useWallet();
    const { transfer } = useTransfer();
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [warningType, setWarningType] = useState<TokenActionTypeModified>("claim");
    const [isBurnLoading, setIsBurnLoading] = useState(false);
    const [isStakeLoading, setIsStakeLoading] = useState(false);

    // Get additional airdrop state from Redux
    const additionalAirdropState = useSelector((state: RootState) => state.account.additionalAirdrop);

    const {
        isClaimed = false,
        isInitialLoading = true,
        claimData = null,
        isLoading = false,
    } = additionalAirdropState || {};

    const isStakeLoadingRedux = additionalAirdropState?.isStakeLoading || false;

    const fetchAirdropInfo = useCallback(async () => {
        if (!currentWallet) return;

        try {
            await dispatch(fetchAdditionalAirdropData({ address: currentWallet, getClients })).unwrap();
        } catch (error) {
            console.error("Failed to fetch additional airdrop data:", error);
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

            await dispatch(claimAdditionalAirdrop({ claim: true, getClients })).unwrap();
            await reloadBalances();

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
                message: error.message || "Failed to claim due to Berachain RPC issue. Please try again later",
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

            await dispatch(claimAdditionalAirdrop({ claim: false, getClients })).unwrap();
            await reloadBalances();

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
                message: error.message || "Failed to stake due to Berachain RPC issue. Please try again later",
            });
        } finally {
            setShowWarningModal(false);
        }
    };

    const handleBurn = async () => {
        if (!claimData) return;

        let id: string | undefined = undefined;
        setIsBurnLoading(true);
        try {
            id = notifyLoading({
                title: "🔥 Burning TRAX...",
                message: "Step 1/2: Claiming your TRAX tokens...",
            });

            // First claim the tokens
            await dispatch(claimAdditionalAirdrop({ claim: true, getClients })).unwrap();

            // Update notification
            id && dismissNotify(id);
            id = notifyLoading({
                title: "🔥 Burning TRAX...",
                message: "Step 2/2: Sending tokens to the void... 🗑️",
            });

            // Then burn them by sending to dead address
            await transfer({
                tokenAddress: TRAX_TOKEN_ADDRESS,
                to: DEAD_ADDRESS,
                amount: BigInt(claimData.amount),
                chainId: CHAIN_ID.BERACHAIN,
            });

            await reloadBalances();

            id && dismissNotify(id);
            notifySuccess({
                title: "🔥 Tokens Burned Successfully!",
                message: "Your TRAX tokens have been permanently destroyed! They're gone forever! 🗑️💸",
            });
        } catch (error: any) {
            console.error(error);
            id && dismissNotify(id);
            notifyError({
                title: "Error",
                message: error.message || "Failed to burn tokens. Please try again later",
            });
        } finally {
            setIsBurnLoading(false);
            setShowWarningModal(false);
        }
    };

    const showWarning = (type: TokenActionTypeModified) => {
        setWarningType(type);
        setShowWarningModal(true);
    };

    const shouldRenderAirdropSection = !isInitialLoading && claimData && Number(claimData.amount) > 0 && !isClaimed;

    return (
        <div className="w-full p-4">
            {shouldRenderAirdropSection ? (
                <div
                    className="w-full rounded-3xl border border-borderDark p-6 text-textWhite flex flex-col xlMobile:flex-auto gap-y-8 xlMobile:gap-y-0"
                    style={{
                        background:
                            "radial-gradient(circle at 45% 151%, var(--new-color_primary) -40%, var(--new-background_dark) 75%)",
                    }}
                >
                    <h2 className="font-league-spartan font-bold text-3xl ">TRAX Season 3 Airdrop</h2>

                    <div className="flex items-center justify-between flex-col xlMobile:flex-row gap-y-4 ">
                        <h3 className="font-arame-mono font-normal text-base text-textWhite/80">
                            Available Additional TRAX to Claim
                        </h3>
                        {/* Show eligible drops info */}
                        {claimData && claimData.sources && claimData.sources.length > 0 && (
                            <div className="inline-flex items-center justify-center flex-row xlMobile:flex-col gap-x-2 gap-y-2 px-3 py-1.5 bg-gradient-to-r from-purple-400 to-blue-500 rounded-lg shadow-lg border-2 border-purple-300/50">
                                <div className="flex items-center gap-1">
                                    <span className="text-lg">✨</span>
                                    <span className="font-league-spartan font-bold text-white text-sm">
                                        Eligible Drops
                                    </span>
                                </div>

                                <div className="flex items-center gap-1">
                                    {(() => {
                                        const sourceLabels = ["Mainnet", "Testnet", "Teddy", "Social"];
                                        return claimData.sources.map((source, index) =>
                                            source ? (
                                                <span
                                                    key={index}
                                                    className="font-league-spartan  text-white text-sm bg-black/20 px-2 py-0.5 rounded-full"
                                                >
                                                    {sourceLabels[index]}
                                                </span>
                                            ) : null
                                        );
                                    })()}
                                </div>
                            </div>
                        )}
                        {/* If user is in top 20, show a badge */}
                        {/* {currentWallet && top20.map((e) => getAddress(e)).includes(getAddress(currentWallet)) && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg border-2 border-yellow-300/50">
                                <span className="text-lg">🏆</span>
                                <span className="font-league-spartan font-bold text-black text-sm">Top 20</span>
                                <span className="font-league-spartan font-bold text-black text-sm bg-black/20 px-2 py-0.5 rounded-full">
                                    3x Multiplier
                                </span>
                            </div>
                        )} */}
                    </div>

                    <p className="font-league-spartan font-bold text-3xl text-textWhite">
                        {customCommify(formatEther(BigInt(claimData?.amount || 0)), {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                            showDollarSign: false,
                        })}{" "}
                        <span className="text-textWhite/80">TRAX</span>
                    </p>

                    <div className="space-y-6">
                        <div className="flex flex-col gap-4">
                            {/* Main claim/stake buttons */}
                            <div className="flex items-center justify-center gap-4 xlMobile:flex-row flex-col">
                                <button
                                    onClick={() => showWarning("claim")}
                                    disabled={isLoading || isStakeLoadingRedux || isBurnLoading || !currentWallet}
                                    className={`flex-1 py-3 px-4 rounded-xl font-league-spartan font-medium text-base
                                        ${
                                            isLoading || isStakeLoadingRedux || isBurnLoading || !currentWallet
                                                ? "bg-buttonDisabled cursor-not-allowed"
                                                : "bg-gray-600 hover:bg-gray-500 text-textWhite"
                                        }`}
                                >
                                    {isLoading ? "Processing..." : "Claim Additional TRAX without staking"}
                                </button>

                                <span className="text-textWhite/80 font-league-spartan">OR</span>

                                <button
                                    onClick={handleStake}
                                    disabled={isLoading || isStakeLoadingRedux || isBurnLoading || !currentWallet}
                                    className={`flex-1 py-3 px-4 rounded-xl font-league-spartan font-bold text-lg
                                        ${
                                            isLoading || isStakeLoadingRedux || isBurnLoading || !currentWallet
                                                ? "bg-buttonDisabled cursor-not-allowed"
                                                : "bg-buttonPrimary hover:bg-buttonPrimaryLight text-black"
                                        }`}
                                >
                                    {isStakeLoadingRedux ? "Processing..." : "Claim and stake for 2000% APY"}
                                </button>
                            </div>

                            {/* Trash It button - centered and special */}
                            <div className="flex justify-center">
                                <div className="relative">
                                    <button
                                        onClick={() => showWarning("burn")}
                                        disabled={isLoading || isStakeLoadingRedux || isBurnLoading || !currentWallet}
                                        className={`group relative overflow-hidden py-3 px-6 rounded-xl font-league-spartan font-bold text-base border-2 transition-all duration-300
                                            ${
                                                isLoading || isStakeLoadingRedux || isBurnLoading || !currentWallet
                                                    ? "bg-buttonDisabled border-gray-600 cursor-not-allowed"
                                                    : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-red-500 hover:border-red-400 text-white hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
                                            }`}
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            <img src="trash.gif" alt="trash" className="w-6 h-6" />
                                            {isBurnLoading ? "Burning..." : "Trash"}
                                            <span className="text-xl">🔥</span>
                                        </span>
                                        {/* Animated background effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                    </button>
                                    {/* Sparkle effects */}
                                    <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 rounded-xl opacity-0 group-hover:opacity-30 blur transition-all duration-300"></div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-bgPrimary/50 backdrop-blur-sm rounded-2xl border border-borderDark">
                            <div className="flex items-start gap-3">
                                <IoInformationCircle className="text-xl text-textWhite/80 mt-1" />
                                <p className="font-league-spartan text-sm text-textWhite/80">
                                    You can either claim your TRAX tokens now, stake them to earn 2000% APR for 3
                                    months, or if you don't want your airdrop? burn it and we'll match you 🔥. Staking
                                    is non-locking, so you can withdraw at any time. However, if you choose to claim
                                    your tokens now, you WILL NOT be able to stake them in this vault again. Burning
                                    tokens is permanent and cannot be undone!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            <WarningModal
                isOpen={showWarningModal}
                onClose={() => setShowWarningModal(false)}
                onConfirm={warningType === "claim" ? handleClaim : warningType === "stake" ? handleStake : handleBurn}
                type={warningType}
                isLoading={
                    warningType === "claim" ? isLoading : warningType === "stake" ? isStakeLoadingRedux : isBurnLoading
                }
            />
        </div>
    );
};

