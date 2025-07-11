import { View, TextInput, Text, Pressable, ScrollView, Platform, Image, ImageSourcePropType, Linking } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { getOnrampBuyUrl, fetchOnrampOptions } from "@coinbase/onchainkit/fund";
import { defaultNetworkName } from "@beratrax/core/src/config/constants";
import { isStagging, RAMP_TRANSAK_API_KEY, onchainkitProjectId } from "@beratrax/core/src/config/constants";
import transaklogo from "@beratrax/core/src/assets/images/transaklogo.png";
import coinbaseLogo from "@beratrax/core/src/assets/images/coinbaselogo.png";
import { WebView } from "react-native-webview";

interface Service {
	id: string;
	name: string;
	url: string;
	icon: ImageSourcePropType;
}

interface OnRampProps {
	isVisible: boolean;
	onClose: () => void;
	service: Service | undefined;
	displayAmount: string;
	address: string | undefined;
}

const OnRamp = ({ isVisible, onClose, service, displayAmount, address }: OnRampProps): JSX.Element | null => {
	if (!isVisible || !service) return null;

	return (
		<View className="mb-6 w-full">
			<View className="bg-bgDark rounded-2xl border border-gradientSecondary p-4 h-[75vh] w-full">
				<View className="flex-row justify-between items-center mb-4">
					<View className="flex-row items-center gap-2">
						<Image source={service.icon as ImageSourcePropType} style={{ width: 28, height: 28 }} />
						<Text className="text-textWhite font-medium">{service.name}</Text>
					</View>
					<Pressable onPress={onClose}>
						<Text className="text-textWhite">✕</Text>
					</Pressable>
				</View>

				<View className="flex-1 rounded-lg overflow-hidden">
					{Platform.OS === "web" ? (
						<View className="w-full h-full">
							<iframe
								title={service.name}
								src={service.url}
								allowFullScreen={true}
								className="border-none rounded-lg w-full h-full bg-white"
							/>
						</View>
					) : (
						<WebView source={{ uri: service.url }} enableApplePay allowsInlineMediaPlayback mediaPlaybackRequiresUserAction={false} />
					)}
				</View>
			</View>
		</View>
	);
};

