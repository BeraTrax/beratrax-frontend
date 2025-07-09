import { ImSpinner8 } from "react-icons/im";
import { WarningModalProps, TokenActionType } from "@beratrax/core/src/types/airdrop";
import { Pressable, Text, View } from "react-native";

const WarningModal = ({ isOpen, onClose, onConfirm, type, isLoading }: WarningModalProps) => {
	if (!isOpen) return null;

	const getModalContent = () => {
		switch (type) {
			case "burn":
				return {
					title: "🗑️ Burn Your TRAX Tokens!",
					message: "Don't want your airdrop? Burn it and we'll match you!",
					buttonText: "Trashhhhhh it!",
				};
			case "claim":
				return {
					title: "Important Notice!",
					message:
						"You are choosing to claim your TRAX tokens. You understand that after this transaction, you will receive your TRAX tokens immediately. You recognize that you won't be able to stake these tokens later in the 2000% APR pool.",
					buttonText: "I understand",
				};
			default:
				return {
					title: "Important Notice!",
					message: "You are choosing to stake your TRAX tokens.",
					buttonText: "I understand",
				};
		}
	};

	const content = getModalContent();

	return (
		<View className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
			<View className="gap-4 items-center justify-center bg-bgSecondary rounded-3xl p-6 max-w-lg w-full mx-4 border border-borderDark">
				<View className="flex flex-col gap-4 items-center w-full mb-4">
					<Text className="normal-case font-league-spartan text-2xl font-bold text-center text-textWhite">{content.title}</Text>
					<Text className="normal-case font-league-spartan text-base text-textWhite">{content.message}</Text>
				</View>
				<View className="flex gap-4">
					<Pressable className="bg-gray-500 p-4 rounded-xl w-full font-league-spartan text-textWhite" onPress={onClose}>
						Cancel
					</Pressable>
					<Pressable
						className={`p-4 rounded-xl w-full font-league-spartan text-textWhite ${
							type === "burn" ? "bg-red-600 hover:bg-red-700" : "bg-bgPrimary"
						}`}
						disabled={isLoading}
						onPress={onConfirm}
					>
						{isLoading ? <ImSpinner8 className="animate-spin mx-auto" /> : content.buttonText}
					</Pressable>
				</View>
			</View>
		</View>
	);
};

export default WarningModal;
