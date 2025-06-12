import { FC, ReactNode, useEffect, useState } from "react";
import { View, TouchableWithoutFeedback, StyleSheet, Modal } from "react-native";
import { BlurView } from "expo-blur";
import { twMerge } from "tailwind-merge";

interface IProps {
	onClose: Function;
	children: ReactNode;
	wrapperClassName?: string;
}

export const ModalLayout: FC<IProps> = ({ onClose, children, wrapperClassName = "w-full" }) => {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		// Small delay to ensure previous modal is fully unmounted
		const timer = setTimeout(() => {
			setIsVisible(true);
		}, 50);

		return () => {
			clearTimeout(timer);
			setIsVisible(false);
		};
	}, []);

	const handleClose = () => {
		setIsVisible(false);
		onClose();
	};

	const containerClass = twMerge("shadow-lg text-white", wrapperClassName);

	const containerStyle = {
		backgroundColor: "#151915", // bgSecondary color
		borderRadius: 16, // This ensures rounded corners work on web
		margin: 16, // Margin around the modal
		padding: 24, // Internal padding
		minHeight: 200, // Minimum height
	};

	return (
		<Modal transparent visible={isVisible} onRequestClose={handleClose}>
			<TouchableWithoutFeedback onPress={handleClose}>
				<BlurView
					intensity={30}
					tint="dark"
					style={StyleSheet.absoluteFill}
					className="flex-1 justify-center items-center"
					experimentalBlurMethod="dimezisBlurView"
				>
					<TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
						<View style={containerStyle} className={containerClass}>
							{children}
						</View>
					</TouchableWithoutFeedback>
				</BlurView>
			</TouchableWithoutFeedback>
		</Modal>
	);
};
