import { useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "src/state";
import {
    fetchAirdropData,
    claimAirdrop,
    fetchAdditionalAirdropData,
    claimAdditionalAirdrop,
} from "src/state/account/accountReducer";
import { dismissNotify, notifyError, notifyLoading, notifySuccess } from "src/api/notify";
import useWallet from "src/hooks/useWallet";
import useTokens from "src/state/tokens/useTokens";
import useTransfer from "src/hooks/useTransfer";
import { CHAIN_ID } from "src/types/enums";
import { DEAD_ADDRESS, TRAX_TOKEN_ADDRESS } from "src/config/constants";
import { AirdropHookConfig, AirdropHookReturn, TokenActionType } from "src/types/airdrop";

const useAirdrop = (config: AirdropHookConfig): AirdropHookReturn => {
    const dispatch = useAppDispatch();
    const { reloadBalances } = useTokens();
    const { getClients, currentWallet } = useWallet();
    const { transfer } = useTransfer();

    // Local state
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [warningType, setWarningType] = useState<TokenActionType>("claim");
    const [isBurnLoading, setIsBurnLoading] = useState(false);

    // Redux state selection based on config
    const airdropState = useSelector((state: RootState) =>
        config.type === "regular" ? state.account.airdrop : state.account.additionalAirdrop
    );

    const {
        isClaimed = false,
        isInitialLoading = true,
        claimData = null,
        stakeInfo = "0",
        pendingRewards = "0",
        isLoading = false,
        isStakeLoading = false,
    } = airdropState || {};

    // Action dispatchers based on config
    const fetchData = useCallback(async () => {
        if (!currentWallet) return;

        try {
            if (config.type === "regular") {
                await dispatch(fetchAirdropData({ address: currentWallet, getClients })).unwrap();
            } else {
                await dispatch(fetchAdditionalAirdropData({ address: currentWallet, getClients })).unwrap();
            }
        } catch (error) {
            console.error(`Failed to fetch ${config.type} airdrop data:`, error);
        }
    }, [currentWallet, getClients, dispatch, config.type]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleClaim = async () => {
        if (!claimData) return;

        let id: string | undefined = undefined;
        try {
            id = notifyLoading({
                title: "Claiming TRAX...",
                message: "Processing your claim transaction...",
            });

            if (config.type === "regular") {
                await dispatch(claimAirdrop({ claim: true, getClients })).unwrap();
            } else {
                await dispatch(
                    claimAdditionalAirdrop({ claim: true, nonce: claimData.nonce || 0, getClients })
                ).unwrap();
            }

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

            if (config.type === "regular") {
                await dispatch(claimAirdrop({ claim: false, getClients })).unwrap();
            } else {
                await dispatch(
                    claimAdditionalAirdrop({ claim: false, nonce: claimData.nonce || 0, getClients })
                ).unwrap();
            }

            if (config.type === "regular") {
                await reloadBalances();
            }

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
            if (config.type === "regular") {
                await dispatch(claimAirdrop({ claim: true, getClients })).unwrap();
            } else {
                await dispatch(
                    claimAdditionalAirdrop({ claim: true, nonce: claimData.nonce || 0, getClients })
                ).unwrap();
            }

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

    const showWarning = (type: TokenActionType) => {
        setWarningType(type);
        setShowWarningModal(true);
    };

    // Computed values
    const shouldRenderAirdropSection = Boolean(
        !isInitialLoading &&
            claimData &&
            (config.type === "regular" ? BigInt(claimData.amount) > 0n : Number(claimData.amount) > 0) &&
            !isClaimed
    );

    return {
        // State
        showWarningModal,
        warningType,
        isBurnLoading,
        isStakeLoading,
        isLoading,
        isClaimed,
        isInitialLoading,
        claimData,
        stakeInfo,
        pendingRewards,

        // Actions
        handleClaim,
        handleStake,
        handleBurn,
        showWarning,
        setShowWarningModal,

        // Computed
        shouldRenderAirdropSection,
    };
};

export default useAirdrop;
