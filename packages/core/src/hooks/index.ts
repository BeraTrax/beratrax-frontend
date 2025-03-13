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
import { usePlatformTVL } from "./usePlatformTVL";
import { useReferralDashboard } from "./useReferralDashboard";
import { useSlippageWithdraw, useSlippageDeposit } from "./useSlippage";
import { useSnapshotJoinSpace, useSnapshotSpace } from "./useSnapshot";
import { useStats } from "./useStats";
import useSwapUsdcNative from "./useSwapUsdcNative";
import useTransfer from "./useTransfer";
import { useTransferToken } from "./useTransferToken";
import useTrax from "./useTrax";
import useTVL from "./useUserTVL";
import useVaultMigrate from "./useVaultMigrate";
import { useVaults } from "./useVaults";
import useTokens from "../state/tokens/useTokens";
import useWallet from "./useWallet";
import useWeb3Auth from "./useWeb3Auth";
import useWindowSize from "./useWindowSize";

// Export all hooks
export {
  useApp,
  useApprovalErc20,
  useConstants,
  useNotify,
  useSnapshotJoinSpace,
  useSnapshotSpace,
  useSlippageDeposit,
  useTokens,
  useWallet,
  useWeb3Auth,
  useWindowSize,
  useDataRefresh,
  useDetailInput,
  useDeviceInfo,
  useLp,
  useMyReferrals,
  usePageTracking,
  usePlatformTVL,
  useReferralDashboard,
  useSlippageWithdraw,
  useStats,
  useSwapUsdcNative,
  useTransfer,
  useTransferToken,
  useTrax,
  useTVL,
  useVaultMigrate,
  useVaults,
};
