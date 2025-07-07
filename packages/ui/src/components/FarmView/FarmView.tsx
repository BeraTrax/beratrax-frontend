import React, { useState, useCallback, useMemo } from "react";
import { View, Text, Platform, FlatList, TouchableOpacity } from "react-native";
import Svg, { G, Path, ClipPath, Rect, Defs } from "react-native-svg";
import Earnpagedots from "@beratrax/core/src/assets/images/earnpagedots.svg";
import Earnpageleaves from "@beratrax/core/src/assets/images/earnpagetoprightleaves1.svg";
import Earnpageleaves2 from "@beratrax/core/src/assets/images/earnpagetoprightleaves2.svg";
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

export function FarmView() {
	const [openedFarm, setOpenedFarm] = useState<number | undefined>();
	const { sortedFarms, farms, selectedPlatform, setSelectedPlatform, setSortSelected, sortSelected } = useEarnPage();

	// Get unique platforms from farms including both original and secondary platforms
	const platforms = useMemo(() => {
		const uniquePlatforms = new Map<string, string>();
		farms.forEach((farm) => {
			if (farm.originPlatform && farm.platform_logo) {
				uniquePlatforms.set(farm.originPlatform, farm.platform_logo);
			}
			if (farm.secondary_platform) {
				// If secondary platform doesn't have a logo, use the primary platform's logo
				uniquePlatforms.set(farm.secondary_platform, farm.platform_logo || "");
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

	const renderHeader = useCallback(
		() => (
			<>
				<BackButton onClick={handleBack} />

				{/* Heading */}
				<View className="mt-4">
					<Text className="font-league-spartan text-3xl font-bold uppercase text-white">Earn</Text>
				</View>

				{farms.length === 0 ? (
					<View className="flex flex-col gap-2">
						<Text className="mb-9 text-lg font-light text-white">Vaults coming soon</Text>
					</View>
				) : (
					<View className="flex flex-col justify-between">
						<Text className="text-base font-light my-4 text-white">Available Protocols</Text>
						<View className="flex flex-row gap-4 justify-end items-center">
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
					</View>
				)}
			</>
		),
		[handleBack, farms.length, platforms, selectedPlatform, setSelectedPlatform, sortSelected, setSortSelected]
	);

	const renderFooter = useCallback(() => <View className="h-32" />, []);

	const renderItem = useCallback(
		({ item }: { item: FarmDataExtended }) => <FarmRow farm={item} openedFarm={openedFarm} setOpenedFarm={setOpenedFarm} />,
		[openedFarm, setOpenedFarm]
	);

	const keyExtractor = useCallback((farm: FarmDataExtended, index: number) => (farm.id ? farm.id.toString() : index.toString()), []);

	const contentContainerStyle = useMemo(() => ({ gap: 8 }), []);

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

	return (
		<View className="relative bg-bgSecondary text-textWhite h-full overflow-hidden font-league-spartan">
			{/* Background Leaves */}
			<View className="absolute top-14 right-1 w-50">
				<SvgImage source={Earnpageleaves2} height={200} width={200} />
			</View>
			<View className="absolute top-2 -right-2 w-40">
				<SvgImage source={Earnpageleaves} height={200} width={200} />
			</View>
			<View className="absolute top-2 right-5 w-40">
				<SvgImage source={Earnpagedots} height={200} width={200} />
			</View>

			<View className="h-full pt-14 px-4 pb-2">
				<FlatList
					data={filteredFarms}
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
			</View>

			{/* Upcoming Farms (only for dev/staging) */}
			{/* {__DEV__ && upcomingFarms.length > 0 && (
          <View className="flex flex-col mt-2 gap-2">
            {upcomingFarms.map((farm, index) => (
              <FarmRow key={index + "nowallet"} farm={farm} openedFarm={openedFarm} setOpenedFarm={setOpenedFarm} />
            ))}
          </View>
        )} */}

			{/* Bottom padding */}
			<View className="h-32" />
		</View>
	);
}
