import React, { FC, useRef } from "react";
import { View, Text, Pressable, Image } from "react-native";
import Depositmodalbackspacecross from "@beratrax/core/src/assets/images/depositmodalbackspacecross.svg";
import { SvgImage } from "../SvgImage/SvgImage";

interface DialPadProps {
	inputValue: string;
	setInputValue: (value: string) => void;
	cursorPosition?: number | null;
	onCursorPositionChange?: (position: number) => void;
	className?: string;
}

const DialPad: FC<DialPadProps> = ({ inputValue, setInputValue, cursorPosition, onCursorPositionChange, className = "" }) => {
	const backspaceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

	const handleButtonClick = (value: string) => {
		if (value === "." && inputValue.includes(".")) return;

		if (cursorPosition !== null && cursorPosition !== undefined) {
			const newValue = inputValue.slice(0, cursorPosition) + value + inputValue.slice(cursorPosition);
			setInputValue(newValue);
			onCursorPositionChange?.(cursorPosition + 1);
		} else {
			setInputValue(inputValue + value);
		}
	};

	const handleBackspace = () => {
		if (cursorPosition !== null && cursorPosition !== undefined) {
			if (cursorPosition > 0) {
				const newValue = inputValue.slice(0, cursorPosition - 1) + inputValue.slice(cursorPosition);
				setInputValue(newValue);
				onCursorPositionChange?.(cursorPosition - 1);
			}
		} else {
			setInputValue(inputValue.slice(0, -1));
		}
	};

	const handleBackspaceHold = () => {
		backspaceTimeout.current = setTimeout(() => {
			setInputValue("");
		}, 500);
	};

	const clearBackspaceTimeout = () => {
		if (backspaceTimeout.current) {
			clearTimeout(backspaceTimeout.current);
		}
	};

	return (
		<View className={`flex flex-row flex-wrap justify-between gap-y-4 mt-4 ${className}`}>
			{["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"].map((num, index) => {
				const isBackspace = num === "⌫";
				return (
					<Pressable
						key={index}
						onPress={() => (isBackspace ? handleBackspace() : handleButtonClick(num))}
						onPressIn={() => isBackspace && handleBackspaceHold()}
						onPressOut={clearBackspaceTimeout}
						className="w-[30%] h-16 rounded-2xl items-center justify-center bg-bgDark active:bg-bgSecondary"
					>
						{isBackspace ? (
							<View className="w-7 h-7">
								<SvgImage source={Depositmodalbackspacecross} height={28} width={28} />
							</View>
						) : (
							<Text className="text-4xl font-bold text-white">{num}</Text>
						)}
					</Pressable>
				);
			})}
		</View>
	);
};

export default DialPad;
