import { FC } from "react";
import { View, Text, Pressable } from "react-native";
import { ModalLayout } from "ui/src/components/modals/ModalLayout/ModalLayout";

interface IProps {
	handleClose: Function;
	handleSubmit: Function;
}
export const ConfirmWithdraw: FC<IProps> = ({ handleClose, handleSubmit }) => {
	return (
		<ModalLayout onClose={handleClose} wrapperClassName="w-[400px]">
			<View className={"text-center tablet:w-full flex flex-col items-center justify-center width-[50%]"}>
				<Text className="text-textWhite text-2xl font-bold pb-4">Confirm Withdraw</Text>
				<Text className={"text-center tablet:text-base mobile:text-sm text-xl text-textWhite"}>
					BTX points are still being earned. Withdrawing will stop your earnings. Are you sure?
				</Text>
				<View className={" tablet:gap-2 mt-4 flex gap-4 w-full justify-evenly"}>
					<Pressable
						className="bg-buttonPrimaryLight w-full py-3 px-2 cursor-pointer text-xl font-bold tracking-widest rounded-[40px] uppercase hover:bg-black border border-green transition-colors group"
						onPress={() => {
							handleClose();
						}}
					>
						<Text className="text-textBlack font-bold text-center group-hover:text-white transition-colors">Close</Text>
					</Pressable>
					<Pressable
						className="bg-bgDark border border-red-500 text-red-500 w-full py-3 px-2 cursor-pointer text-xl font-bold tracking-widest rounded-[40px] uppercase hover:bg-red-500 hover:text-white transition-colors"
						onPress={() => {
							handleSubmit();
							handleClose();
						}}
					>
						<Text className="text-textWhite font-bold text-center group-hover:text-white transition-colors">Continue</Text>
					</Pressable>
				</View>
			</View>
		</ModalLayout>
	);
};
