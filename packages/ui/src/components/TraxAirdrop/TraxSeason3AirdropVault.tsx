import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "@beratrax/core/src/state";
import {
	withdrawAdditionalAirdrop,
	claimAdditionalAirdropRewards,
	fetchAdditionalAirdropData,
} from "@beratrax/core/src/state/account/accountReducer";
import useWallet from "@beratrax/core/src/hooks/useWallet";
import useTokens from "@beratrax/core/src/state/tokens/useTokens";
import { formatEther } from "viem";
import { customCommify } from "@beratrax/core/src/utils/common";
import { dismissNotify, notifyError, notifyLoading, notifySuccess } from "@beratrax/core/src/api/notify";
import { CgSpinner } from "react-icons/cg";
import { ImSpinner8 } from "react-icons/im";
import FarmRowChip from "@beratrax/ui/src/components/FarmItem/components/FarmRowChip/FarmRowChip";
import { CHAIN_ID } from "@beratrax/core/src/types/enums";
import { TRAX_TOKEN_ADDRESS } from "@beratrax/core/src/config/constants";
import { Image, Pressable, Text, View, Platform } from "react-native";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";

interface WarningModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	isLoading: boolean;
}

const WithdrawWarningModal = ({ isOpen, onClose, onConfirm, isLoading }: WarningModalProps) => {
	if (!isOpen) return null;

	return (
		<View className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
			<View className="bg-bgSecondary rounded-3xl p-6 max-w-lg w-full mx-4 border border-borderDark">
				<View className="w-full mb-4">
					<View className="overflow-y-auto pr-2 pt-4 text-justify normal-case text-sm font-league-spartan">
						<Text className="text-2xl font-bold text-center text-textWhite">Important Notice!</Text>
						<Text className="text-base text-textWhite">
							You are choosing to withdraw your staked TRAX tokens. You understand that after this transaction, you will receive your staked
							tokens and any pending rewards. You recognize that you won't be able to stake these tokens again in this pool after
							withdrawal.
						</Text>
					</View>
				</View>
				<View className="flex justify-end gap-4">
					<Pressable className="bg-gray-500 p-4 rounded-xl w-32 font-league-spartan text-textWhite" onPress={onClose}>
						<Text>Cancel</Text>
					</Pressable>
					<Pressable
						className="bg-bgPrimary p-4 rounded-xl w-32 font-league-spartan text-textWhite"
						disabled={isLoading}
						onPress={onConfirm}
					>
						{isLoading ? <ImSpinner8 className="animate-spin mx-auto" /> : "I understand"}
					</Pressable>
				</View>
			</View>
		</View>
	);
};

