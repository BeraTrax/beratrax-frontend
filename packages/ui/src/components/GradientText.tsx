import { Text, Platform, TextStyle, StyleProp, View } from "react-native";
import { twMerge } from "tailwind-merge";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, interpolate } from "react-native-reanimated";
import MaskedView from "@react-native-masked-view/masked-view";
import { useEffect } from "react";

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
					`animate-pulse bg-gradient-to-r from-yellow-400 via-orange-500 to-teal-400 bg-clip-text text-transparent font-extrabold ${Platform.OS === "web" ? "text-lg" : "text-xs"} drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] hover:scale-105 transition-transform uppercase`,
					className
				)}
				style={style}
			>
				{children}
			</Text>
		);
	}

	// Mobile implementation with animated gradient
	const animatedValue = useSharedValue(0);

	useEffect(() => {
		animatedValue.value = withRepeat(withTiming(1, { duration: 4000 }), -1, true);
	}, []);

	// Create animated styles for different gradient combinations
	const gradient1Style = useAnimatedStyle(() => {
		const opacity = interpolate(animatedValue.value, [0, 0.33, 0.66, 1], [1, 0, 0, 1]);
		return { opacity };
	});

	const gradient2Style = useAnimatedStyle(() => {
		const opacity = interpolate(animatedValue.value, [0, 0.33, 0.66, 1], [0, 1, 0, 0]);
		return { opacity };
	});

	const gradient3Style = useAnimatedStyle(() => {
		const opacity = interpolate(animatedValue.value, [0, 0.33, 0.66, 1], [0, 0, 1, 0]);
		return { opacity };
	});

	// Create pulse animation for the overall component
	const pulseStyle = useAnimatedStyle(() => {
		const scale = interpolate(animatedValue.value, [0, 0.5, 1], [1, 1.02, 1]);
		return {
			transform: [{ scale }],
		};
	});

	// Define gradient color combinations as readonly tuples
	const gradients = [
		["#FBBF24", "#F97316", "#14B8A6"] as const, // yellow -> orange -> teal
		["#F97316", "#14B8A6", "#FBBF24"] as const, // orange -> teal -> yellow
		["#14B8A6", "#FBBF24", "#F97316"] as const, // teal -> yellow -> orange
	] as const;

	return (
		<Animated.View style={pulseStyle}>
			<MaskedView
				style={{ flex: 1 }}
				maskElement={
					<Text
						className={twMerge("font-extrabold uppercase text-center", className)}
						style={[
							{
								backgroundColor: "transparent",
								color: "black", // This will be masked
							},
							style,
						]}
					>
						{children}
					</Text>
				}
			>
				<View style={{ flex: 1, height: 25 }}>
					<Animated.View style={[{ position: "absolute", width: "100%", height: "100%" }, gradient1Style]}>
						<LinearGradient colors={gradients[0]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
					</Animated.View>
					<Animated.View style={[{ position: "absolute", width: "100%", height: "100%" }, gradient2Style]}>
						<LinearGradient colors={gradients[1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
					</Animated.View>
					<Animated.View style={[{ position: "absolute", width: "100%", height: "100%" }, gradient3Style]}>
						<LinearGradient colors={gradients[2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
					</Animated.View>
				</View>
			</MaskedView>
		</Animated.View>
	);
};
