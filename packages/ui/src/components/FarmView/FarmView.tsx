import React, { useState, useCallback, useMemo } from "react";
import { View, Text, Platform, FlatList, TouchableOpacity, Image, ImageSourcePropType } from "react-native";
import Svg, { G, Path, ClipPath, Rect, Defs } from "react-native-svg";
import Earnpagedots from "@beratrax/core/src/assets/images/earnpagedots.svg";
import Earnpageleaves from "@beratrax/core/src/assets/images/earnpagetoprightleaves1.png";
import Earnpageleaves2 from "@beratrax/core/src/assets/images/earnpagetoprightleaves2.png";
import { useRouter } from "expo-router";
import { useNavigate } from "react-router-dom";
import BackButton from "ui/src/components/BackButton/BackButton";
import FarmRow from "ui/src/components/FarmItem/FarmRow";
import { IS_LEGACY } from "@beratrax/core/src/config/constants";
import { useEarnPage } from "@beratrax/core/src/state/farms/hooks";
import type { FarmDataExtended } from "@beratrax/core/src/types";
import { SvgImage } from "ui/src/components/SvgImage/SvgImage";
import { FarmSortOptions } from "@beratrax/core/src/types/enums";
import Select from "@beratrax/ui/src/components/Select/Select";
import { type PoolDef, ETF_VAULTS, ETFVaultDef } from "@beratrax/core/src/config/constants/pools_json";

// Clock SVG Icon component
const ClockIcon = ({ isSelected }: { isSelected: boolean }) => (
	<Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
		<Defs>
			<ClipPath id="clip0">
				<Rect width={24} height={24} fill="white" />
			</ClipPath>
		</Defs>
		<G clipPath="url(#clip0)">
			<Path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
				stroke={isSelected ? "#ffffff" : "#9CA3AF"}
				fill="none"
			/>
		</G>
	</Svg>
);

// Section item type for combined list
type SectionItem = {
	type: "etf" | "regular";
	data: PoolDef | FarmDataExtended | ETFVaultDef;
};

