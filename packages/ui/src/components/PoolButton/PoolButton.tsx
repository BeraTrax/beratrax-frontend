import React from "react";
import "./PoolButton.css";
import { Pressable, Text, View } from "react-native";

interface Props {
	description: string;
	active: boolean;
	variant?: number;
	onPress?: () => void;
	className?: string;
}

const styles = {
	variant1: {
		button:
			"w-[100px] py-[7px] bg-gradientPrimary text-color_disabled font-bold mb-[7px] text-[13px] text-center items-center justify-center first:rounded-tl-[20px] first:rounded-bl-[20px] last:rounded-tr-[20px] last:rounded-br-[20px]",
		selected: "text-white bg-new-color_primary",
		text: "text-color_disabled",
	},
	variant2: {
		button:
			"min-w-[150px] p-[10px] my-8 bg-background_dark font-bold mb-[7px] text-[16px] text-center items-center justify-center first:rounded-tl-[20px] first:rounded-bl-[20px] last:rounded-tr-[20px] last:rounded-br-[20px]",
		selected: "text-white bg-bgPrimary",
		text: "text-white",
	},
};

export const PoolButton: React.FC<Props> = ({ description, active, variant = 1, ...props }) => {
	const variantStyle = variant === 1 ? styles.variant1 : styles.variant2;

	return (
		<View className="flex items-center justify-center">
			<Pressable
				className={`border border-[#A0FF3B]/20 [text-shadow:0_0_15px_rgba(160,255,59,0.5)] backdrop-blur-sm font-league-spartan ${variantStyle.button} ${
					active ? variantStyle.selected : ""
				} ${props.className || ""}`}
				onPress={props.onPress}
			>
				<Text className={`${active ? "text-white" : variantStyle.text} text-center font-bold`}>{description}</Text>
			</Pressable>
		</View>
	);
};