export const TraxSeason3AirdropVault = () => {
	const dispatch = useAppDispatch();
	const { reloadBalances } = useTokens();
	const { getClients, currentWallet } = useWallet();
	const { prices } = useTokens();
	const [showWithdrawModal, setShowWithdrawModal] = useState(false);

	// Generate unique gradient ID to avoid conflicts
	const gradientId = useMemo(() => `traxSeason3AirdropGrad-${Math.random().toString(36).substr(2, 9)}`, []);

	// Get additional airdrop state from Redux
	const additionalAirdropState = useSelector((state: RootState) => state.account.additionalAirdrop);

	const {
		isClaimed = false,
		isInitialLoading = true,
		claimData = null,
		stakeInfo = "0",
		pendingRewards = "0",
		isWithdrawLoading = false,
		isClaimRewardsLoading = false,
	} = additionalAirdropState || {};

	// TRAX token address
	const traxPrice = prices[CHAIN_ID.BERACHAIN]?.[TRAX_TOKEN_ADDRESS] || 0;

	// Calculate USD values
	const stakeAmountFormatted = formatEther(BigInt(stakeInfo || "0"));
	const pendingRewardsFormatted = formatEther(BigInt(pendingRewards || "0"));
	const stakeUsdValue = Number(stakeAmountFormatted) * traxPrice;
	const rewardsUsdValue = Number(pendingRewardsFormatted) * traxPrice;

	const handleWithdraw = async () => {
		let id: string | undefined = undefined;
		try {
			id = notifyLoading({
				title: "Withdrawing stake...",
				message: "Processing your withdrawal transaction...",
			});

			await dispatch(withdrawAdditionalAirdrop({ amount: BigInt(stakeInfo), getClients })).unwrap();

			id && dismissNotify(id);
			notifySuccess({
				title: "Success!",
				message: "Stake withdrawn successfully",
			});

			await dispatch(fetchAdditionalAirdropData({ address: currentWallet!, getClients })).unwrap();
			await reloadBalances();
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

			await dispatch(claimAdditionalAirdropRewards({ getClients })).unwrap();

			id && dismissNotify(id);
			notifySuccess({
				title: "Success!",
				message: "Rewards claimed successfully",
			});

			await dispatch(fetchAdditionalAirdropData({ address: currentWallet!, getClients })).unwrap();
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
		<View
			className={`
                rounded-3xl border border-borderDark p-6 text-textWhite shadow-md
                min-w-[calc(25%-12px)]
                max-[2000px]:min-w-[calc(33.33%-10.66px)]
                max-[1300px]:min-w-[calc(50%-8px)]
                max-[768px]:min-w-full
            `}
			style={{
				position: "relative",
				overflow: "hidden",
			}}
		>
			{/* Gradient Background - CSS for web, SVG for mobile */}
			{Platform.OS === "web" && (
				<View
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						borderRadius: 24,
						zIndex: -1,
						pointerEvents: "none",
						// @ts-ignore
						background: "radial-gradient(circle at 45% 151%, var(--new-color_primary) -40%, var(--new-background_dark) 75%)",
					}}
				/>
			)}

			{Platform.OS !== "web" && (
				<View
					style={{
						position: "absolute",
						top: 0,
						left: -15,
						right: 0,
						bottom: 0,
						borderRadius: 24,
						zIndex: -1,
						pointerEvents: "none",
					}}
				>
					<Svg
						height="100%"
						width="100%"
						viewBox="0 0 400 300"
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							zIndex: -1,
						}}
					>
						<Defs>
							<RadialGradient id={gradientId} cx="45%" cy="100%" rx="120%" ry="120%" fx="45%" fy="151%" gradientUnits="objectBoundingBox">
								<Stop offset="0" stopColor="#3B7EE3" stopOpacity="0.6" />
								<Stop offset="0.2" stopColor="#3B7EE3" stopOpacity="0.4" />
								<Stop offset="0.4" stopColor="#3B7EE3" stopOpacity="0.2" />
								<Stop offset="0.6" stopColor="#020907" stopOpacity="0.3" />
								<Stop offset="0.75" stopColor="#020907" stopOpacity="0.8" />
								<Stop offset="1" stopColor="#020907" stopOpacity="1" />
							</RadialGradient>
						</Defs>
						<Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gradientId})`} />
					</Svg>
				</View>
			)}
			{/* Header */}
			<View className="flex flex-row justify-between align-top gap-2 mb-6">
				<View className="flex flex-col gap-2 font-league-spartan text-lg">
					<View className="flex items-start relative">
						<Image
							className="w-9 h-9 rounded-full"
							alt="TRAX"
							source={{ uri: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/btx/logo.png" }}
						/>
					</View>
					<View className="flex items-center gap-2">
						<Text className="text-lg text-textWhite">TRAX 2nd Airdrop Vault</Text>
					</View>
				</View>
				<View className="flex-col gap-1">
					<View className="flex items-center gap-1 mb-2 justify-end">
						<FarmRowChip text={"BeraTrax"} color="invert" />
						<View className="flex">
							<Image alt="Beratrax" className="w-4 rounded-full border border-bgDark" src="beratrax.png" />
						</View>
					</View>
				</View>
			</View>

			{/* Stats Grid */}
			<View className="flex flex-row items-start justify-between mb-6">
				{/* Earnings (Rewards) */}
				<View className="flex-1 pr-6 border-r border-bgPrimary">
					<View className="mb-2">
						<Text className="text-textPrimary text-lg font-arame-mono uppercase">Earnings</Text>
					</View>
					<View className="space-y-1">
						<Text className="text-textWhite text-lg font-league-spartan leading-5">
							+$
							{customCommify(rewardsUsdValue, {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
								showDollarSign: false,
							})}
						</Text>
						<Text className="text-textWhite text-xs">
							+
							{customCommify(pendingRewardsFormatted, {
								minimumFractionDigits: 0,
								maximumFractionDigits: 4,
								showDollarSign: false,
							})}{" "}
							TRAX
						</Text>
						{/* {BigInt(pendingRewards || "0") > 0n && (
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
					</View>
				</View>

				{/* APR */}
				<View className="flex-1 pl-6">
					<View className="mb-2">
						<Text className="text-textPrimary text-lg font-arame-mono uppercase">APR</Text>
					</View>
					<View>
						<Text className="text-textWhite text-lg font-league-spartan leading-5">2000%</Text>
					</View>
				</View>
			</View>

			{/* Bottom Section - Withdraw Button and Your Stake */}
			<View className="flex flex-row justify-between items-center">
				{/* Withdraw Button - Left Side */}
				<Pressable
					onPress={showWithdrawWarning}
					disabled={isWithdrawLoading || !currentWallet}
					className={`px-4 py-2 rounded-md transition-all transform duration-200 flex items-center justify-center gap-2 min-w-[140px] ${
						isWithdrawLoading || !currentWallet
							? "bg-buttonDisabled cursor-not-allowed"
							: "bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95"
					} text-white`}
				>
					{isWithdrawLoading && <CgSpinner className="animate-spin text-xl" />}
					<Text>{isWithdrawLoading ? "Processing..." : "Withdraw Early"}</Text>
				</Pressable>

				{/* Your Stake - Right Side */}
				<View className="flex flex-row items-end gap-2 bg-white/5 backdrop-blur-sm rounded-lg p-3">
					<Text className="text-textPrimary text-md font-arame-mono uppercase">Your Stake</Text>
					<Text className="text-textWhite text-md font-league-spartan">
						${customCommify(stakeUsdValue, { minimumFractionDigits: 2, maximumFractionDigits: 2, showDollarSign: false })} (
						{customCommify(stakeAmountFormatted, { minimumFractionDigits: 0, maximumFractionDigits: 0, showDollarSign: false })} TRAX)
					</Text>
				</View>
			</View>

			<WithdrawWarningModal
				isOpen={showWithdrawModal}
				onClose={() => setShowWithdrawModal(false)}
				onConfirm={handleWithdraw}
				isLoading={isWithdrawLoading}
			/>
		</View>
	);
};
