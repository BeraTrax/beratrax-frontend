import { FC, ReactNode } from "react";
import { View, Pressable, Platform } from "react-native";
import { useApp } from "@beratrax/core/src/hooks";
import { twMerge } from "tailwind-merge";

interface IProps {
	onClose: Function;
	children: ReactNode;
	wrapperClassName?: string;
	wrapperStyle?: any;
	style?: any;
	className?: string;
}

export const ModalLayout: FC<IProps> = ({
	onClose,
	children,
	style,
	className = "",
	wrapperClassName = "lg:w-full",
	wrapperStyle = {},
	...rest
}) => {
	const { lightMode } = useApp();
	const isWeb = Platform.OS === "web";

	// Base classes
	const backdropClasses = "fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black/60 backdrop-blur-sm";
	const containerClasses = "min-h-[200px] w-[90%] max-w-[500px] bg-bgSecondary rounded-[20px] overflow-hidden relative";
	const containerLightClasses = "bg-bgSecondary border border-new-border_dark";

	// Platform specific classes
	const backdropNativeClasses = "absolute inset-0 flex items-center justify-start pt-[40%]";
	const containerWebClasses = "p-[35px] px-[50px]";
	const containerNativeClasses = "p-5 self-center";

	return (
		<Pressable
			className={twMerge(backdropClasses, isWeb ? "" : backdropNativeClasses, isWeb ? twMerge("", wrapperClassName) : "w-full")}
			style={wrapperStyle}
			onPress={(e) => onClose(e)}
		>
			<View
				{...rest}
				className={twMerge(
					containerClasses,
					isWeb ? containerWebClasses : containerNativeClasses,
					lightMode ? containerLightClasses : "",
					className
				)}
				style={style}
				onStartShouldSetResponder={() => true}
				onTouchEnd={(e) => e.stopPropagation()}
			>
				{children}
			</View>
		</Pressable>
	);
};
