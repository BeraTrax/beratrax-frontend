import Tokendetailspageleftsideleaves from "@beratrax/core/src/assets/images/tokendetailspageleftsideleaves.svg";
import Tokendetailspagestoprightleaves from "@beratrax/core/src/assets/images/tokendetailspagestoprightleaves.png";
import { useDetailInput, useTokens, useWallet } from "@beratrax/core/src/hooks";
import { useAppDispatch, useAppSelector } from "@beratrax/core/src/state";
import { LoginModal } from "@beratrax/mobile/app/components/LoginModal/LoginModal";
import { IS_LEGACY } from "@beratrax/core/src/config/constants";
import { Transactions } from "@beratrax/ui";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useState, useCallback, useMemo, memo, useEffect } from "react";
import { useRouter } from "expo-router";
import { useNavigate } from "react-router-dom";
import BackButton from "ui/src/components/BackButton/BackButton";
import { SvgImage } from "ui/src/components/SvgImage/SvgImage";
import { View, Text, Pressable, ScrollView, Platform, ImageSourcePropType, Image, SafeAreaView } from "react-native";
import ETFPriceAndGraph from "./ETFPriceAndGraph/ETFPriceAndGraph";
import FarmActionModal from "../FarmActionView/FarmActionModal/FarmActionModal";
import { Skeleton } from "../../../Skeleton/Skeleton";
import { FarmTransactionType } from "@beratrax/core/src/types/enums";
import { setFarmDetailInputOptions } from "@beratrax/core/src/state/farms/farmsReducer";
import { FarmDetailInputOptions } from "@beratrax/core/src/state/farms/types";
import { ETFVaultDef } from "@beratrax/core/src/config/constants/pools_json";
import ETFInfo from "./ETFInfo/ETFInfo";
import YourBalance from "../FarmActionView/YourBalance/YourBalance";

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

export const ETFVaultActionView: React.FC<{ farm: ETFVaultDef }> = ({ farm }) => {
	const dispatch = useAppDispatch();
	const { lastVisitedPage } = useAppSelector((state) => state.account);
	const { currentWallet, isConnecting, connectWallet } = useWallet();
	const { openConnectModal } = useConnectModal();
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [screenWidth, setScreenWidth] = useState(Platform.OS === "web" ? (typeof window !== "undefined" ? window.innerWidth : 800) : 400);
	const { withdrawable, isLoadingFarm } = useDetailInput(farm);
	const {
		isBalancesLoading: isLoading,
		prices: {
			[farm.chainId]: { [farm.vault_addr]: vaultPrice },
		},
	} = useTokens();

	const [openDepositModal, setOpenDepositModal] = useState(false);

	const router = useRouter();
	let navigate = null;
	if (Platform.OS === "web") {
		navigate = useNavigate();
	}

	// Handle screen resize for web
	useEffect(() => {
		if (Platform.OS === "web" && typeof window !== "undefined") {
			const handleResize = () => {
				setScreenWidth(window.innerWidth);
			};

			window.addEventListener("resize", handleResize);
			// Set initial value
			setScreenWidth(window.innerWidth);

			return () => {
				window.removeEventListener("resize", handleResize);
			};
		}
	}, []);

	const setFarmOptions = useCallback(
		(opt: Partial<FarmDetailInputOptions>) => {
			dispatch(setFarmDetailInputOptions(opt));
			setOpenDepositModal(true);
		},
		[dispatch]
	);

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
		} else if (!IS_LEGACY) {
			setFarmOptions({ transactionType: FarmTransactionType.Deposit });
		}
	}, [currentWallet, openConnectModal, setFarmOptions]);

	const handleWithdrawPress = useCallback(() => {
		if (!IS_LEGACY) {
			setFarmOptions({
				transactionType: FarmTransactionType.Withdraw,
			});
		}
	}, [setFarmOptions]);

	const depositButtonText = useMemo(() => {
		return !currentWallet ? "Sign In/ Up to Deposit" : "Deposit";
	}, [currentWallet]);

	const withdrawButtonText = useMemo(() => FarmTransactionType.Withdraw, []);

	const isSmallScreen = screenWidth <= 640;

	return (
		<SafeAreaView>
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
				<View className={`px-3 sm:px-4 pb-2 ${Platform.OS === "web" || Platform.OS === "android" ? "" : "mb-24"}`}>
					{openDepositModal ? (
						<></>
					) : (
						<>
							<ScrollView className="pt-14">
								<BackButton onClick={handleGoBack} />
								<View className={`relative mt-4 flex gap-y-4 ${Platform.OS === "android" ? "mb-40" : "mb-24"}`}>
									{/* ETF Price and Graph Section */}
									<ETFPriceAndGraph vault={farm} />
									<YourBalance farm={farm} />

									<ETFInfo ETF_VAULT={farm} isSmallScreen={isSmallScreen} />
									<Transactions farmId={farm.id} />
								</View>
							</ScrollView>

							<View
								className={`flex flex-row gap-2 justify-center items-center w-full mx-auto ${
									Platform.OS === "web"
										? "fixed left-0 right-0 bottom-6 max-w-[600px] md:left-[calc(16.67%+0.5rem)] md:right-4 sm:left-4 sm:right-4"
										: "absolute bottom-8 left-4 right-4"
								}`}
							>
								{isConnecting || isLoading ? (
									<>{Number(withdrawable?.amount || "0") > 0 && <Skeleton w="100%" h={72} bRadius={40} className="flex-1" />}</>
								) : (
									<>
										<ActionButton
											onPress={handleDepositPress}
											text={depositButtonText}
											className="bg-buttonPrimaryLight w-[80%] md:w-full py-5 px-4 text-xl font-bold tracking-widest rounded-[40px] uppercase text-center self-center"
										/>

										{Number(withdrawable?.amount || "0") > 0 && (
											<ActionButton
												onPress={handleWithdrawPress}
												text={withdrawButtonText}
												className="bg-bgDark border border-gradientPrimary text-gradientPrimary w-[80%] md:w-full py-5 px-4 text-xl font-bold tracking-widest rounded-[40px] uppercase text-center"
												disabled={!currentWallet}
											/>
										)}
									</>
								)}
							</View>
						</>
					)}
				</View>
			</View>
			<FarmActionModal open={openDepositModal} setOpen={setOpenDepositModal} farm={farm} />
			{/* Login Modal */}
			{/* only for mobile app */}
			{showLoginModal && connectWallet && (
				// @ts-ignore
				<LoginModal visible={showLoginModal} onClose={() => setShowLoginModal(false)} connectWallet={connectWallet} />
			)}
		</SafeAreaView>
	);
};
