import { FC } from "react";
import errorIcon from "@beratrax/core/src/assets/images/Error.png";
import { ModalLayout } from "ui/src/components/modals/ModalLayout/ModalLayout";
import { Image, Pressable, Text, View } from "react-native";

interface IProps {
	handleClose: Function;
	handleSubmit: Function;
}

export const SlippageNotCalculate: FC<IProps> = ({ handleClose, handleSubmit }) => {
	return (
		<ModalLayout onClose={handleClose} style={{ borderColor: "var(--new-border_dark)" }} wrapperClassName="w-full lg:w-[92%]">
			<View className="tablet:w-full flex flex-col gap-4 items-center justify-center width-[540px]">
				<Image src={errorIcon} alt="error" className="mt-4 mb-2 tablet:mt-1" />
				<Text className="text-center tablet:text-base mobile:text-sm text-xl text-textSecondary ">
					Transaction slippage could not be simulated. Your total fees are not confirmed.
				</Text>
				<Text className="text-center tablet:text-base mobile:text-sm text-xl text-textSecondary ">Do you still wish to continue?</Text>
				<View className=" tablet:gap-2 mt-4 flex gap-4 w-full justify-evenly">
					<Pressable
						className=" bg-buttonPrimaryLight w-full py-3 cursor-pointer text-xl font-bold tracking-widest rounded-[40px] uppercase"
						onPress={() => {
							handleClose();
						}}
					>
						<Text className="text-textBlack">Close</Text>
					</Pressable>
					<Pressable
						className="bg-bgDark border border-gradientPrimary text-gradientPrimary w-full py-3 cursor-pointer text-xl font-bold tracking-widest rounded-[40px] uppercase"
						onPress={() => {
							handleSubmit();
							handleClose();
						}}
					>
						<Text className="text-textBlack">Continue</Text>
					</Pressable>
				</View>
			</View>
		</ModalLayout>
	);
};
