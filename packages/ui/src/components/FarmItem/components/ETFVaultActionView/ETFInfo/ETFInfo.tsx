import React, { useMemo } from "react";
import { View, Text, Image, Platform } from "react-native";
import { MarketCapIcon } from "@beratrax/ui/src/icons/MarketCap";
import { VolumeIcon } from "@beratrax/ui/src/icons/Volume";
import { CreatedIcon } from "@beratrax/ui/src/icons/Created";
import { TrendUpIcon } from "@beratrax/ui/src/icons/TrendUp";
import { RocketIcon } from "@beratrax/ui/src/icons/Rocket";
import pools_json, { ETFVaultDef } from "@beratrax/core/src/config/constants/pools_json";
import { Skeleton } from "@beratrax/ui/src/components/Skeleton/Skeleton";
import { customCommify } from "@beratrax/core/src/utils/common";
// Import victory libraries based on platform
import * as Victory from "victory";
import * as VictoryNative from "victory-native";
import { useLp } from "@beratrax/core/src/hooks";
import { useFarmApy } from "@beratrax/core/src/state/farms/hooks";
import useTokens from "@beratrax/core/src/state/tokens/useTokens";

const { VictoryChart, VictoryLine, VictoryTheme, VictoryArea, VictoryAxis } = Platform.OS === "web" ? Victory : VictoryNative;

interface ETFInfoProps {
	ETF_VAULT: ETFVaultDef;
	isSmallScreen: boolean;
}

