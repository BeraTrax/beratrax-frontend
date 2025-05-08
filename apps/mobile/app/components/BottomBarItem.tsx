import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

interface BottomBarItemProps {
	isActive: boolean;
	Icon: any; // Image source
	label: string;
	onPress: () => void;
	position: "left" | "middle" | "right";
}

const BottomBarItem = ({ isActive, Icon, label, onPress, position }: BottomBarItemProps) => {
	// Get border radius based on position
	const getBorderRadius = (): ViewStyle => {
		if (!isActive) return {};

		switch (position) {
			case "left":
				return { borderTopLeftRadius: 12 };
			case "right":
				return { borderTopRightRadius: 12 };
			default:
				return {};
		}
	};

	const handlePress = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		onPress();
	};

	const content = (
		<>
			<Icon className={`w-6 h-6 mb-1 ${isActive ? "text-gradientPrimary" : "text-textSecondary"}`} />
			<Text
				className={`flex justify-self-center align-self-center ${isActive ? "text-gradientPrimary" : "text-textSecondary"} text-sm uppercase`}
			>
				{label}
			</Text>
		</>
	);

	return (
		<TouchableOpacity
			className={`flex-1 flex flex-col items-center justify-center border-t-2  ${isActive ? "border-t-bgPrimary" : "border-t-transparent"}`}
			onPress={handlePress}
			activeOpacity={0.7}
		>
			{isActive ? (
				<LinearGradient
					className="w-full h-full items-center justify-center py-5"
					colors={["rgba(160, 255, 59, 0.3)", "transparent"]}
					start={{ x: 0.5, y: 0 }}
					end={{ x: 0.5, y: 0.6 }}
				>
					{content}
				</LinearGradient>
			) : (
				content
			)}
		</TouchableOpacity>
	);
};

export default BottomBarItem;
