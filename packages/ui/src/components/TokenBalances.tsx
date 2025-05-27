import { useWallet } from "@beratrax/core/src/hooks";
import { useAppSelector } from "@beratrax/core/src/state";
import useTokens, { UIStateEnum } from "@beratrax/core/src/state/tokens/useTokens";
import { Token } from "@beratrax/core/src/types";
import { CHAIN_ID } from "@beratrax/core/src/types/enums";
import { FC, useCallback, useMemo, useState } from "react";
import { View, Text, Image, TouchableOpacity, Platform, ScrollView } from "react-native";
import { Skeleton } from "./Skeleton/Skeleton";
import { zeroAddress } from "viem";
import { useApp } from "@beratrax/core/src/hooks";
import { TransferToken } from "./modals/TransferToken/TransferToken";

const tokenCardStyle =
	"relative group grid grid-cols-[max-content_1fr_max-content] items-center gap-4 py-4 px-4  rounded-3xl cursor-pointer bg-bgDark transition-all duration-300 hover:pr-14 font-league-spartan";

const mobileTokenCardStyle = "flex-row items-center p-6 bg-bgDark rounded-3xl mb-4";

const tokenCardHoverArrowStyles =
	"absolute right-0 top-0 bottom-0 flex items-center justify-center w-10 rounded-r-3xl bg-bgPrimary text-textBlack font-bold text-2xl opacity-0 group-hover:opacity-100 transition-all duration-300";

const containerClass =
	"grid gap-4 grid-cols-[repeat(auto-fit,minmax(250px,400px))] mobile:grid-cols-1 xlMobile:grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3";

interface IProps {}

