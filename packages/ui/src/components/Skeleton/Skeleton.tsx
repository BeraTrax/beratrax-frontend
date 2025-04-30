import { FC } from "react";
import { View } from "react-native";
import { useApp } from "@beratrax/core/src/hooks";

interface IProps {
	w: number | string;
	h: number | string;
	bRadius?: number;
	bg?: string;
	style?: object;
	className?: string;
	inverted?: boolean;
}

export const Skeleton: FC<IProps> = ({ w, h, bg, bRadius = 5, style, className, inverted }) => {
	const { lightMode } = useApp();

	const backgroundColor = bg || (lightMode ? (inverted ? "#ffffff" : "#f5f6f9") : inverted ? "#012243" : "#001428");

	return (
		<View
			style={[
				{
					width: w,
					height: h,
					borderRadius: bRadius,
					backgroundColor,
				},
				style,
				{ className },
			]}
		/>
	);
};
