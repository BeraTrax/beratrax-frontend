import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
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

	return (
		<TouchableOpacity
			className={`flex-1 flex flex-col items-center justify-center relative border-t-2 ${isActive ? "border-t-bgPrimary" : "border-t-transparent"}`}
			onPress={handlePress}
			activeOpacity={0.7}
		>
			{isActive && (
				<LinearGradient
					style={StyleSheet.absoluteFillObject}
					colors={["rgba(52, 89, 181, 0.3)", "transparent"]}
					start={{ x: 0.5, y: 0 }}
					end={{ x: 0.5, y: 1 }}
				/>
			)}
			<View className="py-3 px-1 z-10 items-center justify-center">
				<Icon className={`w-5 h-5 mb-1`} />
				<Text
					className={`pt-2 text-center ${isActive ? "text-gradientPrimary" : "text-textSecondary"} text-[8px] font-small uppercase tracking-wide`}
					numberOfLines={1}
					adjustsFontSizeToFit
				>
					{label}
				</Text>
			</View>
		</TouchableOpacity>
	);
};

export default BottomBarItem;
