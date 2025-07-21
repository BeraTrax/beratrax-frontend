import { PoolDef } from "@beratrax/core/src/config/constants/pools_json";
import { useLp } from "@beratrax/core/src/hooks";
import { customCommify } from "@beratrax/core/src/utils/common";
import { Skeleton } from "ui/src/components/Skeleton/Skeleton";
import FarmLpGraph from "ui/src/components/FarmItem/components/FarmActionView/FarmLpGraph/FarmLpGraph";
import FarmRowChip from "ui/src/components/FarmItem/components/FarmRowChip/FarmRowChip";
import { View, Text, Image, Pressable } from "react-native";
import { useState, useMemo, memo, useCallback } from "react";
import FarmEarningsGraph from "../FarmEarningsGraph/FarmEarningsGraph";
import FarmTvlGraph from "../FarmTvlGraph/FarmTvlGraph";
import FarmApyGraph from "../FarmApyGraph/FarmApyGraph";

interface TokenPriceProps {
	farm: PoolDef;
}

const PriceLoadingSkeleton = () => {
	return (
		<View className="mt-2">
			<Skeleton w={80} h={32} />
			<Skeleton w={100} h={16} className="mt-1" />
		</View>
	);
};

type TabType = "price" | "tvl" | "apy" | "earnings";

const MemoizedText = memo(({ text, color }: { text: string; color: string }) => (
	<Text style={{ color }} className="text-base font-league-spartan">
		{text}
	</Text>
));

const TabButton = memo(({ id, label, isActive, onPress }: { id: TabType; label: string; isActive: boolean; onPress: () => void }) => {
	const buttonStyle = useMemo(
		() => ({
			borderRadius: 7,
			paddingVertical: 8,
			paddingHorizontal: 16,
			fontWeight: "500",
			color: isActive ? "#FFFFFF" : "#878b82",
		}),
		[isActive]
	);

	const textColor = isActive ? "#FFFFFF" : "#878b82";

	return (
		<Pressable onPress={onPress} style={buttonStyle} className={`${isActive ? "bg-gradientSecondary" : ""}`}>
			<MemoizedText text={label} color={textColor} />
		</Pressable>
	);
});

export const TokenPriceAndGraph: React.FC<{ farm: PoolDef }> = ({ farm }) => {
	const { lp, isLpPriceLoading } = useLp(farm.id);
	const [activeTab, setActiveTab] = useState<TabType>("earnings");

	const handleTabPress = useCallback((tabId: TabType) => {
		setActiveTab(tabId);
	}, []);

	const tabHandlers = useMemo(
		() => ({
			earnings: () => handleTabPress("earnings"),
			price: () => handleTabPress("price"),
			tvl: () => handleTabPress("tvl"),
			apy: () => handleTabPress("apy"),
		}),
		[handleTabPress]
	);

	const tabs = useMemo(
		() => [
			{ id: "earnings" as TabType, label: "Earnings" },
			{ id: "price" as TabType, label: "Price" },
			{ id: "tvl" as TabType, label: "TVL" },
			{ id: "apy" as TabType, label: farm.isAutoCompounded ? "Trax APY" : "Underlying APR" },
		],
		[farm.isAutoCompounded]
	);

	return (
		<View className="relative">
			<View className="z-10">
				<View className="flex flex-row justify-between">
					<View>
						<Text className="text-textWhite mt-3 text-xl font-bold">
							{farm.name} {farm.token2 && `LP`} Price
						</Text>
						{isLpPriceLoading ? (
							<PriceLoadingSkeleton />
						) : (
							<View className="mt-2">
								<Text className="text-textWhite text-5xl font-bold ">
									${customCommify(lp?.[0]?.lp || 0, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
								</Text>
								<View className="flex gap-2 items-center justify-center text-[16px]">
									{/* <PriceTrendIcon trend="increase" className="mb-[3px]" />
                                    <p className="text-gradientPrimary ">$50 (2,52%)</p>
                                    <span className="w-1 h-1 rounded-full bg-textSecondary" />
                                    <p className="text-textSecondary">Today</p> */}
								</View>
							</View>
						)}
					</View>
					<View className="flex flex-col mt-2 mr-3">
						<View className="flex flex-row items-center gap-2 mb-2 justify-end">
							<FarmRowChip text={[farm.platform, farm.secondary_platform].filter(Boolean).join(" | ")} color="invert" />
							<View className="flex flex-row">
								<Image
									alt={farm?.platform_alt}
									className="w-4 h-4 rounded-full border border-bgDark"
									source={{ uri: `${farm?.platform_logo}` }}
									style={{ width: 16, height: 16 }}
								/>
								{farm.secondary_platform && (
									<Image className="w-4 h-4 rounded-full border border-bgDark" source={{ uri: `${farm?.secondary_platform_logo}` }} />
								)}
							</View>
						</View>
						<View className="flex flex-row items-center">
							{farm?.logo1 ? <Image alt={farm?.alt1} className="w-16 h-16 rounded-full" source={{ uri: farm?.logo1 }} /> : null}

							{farm?.logo2 ? <Image alt={farm?.alt2} className="w-16 h-16 rounded-full -ml-8" source={{ uri: farm?.logo2 }} /> : null}

							{farm?.logo3 ? <Image alt={farm?.alt3} className="w-16 h-16 rounded-full -ml-8" source={{ uri: farm?.logo3 }} /> : null}

							{farm?.logo4 ? <Image alt={farm?.alt4} className="w-16 h-16 rounded-full -ml-8" source={{ uri: farm?.logo4 }} /> : null}
						</View>
					</View>
				</View>
			</View>
			<View className="flex flex-row gap-4 mt-6 mb-4">
				{tabs.map((tab) => (
					<TabButton key={tab.id} id={tab.id} label={tab.label} isActive={activeTab === tab.id} onPress={tabHandlers[tab.id]} />
				))}
			</View>

			<View>
				{activeTab === "earnings" && <FarmEarningsGraph farm={farm} />}
				{activeTab === "price" && <FarmLpGraph farm={farm} />}
				{activeTab === "tvl" && <FarmTvlGraph farm={farm} />}
				{activeTab === "apy" && <FarmApyGraph farm={farm} />}
			</View>
		</View>
	);
};

export default TokenPriceAndGraph;