// Small inline chart component for price trends
const InlineChart = ({ farm }: { farm: any }) => {
	const { lp, isLpPriceLoading } = useLp(farm.id);

	// Shared data processing function (same as in ETFUnderlyingPriceGraph)
	const downsampleDataForMonth = useMemo(() => {
		return (data: any[]) => {
			if (!data || data.length === 0) return [];

			const filteredData: { date: string; lp: string; timestamp: number }[] = [];

			// Filter and sort entries by timestamp
			const filteredEntries = data
				.filter((entry) => entry.timestamp && typeof entry.lp === "number" && entry.lp > 0)
				.sort((a, b) => a.timestamp - b.timestamp);

			if (filteredEntries.length === 0) return [];

			const now = Date.now() / 1000;
			const firstValidTimestamp = filteredEntries[0].timestamp;

			// Month filter (30 days)
			let filterTimestamp = now - 30 * 24 * 60 * 60;

			// Use the later of filterTimestamp or firstValidTimestamp
			filterTimestamp = Math.max(filterTimestamp, firstValidTimestamp);

			// Make sure we have data in the selected time range
			const entriesInRange = filteredEntries.filter((entry) => entry.timestamp >= filterTimestamp);
			if (entriesInRange.length === 0) {
				// If no entries in range, take the most recent ones for display
				const recentEntries = filteredEntries.slice(-10);
				if (recentEntries.length > 0) {
					const mostRecent = recentEntries[recentEntries.length - 1];
					filteredData.push({
						date: new Date(mostRecent.timestamp * 1000).toLocaleDateString(),
						lp: mostRecent.lp.toFixed(3),
						timestamp: mostRecent.timestamp,
					});
				}
				return filteredData;
			}

			// Generate time slots (1 day intervals for month view, same as main chart)
			const timeSlots: number[] = [];
			const interval = 24 * 60 * 60; // 1 day for month view

			for (let t = filterTimestamp; t <= now; t += interval) {
				timeSlots.push(t);
			}

			// If we don't have any time slots, add at least one
			if (timeSlots.length === 0) {
				timeSlots.push(filterTimestamp);
			}

			// Process entries into appropriate time slots (same averaging logic as main chart)
			timeSlots.forEach((slotTime) => {
				const slotEntries = filteredEntries.filter((entry) => entry.timestamp >= slotTime && entry.timestamp < slotTime + interval);

				if (slotEntries.length > 0) {
					const key = new Date(slotTime * 1000).toLocaleDateString();
					const totalLp = slotEntries.reduce((sum, entry) => sum + (entry.lp || 0), 0);
					const avgLp = totalLp / slotEntries.length;

					if (avgLp > 0) {
						filteredData.push({
							date: key,
							lp: avgLp.toFixed(3),
							timestamp: slotTime,
						});
					}
				}
			});

			return filteredData;
		};
	}, []);

	const chartData = useMemo(() => {
		if (!lp || lp.length === 0) return [];

		const processedData = downsampleDataForMonth(lp);

		// Convert to chart format with actual timestamp for x values to preserve time-based patterns
		return processedData.map((d) => ({
			x: d.timestamp,
			y: parseFloat(d.lp),
		}));
	}, [lp, downsampleDataForMonth]);

	// Use consistent y-domain approach (same logic as main chart)
	const yDomain = useMemo(() => {
		if (chartData.length === 0) return [0, 1] as [number, number];
		const values = chartData.map((d) => d.y);
		const minY = Math.min(...values);
		const maxY = Math.max(...values);

		if (minY === maxY) {
			// If flat line, add fixed padding (same as main chart)
			return [minY * 0.9, minY * 1.1] as [number, number];
		}

		// Use same scaling approach as main chart
		return [minY * 0.7, maxY * 1.1] as [number, number];
	}, [chartData]);

	// Calculate price change percentage
	const priceChange = useMemo(() => {
		if (chartData.length < 2) return { change: 0, isPositive: true };
		const firstPrice = chartData[0].y;
		const lastPrice = chartData[chartData.length - 1].y;
		const change = ((lastPrice - firstPrice) / firstPrice) * 100;
		return { change, isPositive: change >= 0 };
	}, [chartData]);

	if (isLpPriceLoading) {
		return <Skeleton h={48} w={96} />;
	}

	if (chartData.length === 0) {
		return (
			<View className="w-24 h-12 items-center justify-center">
				<Text className="text-textSecondary text-xs">No data</Text>
			</View>
		);
	}

	return (
		<View className="w-24 h-12 items-center justify-center">
			<VictoryChart
				width={96}
				height={48}
				padding={{ top: 4, bottom: 4, left: 4, right: 4 }}
				domain={{ y: yDomain }}
				theme={VictoryTheme.clean}
			>
				{/* Hide X Axis */}
				<VictoryAxis
					style={{
						axis: { stroke: "transparent" },
						ticks: { stroke: "transparent" },
						tickLabels: { fill: "transparent" },
						grid: { stroke: "transparent" },
					}}
				/>
				{/* Hide Y Axis */}
				<VictoryAxis
					dependentAxis
					style={{
						axis: { stroke: "transparent" },
						ticks: { stroke: "transparent" },
						tickLabels: { fill: "transparent" },
						grid: { stroke: "transparent" },
					}}
				/>
				<VictoryLine
					data={chartData}
					style={{
						data: {
							stroke: priceChange.isPositive ? "#10B981" : "#EF4444",
							strokeWidth: 1.5,
						},
					}}
					animate={false}
				/>
				<VictoryArea
					data={chartData}
					style={{
						data: {
							fill: priceChange.isPositive ? "#10B98120" : "#EF444420",
							strokeWidth: 0,
						},
					}}
					animate={false}
				/>
			</VictoryChart>
		</View>
	);
};

// Similar as in PoolInfo.tsx component
const StatInfo = ({ iconUrl, title, value }: { iconUrl: React.ReactNode; title: string; value: number | string }) => {
	return (
		<View className="flex flex-row items-center gap-2 sm:gap-4 bg-bgDark py-3 sm:py-4 px-3 sm:px-4 mt-2 rounded-2xl backdrop-blur-lg">
			{typeof iconUrl === "string" ? (
				<Image source={{ uri: iconUrl }} accessibilityLabel={title} className="flex-shrink-0 flex-grow-0 w-8 h-8 sm:w-10 sm:h-10" />
			) : (
				iconUrl
			)}
			<View className={"flex-1"}>
				<Text className="text-textWhite text-base sm:text-lg font-medium font-league-spartan">{title}</Text>
			</View>
			<Text className="text-textWhite text-base sm:text-lg font-medium font-league-spartan">{value}</Text>
		</View>
	);
};

