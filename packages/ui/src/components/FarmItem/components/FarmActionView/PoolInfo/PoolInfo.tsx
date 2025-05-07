import { TrendUpIcon } from "@beratrax/ui/src/icons/TrendUp";
import { RocketIcon } from "@beratrax/ui/src/icons/Rocket";
import { CreatedIcon } from "@beratrax/ui/src/icons/Created";
import { VolumeIcon } from "@beratrax/ui/src/icons/Volume";
import { MarketCapIcon } from "@beratrax/ui/src/icons/MarketCap";
import { View, Image, Text, Platform } from "react-native";
import { Link } from "expo-router";

// Import for web
import flywheelImageWeb from "@beratrax/core/src/assets/images/flywheelChart.png";
import flywheelImageMobile from "@beratrax/core/src/assets/images/flywheelChartMobile.png";
import { customCommify } from "@beratrax/core/src/utils/common";
import { useMemo } from "react";
import { useFarmApy } from "@beratrax/core/src/state/farms/hooks";
import { toFixedFloor } from "@beratrax/core/src/utils/common";
import { PoolDef, tokenNamesAndImages } from "@beratrax/core/src/config/constants/pools_json";
import { FarmType } from "@beratrax/core/src/types/enums";
import { FarmOriginPlatform } from "@beratrax/core/src/types/enums";

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
			{typeof iconUrl === "string" ? <Image src={iconUrl} alt={title} className="flex-shrink-0 flex-grow-0 w-10 h-10" /> : iconUrl}
			<View className={"flex-1"}>
				<Text className="text-textWhite text-lg font-medium">{title}</Text>
				{subtitle && <Text className="text-textSecondary text-[16px] font-light">{subtitle}</Text>}
			</View>
			{isStatLoading ? (
				<View className="h-7 w-32 bg-gray-700 rounded animate-pulse" />
			) : (
				<Text className="text-textWhite text-lg font-medium">{value}</Text>
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
	const createdTimestamp = 1739292658;
	const createdDate = new Date(createdTimestamp * 1000);
	const createdDateString = createdDate.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	const { originPlatform, token_type: tokenType, token1, token2, token3, isAutoCompounded, description, source } = farm;
	const { apy: farmApys } = useFarmApy(farm);

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

	const showFlywheelChart = farm.originPlatform === FarmOriginPlatform.Infrared && farm.id !== 7;

	const token1Image = tokenNamesAndImages[token1]?.logos[0];
	const token2Image = token2 ? tokenNamesAndImages[token2]?.logos[0] : null;
	const token3Image = token3 ? tokenNamesAndImages[token3]?.logos[0] : null;
	const honeyLogo = tokenNamesAndImages["0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce"]?.logos[0];
	const wberaLogo = tokenNamesAndImages["0x6969696969696969696969696969696969696969"]?.logos[0];
	const ibgtLogo = tokenNamesAndImages["0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b"]?.logos[0];
	const lbgtLogo = tokenNamesAndImages["0xBaadCC2962417C01Af99fb2B7C75706B9bd6Babe"]?.logos[0];
	const infraredLogo = "https://raw.githubusercontent.com/BeraTrax/tokens/main/logos/platform-logos/infrared/infrared.ico";
	const burrbearLogo = "https://raw.githubusercontent.com/BeraTrax/tokens/main/logos/platform-logos/burrbear/burrbear.ico";
	const beraborrowLogo = "https://raw.githubusercontent.com/BeraTrax/tokens/main/logos/platform-logos/beraborrow/beraborrow.ico";
	const btxLogo = "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/btx/logo.png";

	return (
		<View className=" mt-4 relative">
			{description && (
				<>
					<Text className="text-textWhite font-arame-mono font-normal text-[16px] leading-[18px] tracking-widest">ABOUT</Text>
					<Text className="text-textWhite mt-2 text-[16px] font-light">{description}</Text>
					<Text className="text-textWhite mt-4 text-[16px] font-light">
						You can see the underlying vault on the platform{" "}
						<Link href={source!} target="_blank" className="text-gradientPrimary uppercase hover:underline">
							here
						</Link>
						.
					</Text>
				</>
			)}
			{showFlywheelChart && (
				<Image
					// @ts-ignore - Platform-specific image handling
					source={getImageSource()}
					style={{ width: "100%", height: "auto", aspectRatio: window?.innerWidth > 768 ? 16 / 9 : 1 }}
					resizeMode="contain"
				/>
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
										<Text className="text-textWhite font-medium">LP Trading fees</Text>
									</View>
								</View>
								<View className="p-4">
									<Text className="text-gradientPrimary font-bold text-right">Included in APY</Text>
								</View>
							</View>
						)}

						{(isAutoCompounded || originPlatform === FarmOriginPlatform.Burrbear) && (
							<View className="flex-row border-b border-gray-700">
								<View className="flex-1 p-4">
									<View className="flex-row items-center gap-2">
										{originPlatform === FarmOriginPlatform.Infrared && tokenType === FarmType.advanced ? (
											<>
												<Image source={{ uri: ibgtLogo }} alt="iBGT" className="w-5 h-5" />
												<Text className="text-textWhite font-medium">iBGT</Text>
											</>
										) : originPlatform === FarmOriginPlatform.Burrbear || originPlatform === FarmOriginPlatform.BeraPaw ? (
											<>
												{farm.id === 22 ? (
													<>
														<Image source={{ uri: wberaLogo }} alt="WBERA" className="w-5 h-5" />
														<Text className="text-textWhite font-medium">WBERA</Text>
													</>
												) : (
													<>
														<Image source={{ uri: lbgtLogo }} alt="LBGT" className="w-5 h-5" />
														<Text className="text-textWhite font-medium">LBGT</Text>
													</>
												)}
											</>
										) : (
											<>
												<Image source={{ uri: honeyLogo }} alt="HONEY" className="w-5 h-5" />
												<Text className="text-textWhite font-medium">HONEY</Text>
											</>
										)}
									</View>
								</View>
								<View className="p-4">
									<Text className="text-gradientPrimary font-bold text-right">Autocompounded to APY</Text>
								</View>
							</View>
						)}

						{originPlatform === FarmOriginPlatform.Infrared && (
							<View className="flex-row border-b border-gray-700">
								<View className="flex-1 p-4">
									<View className="flex-row items-center gap-2">
										<Image source={{ uri: infraredLogo }} alt="Infrared" className="w-5 h-5" />
										<Text className="text-textWhite font-medium">Infrared airdrop</Text>
									</View>
								</View>
								<View className="p-4">
									<Text className="text-gradientPrimary font-bold text-right">Future claim</Text>
								</View>
							</View>
						)}

						{originPlatform === FarmOriginPlatform.Burrbear && (
							<>
								{farm.name.includes("wgBERA") && (
									<View className="flex-row border-b border-gray-700">
										<View className="flex-1 p-4">
											<View className="flex-row items-center gap-2">
												<Image src="/smilee.png" alt="Smilee" className="w-5 h-5" />
												<Text className="text-textWhite font-medium">Love Score airdrop</Text>
											</View>
										</View>
										<View className="p-4">
											<Text className="text-gradientPrimary font-bold text-right">Non-compounding APR (Future Claim)</Text>
										</View>
									</View>
								)}
								<View className="flex-row border-b border-gray-700">
									<View className="flex-1 p-4">
										<View className="flex-row items-center gap-2">
											<Image source={{ uri: burrbearLogo }} alt="Burrbear" className="w-5 h-5" />
											<Text className="text-textWhite font-medium">BURR Points (Burrbear Airdrop)</Text>
										</View>
									</View>
									<View className="p-4">
										<Text className="text-gradientPrimary font-bold text-right">Non-compounding APR (Future Claim)</Text>
									</View>
								</View>
								<View className="flex-row border-b border-gray-700">
									<View className="flex-1 p-4">
										<View className="flex-row items-center gap-2">
											<Image source={{ uri: beraborrowLogo }} alt="Beraborrow" className="w-5 h-5" />
											<Text className="text-textWhite font-medium">Pollen Points (Beraborrow Airdrop)</Text>
										</View>
									</View>
									<View className="p-4">
										<Text className="text-gradientPrimary font-bold text-right">4x Pollen Points (Future Claim)</Text>
									</View>
								</View>
							</>
						)}

						<View className="flex-row">
							<View className="flex-1 p-4">
								<View className="flex-row items-center gap-2">
									<Image source={{ uri: btxLogo }} alt="BTX" className="w-5 h-5" />
									<Text className="text-textWhite font-medium">BTX Points (BeraTrax Airdrop)</Text>
								</View>
							</View>
							<View className="p-4">
								<Text className="text-gradientPrimary font-bold text-right">Future claim</Text>
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
				{/* <StatInfo title="Volume" subtitle="Past 24h" value={"$16.5M"} iconUrl={volume} /> */}
				{/* <StatInfo title="Holders" value={"-"} iconUrl={holders} /> */}
				{/* <StatInfo title="Circulating Supply" value={"1.0B"} iconUrl={circulatingsupply} /> */}
				<StatInfo title="Added" value={createdDateString} iconUrl={<CreatedIcon />} />
			</View>
			{/* <p className="mt-2 text-textSecondary text-[12px] font-light leading-[18px]">
                Uauctor, augue porta dignissim vestibulum, arcu diam lobortis velit, Ut auctor, augue porta dignissim
                vestibulumUauctor, augue porta dignissim vestibulum, arcu diam lobortis velit, Ut auctor, augue porta
                dignissim vestibulum
            </p> */}
		</View>
	);
};

export default PoolInfo;
