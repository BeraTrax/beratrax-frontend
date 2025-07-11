import { TrendUpIcon } from "@beratrax/ui/src/icons/TrendUp";
import { RocketIcon } from "@beratrax/ui/src/icons/Rocket";
import { CreatedIcon } from "@beratrax/ui/src/icons/Created";
import { VolumeIcon } from "@beratrax/ui/src/icons/Volume";
import { MarketCapIcon } from "@beratrax/ui/src/icons/MarketCap";
import { View, Image, Text, Platform, useWindowDimensions, Pressable, Linking } from "react-native";

// Import for web
import flywheelImageWeb from "@beratrax/core/src/assets/images/flywheelChart.png";
import flywheelImageMobile from "@beratrax/core/src/assets/images/flywheelChartMobile.png";
import { customCommify } from "@beratrax/core/src/utils/common";
import { useMemo } from "react";
import { useFarmApy } from "@beratrax/core/src/state/farms/hooks";
import { toFixedFloor } from "@beratrax/core/src/utils/common";
import { PoolDef, tokenNamesAndImages } from "@beratrax/core/src/config/constants/pools_json";
import { FarmType, FarmOriginPlatform } from "@beratrax/core/src/types/enums";

const getImageSource = () => {
	if (Platform.OS === "web") {
		if (typeof window !== "undefined" && window.innerWidth <= 768) {
			return flywheelImageMobile;
		}
		return flywheelImageWeb;
	} else {
		return require("@beratrax/core/src/assets/images/flywheelChartMobile.png");
	}
};

