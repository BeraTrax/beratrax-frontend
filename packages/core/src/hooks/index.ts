// Import all hooks from their respective files
import useApp from "./useApp";
import { useApprovalErc20 } from "./useApproval";
import useConstants from "./useConstants";
import { useDataRefresh } from "./useDataRefresh";
import { useDetailInput } from "./useDetailInput";
import { useDeviceInfo } from "./useDeviceInfo";
import { useLp } from "./useLp";
import { useMyReferrals } from "./useMyReferrals";
import useNotify from "./useNotify";
import usePageTracking from "./usePageTracking";
import { usePlatformTVL, usePlatformTVLHistory, useTransactionCount } from "./usePlatformTVL";
import { useReferralDashboard } from "./useReferralDashboard";
import { useSlippageWithdraw, useSlippageDeposit } from "./useSlippage";
import { useStats } from "./useStats";
import useTransfer from "./useTransfer";
import { useTransferToken } from "./useTransferToken";
import useTrax from "./useTrax";
import useTVL from "./useUserTVL";
import { useVaults } from "./useVaults";
import { useETFVault } from "./useETFVault";
import { useWithdrawPage } from "./useWithdrawPage";
import { useEmergencyWithdraw } from "./useEmergencyWithdraw";
import useTokens from "../state/tokens/useTokens";
import useWallet from "./useWallet";
import useWindowSize from "./useWindowSize";

// Export all hooks
export {
	useApp,
	useApprovalErc20,
	useConstants,
	useNotify,
	useSlippageDeposit,
	useTokens,
	useWallet,
	useWindowSize,
	useDataRefresh,
	useDetailInput,
	useDeviceInfo,
	useLp,
	useMyReferrals,
	usePageTracking,
	usePlatformTVL,
	usePlatformTVLHistory,
	useTransactionCount,
	useReferralDashboard,
	useSlippageWithdraw,
	useStats,
	useTransfer,
	useTransferToken,
	useTrax,
	useTVL,
	useVaults,
	useETFVault,
	useWithdrawPage,
	useEmergencyWithdraw,
};