// Underlying Vault Mobile component
const UnderlyingVaultMobile = ({ farm, index }: { farm: any; index: number }) => {
	const { apy: farmApys, isLoading: isApyLoading } = useFarmApy(farm);

	const displayApy = useMemo(() => {
		if (isApyLoading) return "Loading...";
		if (!farmApys?.apy) return "--";
		return farmApys.apy.toFixed(2);
	}, [farmApys, isApyLoading]);

	return (
		<View key={index} className="bg-bgDark rounded-2xl p-4 mb-3">
			{/* Header with name and platform logo */}
			<View className="flex flex-row items-center justify-between mb-3">
				<View className="flex flex-row items-center">
					<View className="flex flex-row items-center mr-2">
						{farm.logo1 && <Image source={{ uri: farm.logo1 }} className="w-5 h-5 rounded-full mr-1" />}
						{farm.logo2 && <Image source={{ uri: farm.logo2 }} className="w-5 h-5 rounded-full mr-1" />}
						{farm.logo3 && <Image source={{ uri: farm.logo3 }} className="w-5 h-5 rounded-full" />}
					</View>
					<Text className="text-white text-base font-league-spartan font-medium">{farm.name}</Text>
				</View>
				<View className="flex flex-row items-center">
					<Image source={{ uri: farm.platform_logo }} className="w-5 h-5 rounded-full mr-2" />
					<Text className="text-white text-sm font-league-spartan">{farm.platform}</Text>
				</View>
			</View>

			{/* Stats grid */}
			<View className="space-y-2">
				<View className="flex flex-row justify-between">
					<Text className="text-textSecondary text-sm font-league-spartan">APY</Text>
					{isApyLoading ? (
						<Skeleton h={16} w={50} />
					) : (
						<Text className="text-green-400 text-sm font-league-spartan font-bold">{displayApy}%</Text>
					)}
				</View>
				<View className="flex flex-row justify-between">
					<Text className="text-textSecondary text-sm font-league-spartan">Auto Compounded</Text>
					<Text className="text-white text-sm font-league-spartan">{farm.isAutoCompounded ? "Yes" : "No"}</Text>
				</View>
				<View className="flex flex-row justify-between items-center">
					<Text className="text-textSecondary text-sm font-league-spartan">Price Trend (1M)</Text>
					<InlineChart farm={farm} />
				</View>
			</View>
		</View>
	);
};

// Desktop table row component for underlying vaults
const UnderlyingVaultRowDesktop = ({ farm, index }: { farm: any; index: number }) => {
	const { apy: farmApys, isLoading: isApyLoading } = useFarmApy(farm);

	const displayApy = useMemo(() => {
		if (isApyLoading) return "Loading...";
		if (!farmApys?.apy) return "--";
		return farmApys.apy.toFixed(2);
	}, [farmApys, isApyLoading]);

	return (
		<View key={index} className="flex flex-row items-center py-4 border-b last:border-b-0 bg-bgDark pl-6 rounded-3xl m-2">
			{/* Name Column */}
			<View className="flex-1 min-w-[120px]">
				<View className="flex flex-row items-center">
					<View className="flex flex-row items-center mr-2">
						{farm.logo1 && <Image source={{ uri: farm.logo1 }} className="w-5 h-5 rounded-full mr-1" />}
						{farm.logo2 && <Image source={{ uri: farm.logo2 }} className="w-5 h-5 rounded-full mr-1" />}
						{farm.logo3 && <Image source={{ uri: farm.logo3 }} className="w-5 h-5 rounded-full" />}
					</View>
					<Text className="text-white text-base font-league-spartan">{farm.name}</Text>
				</View>
			</View>

			{/* Platform Column */}
			<View className="flex-1 min-w-[100px]">
				<View className="flex flex-row items-center">
					<Image source={{ uri: farm.platform_logo }} className="w-5 h-5 rounded-full mr-2" />
					<Text className="text-white text-base font-league-spartan">{farm.platform}</Text>
				</View>
			</View>

			{/* APY Column */}
			<View className="flex-1 min-w-[80px]">
				{isApyLoading ? (
					<Skeleton h={16} w={50} />
				) : (
					<Text className="text-green-400 text-base font-league-spartan font-bold">{displayApy}%</Text>
				)}
			</View>

			{/* Auto Compounded Column */}
			<View className="flex-1 min-w-[80px]">
				<Text className="text-white text-base font-league-spartan">{farm.isAutoCompounded ? "Yes" : "No"}</Text>
			</View>

			{/* Price Chart Column */}
			<View className="flex-1 min-w-[120px] items-center">
				<InlineChart farm={farm} />
			</View>
		</View>
	);
};

