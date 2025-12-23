import React, { useState, useCallback, useMemo } from "react";
import { View, Text, Platform, FlatList, TouchableOpacity, ActivityIndicator, Image, ImageSourcePropType } from "react-native";
import Earnpagedots from "@beratrax/core/src/assets/images/earnpagedots.svg";
import Earnpageleaves from "@beratrax/core/src/assets/images/earnpagetoprightleaves1.png";
import Earnpageleaves2 from "@beratrax/core/src/assets/images/earnpagetoprightleaves2.png";
import { useRouter } from "expo-router";
import { useNavigate } from "react-router-dom";
import BackButton from "ui/src/components/BackButton/BackButton";
import { SvgImage } from "ui/src/components/SvgImage/SvgImage";
import { useWithdrawPage, VaultWithBalance } from "@beratrax/core/src/hooks/useWithdrawPage";
import { useEmergencyWithdraw } from "@beratrax/core/src/hooks/useEmergencyWithdraw";
import useWallet from "@beratrax/core/src/hooks/useWallet";
import { VaultWithdrawRow } from "./VaultWithdrawRow";
import { Skeleton } from "ui/src/components/Skeleton/Skeleton";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export function WithdrawView() {
	const router = useRouter();
	let navigate = null;
	if (Platform.OS === "web") {
		navigate = useNavigate();
	}

	const { currentWallet, isConnecting } = useWallet();
	const { openConnectModal } = useConnectModal();
	const { vaultsWithBalances, isLoading, error, refetch } = useWithdrawPage();
	const { redeemFromSingleVault, redeemAll, isRedeeming, redeemingVaultId } = useEmergencyWithdraw();

	const [isRedeemingAll, setIsRedeemingAll] = useState(false);
	const [redeemAllProgress, setRedeemAllProgress] = useState<{ completed: number; total: number } | null>(null);

	const handleBack = useCallback(() => {
		if (Platform.OS === "web") {
			navigate?.("/");
		} else {
			router.replace("/");
		}
	}, [router, navigate]);

	const handleRedeem = useCallback(
		async (vault: VaultWithBalance) => {
			const result = await redeemFromSingleVault(vault);
			if (result.success) {
				// Refetch balances after successful redemption
				await refetch();
			} else {
				// Could show an error toast here
				console.error("Redemption failed:", result.error);
			}
		},
		[redeemFromSingleVault, refetch]
	);

	const handleRedeemAll = useCallback(async () => {
		setIsRedeemingAll(true);
		setRedeemAllProgress({ completed: 0, total: vaultsWithBalances.length });

		const result = await redeemAll(vaultsWithBalances, (completed, total) => {
			setRedeemAllProgress({ completed: completed + 1, total });
		});

		setIsRedeemingAll(false);
		setRedeemAllProgress(null);

		// Refetch balances after all redemptions
		await refetch();

		console.log(`Redeemed ${result.success} vaults, ${result.failed} failed`);
	}, [vaultsWithBalances, redeemAll, refetch]);

	const vaultsWithNonZeroBalance = useMemo(
		() => vaultsWithBalances.filter((v) => v.shareBalance > 0n),
		[vaultsWithBalances]
	);

	const renderHeader = useCallback(
		() => (
			<>
				<BackButton onClick={handleBack} />

				{/* Heading */}
				<View className="mt-4">
					<Text className="font-league-spartan text-3xl font-bold uppercase text-white">Withdraw</Text>
				</View>

				{/* Shutdown Warning Banner */}
				<View className="mt-6 bg-red-500/20 border border-red-500/40 p-4 rounded-xl">
					<Text className="text-red-400 font-medium text-base mb-2">Project Shutdown Notice</Text>
					<Text className="text-red-300 text-sm leading-5">
						Trax is shutting down. Please use this page to withdraw all your funds from the vaults. Your vault shares
						will be redeemed for the underlying tokens.
					</Text>
				</View>

				{/* ETF Warning */}
				{vaultsWithNonZeroBalance.some((v) => v.isETFVault) && (
					<View className="mt-4 bg-yellow-500/20 border border-yellow-500/40 p-4 rounded-xl">
						<Text className="text-yellow-400 font-medium text-base mb-2">ETF Vault Notice</Text>
						<Text className="text-yellow-300 text-sm leading-5">
							ETF vaults return underlying vault shares when withdrawn. You may need to redeem those shares separately
							to get your final tokens.
						</Text>
					</View>
				)}

				{/* Vault Count */}
				{!isLoading && currentWallet && (
					<View className="mt-6 mb-4">
						<Text className="text-lg font-light text-white font-league-spartan">
							{vaultsWithNonZeroBalance.length > 0
								? `Your Vault Positions (${vaultsWithNonZeroBalance.length})`
								: "No vault positions found"}
						</Text>
					</View>
				)}
			</>
		),
		[handleBack, vaultsWithNonZeroBalance, isLoading, currentWallet]
	);

	const renderItem = useCallback(
		({ item }: { item: VaultWithBalance }) => (
			<VaultWithdrawRow
				vault={item}
				onRedeem={() => handleRedeem(item)}
				isRedeeming={isRedeeming || isRedeemingAll}
				isCurrentlyRedeeming={redeemingVaultId === item.id}
			/>
		),
		[handleRedeem, isRedeeming, isRedeemingAll, redeemingVaultId]
	);

	const renderFooter = useCallback(() => {
		if (vaultsWithNonZeroBalance.length === 0) {
			return <View className="h-32" />;
		}

		return (
			<View className="mt-6 mb-32">
				{/* Redeem All Button */}
				<TouchableOpacity
					onPress={handleRedeemAll}
					disabled={isRedeeming || isRedeemingAll || vaultsWithNonZeroBalance.length === 0}
					className="w-full py-4 rounded-xl items-center justify-center"
					style={{
						backgroundColor: isRedeeming || isRedeemingAll ? "#4B5563" : "#7C3AED",
					}}
				>
					{isRedeemingAll ? (
						<View className="flex flex-row items-center gap-2">
							<ActivityIndicator size="small" color="#ffffff" />
							<Text className="text-textWhite font-bold text-lg">
								Redeeming {redeemAllProgress?.completed || 0}/{redeemAllProgress?.total || 0}...
							</Text>
						</View>
					) : (
						<Text className="text-textWhite font-bold text-lg">
							Redeem All ({vaultsWithNonZeroBalance.length} vaults)
						</Text>
					)}
				</TouchableOpacity>

				<Text className="text-textSecondary text-center text-sm mt-4">
					This will redeem all your vault positions sequentially
				</Text>
			</View>
		);
	}, [vaultsWithNonZeroBalance, handleRedeemAll, isRedeeming, isRedeemingAll, redeemAllProgress]);

	const renderConnectWallet = () => (
		<View className="flex-1 items-center justify-center mt-20">
			<Text className="text-textWhite text-lg mb-4">Connect your wallet to view your positions</Text>
			<TouchableOpacity
				onPress={() => openConnectModal?.()}
				className="px-8 py-4 rounded-xl"
				style={{ backgroundColor: "#7C3AED" }}
			>
				<Text className="text-textWhite font-bold text-lg">Connect Wallet</Text>
			</TouchableOpacity>
		</View>
	);

	const renderLoading = () => (
		<View className="mt-6">
			{[1, 2, 3].map((i) => (
				<View key={i} className="bg-bgDark py-4 px-4 rounded-2xl mb-2">
					<View className="flex flex-row justify-between items-center">
						<View className="flex flex-row items-center gap-3">
							<Skeleton w={40} h={40} bRadius={20} />
							<View>
								<Skeleton w={96} h={16} style={{ marginBottom: 8 }} />
								<Skeleton w={64} h={12} />
							</View>
						</View>
						<View className="flex flex-row items-center gap-4">
							<View className="items-end">
								<Skeleton w={64} h={16} style={{ marginBottom: 4 }} />
								<Skeleton w={48} h={12} />
							</View>
							<Skeleton w={96} h={40} bRadius={12} />
						</View>
					</View>
				</View>
			))}
		</View>
	);

	const renderError = () => (
		<View className="mt-6 bg-red-500/20 p-4 rounded-xl">
			<Text className="text-red-400 text-center">{error}</Text>
			<TouchableOpacity onPress={refetch} className="mt-4 items-center">
				<Text className="text-textWhite underline">Try Again</Text>
			</TouchableOpacity>
		</View>
	);

	const keyExtractor = useCallback((item: VaultWithBalance) => `vault-${item.id}`, []);
	const contentContainerStyle = useMemo(() => ({ gap: 8 }), []);

	return (
		<View className="relative bg-bgSecondary text-textWhite h-full overflow-hidden font-league-spartan">
			{/* Background Leaves */}
			<View className="absolute top-14 right-1 w-50">
				{Platform.OS === "web" ? (
					<SvgImage source={Earnpageleaves2} />
				) : (
					<Image source={Earnpageleaves2 as ImageSourcePropType} height={200} width={200} />
				)}
			</View>
			<View className="absolute top-2 -right-2 w-40">
				{Platform.OS === "web" ? (
					<SvgImage source={Earnpageleaves} />
				) : (
					<Image source={Earnpageleaves as ImageSourcePropType} height={200} width={200} />
				)}
			</View>
			<View className="absolute top-2 right-5 w-40">
				<SvgImage source={Earnpagedots} height={200} width={200} />
			</View>

			<View className="h-full pt-14 px-4 pb-2">
				{!currentWallet && !isConnecting ? (
					<>
						{renderHeader()}
						{renderConnectWallet()}
					</>
				) : isLoading || isConnecting ? (
					<>
						{renderHeader()}
						{renderLoading()}
					</>
				) : error ? (
					<>
						{renderHeader()}
						{renderError()}
					</>
				) : (
					<FlatList
						data={vaultsWithNonZeroBalance}
						renderItem={renderItem}
						keyExtractor={keyExtractor}
						contentContainerStyle={contentContainerStyle}
						initialNumToRender={10}
						maxToRenderPerBatch={10}
						windowSize={5}
						removeClippedSubviews={true}
						showsVerticalScrollIndicator={false}
						ListHeaderComponent={renderHeader}
						ListFooterComponent={renderFooter}
						ListEmptyComponent={
							<View className="items-center justify-center py-10">
								<Text className="text-textSecondary text-center">
									No vault positions found for this wallet.
								</Text>
							</View>
						}
					/>
				)}
			</View>
		</View>
	);
}

export default WithdrawView;