export function FarmView() {
	const [openedFarm, setOpenedFarm] = useState<number | undefined>();
	const { sortedFarms, farms, selectedPlatform, setSelectedPlatform, setSortSelected, sortSelected } = useEarnPage();

	// Get unique platforms from farms including both original and secondary platforms
	const platforms = useMemo(() => {
		const uniquePlatforms = new Map<string, string>();
		farms.forEach((farm) => {
			if (farm.originPlatform && farm.platform_logo && !uniquePlatforms.get(farm.originPlatform)) {
				uniquePlatforms.set(farm.originPlatform, farm.platform_logo);
			}
			if ("secondary_platform" in farm && farm.secondary_platform && !uniquePlatforms.get(farm.secondary_platform)) {
				// If secondary platform doesn't have a logo, use the primary platform's logo
				uniquePlatforms.set(farm.secondary_platform, farm.secondary_platform_logo || "");
			}
		});
		return Array.from(uniquePlatforms.entries()).sort((a, b) => a[0].localeCompare(b[0]));
	}, [farms]);

	const router = useRouter();
	let navigate = null;
	if (Platform.OS === "web") {
		navigate = useNavigate();
	}

	const handleBack = useCallback(() => {
		if (Platform.OS === "web") {
			navigate?.("/");
		} else {
			router.replace("/");
		}
	}, [router, navigate]);

	const filteredFarms = useMemo(() => {
		// Use sortedFarms as it already handles the sorting and "New" filter logic
		let filtered = sortedFarms.filter((farm) => (IS_LEGACY ? farm.isDeprecated : !farm.isDeprecated));

		// Only apply platform filter if one is selected (since useEarnPage already handles platform filtering in sortFn)
		// But we need to apply it here again because we're handling platform selection separately
		if (selectedPlatform) {
			filtered = filtered.filter((farm) => farm.originPlatform === selectedPlatform || farm.secondary_platform === selectedPlatform);
		}

		return filtered;
	}, [sortedFarms, selectedPlatform]);

	// Combine ETF vaults and regular farms into a single list with section markers
	const combinedData = useMemo(() => {
		const data: SectionItem[] = [];

		// Add ETF vault (single object)
		// @ts-ignore
		ETF_VAULTS.forEach((vault) => {
			data.push({ type: "etf", data: vault });
		});

		// Add regular farms
		filteredFarms.forEach((farm) => {
			data.push({ type: "regular", data: farm });
		});

		return data;
	}, [filteredFarms]);

	const renderHeader = useCallback(
		() => (
			<>
				<BackButton onClick={handleBack} />

				{/* Heading */}
				<View className="mt-4">
					<Text className="font-league-spartan text-3xl font-bold uppercase text-white">Earn</Text>
				</View>

				{/* ETF Section Header */}
				<View className="mt-6 mb-4">
					<Text className="text-lg font-light text-white font-league-spartan">ETF Yield Protocols</Text>
				</View>
			</>
		),
		[handleBack]
	);

	const renderSectionHeader = useCallback(
		(index: number) => {
			// Check if this is the first regular farm after ETF vaults
			const currentItem = combinedData[index];
			const previousItem = index > 0 ? combinedData[index - 1] : null;

			if (currentItem?.type === "regular" && previousItem?.type === "etf") {
				return (
					<View className="mt-8 mb-4">
						<Text className="text-lg font-light text-white font-league-spartan">Available Protocols</Text>
						{farms.length > 0 && (
							<View className="flex flex-row gap-4 justify-end items-center mt-4">
								<View className="flex items-center gap-4">
									{/* New Vaults Sort Option */}
									<TouchableOpacity
										onPress={() => setSortSelected(sortSelected === FarmSortOptions.New ? undefined : FarmSortOptions.New)}
										className={`flex flex-row items-center gap-2 px-4 py-2 rounded-lg border ${
											sortSelected === FarmSortOptions.New ? "bg-buttonPrimary border-buttonPrimary" : "bg-transparent border-borderDark"
										}`}
									>
										<ClockIcon isSelected={sortSelected === FarmSortOptions.New} />
										<Text className={`${sortSelected === FarmSortOptions.New ? "text-textWhite font-medium" : "text-textSecondary"}`}>
											New
										</Text>
									</TouchableOpacity>
								</View>
								<Select
									options={["All", ...platforms.map(([name]) => name)]}
									images={Object.fromEntries(platforms.map(([name, logo]) => [name, [logo]]))}
									value={selectedPlatform || "All"}
									setValue={(val) => setSelectedPlatform(val === "All" ? null : val)}
									className="text-textWhite font-light text-[16px] w-[150px] border border-borderDark rounded-lg"
									bgSecondary={true}
									customWidth={150}
								/>
							</View>
						)}
					</View>
				);
			}
			return null;
		},
		[combinedData, farms.length, platforms, selectedPlatform, setSelectedPlatform, sortSelected, setSortSelected]
	);

	const renderItem = useCallback(
		({ item, index }: { item: SectionItem; index: number }) => (
			<>
				{renderSectionHeader(index)}
				<FarmRow farm={item.data as any} openedFarm={openedFarm} setOpenedFarm={setOpenedFarm} />
			</>
		),
		[openedFarm, setOpenedFarm, renderSectionHeader]
	);

	const renderFooter = useCallback(() => <View className="h-32" />, []);

	const keyExtractor = useCallback((item: SectionItem, index: number) => `${item.type}-${item.data.id}-${index}`, []);

	const contentContainerStyle = useMemo(() => ({ gap: 8 }), []);

	return (
		<View className="relative bg-bgSecondary text-textWhite h-full overflow-hidden font-league-spartan">
			{/* Background Leaves */}
			<View className="absolute top-14 right-1 w-50">
				{Platform.OS === "web" ? (
					<SvgImage source={Earnpageleaves2} />
				) : (
					<Image source={Earnpageleaves2 as ImageSourcePropType} height={200} width={200} />
				)}
			</View>
			<View className="absolute top-2 -right-2 w-40">
				{Platform.OS === "web" ? (
					<SvgImage source={Earnpageleaves} />
				) : (
					<Image source={Earnpageleaves as ImageSourcePropType} height={200} width={200} />
				)}
			</View>
			<View className="absolute top-2 right-5 w-40">
				<SvgImage source={Earnpagedots} height={200} width={200} />
			</View>

			<View className="h-full pt-14 px-4 pb-2">
				{combinedData.length === 0 ? (
					<>
						{renderHeader()}
						<View className="flex flex-col gap-2">
							<Text className="mb-9 text-lg font-light text-white">Vaults coming soon</Text>
						</View>
					</>
				) : (
					<FlatList
						data={combinedData}
						renderItem={renderItem}
						keyExtractor={keyExtractor}
						contentContainerStyle={contentContainerStyle}
						initialNumToRender={10}
						maxToRenderPerBatch={10}
						windowSize={5}
						removeClippedSubviews={true}
						showsVerticalScrollIndicator={false}
						ListHeaderComponent={renderHeader}
						ListFooterComponent={renderFooter}
					/>
				)}
			</View>
		</View>
	);
}
