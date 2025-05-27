import React, { FC, ReactNode, useRef, useEffect } from "react";
import { View, TouchableWithoutFeedback, StyleSheet, Animated, Modal } from "react-native";
import { BlurView } from "expo-blur";
import { twMerge } from "tailwind-merge";

interface IProps {
	onClose: Function;
	children: ReactNode;
	wrapperClassName?: string;
}

export const ModalLayout: FC<IProps> = ({ onClose, children, wrapperClassName = "w-full" }) => {
	const scaleAnim = useRef(new Animated.Value(0.7)).current;
	const opacityAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.parallel([
			Animated.timing(scaleAnim, {
				toValue: 1,
				duration: 150,
				useNativeDriver: true,
			}),
			Animated.timing(opacityAnim, {
				toValue: 1,
				duration: 150,
				useNativeDriver: true,
			}),
		]).start();
	}, []);

	const containerClass = twMerge("shadow-lg text-white", wrapperClassName);

	const containerStyle = {
		backgroundColor: "#151915", // bgSecondary color
		borderRadius: 16, // This ensures rounded corners work on web
		margin: 16, // Margin around the modal
		padding: 24, // Internal padding
		minHeight: 200, // Minimum height
		transform: [{ scale: scaleAnim }],
		opacity: opacityAnim,
	};

	return (
		<Modal transparent visible animationType="fade" onRequestClose={() => onClose()}>
			<TouchableWithoutFeedback onPress={() => onClose()}>
				<BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} className="flex-1 justify-center items-center">
					<TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
						<Animated.View style={containerStyle} className={containerClass}>
							{children}
						</Animated.View>
					</TouchableWithoutFeedback>
				</BlurView>
			</TouchableWithoutFeedback>
		</Modal>
	);
};
