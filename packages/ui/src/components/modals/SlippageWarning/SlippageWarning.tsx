import { FC } from "react";
import { Pressable, Text, View } from "react-native";
import { ModalLayout } from "ui/src/components/modals/ModalLayout/ModalLayout";

interface IProps {
	handleClose: Function;
	handleSubmit: Function;
	percentage: number | undefined;
}
export const SlippageWarning: FC<IProps> = ({ handleClose, handleSubmit, percentage }) => {
	return (
		<ModalLayout onClose={handleClose} style={{ borderColor: "var(--new-border_dark)" }} wrapperClassName="w-full lg:w-[92%]">
			<View className={"text-center tablet:w-full flex flex-col items-center justify-center width-[50%]"}>
				<Text className="text-red-500">Warning</Text>
				<Text
					className={"text-center tablet:text-base mobile:text-sm text-xl text-red-500"}
				>{`Slipage is higher than normal at ${percentage?.toFixed(2)}%.`}</Text>
				<Text className={"text-center tablet:text-base mobile:text-sm text-xl text-red-500"}>Are you sure you still want to continue?</Text>
				<View className={"tablet:gap-2 mt-4 flex flex-row gap-4 w-full justify-between"}>
					<Pressable
						className="bg-buttonPrimaryLight flex-1 py-3 px-2 cursor-pointer text-xl font-bold tracking-widest rounded-[40px] uppercase hover:bg-white transition-colors group"
						onPress={() => {
							handleClose();
						}}
					>
						<Text className="text-white text-center group-hover:text-buttonPrimaryLight transition-colors">Close</Text>
					</Pressable>
					<Pressable
						className="bg-bgDark border border-red-500 flex-1 py-3 px-2 cursor-pointer text-xl font-bold tracking-widest rounded-[40px] uppercase hover:bg-red-500 transition-colors group"
						onPress={() => {
							handleSubmit();
							handleClose();
						}}
					>
						<Text className="text-red-500 text-center group-hover:text-white transition-colors">Continue</Text>
					</Pressable>
				</View>
			</View>
		</ModalLayout>
	);
};
