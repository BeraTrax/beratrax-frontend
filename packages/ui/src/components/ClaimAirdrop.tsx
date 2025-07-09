import React from "react";
import { View, Text, Pressable, ScrollView, Linking } from "react-native";
import useAirdrop from "@beratrax/core/src/hooks/useAirdrop";

export const ClaimAirdrop: React.FC = () => {
	const { shouldRenderAirdropSection } = useAirdrop({ type: "regular" });
	const { shouldRenderAirdropSection: shouldRenderAdditionalAirdropSection } = useAirdrop({ type: "additional" });
	const handleClaimAirdrop = async () => {
		try {
			const url = "https://legacy.beratrax.com";
			const supported = await Linking.canOpenURL(url);

			if (supported) {
				await Linking.openURL(url);
			} else {
				console.log("Can't open URL: " + url);
			}
		} catch (error) {
			console.error("Error opening URL:", error);
		}
	};

	if (!shouldRenderAirdropSection && !shouldRenderAdditionalAirdropSection) {
		return null;
	}

	return (
		<ScrollView
			contentContainerStyle={{ flexGrow: 1 }}
			className="w-full rounded-3xl border border-borderDark p-6 text-textWhite"
			style={{
				// @ts-ignore
				background: "radial-gradient(circle at 45% 151%, var(--new-color_primary) -40%, var(--new-background_dark) 75%)",
			}}
		>
			<View className="flex flex-col items-center justify-center w-full max-w-md m-auto">
				<Text className="font-arame-mono text-2xl font-bold mb-6 text-center text-textWhite uppercase">CLAIM AIRDROP</Text>

				<View className="bg-bgDark rounded-2xl border border-gradientSecondary p-6 mb-4 w-full">
					<Text className="text-center text-textWhite mb-6 font-league-spartan">Click the button below to claim your airdrop.</Text>

					<Pressable onPress={handleClaimAirdrop} className="w-full py-4 rounded-lg font-semibold text-lg bg-buttonPrimary">
						<Text className="font-league-spartan text-center text-bgDark text-lg font-semibold uppercase">Claim Airdrop</Text>
					</Pressable>
				</View>
			</View>
		</ScrollView>
	);
};
