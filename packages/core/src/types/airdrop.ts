export type TokenActionType = "claim" | "stake" | "burn";

export type AirdropType = {
	isClaimed: boolean;
	isInitialLoading: boolean;
	stakeInfo: string;
	pendingRewards: string;
	isLoading: boolean;
	isWithdrawLoading: boolean;
	isClaimRewardsLoading: boolean;
	isStakeLoading: boolean;
};

export interface WarningModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	type: TokenActionType;
	isLoading: boolean;
}

export interface AirdropHookConfig {
	type: "regular" | "additional";
}

export interface AirdropHookReturn {
	// State
	showWarningModal: boolean;
	warningType: TokenActionType;
	isBurnLoading: boolean;
	isStakeLoading: boolean;
	isLoading: boolean;
	isClaimed: boolean;
	isInitialLoading: boolean;
	claimData: any;
	stakeInfo?: string;
	pendingRewards?: string;

	// Actions
	handleClaim: () => Promise<void>;
	handleStake: () => Promise<void>;
	handleBurn: () => Promise<void>;
	showWarning: (type: TokenActionType) => void;
	setShowWarningModal: (show: boolean) => void;

	// Computed
	shouldRenderAirdropSection: boolean;
}
