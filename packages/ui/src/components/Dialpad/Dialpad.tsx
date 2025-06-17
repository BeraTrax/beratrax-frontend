import { FC, useRef, useCallback, memo, useMemo } from "react";
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

// Memoized button content component
const ButtonContent = memo(({ value }: { value: string }) => {
	const isBackspace = value === "⌫";

	return isBackspace ? (
		<View className="w-7 h-7">
			<SvgImage source={Depositmodalbackspacecross} height={28} width={28} />
		</View>
	) : (
		<Text className="text-4xl font-bold text-white">{value}</Text>
	);
});

// Memoized button component
const DialPadButton = memo(
	({ value, onPress, onPressIn, onPressOut }: { value: string; onPress: () => void; onPressIn?: () => void; onPressOut?: () => void }) => {
		const buttonContent = useMemo(() => <ButtonContent value={value} />, [value]);

		return (
			<Pressable
				onPress={onPress}
				onPressIn={onPressIn}
				onPressOut={onPressOut}
				className="w-[30%] h-12 rounded-2xl items-center justify-center bg-bgDark active:bg-bgSecondary"
			>
				{buttonContent}
			</Pressable>
		);
	},
	(prevProps, nextProps) => {
		return (
			prevProps.value === nextProps.value &&
			prevProps.onPress === nextProps.onPress &&
			prevProps.onPressIn === nextProps.onPressIn &&
			prevProps.onPressOut === nextProps.onPressOut
		);
	}
);

const DialPad: FC<DialPadProps> = ({ inputValue, setInputValue, cursorPosition, onCursorPositionChange, className = "" }) => {
	const backspaceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

	const handleButtonClick = useCallback(
		(value: string) => {
			if (value === "." && inputValue.includes(".")) return;

			if (cursorPosition !== null && cursorPosition !== undefined) {
				const newValue = inputValue.slice(0, cursorPosition) + value + inputValue.slice(cursorPosition);
				setInputValue(newValue);
				onCursorPositionChange?.(cursorPosition + 1);
			} else {
				setInputValue(inputValue + value);
			}
		},
		[inputValue, cursorPosition, setInputValue, onCursorPositionChange]
	);

	const handleBackspace = useCallback(() => {
		if (cursorPosition !== null && cursorPosition !== undefined) {
			if (cursorPosition > 0) {
				const newValue = inputValue.slice(0, cursorPosition - 1) + inputValue.slice(cursorPosition);
				setInputValue(newValue);
				onCursorPositionChange?.(cursorPosition - 1);
			}
		} else {
			setInputValue(inputValue.slice(0, -1));
		}
	}, [inputValue, cursorPosition, setInputValue, onCursorPositionChange]);

	const handleBackspaceHold = useCallback(() => {
		backspaceTimeout.current = setTimeout(() => {
			setInputValue("");
		}, 500);
	}, [setInputValue]);

	const clearBackspaceTimeout = useCallback(() => {
		if (backspaceTimeout.current) {
			clearTimeout(backspaceTimeout.current);
		}
	}, []);

	const buttons = useMemo(() => ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"], []);

	const buttonHandlers = useMemo(() => {
		return buttons.map((num) => ({
			onPress: () => (num === "⌫" ? handleBackspace() : handleButtonClick(num)),
			onPressIn: () => num === "⌫" && handleBackspaceHold(),
			onPressOut: clearBackspaceTimeout,
		}));
	}, [buttons, handleBackspace, handleButtonClick, handleBackspaceHold, clearBackspaceTimeout]);

	return (
		<View className={`flex flex-row flex-wrap justify-between gap-y-8 gap-x-1 mt-4 ${className}`}>
			{buttons.map((num, index) => (
				<DialPadButton
					key={num}
					value={num}
					onPress={buttonHandlers[index].onPress}
					onPressIn={buttonHandlers[index].onPressIn}
					onPressOut={buttonHandlers[index].onPressOut}
				/>
			))}
		</View>
	);
};

export default memo(DialPad);
