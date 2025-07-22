import { useState, useMemo, memo, useCallback } from "react";
import FarmRowChip from "ui/src/components/FarmItem/components/FarmRowChip/FarmRowChip";
import { View, Text, Image, Pressable, Platform, Dimensions } from "react-native";
import pools_json, { ETF_VAULTS, ETFVaultDef } from "@beratrax/core/src/config/constants/pools_json";
import ETFPriceGraph from "../ETFPriceGraph/ETFPriceGraph";
import ETFUnderlyingPriceGraph from "../ETFUnderlyingPriceGraph/ETFUnderlyingPriceGraph";
import ETFTvlGraph from "../ETFTvlGraph/ETFTvlGraph";
import ETFUnderlyingTvlGraph from "../ETFUnderlyingTvlGraph/ETFUnderlyingTvlGraph";
import { useLp } from "@beratrax/core/src/hooks";
import { customCommify } from "@beratrax/core/src/utils/common";

type TabType = "price" | "underlying-price" | "tvl" | "underlying-tvl";

const MemoizedText = memo(({ text, color }: { text: string; color: string }) => (
	<Text style={{ color }} className="text-base font-league-spartan">
		{text}
	</Text>
));

const TabButton = memo(({ id, label, isActive, onPress }: { id: TabType; label: string; isActive: boolean; onPress: () => void }) => {
	const buttonStyle = useMemo(
		() => ({
			borderRadius: 7,
			paddingVertical: 6,
			paddingHorizontal: 12,
			fontWeight: "500",
			color: isActive ? "#FFFFFF" : "#878b82",
		}),
		[isActive]
	);

	const textColor = isActive ? "#FFFFFF" : "#878b82";

	return (
		<Pressable onPress={onPress} style={buttonStyle} className={`${isActive ? "bg-gradientSecondary" : ""}`}>
			<Text className="text-sm sm:text-base font-league-spartan" style={{ color: textColor }}>
				{label}
			</Text>
		</Pressable>
	);
});

export const ETFPriceAndGraph: React.FC<{ vault: ETFVaultDef }> = ({ vault }) => {
	const { lp, isLpPriceLoading } = useLp(vault.id);
	const [activeTab, setActiveTab] = useState<TabType>("price");

	const underlyingVaultFarms = useMemo(() => {
		return vault.underlyingVaults.map((farmId) => pools_json.find((farm) => farm.id === farmId)).filter(Boolean) as typeof pools_json;
	}, [vault.underlyingVaults]);

	const handleTabPress = useCallback((tabId: TabType) => {
		setActiveTab(tabId);
	}, []);

	const tabHandlers = useMemo(
		() => ({
			price: () => handleTabPress("price"),
			"underlying-price": () => handleTabPress("underlying-price"),
			tvl: () => handleTabPress("tvl"),
			"underlying-tvl": () => handleTabPress("underlying-tvl"),
		}),
		[handleTabPress]
	);

	const tabs = useMemo(
		() => [
			{ id: "price" as TabType, label: "Price" },
			{ id: "underlying-price" as TabType, label: "Underlying Price" },
			{ id: "tvl" as TabType, label: "TVL" },
			{ id: "underlying-tvl" as TabType, label: "Underlying TVL" },
		],
		[]
	);

	return (
		<View className="relative">
			<View className="z-10">
				<View className="flex flex-row justify-between">
					<View className="flex-1 pr-2">
						<Text className="text-textWhite mt-3 text-lg sm:text-xl font-bold">{vault.name}</Text>
						<View className="mt-2">
							<Text className="text-textWhite text-5xl font-bold ">${customCommify(lp?.[0]?.lp || 0)}</Text>
						</View>
					</View>
					<View className="flex flex-col mt-2 mr-1 sm:mr-3">
						<View className="flex flex-row items-center gap-1 sm:gap-2 mb-2 justify-end">
							<FarmRowChip text="Trax ETF" color="invert" />
							<Image
								className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-bgDark"
								source={{ uri: `${vault.platform_logo}` }}
								style={{ width: 12, height: 12 }}
							/>
						</View>
						<View className="flex flex-row items-center">
							{vault.logo1 ? (
								<Image alt={vault.alt1} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full" source={{ uri: vault.logo1 }} />
							) : null}
							{vault.logo2 ? (
								<Image alt={vault.alt2} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full -ml-6 sm:-ml-8" source={{ uri: vault.logo2 }} />
							) : null}
							{vault.logo3 ? (
								<Image alt={vault.alt3} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full -ml-6 sm:-ml-8" source={{ uri: vault.logo3 }} />
							) : null}
							{vault.logo4 ? (
								<Image alt={vault.alt4} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full -ml-6 sm:-ml-8" source={{ uri: vault.logo4 }} />
							) : null}
						</View>
					</View>
				</View>
			</View>
			<View className="flex flex-row gap-1 sm:gap-2 mt-4 sm:mt-6 mb-3 sm:mb-4 flex-wrap">
				{tabs.map((tab) => (
					<TabButton key={tab.id} id={tab.id} label={tab.label} isActive={activeTab === tab.id} onPress={tabHandlers[tab.id]} />
				))}
			</View>

			<View>
				{activeTab === "price" && <ETFPriceGraph vault={vault} />}
				{activeTab === "underlying-price" && <ETFUnderlyingPriceGraph vault={vault} underlyingFarms={underlyingVaultFarms} />}
				{activeTab === "tvl" && <ETFTvlGraph vault={vault} />}
				{activeTab === "underlying-tvl" && <ETFUnderlyingTvlGraph vault={vault} underlyingFarms={underlyingVaultFarms} />}
			</View>
		</View>
	);
};

export default ETFPriceAndGraph;