export const TokenBalances: FC<IProps> = () => {
	const { lightMode } = useApp();
	const [selectedToken, setSelectedToken] = useState<Token>();
	const showTokenDetailedBalances = useAppSelector((state) => state.settings.showTokenDetailedBalances);
	const { balances, isBalancesLoading: balancesLoading, isPricesLoading: pricesLoading, tokens, lpTokens, UIState } = useTokens();
	const isWeb = Platform.OS === "web";

	const filteredLpTokens = useMemo(() => {
		return lpTokens.filter((t) => Number(t.usdBalance) > 0.01 && t.address !== "0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b");
	}, [lpTokens]);

	const { isConnecting } = useWallet();
	const isLoading = balancesLoading || pricesLoading || isConnecting;

	const handleCloseModal = useCallback(() => setSelectedToken(undefined), [setSelectedToken]);
	const ethBalance = balances[CHAIN_ID.BERACHAIN]?.[zeroAddress];

	const filteredTokens = useMemo(() => {
		return tokens
			.filter((item) => {
				if (Number(item.usdBalance) < 0.01) return false;
				if (item.name === "BERA") return false;
				return true;
			})
			.map((e) => ({ ...e, isTransferable: e.name !== "BGT" }));
	}, [tokens, showTokenDetailedBalances]);

	const beraToken = tokens.find((token) => token.address == zeroAddress);

	// Function to render Token Card
	const renderTokenCard = (token: Token & { isTransferable?: boolean }, index: string | number, isBera = false) => {
		const beraLogoUrl =
			"https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x7507c1dc16935B82698e4C63f2746A2fCf994dF8/logo.png";
		const tokenValue = isBera ? ethBalance?.valueUsdFormatted : token.name !== "BTX" && token.usdBalance;
		const tokenBalance = isBera ? ethBalance?.valueFormatted || 0 : token.balance;

		return (
			<TouchableOpacity
				key={index}
				className={isWeb ? tokenCardStyle : mobileTokenCardStyle}
				onPress={() => token.isTransferable && setSelectedToken(token)}
			>
				{/* Token Logo */}
				<View className="relative">
					<Image className="w-9 h-9 rounded-full" source={{ uri: isBera ? beraLogoUrl : token.logo }} />
					{!isBera && (
						<Image
							className={isWeb ? "w-3.5 h-3.5 rounded-full absolute top-4 left-6" : "w-3.5 h-3.5 rounded-full absolute right-0 bottom-0"}
							source={{ uri: `https://github.com/BeraTrax/tokens/blob/main/chains/${token.networkId}.png?raw=true` }}
						/>
					)}
				</View>

				{/* Token Details */}
				<View className={"flex-1 ml-4"}>
					<Text className="text-lg text-white font-league-spartan">{token.name}</Text>
					<Text className="text-base text-textSecondary">{tokenBalance}</Text>
				</View>

				{/* USD Balance */}
				<Text className="text-lg text-white">${tokenValue}</Text>

				{token.isTransferable && (
					<View className={tokenCardHoverArrowStyles}>
						<Text className="text-textBlack text-lg font-bold text-center">&gt;</Text>
					</View>
				)}
			</TouchableOpacity>
		);
	};

	const renderLpTokenCard = (token: Token & { network?: string; logo2?: string }, index: number) => {
		return (
			<TouchableOpacity key={index} className={isWeb ? tokenCardStyle : mobileTokenCardStyle} onPress={() => setSelectedToken(token)}>
				{/* LP Token Logos */}
				<View className={"flex flex-row"}>
					<Image className="w-9 h-9 rounded-full" source={{ uri: token.logo }} />
					{token.logo2 && <Image className="w-9 h-9 rounded-full -ml-3" source={{ uri: token.logo2 }} />}
				</View>
				{/* Token Details */}
				<View className="flex-1 ml-4">
					<Text className="text-lg text-white font-league-spartan">
						{token.name}
						{token.network && <Text className="ml-1 text-sm font-normal text-textPrimary">{token.network}</Text>}
					</Text>
					<Text className="text-base text-textSecondary">{token.balance}</Text>
				</View>
				{/* USD Balance */}
				<Text className="text-lg text-white">${token.usdBalance}</Text>
				{/* Arrow Icon */}
				<View className={tokenCardHoverArrowStyles}>
					<Text className="text-textBlack text-lg font-bold text-center">&gt;</Text>
				</View>
			</TouchableOpacity>
		);
	};

	if (isLoading) {
		return (
			<View>
				<Text className="font-arame-mono font-normal text-[16px] text-textWhite leading-4 uppercase mt-5">Token Balances</Text>
				<View className={containerClass}>
					{[...Array(3)].map((_, index) => (
						<View
							key={index}
							className="py-6 px-4 rounded-3xl gap-4 bg-bgDark justify-between grid grid-cols-[max-content_1fr_max-content] items-center font-league-spartan"
						>
							<View className="relative">
								<Skeleton w={36} h={36} />
							</View>
							<View>
								<Skeleton w={100} h={24} />
								<Skeleton w={60} h={20} className="mt-1" />
							</View>
							<View>
								<Skeleton w={80} h={24} />
							</View>
						</View>
					))}
				</View>
			</View>
		);
	}

	return (
		<View className="flex-1 mb-5 mt-5">
			<View className="mb-5">
				<Text className={"font-arame-mono text-base text-textWhite leading-4 uppercase mb-5 tracking-widest"}>Token Balances</Text>
				{/* <Settings /> */}
			</View>

			{UIState === UIStateEnum.CONNECT_WALLET && (
				<View className={isWeb ? "flex justify-center items-center py-12" : "items-center justify-center pt-[50px] pb-[50px]"}>
					<Text className="text-white text-center">Sign in/up to view your balances</Text>
				</View>
			)}

			{UIState === UIStateEnum.LOADING && (
				<Skeleton w={"100%"} h={150} bg={lightMode ? "#ffffff" : undefined} bRadius={20} inverted={true} />
			)}

			{UIState === UIStateEnum.NO_TOKENS && ethBalance?.valueWei === "0" && (
				<View className={isWeb ? "flex justify-center items-center py-12" : "items-center justify-center pt-[50px] pb-[50px]"}>
					<Text className="text-white text-center">Get some Bera or Honey on Kodiak to start earning.</Text>
				</View>
			)}

			{(UIState === UIStateEnum.SHOW_TOKENS_TOKENS || UIState === UIStateEnum.SHOW_TOKENS) && (
				<View className={isWeb ? containerClass : "w-full"}>
					{!showTokenDetailedBalances && beraToken && renderTokenCard(beraToken, "bera", true)}
					{filteredTokens.map((token, i) => renderTokenCard(token, i))}
				</View>
			)}

			{(UIState === UIStateEnum.SHOW_TOKENS_LP || UIState === UIStateEnum.SHOW_TOKENS) && filteredLpTokens.length > 0 && (
				<View className="mt-5">
					<Text className={"font-arame-mono text-base text-textWhite leading-4 uppercase mb-5 tracking-widest"}>
						Unstaked LP Token Balances
					</Text>
					<View className={isWeb ? containerClass : "w-full"}>{filteredLpTokens.map((token, i) => renderLpTokenCard(token, i))}</View>
				</View>
			)}
			{selectedToken ? <TransferToken token={selectedToken} handleClose={handleCloseModal} /> : null}
		</View>
	);
};
