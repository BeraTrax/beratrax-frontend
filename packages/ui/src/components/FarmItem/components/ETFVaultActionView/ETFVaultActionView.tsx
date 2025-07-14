import Tokendetailspageleftsideleaves from "@beratrax/core/src/assets/images/tokendetailspageleftsideleaves.svg";
import Tokendetailspagestoprightleaves from "@beratrax/core/src/assets/images/tokendetailspagestoprightleaves.png";
import { useWallet } from "@beratrax/core/src/hooks";
import { useAppSelector } from "@beratrax/core/src/state";
import { LoginModal } from "@beratrax/mobile/app/components/LoginModal/LoginModal";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useState, useCallback, useMemo, memo } from "react";
import { useRouter } from "expo-router";
import { useNavigate } from "react-router-dom";
import BackButton from "ui/src/components/BackButton/BackButton";
import { SvgImage } from "ui/src/components/SvgImage/SvgImage";
import { View, Text, Pressable, ScrollView, Platform, ImageSourcePropType, Image } from "react-native";
import { MarketCapIcon } from "@beratrax/ui/src/icons/MarketCap";
import { VolumeIcon } from "@beratrax/ui/src/icons/Volume";
import { CreatedIcon } from "@beratrax/ui/src/icons/Created";
import { TrendUpIcon } from "@beratrax/ui/src/icons/TrendUp";
import { RocketIcon } from "@beratrax/ui/src/icons/Rocket";

const ActionButton = memo(
	({
		onPress,
		text,
		className,
		disabled,
	}: {
		onPress: () => void;
		text: string;
		className: string;
		testID?: string;
		disabled?: boolean;
	}) => (
		<Pressable className="flex-1" onPress={onPress} disabled={disabled}>
			<Text className={className}>{text}</Text>
		</Pressable>
	)
);

// Similar as in PoolInfo.tsx component
const StatInfo = ({ iconUrl, title, value }: { iconUrl: React.ReactNode; title: string; value: number | string }) => {
	return (
		<View className="flex flex-row items-center gap-4 bg-bgDark py-4 px-4 mt-2 rounded-2xl backdrop-blur-lg">
			{typeof iconUrl === "string" ? (
				<Image source={{ uri: iconUrl }} accessibilityLabel={title} className="flex-shrink-0 flex-grow-0 w-10 h-10" />
			) : (
				iconUrl
			)}
			<View className={"flex-1"}>
				<Text className="text-textWhite text-lg font-medium font-league-spartan">{title}</Text>
			</View>
			<Text className="text-textWhite text-lg font-medium font-league-spartan">{value}</Text>
		</View>
	);
};

// Hardcoded ETF vault data
const ETF_VAULT_DATA = {
	name: "wBera-Honey-USDT-styBgt Price",
	currentPrice: "$1.24",
	marketCap: "$2,450,000",
	totalSupply: "1,975,806",
	vaultLiquidity: "$1,240,000",
	underlyingAPR: "240.1%",
	apy: "240.1%",
	createdOn: "June 16, 2025",
	composition: [
		{
			name: "wBera",
			targetPercentage: "40%",
			currentPercentage: "41.52%",
			currentPrice: "$100",
			totalLiquidity: "$504.62k",
			logo: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x7507c1dc16935B82698e4C63f2746A2fCf994dF8/logo.png",
		},
		{
			name: "HONEY",
			targetPercentage: "30%",
			currentPercentage: "30.93%",
			currentPrice: "$100",
			totalLiquidity: "$303.19k",
			logo: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03/logo.png",
		},
		{
			name: "USDT",
			targetPercentage: "20%",
			currentPercentage: "19.80%",
			currentPrice: "$100",
			totalLiquidity: "$370.38k",
			logo: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x779Ded0c9e1022225f8E0630b35a9b54bE713736/logo.png",
		},
		{
			name: "styBgt",
			targetPercentage: "10%",
			currentPercentage: "9.75%",
			currentPrice: "$3,031.72",
			totalLiquidity: "$117m",
			logo: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/ybgt/logo.png",
		},
	],
	alt1: "wBera logo",
	alt2: "Honey logo",
	alt3: "USDT logo",
	alt4: "styBgt logo",
	logo1: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x7507c1dc16935B82698e4C63f2746A2fCf994dF8/logo.png",
	logo2: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03/logo.png",
	logo3: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x779Ded0c9e1022225f8E0630b35a9b54bE713736/logo.png",
	logo4: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/ybgt/logo.png",
};

