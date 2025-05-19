import { FC } from "react";
import { View, Text } from "react-native";
interface IProps {
	top?: number;
	right?: number;
	bottom?: number;
	left?: number;
	color?: "invert" | "default";
	text: string;
	position?: "absolute" | "static" | "relative";
}
const FarmRowChip: FC<IProps> = ({ top, right, bottom, left, position, color, text }) => {
	const getColor = () => {
		let bgColor = "";
		let textColor = "";
		switch (color) {
			case "invert":
				bgColor = "bg-textPrimary";
				textColor = "text-gradientSecondary";
				break;
			default:
				bgColor = "bg-gradientSecondary";
				textColor = "text-textPrimary";
				break;
		}
		return { bgColor, textColor };
	};
	return (
		<View
			className={`${getColor().bgColor}  ${getColor().textColor} modile:font-semi-bold relative p-[2px] px-2 rounded-lg text-sm font-bold `}
			style={{
				position,
				top: top,
				right: right,
				bottom: bottom,
				left: left,
				// backgroundColor: getColor().bgColor,
				// color: getColor().textColor
			}}
		>
			<Text
				className={`${getColor().bgColor} ${getColor().textColor} font-arame-mono uppercase modile:font-semi-bold relative rounded-lg text-sm font-bold `}
			>
				{text}
			</Text>
		</View>
	);
};

export default FarmRowChip;