const ETFInfo = ({ ETF_VAULT, isSmallScreen }: ETFInfoProps) => {
	const { totalSupplies } = useTokens();

	// Get underlying vault farms by IDs
	const underlyingVaultFarms = useMemo(() => {
		return ETF_VAULT.underlyingVaults.map((farmId) => pools_json.find((farm) => farm.id === farmId)).filter(Boolean);
	}, [ETF_VAULT.underlyingVaults]);

	// Calculate total market cap from underlying vaults LP tokens
	const totalMarketCap = useMemo(() => {
		if (!totalSupplies[ETF_VAULT.chainId]) return 0;

		const chainSupplies = totalSupplies[ETF_VAULT.chainId];
		let totalUsd = 0;

		underlyingVaultFarms.forEach((farm) => {
			if (farm?.lp_address && chainSupplies[farm.lp_address]) {
				totalUsd += chainSupplies[farm.lp_address].supplyUsd || 0;
			}
		});

		return totalUsd;
	}, [totalSupplies, ETF_VAULT.chainId, underlyingVaultFarms]);

	// Get ETF vault supply for liquidity display
	const etfVaultSupply = useMemo(() => {
		const chainSupplies = totalSupplies[ETF_VAULT.chainId];
		return chainSupplies?.[ETF_VAULT.vault_addr] || { supplyUsdFormatted: "$0" };
	}, [totalSupplies, ETF_VAULT.chainId, ETF_VAULT.vault_addr]);
	return (
		<View>
			<Text className="text-white text-lg sm:text-xl font-bold mb-4 pl-2 sm:pl-6">Underlying Vaults</Text>

			{isSmallScreen ? (
				/* Mobile Layout - Card Style */
				<View className="px-2">
					{underlyingVaultFarms.map((farm, index) => (
						<UnderlyingVaultMobile key={index} farm={farm} index={index} />
					))}
				</View>
			) : (
				/* Desktop Layout - Table Style */
				<>
					{/* Table Header */}
					<View className="flex flex-row items-center py-3 border-b border-gray-600 pl-6">
						<View className="flex-1 min-w-[120px]">
							<Text className="text-textSecondary text-base font-league-spartan">Vault Name</Text>
						</View>
						<View className="flex-1 min-w-[100px]">
							<Text className="text-textSecondary text-base font-league-spartan">Platform</Text>
						</View>
						<View className="flex-1 min-w-[80px]">
							<Text className="text-textSecondary text-base font-league-spartan">APY</Text>
						</View>
						<View className="flex-1 min-w-[80px]">
							<Text className="text-textSecondary text-base font-league-spartan">Auto Compounded</Text>
						</View>
						<View className="flex-1 min-w-[120px] text-center">
							<Text className="text-textSecondary text-base font-league-spartan text-center">Price Trend (1M)</Text>
						</View>
					</View>

					{/* Table Rows */}
					{underlyingVaultFarms.map((farm, index) => (
						<UnderlyingVaultRowDesktop key={index} farm={farm} index={index} />
					))}
				</>
			)}
			{/* Pool Info Section */}
			<View className="mt-4 flex flex-col gap-2">
				<StatInfo
					iconUrl={<MarketCapIcon />}
					title="Market Cap"
					value={customCommify(totalMarketCap, { minimumFractionDigits: 0, showDollarSign: true })}
				/>
				<StatInfo
					iconUrl={<VolumeIcon />}
					title="Vault Liquidity"
					value={customCommify(etfVaultSupply.supplyUsdFormatted, { minimumFractionDigits: 0, showDollarSign: true })}
				/>
				<StatInfo iconUrl={<TrendUpIcon />} title="Underlying APR" value={ETF_VAULT.underlyingAPR} />
				<StatInfo iconUrl={<RocketIcon />} title="Beratrax Auto-Compounded APY" value={ETF_VAULT.apy} />
				<StatInfo iconUrl={<CreatedIcon />} title="Created On" value={ETF_VAULT.createdOn} />
			</View>
		</View>
	);
};

export default ETFInfo;