export const Buy = (): React.JSX.Element => {
	const { address } = useAccount();
	const [userCountryCode, setUserCountryCode] = useState<string>("");
	const [userSubDivisionCode, setUserSubDivisionCode] = useState<string>("");
	const [onrampOptions, setOnrampOptions] = useState<any>(null);

	useEffect(() => {
		fetch("http://ip-api.com/json")
			.then((res) => res.json())
			.then((data) => {
				setUserCountryCode(data.countryCode);
				setUserSubDivisionCode(data.region);
			})
			.catch((err) => {
				console.log("Error fetching user country", err);
			});
	}, []);

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

	const onrampBuyUrl = useMemo(() => {
		return getOnrampBuyUrl({
			projectId: onchainkitProjectId,
			addresses: { [address?.toString() || ""]: [defaultNetworkName] },
			assets: ["USDC"],
			presetFiatAmount: parseFloat(displayAmount) || 10,
			fiatCurrency: "USD",
		});
	}, [address, displayAmount]);

	const services = useMemo(
		() => [
			{
				id: "coinbase",
				name: "Coinbase",
				url: onrampBuyUrl,
				icon: coinbaseLogo,
			},
			{
				id: "transak",
				name: "Transak",
				url: `https://global${isStagging ? "-stg" : ""}.transak.com/?apiKey=${RAMP_TRANSAK_API_KEY}&cryptoCurrencyCode=BERA&network=berachain&walletAddress=${address}&defaultFiatAmount=${displayAmount}&defaultFiatCurrency=USD`,
				icon: transaklogo,
			},
		],
		[address, displayAmount, isStagging, onrampBuyUrl]
	);

	const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0].id);
	const selectedService = services.find((service) => service.id === selectedServiceId);

	const { minAmount, maxAmount } = useMemo(
		() => ({
			minAmount: 10,
			maxAmount: 3000,
		}),
		[]
	);

	const handleCustomInputChange = (text: string) => {
		if (text === "" || /^\d*\.?\d*$/.test(text)) {
			setCustomAmount(text);
			setIsCustomInput(true);
		}
	};

	const handlePresetClick = (value: string) => {
		setAmount(value);
		setCustomAmount(value);
		setIsCustomInput(false);
	};

	const isValidAmount = displayAmount !== "" && displayAmount !== "0" && parseFloat(displayAmount) >= minAmount;

	const handleBuyClick = async () => {
		if (selectedService?.id === "coinbase" && userCountryCode && userSubDivisionCode) {
			console.log("User Country Code", userCountryCode);
			console.log("User SubDivision Code", userSubDivisionCode);
			try {
				const config = await fetchOnrampOptions({
					country: userCountryCode,
					subdivision: userSubDivisionCode,
					apiKey: "r84JysipaN1nF2Wd46D27d874Kffr9Wa",
				});
				setOnrampOptions(config);
				// For simplicity, proceed to URL after fetching options; you could add selection logic here
				if (Platform.OS === "web") {
					window.open(selectedService.url, "_blank");
				} else {
					Linking.openURL(selectedService.url);
				}
			} catch (error) {
				console.error("Error fetching onramp options", error);
			}
		} else {
			setIsWebViewVisible(true);
		}
	};

	return (
		<ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-bgDark p-4">
			<View className="flex flex-col items-center justify-center w-full max-w-md m-auto">
				<Text className="font-arame-mono text-2xl font-bold mb-6 text-center text-textWhite uppercase">BUY CRYPTO</Text>

				<View className="flex-row mb-4 w-full">
					{services.map((service) => (
						<Pressable
							key={service.id}
							onPress={() => setSelectedServiceId(service.id)}
							className={`flex-1 py-3 px-4 rounded-lg border border-borderDark flex-row items-center justify-center gap-2
                            ${selectedServiceId === service.id ? "bg-buttonPrimary" : "bg-bgSecondary"}`}
						>
							<Image source={service.icon as ImageSourcePropType} style={{ width: 28, height: 28, borderRadius: 14 }} />
							<Text className="text-textWhite text-xl">{service.name}</Text>
						</Pressable>
					))}
				</View>

				<OnRamp
					isVisible={isWebViewVisible}
					onClose={() => setIsWebViewVisible(false)}
					displayAmount={displayAmount}
					address={address}
					service={selectedService as Service}
				/>

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

						{selectedService?.id === "coinbase" && (
							<Text className="text-textSecondary text-xs text-center mb-4">
								Using Coinbase will open an external link to complete your purchase.
							</Text>
						)}

						<Pressable
							onPress={handleBuyClick}
							disabled={!isValidAmount}
							className={`w-full py-4 rounded-lg font-semibold text-lg ${
								isValidAmount ? "bg-buttonPrimary text-bgDark" : "bg-buttonDisabled text-textBlack"
							}`}
						>
							<Text className="font-league-spartan text-center text-textWhite text-lg font-semibold">Buy</Text>
						</Pressable>

						{onrampOptions && (
							<View className="mt-4">
								<Text className="text-textWhite text-lg font-medium mb-2">Available Tokens</Text>
								{onrampOptions.purchaseCurrencies.map((token: any) => (
									<View key={token.symbol} className="mb-2">
										<Text className="text-textWhite">
											{token.name} ({token.symbol})
										</Text>
										{token.networks && token.networks.length > 0 && (
											<View className="ml-4">
												<Text className="text-textSecondary">Networks:</Text>
												{token.networks.map((network: any) => (
													<Text key={network.id} className="text-textWhite">
														{network.name}
													</Text>
												))}
											</View>
										)}
									</View>
								))}
							</View>
						)}
					</View>
				)}
			</View>
		</ScrollView>
	);
};
