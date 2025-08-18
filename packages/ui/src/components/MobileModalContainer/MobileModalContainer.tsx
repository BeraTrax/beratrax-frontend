import React from "react";
import { View, Dimensions, ScrollView, Platform, ViewStyle } from "react-native";
import { twMerge } from "tailwind-merge";
import { useCrossPlatformSafeArea, useAndroidNavigation } from "../../hooks/useCrossPlatformSafeArea";

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
	const insets = useCrossPlatformSafeArea();
	const androidNav = useAndroidNavigation();

	if (open === false) {
		return null;
	}

	// Create the style object with maxHeight
	const modalStyle: ViewStyle = {
		maxHeight: maxHeight as any,
	};

	// Calculate dynamic bottom padding based on platform and navigation type
	const dynamicBottomPadding =
		Platform.OS === "web"
			? 20 // Standard web padding
			: androidNav.isAndroid
				? Math.max(30, androidNav.recommendedBottomPadding / 2) // Modal needs less padding than action buttons
				: insets.bottom + 20;

	return (
		<View className={twMerge(`absolute w-full top-0 left-0 right-0 z-20 bg-transparent`, wrapperClassName)} style={{ height }}>
			<View className="flex-1 justify-end">
				<View
					className={twMerge(`w-full bg-[#1A1A1A] rounded-t-[40px] border-t-2 border-t-[#333333] overflow-hidden`, className)}
					style={modalStyle}
				>
					<ScrollView
						className="w-full rounded-t-[40px]"
						showsVerticalScrollIndicator={true}
						bounces={true}
						contentContainerStyle={{ paddingBottom: dynamicBottomPadding }}
					>
						{children}
					</ScrollView>
				</View>
			</View>
		</View>
	);
};

export default MobileModalContainer;
