import { FC, useMemo, useCallback } from "react";
import errorIcon from "@beratrax/core/src/assets/images/Error.png";
import { ModalLayout } from "ui/src/components/modals/ModalLayout/ModalLayout";
import { Image, Pressable, Text, View, ViewStyle } from "react-native";

interface IProps {
	handleClose: Function;
	handleSubmit: Function;
}

export const SlippageNotCalculate: FC<IProps> = ({ handleClose, handleSubmit }) => {
	const closeText = useMemo(() => <Text className="text-textBlack font-bold text-center">Close</Text>, []);
	const continueText = useMemo(() => <Text className="text-textWhite font-bold text-center">Continue</Text>, []);

	const closeButtonStyle = useMemo<ViewStyle>(
		() => ({
			backgroundColor: "#a0ff3b",
			borderRadius: 40,
			borderWidth: 1,
			paddingVertical: 10.5,
			width: "100%",
		}),
		[]
	);

	const continueButtonStyle = useMemo<ViewStyle>(
		() => ({
			backgroundColor: "#020907",
			borderColor: "#a0ff3b",
			borderRadius: 40,
			borderWidth: 1,
			paddingVertical: 10.5,
			width: "100%",
		}),
		[]
	);

	const onClosePress = useCallback(() => {
		handleClose();
	}, [handleClose]);

	const onContinuePress = useCallback(() => {
		handleSubmit();
		handleClose();
	}, [handleSubmit, handleClose]);

	return (
		<ModalLayout onClose={handleClose} wrapperClassName="w-full lg:w-[92%]">
			<View className="tablet:w-full flex flex-col gap-4 items-center justify-center width-[540px]">
				<Image src={errorIcon} alt="error" className="mt-4 mb-2 tablet:mt-1" />
				<Text className="text-center tablet:text-base mobile:text-sm text-xl text-textSecondary ">
					Transaction slippage could not be simulated. Your total fees are not confirmed.
				</Text>
				<Text className="text-center tablet:text-base mobile:text-sm text-xl text-textSecondary ">Do you still wish to continue?</Text>
				<View className="tablet:gap-2 mt-4 flex gap-4 w-full justify-evenly">
					<Pressable
						style={closeButtonStyle}
						className="text-xl font-bold tracking-widest uppercase"
						onPress={onClosePress}
					>
						{closeText}
					</Pressable>
					<Pressable
						style={continueButtonStyle}
						className="text-xl font-bold tracking-widest uppercase text-gradientPrimary"
						onPress={onContinuePress}
					>
						{continueText}
					</Pressable>
				</View>
			</View>
		</ModalLayout>
	);
};
