import { Text, Platform, TextStyle, StyleProp } from "react-native";
import { twMerge } from "tailwind-merge";

interface GradientTextProps {
	children: string;
	className?: string;
	style?: StyleProp<TextStyle>;
}

export const GradientText = ({ children, className = "", style = {} }: GradientTextProps) => {
	if (Platform.OS === "web") {
		return (
			<Text
				className={twMerge(
					`animate-pulse bg-gradient-to-r from-yellow-400 via-orange-500 to-teal-400 bg-clip-text text-transparent font-extrabold ${Platform.OS === "web" ? "text-lg" : "text-xs"} drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] hover:scale-105 transition-transform duration-200 uppercase`,
					className
				)}
				style={style}
			>
				{children}
			</Text>
		);
	}

	return (
		<Text
			className={twMerge("font-extrabold uppercase", className)}
			style={[
				{
					color: "#FB923C", // orange-400, more vibrant
					textShadowColor: "rgba(255,255,255,0.4)",
					textShadowOffset: { width: 0, height: 0 },
					textShadowRadius: 6,
				},
				style,
			]}
		>
			{children}
		</Text>
	);
};

