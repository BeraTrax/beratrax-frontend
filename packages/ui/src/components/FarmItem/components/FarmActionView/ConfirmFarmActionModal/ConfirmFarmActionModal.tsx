import { PoolDef } from "@beratrax/core/src/config/constants/pools_json";
import { useNotification } from "@beratrax/core/src/state/notification/useNotification";
import useTransactions from "@beratrax/core/src/state/transactions/useTransactions";
import { FarmTransactionType } from "@beratrax/core/src/types/enums";
import { formatBalance } from "@beratrax/core/src/utils/common";
import { FC, useEffect, useMemo } from "react";
import { ModalLayout } from "ui/src/components/modals/ModalLayout/ModalLayout";
import TransactionDetails from "@beratrax/ui/src/components/Transactions/components/TransactionDetail/TransactionDetail";
import { Pressable, Text, View } from "react-native";

interface DepositInfo {
	amount: string;
	showInUsd: boolean;
	token: string;
	transactionType: FarmTransactionType;
}

interface IProps {
	farm: PoolDef;
	handleClose: (closeDepositModal?: boolean) => void;
	txId: string;
	depositInfo?: DepositInfo;
}

const ConfirmFarmActionModal: FC<IProps> = ({ handleClose, txId, farm, depositInfo }) => {
	const { isLoading, reset } = useTransactions();
	const { errors, success, clearAllNotifications } = useNotification();
	const amount = useMemo(() => formatBalance(depositInfo?.amount ?? "0", { maximumFractionDigits: 3 }), []);

	const getTransactionTitle = () => {
		if (!depositInfo) return "";
		const action = depositInfo.transactionType === FarmTransactionType.Deposit ? "Depositing" : "Withdrawing";
		const currency = depositInfo.showInUsd ? "$" : "";
		return `${action} ${currency}${amount} ${depositInfo.token}`;
	};

	const getTransactionDescription = () => {
		if (!depositInfo) return "";
		const action = depositInfo.transactionType === FarmTransactionType.Deposit ? "deposit" : "withdraw";
		const currency = depositInfo.showInUsd ? "$" : "";
		return `We are taking care of all the steps to ${action} ${currency}${amount} ${depositInfo.token} ${
			depositInfo.transactionType === FarmTransactionType.Deposit ? "into" : "from"
		} ${farm.name} Vault for you!`;
	};

	useEffect(() => {
		clearAllNotifications();
	}, []);

	return (
		<ModalLayout
			onClose={() => {
				clearAllNotifications();
				handleClose();
			}}
			wrapperClassName="w-full lg:w-[92%]"
			style={{ borderColor: "var(--new-border_dark)" }}
		>
			<View className="text-textWhite flex flex-col gap-4">
				<Text className="text-xl font-bold align-middle uppercase">{getTransactionTitle()}</Text>
				<Text className="text-textWhite mt-2 text-[16px] font-light leading-relaxed">{getTransactionDescription()}</Text>

				<View className="mt-[1.2rem] flex flex-col gap-[0.7rem]">
					<TransactionDetails transactionId={txId} open={true} farm={undefined} tx={undefined} />
					{isLoading && (
						<View className="center">
							<View className="w-[18px] h-[18px] border-2 border-solid border-current border-b-transparent border-r-transparent rounded-full box-border animate-rotation" />
						</View>
					)}
				</View>

				{success.length > 0 && (
					<>
						<View className="bg-green-800/30 border border-green-600 rounded-md p-4 mt-2">
							{success.map((notification, index) => (
								<View key={index} className="mb-2 last:mb-0">
									{notification.title && <Text className="text-green-400 font-semibold mb-1">{notification.title}</Text>}
									<Text className="text-green-400">{notification.message}</Text>
								</View>
							))}
						</View>
						<Pressable
							className={`mt-4 uppercase bg-buttonPrimaryLight text-textBlack w-full py-5 px-4 text-xl font-bold tracking-widest rounded-[40px]`}
							onPress={() => handleClose(true)}
						>
							<Text className="text-textBlack">Go Back</Text>
						</Pressable>
					</>
				)}

				{errors.length > 0 && (
					<>
						<View className="bg-red-800/30 border border-red-600 rounded-md p-4 mt-2">
							{errors.map((error, index) => (
								<View key={index} className="mb-2 last:mb-0">
									{error.title && <Text className="text-red-400 font-semibold mb-1">{error.title}</Text>}
									<Text className="text-red-400">{error.message}</Text>
								</View>
							))}
						</View>
						<Pressable
							className={`mt-4 uppercase bg-buttonPrimaryLight text-textBlack w-full py-5 px-4 text-xl font-bold tracking-widest rounded-[40px]`}
							onPress={() => handleClose()}
						>
							<Text className="text-textBlack">Close</Text>
						</Pressable>
					</>
				)}
			</View>
		</ModalLayout>
	);
};

export default ConfirmFarmActionModal;
