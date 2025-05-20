import { FC, ReactNode } from "react";
import { useApp } from "@beratrax/core/src/hooks";
import { twMerge } from "tailwind-merge";
import styles from "./ModalLayout.module.css";
import { View, TouchableWithoutFeedback, ViewStyle, GestureResponderEvent } from "react-native";

interface IProps {
	onClose: (event?: GestureResponderEvent) => void;
	children: ReactNode;
	className?: string;
	style?: ViewStyle;
	wrapperClassName?: string;
	wrapperStyle?: ViewStyle;
}

export const ModalLayout: FC<IProps> = ({
	onClose,
	children,
	style,
	className = "",
	wrapperClassName = "lg:w-full",
	wrapperStyle = {},
}) => {
	const { lightMode } = useApp();

	return (
		// this twMerge will follow the rule of latter defined has the highest priority and overrides the previous class
		<TouchableWithoutFeedback onPress={(e) => onClose(e)}>
			<View className={`${styles.backdrop} ${twMerge("w-full lg:w-[92%]", wrapperClassName)}`} style={wrapperStyle}>
				<TouchableWithoutFeedback onPress={(e: GestureResponderEvent) => e.stopPropagation()}>
					<View className={`${styles.container} ${className}`} style={style}>
						{children}
					</View>
				</TouchableWithoutFeedback>
			</View>
		</TouchableWithoutFeedback>
	);
};
