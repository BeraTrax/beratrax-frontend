import React from "react";
import { TouchableOpacity, Text } from "react-native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

interface BottomBarItemProps {
	isActive: boolean;
	Icon: any; // Image source
	label: string;
	onPress: () => void;
}

const BottomBarItem = ({ isActive, Icon, label, onPress }: BottomBarItemProps) => {
	const handlePress = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		onPress();
	};

	const content = (
		<>
			<Icon className={`w-4 h-4 mb-1 ${isActive ? "text-gradientPrimary" : "text-textSecondary"}`} />
			<Text
				className={`flex justify-self-center align-self-center ${isActive ? "text-gradientPrimary" : "text-textSecondary"} text-xs uppercase`}
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
