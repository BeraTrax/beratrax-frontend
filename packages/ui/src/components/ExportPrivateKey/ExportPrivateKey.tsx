import { useWallet } from "@beratrax/core/src/hooks";
import { copyToClipboard } from "@beratrax/core/src/utils";
import { FC, useState } from "react";
import { CopyIcon, CheckCircleIcon } from "../../icons";
import { View, Text, TouchableOpacity } from "react-native";
import QRCode from "react-qr-code";
import { ModalLayout } from "../modals/ModalLayout/ModalLayout";

interface IProps {
	setOpenModal: Function;
}

export const ExportPrivateKey: FC<IProps> = ({ setOpenModal }) => {
	const [copied, setCopied] = useState(false);
	const { currentWallet } = useWallet();

	const copy = () => {
		setCopied(true);
		copyToClipboard(currentWallet!, () => setCopied(false));
	};

	return (
		<ModalLayout
			onClose={() => setOpenModal(false)}
			className={"p-14 h-m-[330px] block text-center gap-7 tablet:w-[initial] tablet:flex tablet:items-center "}
		>
			<View className="tablet:text-left">
				<View className="mb-5">
					<Text className="font-arame-mono text-4xl font-bold mb-5 text-textWhite">Scan Me</Text>
				</View>
				<Text className="font-arame-mono text-lg font-bold mb-0 text-textWhite">Wallet Address</Text>
				<View className="flex-row justify-center items-center gap-2 mb-5">
					<Text className="font-arame-mono text-textGrey  max-w-[377px] truncate">{`${currentWallet?.substring(0, 20)}...${currentWallet?.substring(
						currentWallet.length - 3
					)}`}</Text>
					{copied ? (
						<View className="cursor-pointer text-inherit">
							<CheckCircleIcon color="var(--new-color_grey)" />
						</View>
					) : (
						<TouchableOpacity onPress={copy} className="cursor-pointer text-inherit">
							<CopyIcon color="var(--new-color_grey)" />
						</TouchableOpacity>
					)}
				</View>
				<Text className="font-arame-mono w-[250px] hidden md:block text-textWhite">
					Sending cryptocurrency has never been easier. Simply scan this QR code to transfer your desired tokens to your Beratrax wallet.
				</Text>
			</View>
			<View className="bg-bgPrimary w-fit h-fit text-center p-3 m-auto border-[12px] border-bgDark rounded-xl shadow-xl">
				{/* {currentWallet && (
					<QRCode
						value={currentWallet}
						size={200}
						// bgColor={lightMode ? "var(--new-background_primary)" : "var(--new-background_secondary)"}
						// fgColor={lightMode ? "var(--new-background_secondary)" : "var(--new-background_primary)"}
					/>
				)} */}
			</View>
		</ModalLayout>
	);
};
