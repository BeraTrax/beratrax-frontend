import { FC, useState } from "react";
import { ModalLayout } from "ui/src/components/modals/ModalLayout/ModalLayout";
import styles from "./OneTimeZapping.module.css";
import { useAppDispatch } from "@beratrax/core/src/state";
import { useWallet } from "@beratrax/core/src/hooks";
import { LoaderIcon } from "@beratrax/ui/src/icons/Loader";
import { disableZapWarning } from "@beratrax/core/src/state/account/accountReducer";
import { View, Text, Pressable, Switch } from "react-native";

interface IProps {
	inputToken: string;
	outputToken: string;
	handleClose: Function;
	handleSubmit: Function;
}

export const OneTimeZapping: FC<IProps> = ({ inputToken, outputToken, handleClose, handleSubmit }) => {
	const dispatch = useAppDispatch();
	const { currentWallet } = useWallet();
	const [isLoading, setIsLoading] = useState(false);
	const [doNotNotifyAgain, setDoNotNotifyAgain] = useState(false);

	const handleUnderstand = async () => {
		if (!currentWallet) return;
		setIsLoading(true);
		await dispatch(disableZapWarning({ address: currentWallet, value: doNotNotifyAgain }));
		setIsLoading(false);
		handleClose();
		handleSubmit();
	};

	return (
		<ModalLayout onClose={handleClose} className={`${styles.container}`} style={{ zIndex: 20 }} wrapperClassName="lg:w-full">
			<View className="w-full mb-4">
				<View className="overflow-y-auto pr-2 pt-4 text-justify normal-case text-sm font-league-spartan">
					<Text className="text-2xl font-bold text-center text-textWhite">Important Notice!</Text>
					<Text className="text-base text-textWhite">
						You are choosing to trade your <Text className="font-bold">${inputToken}</Text> for a share in the{" "}
						<Text className="font-bold">${outputToken}</Text>. You understand that after this transaction, you now hold{" "}
						<Text className="font-bold">${outputToken}</Text>, and BeraTrax is increasing your position in{" "}
						<Text className="font-bold">${outputToken}</Text>. You recognize the prices changes of
						<Text className="font-bold"> ${outputToken}</Text> apply to your position, and the price changes of
						<Text className="font-bold"> ${inputToken}</Text> are no longer relevant.
					</Text>
				</View>
			</View>
			<View className={`${styles.checkbox} flex-row items-center gap-3`}>
				<Switch
					value={doNotNotifyAgain}
					onValueChange={() => setDoNotNotifyAgain((prev) => !prev)}
					trackColor={{ false: "#767577", true: "#4CAF50" }}
					thumbColor={doNotNotifyAgain ? "#ffffff" : "#f4f3f4"}
					ios_backgroundColor="#767577"
				/>
				<Text className="text-textWhite text-base">Do not notify me again</Text>
			</View>
			<View className="flex flex-row justify-between items-center">
				<Pressable
					className="bg-bgPrimary p-4 rounded-xl text-textWhite"
					onPress={() => {
						handleClose();
					}}
				>
					<Text className="text-center text-textWhite font-bold">Cancel</Text>
				</Pressable>
				<Pressable className={`bg-bgPrimary p-4 rounded-xl  text-textWhite`} disabled={isLoading} onPress={handleUnderstand}>
					<Text className="text-center text-textWhite font-bold">
						{isLoading ? <LoaderIcon className={styles.loader} /> : "I understand"}
					</Text>
				</Pressable>
			</View>
		</ModalLayout>
	);
};
