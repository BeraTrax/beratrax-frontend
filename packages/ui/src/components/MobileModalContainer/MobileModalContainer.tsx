import React, { useEffect, useRef } from "react";
import { View, Dimensions, ScrollView, Animated, Platform, ViewStyle } from "react-native";
import { twMerge } from "tailwind-merge";

interface MobileModalContainerProps {
	children: React.ReactNode;
	open?: boolean;
	className?: string;
	wrapperClassName?: string;
	maxHeight?: string | number;
}

const MobileModalContainer = ({
	children,
	open = false,
	className = "",
	wrapperClassName = "",
	maxHeight = "90%",
}: MobileModalContainerProps) => {
	const { height } = Dimensions.get("window");
	const slideAnim = useRef(new Animated.Value(height)).current;

	useEffect(() => {
		Animated.timing(slideAnim, {
			toValue: open ? 0 : height,
			duration: 300,
			useNativeDriver: true,
		}).start();
	}, [open, slideAnim, height]);

	if (open === false) {
		return null;
	}

	// Use fixed positioning on web to ensure the modal appears at the bottom of the viewport
	const positionClass = Platform.OS === "web" ? "fixed" : "absolute";

	// Create the style object with maxHeight
	const modalStyle: ViewStyle = {
		maxHeight: maxHeight as any,
	};

	return (
		<Animated.View
			className={twMerge(`${positionClass} w-full top-0 left-0 right-0 z-20 bg-transparent`, wrapperClassName)}
			style={{ height, transform: [{ translateY: slideAnim }] }}
		>
			<View className="flex-1 justify-end">
				<View
					className={twMerge(`w-full bg-[#1A1A1A] rounded-t-[40px] border-t-2 border-t-[#333333] overflow-hidden`, className)}
					style={modalStyle}
				>
					<ScrollView
						className="w-full rounded-t-[40px]"
						showsVerticalScrollIndicator={true}
						bounces={true}
						contentContainerStyle={{ paddingBottom: 20 }}
					>
						{children}
					</ScrollView>
				</View>
			</View>
		</Animated.View>
	);
};

export default MobileModalContainer;