export const ETFVaultActionView: React.FC = () => {
	const { lastVisitedPage } = useAppSelector((state) => state.account);
	const { currentWallet, isConnecting, connectWallet } = useWallet();
	const { openConnectModal } = useConnectModal();
	const [showLoginModal, setShowLoginModal] = useState(false);

	const router = useRouter();
	let navigate = null;
	if (Platform.OS === "web") {
		navigate = useNavigate();
	}

	const handleGoBack = () => {
		if (Platform.OS === "web") {
			navigate?.(lastVisitedPage || "/Earn", { replace: true });
		} else {
			router.replace(lastVisitedPage || "/Earn");
		}
	};

	const handleDepositPress = useCallback(() => {
		if (!currentWallet) {
			Platform.OS === "web" ? openConnectModal?.() : setShowLoginModal(true);
		} else {
			// For now, just show an alert
			if (Platform.OS === "web") {
				alert("ETF vault deposit functionality coming soon!");
			}
		}
	}, [currentWallet, openConnectModal]);

	const depositButtonText = useMemo(() => {
		return !currentWallet ? "Sign In/ Up to Deposit" : "Deposit (Coming Soon)";
	}, [currentWallet]);

	return (
		<>
			<View className={`flex-1 w-full bg-bgSecondary relative ${Platform.OS === "web" ? "" : "min-h-screen"}`}>
				<View className={`${Platform.OS === "web" ? "fixed" : "absolute"} top-[45%]`}>
					<SvgImage source={Tokendetailspageleftsideleaves} height={200} width={200} />
				</View>
				<View className={`${Platform.OS === "web" ? "fixed" : "absolute"} right-0 top-0`}>
					{Platform.OS === "web" ? (
						<SvgImage source={Tokendetailspagestoprightleaves} height={200} width={200} />
					) : (
						<Image source={Tokendetailspagestoprightleaves as ImageSourcePropType} height={200} width={200} />
					)}
				</View>
				<View className={`px-4 pb-2 ${Platform.OS === "web" || Platform.OS === "android" ? "" : "mb-24"}`}>
					<ScrollView className="pt-14">
						<BackButton onClick={handleGoBack} />
						<View className={`relative mt-4 ${Platform.OS === "android" ? "mb-40" : "mb-24"}`}>
							{/* Token Price and Graph Section */}
							<View className="rounded-3xl p-6 mb-4">
								<View className="flex flex-row justify-between">
									<View>
										<Text className="text-textWhite mt-3 text-xl font-bold">{ETF_VAULT_DATA.name}</Text>
										<View className="mt-2">
											<Text className="text-textWhite text-5xl font-bold">{ETF_VAULT_DATA.currentPrice}</Text>
											<View className="flex gap-2 items-center justify-center text-[16px]">
												{/* Future: Add price trend indicators here */}
											</View>
										</View>
									</View>
									<View className="flex flex-col mt-2 mr-3">
										<View className="flex flex-row items-center gap-2 mb-2 justify-end">
											<View className="bg-gradientPrimary px-3 py-1 rounded-full">
												<Text className="text-black font-bold">BeraTrax ETF</Text>
											</View>
										</View>
										<View className="flex flex-row items-center">
											{ETF_VAULT_DATA.logo1 ? (
												<Image alt={ETF_VAULT_DATA.alt1} className="w-16 h-16 rounded-full" source={{ uri: ETF_VAULT_DATA.logo1 }} />
											) : null}

											{ETF_VAULT_DATA.logo2 ? (
												<Image alt={ETF_VAULT_DATA.alt2} className="w-16 h-16 rounded-full -ml-8" source={{ uri: ETF_VAULT_DATA.logo2 }} />
											) : null}

											{ETF_VAULT_DATA.logo3 ? (
												<Image alt={ETF_VAULT_DATA.alt3} className="w-16 h-16 rounded-full -ml-8" source={{ uri: ETF_VAULT_DATA.logo3 }} />
											) : null}

											{ETF_VAULT_DATA.logo4 ? (
												<Image alt={ETF_VAULT_DATA.alt4} className="w-16 h-16 rounded-full -ml-8" source={{ uri: ETF_VAULT_DATA.logo4 }} />
											) : null}
										</View>
									</View>
								</View>
							</View>

							{/* ETF Composition Section */}
							<View className="rounded-3xl mb-4">
								<Text className="text-white text-xl font-bold mb-4 pl-6">Assets</Text>

								{/* Table Header */}
								<View className="flex flex-row items-center py-3 border-b border-gray-600 pl-6">
									<View className="flex-1 min-w-[80px]">
										<Text className="text-textSecondary text-base font-league-spartan">Name</Text>
									</View>
									<View className="flex-1 min-w-[80px]">
										<Text className="text-textSecondary text-base font-league-spartan">Current Price</Text>
									</View>
									<View className="flex-1 min-w-[80px]">
										<Text className="text-textSecondary text-base font-league-spartan">Total Liquidity</Text>
									</View>
									<View className="flex-1 min-w-[80px]">
										<Text className="text-textSecondary text-base font-league-spartan">Target Composition</Text>
									</View>
									<View className="flex-1 min-w-[80px]">
										<Text className="text-textSecondary text-base font-league-spartan">Current Composition</Text>
									</View>
								</View>

								{/* Table Rows */}
								{ETF_VAULT_DATA.composition.map((token, index) => (
									<View key={index} className="flex flex-row items-center py-4 border-b last:border-b-0 bg-bgDark pl-6 rounded-3xl m-2">
										{/* Name Column */}
										<View className="flex-1 min-w-[80px]">
											<View className="flex flex-row items-center">
												<Image source={{ uri: token.logo }} className="w-6 h-6 rounded-full mr-2" />
												<Text className="text-white text-base font-league-spartan">{token.name}</Text>
											</View>
										</View>

										{/* Current Price Column */}
										<View className="flex-1 min-w-[80px]">
											<Text className="text-white text-base font-league-spartan">{token.currentPrice}</Text>
										</View>

										{/* Total Liquidity Column */}
										<View className="flex-1 min-w-[80px]">
											<Text className="text-white text-base font-league-spartan">{token.totalLiquidity}</Text>
										</View>

										{/* Target Composition Column */}
										<View className="flex-1 min-w-[80px]">
											<Text className="text-white text-base font-league-spartan">{token.targetPercentage}</Text>
										</View>

										{/* Current Composition Column */}
										<View className="flex-1 min-w-[80px]">
											<Text className="text-white text-base font-league-spartan">{token.currentPercentage}</Text>
										</View>
									</View>
								))}
							</View>
							{/* Pool Info Section */}
							<View className="mt-4 flex flex-col gap-2">
								<StatInfo iconUrl={<MarketCapIcon />} title="Market Cap" value={ETF_VAULT_DATA.marketCap} />
								<StatInfo iconUrl={<VolumeIcon />} title="Vault Liquidity" value={ETF_VAULT_DATA.vaultLiquidity} />
								<StatInfo iconUrl={<TrendUpIcon />} title="Underlying APR" value={ETF_VAULT_DATA.underlyingAPR} />
								<StatInfo iconUrl={<RocketIcon />} title="Beratrax Auto-Compounded APY" value={ETF_VAULT_DATA.apy} />
								<StatInfo iconUrl={<CreatedIcon />} title="Created On" value={ETF_VAULT_DATA.createdOn} />
							</View>
						</View>
					</ScrollView>
					<View
						className={`flex flex-row gap-2 justify-center items-center w-full mx-auto ${
							Platform.OS === "web"
								? "fixed left-0 right-0 bottom-6 max-w-[600px] md:left-[calc(16.67%+0.5rem)] md:right-4 sm:left-4 sm:right-4"
								: "absolute bottom-8 left-4 right-4"
						}`}
					>
						{isConnecting ? (
							<View className="bg-buttonPrimaryLight w-full py-5 px-4 rounded-[40px]">
								<Text className="text-xl font-bold tracking-widest uppercase text-center">Connecting...</Text>
							</View>
						) : (
							<ActionButton
								onPress={handleDepositPress}
								text={depositButtonText}
								className="bg-buttonPrimaryLight w-full py-5 px-4 text-xl font-bold tracking-widest rounded-[40px] uppercase text-center"
							/>
						)}
					</View>
				</View>
			</View>
			{/* Login Modal */}
			{/* only for mobile app */}
			{showLoginModal && connectWallet && (
				// @ts-ignore
				<LoginModal visible={showLoginModal} onClose={() => setShowLoginModal(false)} connectWallet={connectWallet} />
			)}
		</>
	);
};
