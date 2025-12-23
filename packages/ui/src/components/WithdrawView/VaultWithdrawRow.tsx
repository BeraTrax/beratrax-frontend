import React from "react";
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { VaultWithBalance } from "@beratrax/core/src/hooks/useWithdrawPage";
import { toFixedFloor } from "@beratrax/core/src/utils/common";

interface VaultWithdrawRowProps {
	vault: VaultWithBalance;
	onRedeem: () => void;
	isRedeeming: boolean;
	isCurrentlyRedeeming: boolean;
}

export function VaultWithdrawRow({ vault, onRedeem, isRedeeming, isCurrentlyRedeeming }: VaultWithdrawRowProps) {
	const isDisabled = isRedeeming || vault.shareBalance === 0n;

	return (
		<View className="bg-bgDark py-4 px-4 rounded-2xl">
			<View className="flex flex-row justify-between items-center">
				{/* Left: Logo and name */}
				<View className="flex flex-row items-center gap-3 flex-1">
					<View className="flex flex-row justify-center items-center" style={{ position: "relative" }}>
						{vault.logo1 && (
							<Image
								source={{ uri: vault.logo1 }}
								alt={vault.name}
								className="h-10 w-10 rounded-full"
								style={{ zIndex: 1 }}
							/>
						)}
						{vault.logo2 && (
							<Image
								source={{ uri: vault.logo2 }}
								alt={vault.name}
								className="h-10 w-10 rounded-full"
								style={{ marginLeft: -12, zIndex: 0 }}
							/>
						)}
					</View>
					<View className="flex-1">
						<View className="flex flex-row items-center gap-2">
							<Text className="text-textWhite font-medium text-base">{vault.name}</Text>
							{vault.isETFVault && (
								<View className="bg-yellow-500/20 px-2 py-0.5 rounded">
									<Text className="text-yellow-500 text-xs font-medium">ETF</Text>
								</View>
							)}
						</View>
						<Text className="text-textSecondary text-sm mt-0.5">
							{toFixedFloor(parseFloat(vault.shareBalanceFormatted), 6)} shares
						</Text>
					</View>
				</View>

				{/* Right: Value and button */}
				<View className="flex flex-row items-center gap-4">
					<View className="items-end mr-2">
						<Text className="text-textWhite font-medium">
							~{toFixedFloor(parseFloat(vault.estimatedUnderlyingFormatted), 6)}
						</Text>
						<Text className="text-textSecondary text-xs">underlying</Text>
					</View>
					<TouchableOpacity
						onPress={onRedeem}
						disabled={isDisabled}
						className={`px-4 py-2.5 rounded-xl min-w-[100px] items-center justify-center ${
							isDisabled ? "bg-gray-600" : "bg-gradientPrimary"
						}`}
						style={{
							backgroundColor: isDisabled ? "#4B5563" : "#7C3AED",
						}}
					>
						{isCurrentlyRedeeming ? (
							<ActivityIndicator size="small" color="#ffffff" />
						) : (
							<Text className="text-textWhite font-medium text-sm">
								{vault.shareBalance === 0n ? "No Balance" : "Redeem"}
							</Text>
						)}
					</TouchableOpacity>
				</View>
			</View>

			{/* ETF Warning */}
			{vault.isETFVault && vault.shareBalance > 0n && (
				<View className="mt-3 bg-yellow-500/10 p-3 rounded-lg">
					<Text className="text-yellow-500 text-xs">
						Note: ETF vault withdrawal returns underlying vault shares, not final tokens. You may need to redeem those
						shares separately.
					</Text>
				</View>
			)}
		</View>
	);
}

export default VaultWithdrawRow;
