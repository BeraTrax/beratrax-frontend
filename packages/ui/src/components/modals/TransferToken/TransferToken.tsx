import { useTransferToken } from "@beratrax/core/src/hooks";
import { Token } from "@beratrax/core/src/types";
import { noExponents } from "@beratrax/core/src/utils/common";
import { FC, useMemo } from "react";
import { ModalLayout } from "ui/src/components/modals/ModalLayout/ModalLayout";
import { UsdToggle } from "../../UsdToggle/UsdToggle";
import { Text, View, TextInput, Pressable, TouchableOpacity } from "react-native";
import Colors from "@beratrax/typescript-config/Colors";

interface IProps {
	token: Token;
	handleClose: Function;
}

export const TransferToken: FC<IProps> = ({ token, handleClose }) => {
	const {
		isLoading,
		showInUsd,
		amount,
		setAmount,
		setMax,
		handleSubmit,
		handleMaxClick,
		handleToggleShowInUsdc,
		receiverAddress,
		setReceiverAddress,
	} = useTransferToken(token, handleClose);

	const hasInsufficientBalance = useMemo(
		() => (showInUsd ? Number(amount) > Number(token.usdBalance) : Number(amount) > Number(token.balance)),
		[token.balance, showInUsd, token.usdBalance, amount]
	);

	return (
		<ModalLayout onClose={handleClose} wrapperClassName="w-full">
			<View className="w-full flex flex-col justify-center items-center">
				<Text className="text-base text-center text-textWhite mb-4 font-medium">Transfer {token.name}</Text>

				<View className="flex flex-col w-full my-2">
					<Text className="text-textSecondary text-base mb-2">Send To:</Text>
					<View className="flex w-full rounded-2xl py-4 px-3 bg-gradientSecondary">
						<TextInput
							placeholder="0x1c..."
							className="bg-transparent w-full h-10 text-base text-textSecondary"
							value={receiverAddress}
							onChangeText={setReceiverAddress}
							placeholderTextColor={Colors.textSecondary}
						/>
					</View>
				</View>

				<View className="flex flex-col w-full my-2">
					<Text className="text-textSecondary text-base mb-2">
						Amount: <Text className="text-sm">(Balance: {showInUsd ? `$${token.usdBalance}` : token.balance})</Text>
					</Text>
					<View className="flex flex-row justify-between items-center rounded-2xl py-3 px-3 bg-gradientSecondary">
						<TextInput
							placeholder="e.g. 250"
							keyboardType="numeric"
							className="bg-transparent flex-1 h-10 text-base text-textSecondary"
							value={amount ? noExponents(amount) : ""}
							onChangeText={(text) => {
								setAmount(text);
								setMax(false);
							}}
							placeholderTextColor={Colors.textSecondary}
						/>
						<View className="flex flex-row items-center ml-4">
							<TouchableOpacity onPress={handleMaxClick} className="rounded-full border border-borderDark py-1.5 px-3 bg-transparent">
								<Text className="text-textSecondary text-sm font-medium">MAX</Text>
							</TouchableOpacity>
							<View className="ml-3">
								<UsdToggle showInUsd={showInUsd} handleToggleShowInUsdc={handleToggleShowInUsdc} />
							</View>
						</View>
					</View>
				</View>

				<Pressable
					className={`py-4 px-8 mt-8 w-full rounded-full items-center justify-center ${
						hasInsufficientBalance ? "bg-buttonDisabled" : "bg-buttonPrimaryLight"
					}`}
					onPress={() => {
						const mockEvent = { preventDefault: () => {} } as any;
						handleSubmit(mockEvent);
					}}
					disabled={isLoading || Number(amount) <= 0 || !receiverAddress || hasInsufficientBalance}
				>
					<Text className="text-textBlack text-base font-bold text-center">
						{hasInsufficientBalance ? "Insufficient Fund" : "Transfer"}
					</Text>
				</Pressable>
			</View>
		</ModalLayout>
	);
};
