import React, { useCallback, useState } from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import useWallet from "@beratrax/core/src/hooks/useWallet";
import { BackButton } from "@beratrax/ui";
import { AccountDeletionModal } from "@beratrax/ui";
import { TrashIcon, SettingsIcon } from "@beratrax/ui";

const Settings = () => {
	const router = useRouter();
	const { currentWallet, logout } = useWallet();
	const [showDeletionModal, setShowDeletionModal] = useState(false);

	console.log(currentWallet);

	const handleBack = useCallback(() => {
		router.replace("/");
	}, [router]);

	const handleLogout = async () => {
		Alert.alert("Logout", "Are you sure you want to logout?", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Logout",
				style: "destructive",
				onPress: () => {
					logout();
					router.replace("/");
				},
			},
		]);
	};

	const dangerZoneOptions = [
		{
			id: "deleteAccount",
			title: "Delete Account",
			description: "Permanently delete your account and all data",
			icon: TrashIcon,
			onPress: () => setShowDeletionModal(true),
			isDanger: true,
		},
	];

	const DangerOption = ({ option }: { option: any }) => {
		const IconComponent = option.icon;

		return (
			<Pressable onPress={option.onPress} className="flex-row items-center p-4 rounded-xl border bg-red-900/10 border-red-500/20">
				<View className="p-3 rounded-lg mr-4 bg-red-500/20">
					<IconComponent color="#ef4444" size={20} />
				</View>
				<View className="flex-1">
					<Text className="font-league-spartan text-lg font-semibold text-red-400">{option.title}</Text>
					<Text className="font-league-spartan text-sm text-white mt-1">{option.description}</Text>
				</View>
			</Pressable>
		);
	};

	if (!currentWallet) {
		return (
			<SafeAreaView className="flex-1 bg-bgSecondary">
				<ScrollView className="flex-1">
					{/* Header */}
					<View className="flex-row items-center px-4 py-6 border-b border-borderDark">
						<BackButton onClick={handleBack} />
						<View className="flex-row items-center ml-4">
							<SettingsIcon color="#3B7EE3" size={24} />
							<Text className="font-league-spartan text-2xl font-bold text-textWhite ml-3">Settings</Text>
						</View>
					</View>
				</ScrollView>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-bgSecondary">
			<ScrollView className="flex-1">
				{/* Header */}
				<View className="flex-row items-center px-4 py-6 border-b border-borderDark">
					<BackButton onClick={handleBack} />
					<View className="flex-row items-center ml-4">
						<SettingsIcon color="#3B7EE3" size={24} />
						<Text className="font-league-spartan text-2xl font-bold text-textWhite ml-3">Settings</Text>
					</View>
				</View>

				{/* Wallet Information */}
				{currentWallet && (
					<View className="mx-4 mt-6">
						<Text className="font-league-spartan text-xl font-bold text-textWhite mb-4">Wallet</Text>
						<View className="p-4 bg-bgDark rounded-xl border border-borderDark">
							<Text className="font-league-spartan text-lg font-semibold text-textWhite mb-2">Connected Wallet</Text>
							<Text className="font-league-spartan text-lg font-semibold text-textWhite mb-2">{`${currentWallet}`}</Text>
						</View>
					</View>
				)}

				{/* Account Actions */}
				<View className="mx-4 mt-6">
					<Text className="font-league-spartan text-xl font-bold text-textWhite mb-4">Account</Text>
					<Pressable onPress={handleLogout} className="flex-row items-center p-4 rounded-xl bg-bgDark border border-borderDark">
						<Text className="font-league-spartan text-lg font-semibold text-textWhite">Logout</Text>
					</Pressable>
				</View>

				{/* Danger Zone */}
				<View className="mx-4 mt-8 mb-6">
					<Text className="font-league-spartan text-xl font-bold text-red-400 mb-4">Danger Zone</Text>
					<View className="gap-3">
						{dangerZoneOptions.map((option) => (
							<DangerOption key={option.id} option={option} />
						))}
					</View>
				</View>
			</ScrollView>

			{/* Account Deletion Modal */}
			<AccountDeletionModal
				isVisible={showDeletionModal}
				onClose={(shouldLogout) => {
					setShowDeletionModal(false);
					if (shouldLogout) {
						logout();
						router.replace("/");
					}
				}}
				userAddress={currentWallet}
			/>
		</SafeAreaView>
	);
};

export default Settings;
