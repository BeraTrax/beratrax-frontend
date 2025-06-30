import React from "react";
import { View, Dimensions, ScrollView, Platform, ViewStyle } from "react-native";
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

	if (open === false) {
		return null;
	}

	// Create the style object with maxHeight
	const modalStyle: ViewStyle = {
		maxHeight: maxHeight as any,
	};

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
						contentContainerStyle={{ paddingBottom: Platform.OS === "ios" ? 20 : 0 }}
					>
						{children}
					</ScrollView>
				</View>
			</View>
		</View>
	);
};

export default MobileModalContainer;
