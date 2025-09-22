import React, { useState, useCallback } from "react";
import { View, Text, Pressable, TextInput, Alert, ActivityIndicator } from "react-native";
import { useAppDispatch } from "@beratrax/core/src/state";
import { deleteAccount } from "@beratrax/core/src/state/account/accountReducer";
import { ModalLayout } from "../modals/ModalLayout/ModalLayout";
import { WarningIcon, TrashIcon } from "../../icons";
import { notifySuccess, notifyError } from "@beratrax/core/src/api/notify";

interface AccountDeletionModalProps {
	isVisible: boolean;
	onClose: (logOut?: boolean) => void;
	userAddress?: string;
}

enum DeletionStep {
	WARNING = "warning",
	CONFIRMATION = "confirmation",
	FINAL = "final",
}

export const AccountDeletionModal: React.FC<AccountDeletionModalProps> = ({ isVisible, onClose, userAddress }) => {
	const dispatch = useAppDispatch();
	const [currentStep, setCurrentStep] = useState<DeletionStep>(DeletionStep.WARNING);
	const [confirmationText, setConfirmationText] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);

	const resetModal = useCallback(() => {
		setCurrentStep(DeletionStep.WARNING);
		setConfirmationText("");
		setIsDeleting(false);
	}, []);

	const handleClose = useCallback(() => {
		if (!isDeleting) {
			resetModal();
			onClose();
		}
	}, [isDeleting, resetModal, onClose]);

	const handleNextStep = useCallback(() => {
		if (currentStep === DeletionStep.WARNING) {
			setCurrentStep(DeletionStep.CONFIRMATION);
		} else if (currentStep === DeletionStep.CONFIRMATION) {
			setCurrentStep(DeletionStep.FINAL);
		}
	}, [currentStep]);

	const handlePreviousStep = useCallback(() => {
		if (currentStep === DeletionStep.CONFIRMATION) {
			setCurrentStep(DeletionStep.WARNING);
		} else if (currentStep === DeletionStep.FINAL) {
			setCurrentStep(DeletionStep.CONFIRMATION);
		}
	}, [currentStep]);

	const handleDeleteAccount = useCallback(async () => {
		if (!userAddress) {
			Alert.alert("Error", "No wallet address found");
			return;
		}

		setIsDeleting(true);

		try {
			const result = await dispatch(deleteAccount({ address: userAddress })).unwrap();

			notifySuccess({
				title: "Account marked for deletion",
				message: `Your account will be deleted on ${new Date(result.deletionDate).toLocaleDateString()}. You can cancel by logging in during the 5-day grace period.`,
			});

			resetModal();
			onClose(true);
		} catch (error: any) {
			console.error("Delete account error:", error);
			notifyError({
				title: "Deletion Failed",
				message: error.message || "Failed to delete account",
			});
		} finally {
			setIsDeleting(false);
		}
	}, [userAddress, dispatch, resetModal, onClose]);

	const isConfirmationValid = confirmationText.toLowerCase() === "delete";
	const shortAddress = userAddress ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : "";

	if (!isVisible) return null;

	const renderWarningStep = () => (
		<View className="gap-y-6">
			<View className="flex-row items-center gap-x-3">
				<View className="p-3 bg-red-500/20 rounded-full">
					<WarningIcon color="#ef4444" size={24} />
				</View>
				<Text className="font-league-spartan text-xl font-bold text-textWhite">Account Deletion Warning</Text>
			</View>

			<View className="gap-y-4">
				<Text className="font-league-spartan text-base text-textWhite leading-6">
					You are about to permanently delete your Trax account. This action will:
				</Text>

				<View className="gap-y-2">
					<Text className="font-league-spartan text-sm text-red-400 leading-5">• Delete ALL your transaction history and vault data</Text>
					<Text className="font-league-spartan text-sm text-red-400 leading-5">• Remove all earned points and airdrop eligibility</Text>
					<Text className="font-league-spartan text-sm text-red-400 leading-5">• Delete all referral relationships and earnings</Text>
					<Text className="font-league-spartan text-sm text-red-400 leading-5">
						• Permanently remove your account from all Trax services
					</Text>
				</View>

				<View className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
					<Text className="font-league-spartan text-sm text-orange-400 font-semibold mb-2">⏰ 5-Day Grace Period</Text>
					<Text className="font-league-spartan text-sm text-orange-300 leading-5">
						Your account will be marked for deletion but not immediately removed. If you log in within 5 days, the deletion will be
						automatically cancelled.
					</Text>
				</View>

				<View className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
					<Text className="font-league-spartan text-sm text-blue-400 font-semibold mb-2">🔐 Web3Auth Data Deletion</Text>
					<Text className="font-league-spartan text-sm text-blue-300 leading-5 mb-3">
						This action only deletes your Trax account data. To delete your data from Web3Auth services:
					</Text>
					<Text className="font-league-spartan text-sm text-blue-300 leading-5 mb-2">
						• Send a deletion request to ConsenSys Privacy team
					</Text>
					<Text className="font-league-spartan text-sm text-blue-300 leading-5">
						• Email: <Text className="font-league-spartan text-blue-200">privacy-requests@consensys.net</Text>
					</Text>
				</View>
			</View>

			<View className="flex-row gap-3">
				<Pressable onPress={handleClose} className="flex-1 py-4 bg-gray-600 rounded-lg">
					<Text className="font-league-spartan text-center text-white font-medium">Cancel</Text>
				</Pressable>
				<Pressable onPress={handleNextStep} className="flex-1 py-4 bg-red-600 rounded-lg">
					<Text className="font-league-spartan text-center text-white font-medium">Continue</Text>
				</Pressable>
			</View>
		</View>
	);

	const renderConfirmationStep = () => (
		<View className="gap-y-6">
			<View className="flex-row items-center gap-x-3">
				<View className="p-3 bg-red-500/20 rounded-full">
					<TrashIcon color="#ef4444" size={24} />
				</View>
				<Text className="font-league-spartan text-xl font-bold text-textWhite">Confirm Account Deletion</Text>
			</View>

			<View className="gap-y-4">
				<Text className="font-league-spartan text-base text-textWhite leading-6">
					To confirm deletion of your account <Text className="font-arame-mono text-green-400">{shortAddress}</Text>, please type{" "}
					<Text className="font-bold text-red-400">DELETE</Text> in the field below:
				</Text>

				<TextInput
					value={confirmationText}
					onChangeText={setConfirmationText}
					placeholder="Type DELETE to confirm"
					placeholderTextColor="#666"
					className="w-full bg-bgDark border border-borderDark rounded-lg text-textWhite font-league-spartan text-base"
					style={{
						minHeight: 56,
						paddingHorizontal: 16,
						paddingVertical: 16,
						fontSize: 16,
						lineHeight: 20,
						textAlignVertical: "center",
					}}
					autoCapitalize="characters"
					autoCorrect={false}
				/>

				{confirmationText && !isConfirmationValid && (
					<Text className="font-league-spartan text-sm text-red-400">Please type "DELETE" exactly as shown</Text>
				)}
			</View>

			<View className="flex-row gap-x-3">
				<Pressable onPress={handlePreviousStep} className="flex-1 py-4 bg-gray-600 rounded-lg">
					<Text className="font-league-spartan text-center text-white font-medium">Back</Text>
				</Pressable>
				<Pressable
					onPress={handleNextStep}
					disabled={!isConfirmationValid}
					className={`flex-1 py-4 rounded-lg ${isConfirmationValid ? "bg-red-600" : "bg-gray-700"}`}
				>
					<Text className={`font-league-spartan text-center font-medium ${isConfirmationValid ? "text-white" : "text-gray-400"}`}>
						Continue
					</Text>
				</Pressable>
			</View>
		</View>
	);

	const renderFinalStep = () => (
		<View className="gap-y-6">
			<View className="flex-row items-center gap-x-3">
				<View className="p-3 bg-red-500/20 rounded-full">
					<TrashIcon color="#ef4444" size={24} />
				</View>
				<Text className="font-league-spartan text-xl font-bold text-textWhite">Final Confirmation</Text>
			</View>

			<View className="gap-y-4">
				<View className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
					<Text className="font-league-spartan text-base text-red-400 font-bold text-center leading-6">⚠️ LAST CHANCE ⚠️</Text>
					<Text className="font-league-spartan text-sm text-red-300 text-center mt-2 leading-5">
						This will mark your account for permanent deletion. All your data will be removed after 5 days unless you log in to cancel.
					</Text>
				</View>

				<Text className="font-league-spartan text-base text-textWhite text-center leading-6">
					Are you absolutely sure you want to delete your account?
				</Text>
			</View>

			<View className="flex-row gap-x-3">
				<Pressable onPress={handlePreviousStep} disabled={isDeleting} className="flex-1 py-4 bg-gray-600 rounded-lg">
					<Text className="font-league-spartan text-center text-white font-medium">Back</Text>
				</Pressable>
				<Pressable onPress={handleDeleteAccount} disabled={isDeleting} className="flex-1 py-4 bg-red-600 rounded-lg">
					{isDeleting ? (
						<ActivityIndicator color="white" size="small" />
					) : (
						<Text className="font-league-spartan text-center text-white font-medium">Delete Account</Text>
					)}
				</Pressable>
			</View>
		</View>
	);

	const renderCurrentStep = () => {
		switch (currentStep) {
			case DeletionStep.WARNING:
				return renderWarningStep();
			case DeletionStep.CONFIRMATION:
				return renderConfirmationStep();
			case DeletionStep.FINAL:
				return renderFinalStep();
			default:
				return renderWarningStep();
		}
	};

	return (
		<ModalLayout onClose={handleClose} wrapperClassName="w-full max-w-lg">
			{renderCurrentStep()}
		</ModalLayout>
	);
};
