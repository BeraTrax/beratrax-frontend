import { View, TextInput, Text, Pressable, ScrollView, Platform, Image, ImageSourcePropType } from "react-native";
import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { isStagging, RAMP_TRANSAK_API_KEY } from "@beratrax/core/src/config/constants";
import transaklogo from "@beratrax/core/src/assets/images/transaklogo.png";
import { WebView } from "react-native-webview";

/**
 * Transak Widget Component that renders conditionally for web and mobile.
 *
 * - On web: Displays Transak iframe using the provided API URL.
 * - On mobile: Embeds the Transak React Native SDK WebView.
 */
interface TransakWidgetProps {
	isVisible: boolean;
	onClose: () => void;
	transakUrl: string;
	displayAmount: string;
	address: string | undefined;
}

const TransakWidget = ({ isVisible, onClose, transakUrl, displayAmount, address }: TransakWidgetProps): JSX.Element | null => {
	if (!isVisible) return null;

	return (
		<View className="mb-6 w-full">
			<View className="bg-bgDark rounded-2xl border border-gradientSecondary p-4 h-[75vh] w-full">
				<View className="flex-row justify-between items-center mb-4">
					<View className="flex-row items-center gap-2">
						<Image source={transaklogo as ImageSourcePropType} style={{ width: 28, height: 28, borderRadius: 14 }} />
						<Text className="text-textWhite font-medium">Transak Onramp</Text>
					</View>
					<Pressable onPress={onClose}>
						<Text className="text-textWhite">✕</Text>
					</Pressable>
				</View>

				<View className="flex-1 rounded-lg overflow-hidden">
					{Platform.OS === "web" ? (
						<View className="w-full h-full">
							<iframe
								title="Transak OnRamp"
								src={transakUrl}
								allowFullScreen={true}
								className="border-none rounded-lg w-full h-full bg-white"
							/>
						</View>
					) : (
						<WebView source={{ uri: transakUrl }} enableApplePay allowsInlineMediaPlayback mediaPlaybackRequiresUserAction={false} />
					)}
				</View>
			</View>
		</View>
	);
};

/**
 * A cross-platform UI for buying tokens using the Transak fiat on-ramp.
 *
 * @returns {React.JSX.Element} The Buy component.
 */
export const Buy = (): React.JSX.Element => {
	const { address } = useAccount();

	const presetAmounts = ["20", "50", "100"];
	const [amount, setAmount] = useState("10");
	const [currencyType] = useState<"USD" | "USDC">("USD");
	const [isCustomInput, setIsCustomInput] = useState(false);
	const [customAmount, setCustomAmount] = useState("10");
	const [isWebViewVisible, setIsWebViewVisible] = useState(false);

	const currentAmount = isCustomInput ? customAmount : amount;
	const displayAmount = currentAmount || "0";
	const displayText = currentAmount && currentAmount !== "0" ? currentAmount : "0";

	const convertedAmount = displayAmount; // 1:1 ratio for simplicity

	// Amount limits
	const { minAmount, maxAmount } = useMemo(
		() => ({
			minAmount: 10,
			maxAmount: 999999999999999,
		}),
		[]
	);

	// Handle custom input
	const handleCustomInputChange = (text: string) => {
		if (text === "" || /^\d*\.?\d*$/.test(text)) {
			setCustomAmount(text);
			setIsCustomInput(true);
		}
	};

	// Handle preset selection
	const handlePresetClick = (value: string) => {
		setAmount(value);
		setCustomAmount(value);
		setIsCustomInput(false);
	};

	const isValidAmount = displayAmount !== "" && displayAmount !== "0" && parseFloat(displayAmount) >= minAmount;

	const transakUrl = `https://global${isStagging ? "-stg" : ""}.transak.com/?apiKey=${RAMP_TRANSAK_API_KEY}&cryptoCurrencyCode=BERA&network=berachain&walletAddress=${address}&defaultFiatAmount=${displayAmount}&defaultFiatCurrency=USD`;

	return (
		<ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-bgDark p-4">
			<View className="flex flex-col items-center justify-center w-full max-w-md m-auto">
				<Text className="font-arame-mono text-2xl font-bold mb-6 text-center text-textWhite uppercase">BUY CRYPTO</Text>

				{/* Transak Widget */}
				<TransakWidget
					isVisible={isWebViewVisible}
					onClose={() => setIsWebViewVisible(false)}
					transakUrl={transakUrl}
					displayAmount={displayAmount}
					address={address}
				/>

				{/* Amount Selection Card */}
				{!isWebViewVisible && (
					<View className="bg-bgDark rounded-2xl border border-gradientSecondary p-6 mb-4 w-full">
						<View className="mb-6">
							<Text className="text-center text-4xl font-bold text-textWhite mb-2">
								{displayText} {currencyType}
							</Text>
							<View className="flex-row justify-center items-center gap-2 text-textSecondary">
								<Text className="text-sm text-textWhite">⟷</Text>
								<Text className="text-sm text-textWhite">
									{convertedAmount} {currencyType === "USD" ? "USDC" : "USD"}
								</Text>
							</View>
						</View>

						{/* Custom Amount Input */}
						<View className="mb-6">
							<Text className="font-league-spartan text-textWhite text-sm font-medium mb-2">
								Enter Amount (${minAmount} - ${maxAmount})
							</Text>
							<TextInput
								value={customAmount}
								onChangeText={handleCustomInputChange}
								placeholder={`Enter amount in ${currencyType}`}
								keyboardType="decimal-pad"
								className="font-league-spartan w-full px-4 py-3 bg-bgSecondary border border-borderDark rounded-lg text-textWhite placeholder-textSecondary"
							/>
						</View>

						{/* Preset Amount Buttons */}
						<View className="mb-6">
							<Text className="font-league-spartan text-textWhite text-sm font-medium mb-3">Quick Select</Text>
							<View className="flex-row gap-3">
								{presetAmounts.map((presetAmount) => (
									<Pressable
										key={presetAmount}
										onPress={() => handlePresetClick(presetAmount)}
										className={`flex-1 py-3 px-4 rounded-lg border ${
											!isCustomInput && amount === presetAmount
												? "bg-buttonPrimary border-buttonPrimary text-bgDark"
												: "bg-bgSecondary border-borderDark text-textWhite"
										}`}
									>
										<Text
											className={`font-league-spartan text-center font-medium ${!isCustomInput && amount === presetAmount ? "text-bgDark" : "text-textWhite"}`}
										>
											${presetAmount}
										</Text>
									</Pressable>
								))}
							</View>
						</View>

						{/* Buy Button */}
						<Pressable
							onPress={() => setIsWebViewVisible(true)}
							disabled={!isValidAmount}
							className={`w-full py-4 rounded-lg font-semibold text-lg ${
								isValidAmount ? "bg-buttonPrimary text-bgDark" : "bg-buttonDisabled text-textBlack"
							}`}
						>
							<Text className="font-league-spartan text-center text-textWhite text-lg font-semibold">Buy</Text>
						</Pressable>
					</View>
				)}
			</View>
		</ScrollView>
	);
};
