import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, Image, TextInput } from "react-native";
import { LOGIN_PROVIDER } from "@web3auth/react-native-sdk";

interface LoginModalProps {
	visible: boolean;
	onClose: () => void;
	connectWallet: (provider: (typeof LOGIN_PROVIDER)[keyof typeof LOGIN_PROVIDER], email?: string) => Promise<void>;
}

const loginProviders = [
	{
		id: LOGIN_PROVIDER.GOOGLE,
		name: "Google",
		icon: "https://www.google.com/favicon.ico",
		color: "#4285F4",
	},
	{
		id: LOGIN_PROVIDER.FACEBOOK,
		name: "Facebook",
		icon: "https://www.facebook.com/favicon.ico",
		color: "#1877F2",
	},
	{
		id: LOGIN_PROVIDER.GITHUB,
		name: "GitHub",
		icon: "https://github.com/favicon.ico",
		color: "#333333",
	},
	{
		id: LOGIN_PROVIDER.TWITTER,
		name: "X",
		icon: "https://twitter.com/favicon.ico",
		color: "#000000",
	},
	{
		id: LOGIN_PROVIDER.DISCORD,
		name: "Discord",
		icon: "https://assets.streamlinehq.com/image/private/w_300,h_300,ar_1/f_auto/v1/icons/logos/discord-827th92xaqo9x60z70d8.png/discord-3laxilfyqm52ssh24sv4oe.png?_a=DATAdtAAZAA0",
		color: "#5865F2",
	},
	{
		id: LOGIN_PROVIDER.EMAIL_PASSWORDLESS,
		name: "Email",
		icon: "https://images.icon-icons.com/614/PNG/512/email-envelope-outline-shape-with-rounded-corners_icon-icons.com_56530.png",
		color: "#EA4335",
	},
];

export const LoginModal: React.FC<LoginModalProps> = ({ visible, onClose, connectWallet }) => {
	const [showEmailInput, setShowEmailInput] = useState(false);
	const [email, setEmail] = useState("");

	const handleLogin = async (provider: (typeof LOGIN_PROVIDER)[keyof typeof LOGIN_PROVIDER]) => {
		try {
			if (provider === LOGIN_PROVIDER.EMAIL_PASSWORDLESS) {
				setShowEmailInput(true);
				return;
			}
			await connectWallet(provider);
			onClose();
		} catch (error) {
			console.error("Login failed:", error);
		}
	};

	const handleEmailSubmit = async () => {
		try {
			await connectWallet(LOGIN_PROVIDER.EMAIL_PASSWORDLESS, email);
			onClose();
		} catch (error) {
			console.error("Email login failed:", error);
		}
	};

	const handleBack = () => {
		setShowEmailInput(false);
		setEmail("");
	};

	return (
		<Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
			<View className="flex-1 bg-black/50 justify-center items-center">
				<View className="w-[90vw] bg-[#1A1A1A] rounded-2xl p-6 shadow-2xl">
					{!showEmailInput ? (
						<>
							<View className="flex-row justify-between items-center mb-5">
								<Text className="text-2xl font-bold text-white">Connect Wallet</Text>
								<TouchableOpacity onPress={onClose} className="p-1">
									<Text className="text-3xl text-white font-bold">×</Text>
								</TouchableOpacity>
							</View>

							<Text className="text-base text-white mb-5">Choose your preferred login method</Text>

							<View className="space-y-3">
								{loginProviders.map((provider) => (
									<TouchableOpacity
										key={provider.id}
										className="flex-row items-center p-4 rounded-xl my-2"
										style={{ backgroundColor: provider.color }}
										onPress={() => handleLogin(provider.id)}
									>
										<Image source={{ uri: provider.icon }} className="w-6 h-6 mr-3" />
										<Text className="text-white text-base font-semibold">Continue with {provider.name}</Text>
									</TouchableOpacity>
								))}
							</View>
						</>
					) : (
						<>
							<View className="flex-row justify-between items-center mb-6">
								<View className="flex-row items-center">
									<TouchableOpacity onPress={handleBack} className="mr-3">
										<Text className="text-white text-2xl">←</Text>
									</TouchableOpacity>
									<Image
										source={{
											uri: "https://images.icon-icons.com/614/PNG/512/email-envelope-outline-shape-with-rounded-corners_icon-icons.com_56530.png",
										}}
										className="w-6 h-6 mr-3"
									/>
									<Text className="text-2xl font-bold text-white">Enter Email</Text>
								</View>
								<TouchableOpacity onPress={onClose} className="p-1">
									<Text className="text-3xl text-white font-bold">×</Text>
								</TouchableOpacity>
							</View>

							<Text className="text-base text-gray-400 mb-6">Enter your email address to continue with passwordless login</Text>

							<View className="space-y-4">
								<View className="bg-[#2A2A2A] rounded-xl overflow-hidden">
									<TextInput
										className="w-full text-white p-4 text-base"
										placeholder="Enter your email"
										placeholderTextColor="#666"
										value={email}
										onChangeText={setEmail}
										keyboardType="email-address"
										autoCapitalize="none"
										autoCorrect={false}
									/>
								</View>

								<TouchableOpacity
									className="w-full bg-[#EA4335] p-4 rounded-xl items-center shadow-lg"
									onPress={handleEmailSubmit}
									style={{ elevation: 3 }}
								>
									<Text className="text-white text-base font-semibold">Continue</Text>
								</TouchableOpacity>
							</View>
						</>
					)}
				</View>
			</View>
		</Modal>
	);
};
