import { FC, useCallback, useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { ModalLayout } from "ui/src/components/modals/ModalLayout/ModalLayout";

interface IProps {
	handleClose: Function;
	handleSubmit: Function;
}
export const ConfirmWithdraw: FC<IProps> = ({ handleClose, handleSubmit }) => {
	const closeText = useMemo(() => <Text className="text-textBlack font-bold text-center">Close</Text>, []);
	const continueText = useMemo(() => <Text className="text-textWhite font-bold text-center">Continue</Text>, []);

	const onClosePress = useCallback(() => {
		handleClose();
	}, [handleClose]);

	const onContinuePress = useCallback(() => {
		handleSubmit();
		handleClose();
	}, [handleSubmit, handleClose]);
	return (
		<ModalLayout onClose={handleClose} wrapperClassName="w-[90vw] max-w-[600px]">
			<View className={"text-center tablet:w-full flex flex-col items-center justify-center width-[50%]"}>
				<Text className="text-textWhite text-2xl font-bold uppercase">Confirm Withdraw</Text>
				<Text className={"text-center tablet:text-base mobile:text-sm text-xl text-textWhite"}>
					BTX points are still being earned. Withdrawing will stop your earnings. Are you sure?
				</Text>
				<Text className={"text-center tablet:text-base mobile:text-sm text-xl text-red-500"}>Do you still wish to continue?</Text>
				<View className={"tablet:gap-2 mt-4 flex flex-row gap-4 w-full justify-between"}>
					<Pressable
						className="bg-buttonPrimaryLight flex-1 py-3 px-2 cursor-pointer text-xl font-bold tracking-widest rounded-[40px] uppercase hover:bg-white transition-colors group"
						onPress={() => {
							onClosePress();
						}}
					>
						{closeText}
					</Pressable>
					<Pressable
						className="bg-bgDark border border-red-500 flex-1 py-3 px-2 cursor-pointer text-xl font-bold tracking-widest rounded-[40px] uppercase hover:bg-red-500 transition-colors group"
						onPress={() => {
							onContinuePress();
						}}
					>
						{continueText}
					</Pressable>
				</View>
			</View>
		</ModalLayout>
	);
};
