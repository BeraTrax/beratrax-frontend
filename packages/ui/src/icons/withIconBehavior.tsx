import React from "react";
import { TouchableOpacity, Vibration, Platform } from "react-native";
import Svg, { SvgProps } from "react-native-svg";

export interface IconProps extends SvgProps {
	size?: number;
	color?: string;
	onPress?: () => void;
	activeOpacity?: number;
	feedbackColor?: string;
	className?: string;
}

// This HOC takes an SVG content component and returns an icon component with all the common behavior
export const withIconBehavior = (SvgContent: React.FC<SvgProps>) => {
	const IconComponent: React.FC<IconProps> = ({
		size = 24,
		color = "white",
		onPress,
		activeOpacity = 0.7,
		feedbackColor,
		className = "",
		...props
	}) => {
		// Use width and height from size if not explicitly provided
		const width = props.width || size;
		const height = props.height || size;
		const stroke = props.stroke || color;

		const handlePress = () => {
			try {
				if (Platform.OS !== "web" && Platform.OS === "ios") {
					Vibration.vibrate(10);
				}
			} catch (error) {
				console.warn("Vibration failed:", error);
			}

			if (onPress) {
				onPress();
			}
		};

		const SvgComponent = (
			<Svg
				width={width}
				height={height}
				viewBox="0 0 30 30"
				fill="none"
				stroke={stroke}
				strokeWidth="1"
				strokeLinecap="round"
				strokeLinejoin="round"
				className={`icon icon-tabler icons-tabler-outline ${className}`}
				{...props}
			>
				<SvgContent {...props} />
			</Svg>
		);

		// If no onPress is provided, just return the SVG
		if (!onPress) {
			return SvgComponent;
		}

		return (
			<TouchableOpacity
				onPress={handlePress}
				activeOpacity={activeOpacity}
				style={{
					backgroundColor: feedbackColor || "transparent",
					borderRadius: size / 2,
				}}
				accessibilityRole="button"
				accessibilityLabel={props.accessibilityLabel || "Icon button"}
			>
				{SvgComponent}
			</TouchableOpacity>
		);
	};

	return IconComponent;
};