const StatInfo = ({
	iconUrl,
	title,
	subtitle,
	value,
	isStatLoading,
}: {
	iconUrl: string | React.ReactNode;
	title: string;
	value: number | string;
	subtitle?: string;
	isStatLoading?: boolean;
}) => {
	return (
		<View className="flex flex-row items-center gap-4 bg-bgDark py-4 px-4 mt-2 rounded-2xl backdrop-blur-lg">
			{typeof iconUrl === "string" ? (
				<Image source={{ uri: iconUrl }} accessibilityLabel={title} className="flex-shrink-0 flex-grow-0 w-10 h-10" />
			) : (
				iconUrl
			)}
			<View className={"flex-1"}>
				<Text className="text-textWhite text-lg font-medium font-league-spartan">{title}</Text>
				{subtitle && <Text className="text-textSecondary text-[16px] font-light">{subtitle}</Text>}
			</View>
			{isStatLoading ? (
				<View className="h-7 w-32 bg-gray-700 rounded animate-pulse" />
			) : (
				<Text className="text-textWhite text-lg font-medium font-league-spartan">{value}</Text>
			)}
		</View>
	);
};
interface IProps {
	farm: PoolDef;
	marketCap: string;
	vaultTvl: string;
	marketCapLoading?: boolean;
	vaultTvlLoading?: boolean;
}
const PoolInfo = ({ farm, marketCap, vaultTvl, marketCapLoading, vaultTvlLoading }: IProps) => {
	const createdDate = new Date((farm.createdAt ?? 0) * 1000);
	const createdDateString = createdDate.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	const { originPlatform, token_type: tokenType, token1, token2, token3, isAutoCompounded, description, source } = farm;
	const { apy: farmApys } = useFarmApy(farm);
	const isSyntheticFarm = farm.synthetic;

	const _underlyingApy = useMemo(() => {
		return toFixedFloor((farm.isUpcoming ? farm.total_apy : farmApys?.feeApr + farmApys?.rewardsApr) || 0, 2);
	}, [farmApys]);
	const underlyingApy = useMemo(() => {
		return farm.isCurrentWeeksRewardsVault ? "??? " : customCommify(_underlyingApy, { minimumFractionDigits: 0 });
	}, [farm.isCurrentWeeksRewardsVault, _underlyingApy]);
	const underlyingApyWithPoints = useMemo(() => {
		return farmApys.pointsApr > 0 ? customCommify(_underlyingApy + farmApys?.pointsApr, { minimumFractionDigits: 0 }) + "%" : 0;
	}, [farmApys, _underlyingApy]);

	const _beratraxApy = useMemo(() => {
		return toFixedFloor((farm.isUpcoming ? farm.total_apy : farmApys?.apy) || 0, 2);
	}, [farmApys, farm.isCurrentWeeksRewardsVault, farm.isUpcoming, farm.total_apy]);

	const beraTraxApy = useMemo(() => {
		return farm.isCurrentWeeksRewardsVault ? "??? " : customCommify(_beratraxApy, { minimumFractionDigits: 0 });
	}, [farm.isCurrentWeeksRewardsVault, _beratraxApy]);
	const beraTraxApyWithPoints = useMemo(() => {
		return farmApys.pointsApr > 0 ? customCommify(_beratraxApy + farmApys?.pointsApr, { minimumFractionDigits: 0 }) + "%" : 0;
	}, [farmApys, _beratraxApy]);

	const showFlywheelChart = farm.originPlatform === FarmOriginPlatform.Infrared.name && farm.id !== 7;

	const token1Image = tokenNamesAndImages[token1]?.logos[0];
	const token2Image = token2 ? tokenNamesAndImages[token2]?.logos[0] : null;
	const token3Image = token3 ? tokenNamesAndImages[token3]?.logos[0] : null;
	const honeyLogo = tokenNamesAndImages["0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce"]?.logos[0];
	const wberaLogo = tokenNamesAndImages["0x6969696969696969696969696969696969696969"]?.logos[0];
	const ibgtLogo = tokenNamesAndImages["0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b"]?.logos[0];
	const lbgtLogo = tokenNamesAndImages["0xBaadCC2962417C01Af99fb2B7C75706B9bd6Babe"]?.logos[0];
	const smileeLogo = "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/smilee/logo.png";

	const { width } = useWindowDimensions();

	return (
		<View className=" mt-4 relative">
			{description && (
				<>
					<Text className="text-textWhite font-arame-mono font-normal text-[16px] leading-[18px] tracking-widest">ABOUT</Text>
					<Text className="text-textWhite mt-2 text-[16px] font-light font-league-spartan">{description}</Text>
					{isSyntheticFarm && (
						<>
							<Text className="text-textWhite mt-2 text-[16px] font-light font-league-spartan">
								Synthetic Reward Vaults are deposits into Rewards Vaults where the BGT is always claimed as a BGT liquid wrapper and
								autocompound. BeraTrax always claims the BGT wrapper that is the highest price that minute. The current wrappers that are
								supported for compounding:
							</Text>
							<View className="mt-4 overflow-hidden rounded-xl bg-bgSecondary">
								<View className="w-full">
									<View className="flex-row border-b border-gray-700">
										<View className="flex-1 p-4">
											<View className="flex-row items-center gap-2">
												<Image
													source={{ uri: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/ybgt/logo.png" }}
													accessibilityLabel="yBGT"
													className="w-6 h-6"
												/>
												<Text className="text-textWhite font-bold">yBGT</Text>
											</View>
										</View>
										<View className="p-4 justify-center">
											<Text className="text-textWhite">Yearn BGT</Text>
										</View>
									</View>
									<View className="flex-row">
										<View className="flex-1 p-4">
											<View className="flex-row items-center gap-2">
												<Image
													source={{
														uri: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0xBaadCC2962417C01Af99fb2B7C75706B9bd6Babe/logo.png",
													}}
													accessibilityLabel="lBGT"
													className="w-6 h-6"
												/>
												<Text className="text-textWhite font-bold">LBGT</Text>
											</View>
										</View>
										<View className="p-4 justify-center">
											<Text className="text-textWhite">Liquid BGT</Text>
										</View>
									</View>
								</View>
							</View>
						</>
					)}
					<Text className="text-textWhite mt-4 text-[16px] font-light font-league-spartan">
						You can see the underlying vault on the platform{" "}
						<Pressable onPress={() => Linking.openURL(source!)} className="text-gradientPrimary uppercase hover:underline">
							<Text className="text-gradientPrimary uppercase hover:underline">here</Text>
						</Pressable>
						.
					</Text>
				</>
			)}
			{showFlywheelChart && (
				<View className="w-full overflow-hidden">
					<Image
						// @ts-ignore - Platform-specific image handling
						source={getImageSource()}
						style={Platform.OS === "web" ? { width: "100%", aspectRatio: width > 768 ? 16 / 9 : 4 / 3 } : { width: "100%", height: 250 }}
						resizeMode="contain"
					/>
				</View>
			)}
			<View className="mt-6 mb-6">
				<Text className="text-textWhite font-arame-mono font-normal text-[16px] leading-[18px] tracking-widest mb-4">
					REWARDS BREAKDOWN
				</Text>
				<View className="overflow-hidden rounded-xl bg-bgSecondary">
					<View className="w-full">
						{tokenType === FarmType.advanced && (
							<View className="flex-row border-b border-gray-700">
								<View className="flex-1 p-4">
									<View className="flex-row items-center">
										<View className="flex-row -space-x-2.5 mr-2">
											{token1Image && <Image source={{ uri: token1Image }} alt={token1} className="w-5 h-5 relative z-30" />}
											{token2Image && <Image source={{ uri: token2Image }} alt={token2} className="w-5 h-5 relative z-20" />}
											{token3Image && <Image source={{ uri: token3Image }} alt={token3} className="w-5 h-5 relative z-10" />}
										</View>
										<Text className="text-textWhite text-base font-league-spartan">LP Trading fees</Text>
									</View>
								</View>
								<View className="p-4">
									<Text className="text-gradientPrimary font-bold text-right text-base font-league-spartan">Included in APY</Text>
								</View>
							</View>
						)}

						{(isAutoCompounded || originPlatform === FarmOriginPlatform.Burrbear.name) && (
							<View className="flex-row border-b border-gray-700">
								<View className="flex-1 p-4">
									<View className="flex-row items-center gap-2">
										{originPlatform === FarmOriginPlatform.Infrared.name && tokenType === FarmType.advanced ? (
											<>
												<Image source={{ uri: ibgtLogo }} accessibilityLabel="iBGT" className="w-5 h-5" />
												<Text className="text-textWhite text-base font-league-spartan">iBGT</Text>
											</>
										) : originPlatform === FarmOriginPlatform.Burrbear.name || originPlatform === FarmOriginPlatform.BeraPaw.name ? (
											<>
												{farm.id === 22 ? (
													<>
														<Image source={{ uri: wberaLogo }} accessibilityLabel="WBERA" className="w-5 h-5" />
														<Text className="text-textWhite text-base font-league-spartan">WBERA</Text>
													</>
												) : (
													<>
														<Image source={{ uri: lbgtLogo }} accessibilityLabel="LBGT" className="w-5 h-5" />
														<Text className="text-textWhite text-base font-league-spartan">LBGT</Text>
													</>
												)}
											</>
										) : (
											<>
												{farm.id === 45 ? (
													<>
														<Image source={{ uri: FarmOriginPlatform.BeraTrax.logo }} accessibilityLabel="BTX" className="w-5 h-5" />
														<Text className="text-textWhite text-base font-league-spartan">TRAX</Text>
													</>
												) : (
													<>
														<Image source={{ uri: honeyLogo }} accessibilityLabel="HONEY" className="w-5 h-5" />
														<Text className="text-textWhite text-base font-league-spartan">HONEY</Text>
													</>
												)}
											</>
										)}
									</View>
								</View>
								<View className="p-4">
									<Text className="text-gradientPrimary font-bold text-right text-base font-league-spartan">Autocompounded to APY</Text>
								</View>
							</View>
						)}

						{originPlatform === FarmOriginPlatform.BeraPaw.name && farm.secondary_platform == null && (
							<View className="flex-row border-b border-gray-700">
								<View className="flex-1 p-4">
									<View className="flex-row items-center gap-2">
										<Image source={{ uri: FarmOriginPlatform.BeraPaw.logo }} accessibilityLabel="Berapaw" className="w-5 h-5" />
										<Text className="text-textWhite text-base font-league-spartan">pPAW</Text>
									</View>
								</View>
								<View className="p-4">
									<Text className="text-gradientPrimary font-bold text-right text-base font-league-spartan">Future claim</Text>
								</View>
							</View>
						)}

						{originPlatform === FarmOriginPlatform.Bearn.name && (
							<View className="flex-row border-b border-gray-700">
								<View className="flex-1 p-4">
									<View className="flex-row items-center gap-2">
										<Image source={{ uri: FarmOriginPlatform.Bearn.logo }} accessibilityLabel="Bearn" className="w-5 h-5" />
										<Text className="text-textWhite text-base font-league-spartan">Bearn airdrop</Text>
									</View>
								</View>
								<View className="p-4">
									<Text className="text-gradientPrimary font-bold text-right text-base font-league-spartan">Future claim</Text>
								</View>
							</View>
						)}

						{originPlatform === FarmOriginPlatform.Infrared.name && (
							<View className="flex-row border-b border-gray-700">
								<View className="flex-1 p-4">
									<View className="flex-row items-center gap-2">
										<Image source={{ uri: FarmOriginPlatform.Infrared.logo }} accessibilityLabel="Infrared" className="w-5 h-5" />
										<Text className="text-textWhite text-base font-league-spartan">Infrared airdrop</Text>
									</View>
								</View>
								<View className="p-4">
									<Text className="text-gradientPrimary font-bold text-right text-base font-league-spartan">Future claim</Text>
								</View>
							</View>
						)}

						{originPlatform === FarmOriginPlatform.Burrbear.name && (
							<>
								{farm.name.includes("wgBERA") && (
									<View className="flex-row border-b border-gray-700">
										<View className="flex-1 p-4">
											<View className="flex-row items-center gap-2">
												<Image source={{ uri: smileeLogo }} accessibilityLabel="Smilee" className="w-5 h-5" />
												<Text className="text-textWhite text-base font-league-spartan">Love Score airdrop</Text>
											</View>
										</View>
										<View className="p-4">
											<Text className="text-gradientPrimary font-bold text-right text-base font-league-spartan">
												Non-compounding APR (Future Claim)
											</Text>
										</View>
									</View>
								)}
								<View className="flex-row border-b border-gray-700">
									<View className="flex-1 p-4">
										<View className="flex-row items-center gap-2">
											<Image source={{ uri: FarmOriginPlatform.Burrbear.logo }} accessibilityLabel="Burrbear" className="w-5 h-5" />
											<Text className="text-textWhite text-base font-league-spartan">BURR Points (Burrbear Airdrop)</Text>
										</View>
									</View>
									<View className="p-4">
										<Text className="text-gradientPrimary font-bold text-right text-base font-league-spartan">
											Non-compounding APR (Future Claim)
										</Text>
									</View>
								</View>
								{farm.id !== 24 && farm.id !== 51 && (
									<View className="flex-row border-b border-gray-700">
										<View className="flex-1 p-4">
											<View className="flex-row items-center gap-2">
												<Image source={{ uri: FarmOriginPlatform.Beraborrow.logo }} accessibilityLabel="Beraborrow" className="w-5 h-5" />
												<Text className="text-textWhite text-base font-league-spartan">Pollen Points (Beraborrow Airdrop)</Text>
											</View>
										</View>
										<View className="p-4">
											<Text className="text-gradientPrimary font-bold text-right text-base font-league-spartan">
												4x Pollen Points (Future Claim)
											</Text>
										</View>
									</View>
								)}
							</>
						)}

						<View className="flex-row">
							<View className="flex-1 p-4">
								<View className="flex-row items-center gap-2">
									<Image source={{ uri: FarmOriginPlatform.BeraTrax.logo }} accessibilityLabel="BTX" className="w-5 h-5" />
									<Text className="text-textWhite text-base font-league-spartan">BTX Points (BeraTrax Airdrop)</Text>
								</View>
							</View>
							<View className="p-4">
								<Text className="text-gradientPrimary font-bold text-right text-base font-league-spartan">Future claim</Text>
							</View>
						</View>
					</View>
				</View>
			</View>

			<View className="mt-4 flex flex-col gap-2">
				<StatInfo title="Market cap" value={marketCap} iconUrl={<MarketCapIcon />} isStatLoading={marketCapLoading} />
				<StatInfo title="Vault Liquidity" value={vaultTvl} iconUrl={<VolumeIcon />} isStatLoading={vaultTvlLoading} />

				<StatInfo title={!isAutoCompounded ? "BeraTrax APY" : "Underlying APR"} value={underlyingApy + "%"} iconUrl={<TrendUpIcon />} />
				{underlyingApyWithPoints ? (
					<StatInfo
						title={!isAutoCompounded ? "BeraTrax APY with Points" : "Underlying APR with Points"}
						value={underlyingApyWithPoints}
						iconUrl={<TrendUpIcon />}
					/>
				) : null}

				{isAutoCompounded ? <StatInfo title="BeraTrax auto-compounded APY" value={beraTraxApy + "%"} iconUrl={<RocketIcon />} /> : null}

				{isAutoCompounded && beraTraxApyWithPoints ? (
					<StatInfo title="BeraTrax APY with Points" value={beraTraxApyWithPoints} iconUrl={<RocketIcon />} />
				) : null}
				{farmApys.merklApr > 0 && (
					<StatInfo title="Additional Merkl APR" value={farmApys.merklApr?.toFixed(2) || "0" + "%"} iconUrl={<RocketIcon />} />
				)}
				{farm.createdAt && <StatInfo title="Created On" value={createdDateString} iconUrl={<CreatedIcon />} />}
			</View>
		</View>
	);
};

export default PoolInfo;
