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
					<Text className="text-2xl font-bold text-center">Important Notice!</Text>
					<Text className="text-base">
						You are choosing to trade your <Text className="font-bold">${inputToken}</Text> for a share in the{" "}
						<Text className="font-bold">${outputToken}</Text>. You understand that after this transaction, you now hold{" "}
						<Text className="font-bold">${outputToken}</Text>, and BeraTrax is increasing your position in{" "}
						<Text className="font-bold">${outputToken}</Text>. You recognize the prices changes of
						<Text className="font-bold"> ${outputToken}</Text> apply to your position, and the price changes of
						<Text className="font-bold"> ${inputToken}</Text> are no longer relevant.
					</Text>
				</View>
			</View>
			<View className={`${styles.checkbox}`}>
				<Switch
					value={doNotNotifyAgain}
					onValueChange={() => setDoNotNotifyAgain((prev) => !prev)}
					trackColor={{ false: "#767577", true: "#81b0ff" }}
					thumbColor={doNotNotifyAgain ? "#f5dd4b" : "#f4f3f4"}
				/>
				<Text style={{ color: "white" }}>Do not notify me again</Text>
			</View>
			<View className={styles.buttonsContainer}>
				<Pressable
					className="bg-bgPrimary p-4 rounded-xl w-24"
					onPress={() => {
						handleClose();
					}}
				>
					Cancel
				</Pressable>
				<Pressable className={`bg-bgPrimary p-4 rounded-xl w-24`} disabled={isLoading} onPress={handleUnderstand}>
					{isLoading ? <LoaderIcon className={styles.loader} /> : "I understand"}
				</Pressable>
			</View>
		</ModalLayout>
	);
};
