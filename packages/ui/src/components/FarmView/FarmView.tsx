import React, { useState, useCallback, useMemo } from "react";
import { View, Text, Image, Platform, ImageSourcePropType, FlatList } from "react-native";
import Earnpagedots from "@beratrax/core/src/assets/images/earnpagedots.svg";
import Earnpageleaves from "@beratrax/core/src/assets/images/earnpagetoprightleaves1.svg";
import Earnpageleaves2 from "@beratrax/core/src/assets/images/earnpagetoprightleaves2.svg";
import { useRouter } from "expo-router";
import BackButton from "ui/src/components/BackButton/BackButton";
import FarmRow from "ui/src/components/FarmItem/FarmRow";
import { IS_LEGACY } from "@beratrax/core/src/config/constants";
import { useEarnPage } from "@beratrax/core/src/state/farms/hooks";
import type { FarmDataExtended } from "@beratrax/core/src/types";

export function FarmView() {
	const [openedFarm, setOpenedFarm] = useState<number | undefined>();
	const { sortedFarms, farms, selectedPlatform, setSelectedPlatform, setSortSelected, sortSelected } = useEarnPage();

	const router = useRouter();

	const renderHeader = useCallback(
		() => (
			<>
				<BackButton onClick={() => router.replace("/")} />

				{/* Heading */}
				<View className="mt-4">
					<Text className="text-3xl font-bold uppercase text-white">Earn</Text>
				</View>

				{farms.length === 0 ? (
					<View className="flex flex-col gap-2">
						<Text className="mb-9 text-lg font-light text-white">Vaults coming soon</Text>
					</View>
				) : (
					<Text className="mb-9 text-lg font-light text-white">Available Protocols</Text>
				)}
			</>
		),
		[router, farms.length]
	);

	const renderFooter = useCallback(() => <View className="h-32" />, []);

	const renderItem = useCallback(
		({ item }: { item: FarmDataExtended }) => <FarmRow farm={item} openedFarm={openedFarm} setOpenedFarm={setOpenedFarm} />,
		[openedFarm, setOpenedFarm]
	);

	const keyExtractor = useCallback((farm: FarmDataExtended, index: number) => (farm.id ? farm.id.toString() : index.toString()), []);

	const contentContainerStyle = useMemo(() => ({ gap: 8 }), []);

	const filteredFarms = useMemo(() => (sortedFarms || farms).filter((farm) => (IS_LEGACY ? farm.isDeprecated : !farm.isDeprecated)), []);

	return (
		<View className="relative bg-bgSecondary text-textWhite h-full overflow-hidden font-league-spartan">
			{/* Background Leaves */}
			<View className="absolute top-14 right-1 w-50">
				<Earnpageleaves2 />
			</View>
			<View className="absolute top-2 -right-2 w-40">
				<Earnpageleaves />
			</View>
			<View className="absolute top-2 right-5 w-40">
				<Earnpagedots />
			</View>

			<BackButton onClick={() => router.back()} />

			{/* Heading */}
			<View className="mt-4">
				<Text className="text-3xl font-bold uppercase text-white">Earn</Text>
			</View>

			{farms.length === 0 ? (
				<View className="flex flex-col gap-2">
					<Text className="mb-9 text-lg font-light text-white">Vaults coming soon</Text>
				</View>
			) : (
				<Text className="mb-9 text-lg font-light text-white">Available Protocols</Text>
			)}

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
