import Tokendetailspageleftsideleaves from "@beratrax/core/src/assets/images/tokendetailspageleftsideleaves.svg";
import Tokendetailspagestoprightleaves from "@beratrax/core/src/assets/images/tokendetailspagestoprightleaves.svg";
import { IS_LEGACY } from "@beratrax/core/src/config/constants";
import { PoolDef } from "@beratrax/core/src/config/constants/pools_json";
import { useDetailInput, useWallet } from "@beratrax/core/src/hooks";
import { useAppDispatch, useAppSelector } from "@beratrax/core/src/state";
import { setFarmDetailInputOptions } from "@beratrax/core/src/state/farms/farmsReducer";
import { useFarmApy } from "@beratrax/core/src/state/farms/hooks";
import { FarmDetailInputOptions } from "@beratrax/core/src/state/farms/types";
import useTokens from "@beratrax/core/src/state/tokens/useTokens";
import { FarmOriginPlatform, FarmTransactionType } from "@beratrax/core/src/types/enums";
import { formatCurrency, toFixedFloor } from "@beratrax/core/src/utils/common";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import BackButton from "ui/src/components/BackButton/BackButton";
import { Skeleton } from "ui/src/components/Skeleton/Skeleton";
import { SvgImage } from "ui/src/components/SvgImage/SvgImage";
import FarmActionModal from "./FarmActionModal/FarmActionModal";
import PoolInfo from "./PoolInfo/PoolInfo";
import TokenPriceAndGraph from "./TokenPriceAndGraph/TokenPriceAndGraph";
import YourBalance from "./YourBalance/YourBalance";
import { View, Text, Pressable, ScrollView, Platform } from "react-native";

export const FarmActionView: React.FC<{ farm: PoolDef }> = ({ farm }) => {
	const dispatch = useAppDispatch();
	const { currentWallet, isConnecting } = useWallet();
	const { openConnectModal } = useConnectModal();
	const { apy: farmApys } = useFarmApy(farm);
	const {
		isBalancesLoading: isLoading,
		prices: {
			[farm.chainId]: { [farm.vault_addr]: vaultPrice },
		},
		totalSupplies,
		isTotalSuppliesLoading,
	} = useTokens();
	const [marketCap, setMarketCap] = useState<string | null>(null);
	const [vaultTvl, setVaultTvl] = useState<string | null>(null);
	const isMarketCapAndVaultLoading = isTotalSuppliesLoading || marketCap === null || vaultTvl === null || marketCap === "0";

	const router = useRouter();
	const { withdrawable, isLoadingFarm } = useDetailInput(farm);

	const [openDepositModal, setOpenDepositModal] = useState(false);

	const transactionType = useAppSelector((state) =>
		IS_LEGACY ? FarmTransactionType.Withdraw : state.farms.farmDetailInputOptions.transactionType
	);

	useEffect(() => {
		(async () => {
			try {
				if (Number(vaultPrice) > 0) {
					setMarketCap(formatCurrency(Number(totalSupplies[farm.chainId][farm.lp_address].supplyUsd)));
					setVaultTvl(formatCurrency(Number(totalSupplies[farm.chainId][farm.vault_addr].supplyUsd)));
				}
			} catch (error) {
				console.log(error);
			}
		})();
	}, [totalSupplies]);

	const setFarmOptions = (opt: Partial<FarmDetailInputOptions>) => {
		dispatch(setFarmDetailInputOptions(opt));
		setOpenDepositModal(true);
	};

	const handleGoBack = () => {
		if (Platform.OS === "web") {
			// Use browser history on web
			window.history.back();
		} else {
			// Use router.back() on mobile
			router.back();
		}
	};

	return (
		<>
			<View className={`flex-1 w-full bg-bgSecondary relative ${Platform.OS === "web" ? "" : "min-h-screen"}`}>
				<View className={`${Platform.OS === "web" ? "fixed" : "absolute"} top-[45%]`}>
					<SvgImage source={Tokendetailspageleftsideleaves} height={200} width={200} />
				</View>
				<View className={`${Platform.OS === "web" ? "fixed" : "absolute"} right-0 top-0`}>
					<SvgImage source={Tokendetailspagestoprightleaves} height={200} width={200} />
				</View>
				<View className={`px-4 pb-2 ${Platform.OS === "web" || Platform.OS === "android" ? "" : "mb-24"}`}>
					{openDepositModal ? (
						<></>
					) : (
						<>
							<ScrollView className="pt-14">
								<BackButton onClick={handleGoBack} />
								<View className={`relative mt-4 ${Platform.OS === "android" ? "mb-40" : "mb-24"}`}>
									<TokenPriceAndGraph farm={farm} />
									<YourBalance farm={farm} />
									<PoolInfo
										marketCap={`$${marketCap}`}
										vaultTvl={`$${vaultTvl}`}
										marketCapLoading={isMarketCapAndVaultLoading}
										vaultTvlLoading={isMarketCapAndVaultLoading}
										farm={farm}
									/>
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
										<Pressable
											className="flex-1"
											onPress={() => {
												!currentWallet
													? openConnectModal && openConnectModal()
													: !IS_LEGACY && setFarmOptions({ transactionType: FarmTransactionType.Deposit });
											}}
										>
											<Text className="bg-buttonPrimaryLight w-full py-5 px-4 text-xl font-bold tracking-widest rounded-[40px] uppercase text-center">
												{!currentWallet ? "Sign In/ Up to Deposit" : FarmTransactionType.Deposit}
											</Text>
										</Pressable>

										{Number(withdrawable?.amount || "0") > 0 && (
											<Pressable
												className="flex-1"
												disabled={!currentWallet}
												onPress={() => {
													!IS_LEGACY &&
														setFarmOptions({
															transactionType: FarmTransactionType.Withdraw,
														});
												}}
											>
												<Text className="bg-bgDark border border-gradientPrimary text-gradientPrimary w-full py-5 px-4 text-xl font-bold tracking-widest rounded-[40px] uppercase text-center">
													{FarmTransactionType.Withdraw}
												</Text>
											</Pressable>
										)}
									</>
								)}
							</View>
						</>
					)}
				</View>
			</View>
			<FarmActionModal open={openDepositModal} setOpen={setOpenDepositModal} farm={farm} />
		</>
	);
};
