import { useWallet } from "@beratrax/core/src/hooks";
import { copyToClipboard } from "@beratrax/core/src/utils";
import { FC, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Switch } from "react-native";
import { WarningIcon, CopyIcon, CheckCircleIcon } from "./../../icons";
import { ModalLayout } from "../modals/ModalLayout/ModalLayout";

interface IProps {
	setOpenModal: Function;
}

export const ExportPrivateKey: FC<IProps> = ({ setOpenModal }) => {
	const [confirm, setConfirm] = useState(false);
	const [show, setShow] = useState(false);
	const [copied, setCopied] = useState(false);
	const [privateKey, setPrivateKey] = useState("");
	const { getPkey } = useWallet();

	useEffect(() => {
		if (!confirm) if (show) setShow(false);
	}, [confirm]);

	const handleShow = async () => {
		const pKey = await getPkey();
		setPrivateKey(pKey || "");
		setShow((prev) => !prev);
	};

	const copy = () => {
		setCopied(true);
		copyToClipboard(privateKey, () => setCopied(false));
	};

	return (
		<ModalLayout onClose={() => setOpenModal(false)} wrapperClassName="w-[90vw] max-w-[400px]">
			<View>
				<View className="flex-row items-center gap-2 mb-4">
					<WarningIcon color="red" size={40} />
					<Text className="text-textPrimary text-2xl font-bold">Disclaimer</Text>
				</View>

				<Text className="text-base text-white mb-1">Exporting Private Key</Text>
				<Text className="text-textSecondary max-w-[400px] mb-7">
					This is for advanced users and can put their funds at risk if they export without knowing how to handle it
				</Text>

				<View className="flex-row items-center mb-4">
					<Switch
						value={confirm}
						onValueChange={setConfirm}
						thumbColor={`var(--new-gradient-light)`}
						trackColor={{ false: `var(--new-gradient-dark)`, true: `var(--new-gradient-light)` }}
					/>
					<Text className="ml-2 text-white">I Understand</Text>
				</View>

				<View className="bg-bgPrimary w-full gap-4 rounded-xl px-4 py-3 my-3 relative flex-row items-center">
					<TextInput
						readOnly
						value={show ? privateKey : "0xXXXXXXXXXXXXXXXXXXXXXXXXXXX"}
						className="flex-grow min-w-0 text-sm font-bold text-white bg-transparent"
						editable={false}
					/>
					{show && (
						<TouchableOpacity onPress={copy} className="flex-shrink-0">
							{copied ? <CheckCircleIcon /> : <CopyIcon />}
						</TouchableOpacity>
					)}
					<TouchableOpacity disabled={!confirm} onPress={handleShow} className="flex-shrink-0">
						<Text className=" font-bold">{show ? "HIDE" : "SHOW"}</Text>
					</TouchableOpacity>
				</View>

				<Text className="text-sm text-textSecondary mt-2">Note: This feature is only for social wallets</Text>
			</View>
		</ModalLayout>
	);
};
