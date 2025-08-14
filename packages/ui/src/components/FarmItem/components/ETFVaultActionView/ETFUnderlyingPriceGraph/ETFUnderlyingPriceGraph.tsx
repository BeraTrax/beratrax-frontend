import { useMemo, useState, memo, useCallback } from "react";
import { Skeleton } from "@beratrax/ui/src/components/Skeleton/Skeleton";
import { PoolDef, ETFVaultDef } from "@beratrax/core/src/config/constants/pools_json";
import { useLp } from "@beratrax/core/src/hooks";
import { Pressable, Text, View, Platform, Dimensions } from "react-native";
import { Defs, LinearGradient, Stop } from "react-native-svg";
import Colors from "@beratrax/typescript-config/Colors";

// Import victory libraries based on platform
import * as Victory from "victory";
import * as VictoryNative from "victory-native";

// Create a wrapper component to filter out stringMap prop
const VictoryDefsWrapper = (props: any) => {
	const { stringMap, standalone, ...rest } = props;
	return <Defs {...rest} />;
};

const VoronoiContainer = Platform.OS === "web" ? Victory.VictoryVoronoiContainer : VictoryNative.createContainer("voronoi", "voronoi");

const { VictoryChart, VictoryLine, VictoryTheme, VictoryAxis, VictoryTooltip } = Platform.OS === "web" ? Victory : VictoryNative;

type GraphFilterType = "hour" | "day" | "week" | "month";

const GraphFilter = memo(({ text, onClick, isSelected }: { text: string; onClick?: () => void; isSelected?: boolean }) => {
	return (
		<Pressable onPress={onClick}>
			<Text
				className={` px-3 sm:px-5 py-1.5 sm:py-2 font-light rounded-2xl text-sm sm:text-[16px] font-league-spartan ${
					isSelected ? "bg-gradientSecondary text-textPrimary" : "bg-bgDark text-textWhite"
				}`}
			>
				{text}
			</Text>
		</Pressable>
	);
});

const formatDate = (timestamp: number, filter: GraphFilterType): string => {
	const date = new Date(timestamp * 1000);
	const hours = date.getHours();
	const minutes = date.getMinutes();
	const day = date.getDate();
	const month = date.getMonth() + 1;

	switch (filter) {
		case "hour":
			return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
		case "day":
			return `${hours.toString().padStart(2, "0")}:00`;
		case "week":
		case "month":
			return `${day}/${month}`;
		default:
			return `${day}/${month}/${date.getFullYear()}`;
	}
};

// Define colors for different underlying assets
const UNDERLYING_COLORS = [
	Colors.buttonPrimary, // Blue (keep one)
	"#FF6B35", // Orange/Red
	"#4ECDC4", // Teal/Cyan
	"#45B7D1", // Light Blue
	"#96CEB4", // Mint Green
	"#FFEAA7", // Yellow
	"#DDA0DD", // Plum/Purple
	"#FFB6C1", // Light Pink
];

interface ETFUnderlyingPriceGraphProps {
	vault: ETFVaultDef;
	underlyingFarms: PoolDef[];
}

const ETFUnderlyingPriceGraph: React.FC<ETFUnderlyingPriceGraphProps> = ({ vault, underlyingFarms }) => {
	const [graphFilter, setGraphFilter] = useState<GraphFilterType>("day");

	const graphFiltersList = useMemo(
		() => [
			{ text: "1H", type: "hour" as const },
			{ text: "1D", type: "day" as const },
			{ text: "1W", type: "week" as const },
			{ text: "1M", type: "month" as const },
		],
		[]
	);

	const handleFilterClick = useCallback((type: GraphFilterType) => {
		setGraphFilter(type);
	}, []);

	const filterCallbacks = useMemo(() => {
		return graphFiltersList.reduce(
			(acc, filter) => {
				acc[filter.type] = () => handleFilterClick(filter.type);
				return acc;
			},
			{} as Record<GraphFilterType, () => void>
		);
	}, [graphFiltersList, handleFilterClick]);

	// Get LP data for all underlying farms
	const underlyingLpDataHooks = underlyingFarms.map((farm) => useLp(farm.id));

	const downsampleData = useCallback((data: any[], filter: GraphFilterType) => {
		if (!data || data.length === 0) return [];

		const filteredData: { date: string; lp: string; timestamp: number }[] = [];

		// Filter and sort entries by timestamp
		const filteredEntries = data
			.filter((entry) => entry.timestamp && typeof entry.lp === "number" && entry.lp > 0)
			.sort((a, b) => a.timestamp - b.timestamp);

		if (filteredEntries.length === 0) return [];

		const now = Date.now() / 1000;
		const firstValidTimestamp = filteredEntries[0].timestamp;
		let filterTimestamp = now;

		switch (filter) {
			case "hour":
				filterTimestamp = now - 60 * 60;
				break;
			case "day":
				filterTimestamp = now - 24 * 60 * 60;
				break;
			case "week":
				filterTimestamp = now - 7 * 24 * 60 * 60;
				break;
			case "month":
				filterTimestamp = now - 30 * 24 * 60 * 60;
				break;
		}

		// Use the later of filterTimestamp or firstValidTimestamp
		filterTimestamp = Math.max(filterTimestamp, firstValidTimestamp);

		// Make sure we have data in the selected time range
		const entriesInRange = filteredEntries.filter((entry) => entry.timestamp >= filterTimestamp);
		if (entriesInRange.length === 0) {
			// If no entries in range, take the most recent ones for display
			const recentEntries = filteredEntries.slice(-10); // Take last 10 entries
			if (recentEntries.length > 0) {
				const mostRecent = recentEntries[recentEntries.length - 1];
				filteredData.push({
					date: formatDate(mostRecent.timestamp, filter),
					lp: mostRecent.lp.toFixed(3),
					timestamp: mostRecent.timestamp,
				});
			}
			return filteredData;
		}

		// Generate time slots based on the filter type
		const timeSlots: number[] = [];
		const interval =
			filter === "hour"
				? 5 * 60 // 5 minutes for hour view
				: filter === "day"
					? 60 * 60 // 1 hour for day view
					: filter === "week"
						? 24 * 60 * 60 // 1 day for week view
						: 24 * 60 * 60; // 1 day for month view

		for (let t = filterTimestamp; t <= now; t += interval) {
			timeSlots.push(t);
		}

		// If we don't have any time slots, add at least one
		if (timeSlots.length === 0) {
			timeSlots.push(filterTimestamp);
		}

		// Process entries into appropriate time slots
		timeSlots.forEach((slotTime) => {
			const slotEntries = filteredEntries.filter((entry) => entry.timestamp >= slotTime && entry.timestamp < slotTime + interval);

			if (slotEntries.length > 0) {
				const key = formatDate(slotTime, filter);
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
	}, []);

	// Process data for each underlying farm
	const underlyingChartsData = useMemo(() => {
		// Check if any hook is still loading
		const isAnyLoading = underlyingLpDataHooks.some((hook) => hook.isLpPriceLoading);
		if (isAnyLoading) return [];

		return underlyingFarms.map((farm, index) => {
			const farmLpHook = underlyingLpDataHooks[index];
			const farmLpData = farmLpHook?.lp;

			if (!farmLpData || farmLpData.length === 0) {
				return { name: farm.name, color: UNDERLYING_COLORS[index % UNDERLYING_COLORS.length], data: [] };
			}

			const processedData = downsampleData(farmLpData, graphFilter);
			const chartData = processedData.map((d) => ({
				x: d.date,
				y: parseFloat(d.lp),
				farmName: farm.name,
			}));

			return {
				name: farm.name,
				color: UNDERLYING_COLORS[index % UNDERLYING_COLORS.length],
				data: chartData,
			};
		});
	}, [underlyingLpDataHooks, underlyingFarms, graphFilter, downsampleData]);

	// Calculate y domain across all farms
	const yDomain = useMemo(() => {
		const allValues = underlyingChartsData.flatMap((farm) => farm.data.map((d) => d.y));

		if (allValues.length === 0) {
			return [0, 1] as [number, number];
		}

		const minY = Math.min(...allValues);
		const maxY = Math.max(...allValues);

		if (minY === maxY) {
			return [minY * 0.9, minY * 1.1] as [number, number];
		}

		return [minY * 0.7, maxY * 1.1] as [number, number];
	}, [underlyingChartsData]);

	const screenWidth = Dimensions.get("window").width;

	if (!screenWidth) return null;

	// Responsive configuration based on screen width
	const getTickCount = (width: number) => {
		if (width < 375) return 3;
		if (width < 576) return 4;
		if (width < 768) return 5;
		return 8;
	};

	const xAxisTickCount = getTickCount(screenWidth);
	const yAxisTickCount = Math.min(5, getTickCount(screenWidth) - 1);

	// Calculate padding based on screen size
	const chartPadding = useMemo(() => {
		const leftPadding = screenWidth < 576 ? 30 : 40;
		const rightPadding = screenWidth < 576 ? 10 : 20;
		return { top: 40, bottom: 20, left: leftPadding, right: rightPadding };
	}, [screenWidth]);

	const chartHeight = screenWidth <= 640 ? 250 : 300;

	const hasData = underlyingChartsData.some((farm) => farm.data.length > 0);

	return (
		<View className="z-10 relative">
			<View style={{ marginTop: 10, width: "100%", height: chartHeight }}>
				{underlyingLpDataHooks.some((hook) => hook.isLpPriceLoading) ? (
					<Skeleton h={chartHeight} w="100%" />
				) : (
					<>
						{!hasData ? (
							<View style={{ height: chartHeight, justifyContent: "center", alignItems: "center" }}>
								<Text className="text-textWhite">No data available for this time period</Text>
							</View>
						) : (
							<VictoryChart
								width={screenWidth}
								height={chartHeight}
								theme={VictoryTheme.clean}
								padding={chartPadding}
								animate={false}
								domain={{
									y: yDomain,
								}}
								containerComponent={
									<VoronoiContainer
										voronoiDimension="x"
										voronoiBlacklist={(() => {
											// Find the farm with the highest average value to make it the "top line"
											const farmWithHighestAvg = underlyingChartsData.reduce((highest, current) => {
												const highestAvg = highest.data.reduce((sum, d) => sum + d.y, 0) / highest.data.length;
												const currentAvg = current.data.reduce((sum, d) => sum + d.y, 0) / current.data.length;
												return currentAvg > highestAvg ? current : highest;
											});

											// Blacklist all lines except the highest value one
											return underlyingChartsData
												.map((farm, i) => (farm === farmWithHighestAvg ? null : `underlyingLine-${i}`))
												.filter((item): item is string => item !== null);
										})()}
										labels={({ datum }) => {
											// Find all farms data for this time point
											const timePoint = datum.x;
											const allFarmsAtTime = underlyingChartsData
												.map((farm) => {
													const dataAtTime = farm.data.find((d) => d.x === timePoint);
													return dataAtTime ? `${farm.name}: $${dataAtTime.y.toFixed(4)}` : null;
												})
												.filter(Boolean);

											return `${timePoint}\n${allFarmsAtTime.join("\n")}`;
										}}
										labelComponent={
											<VictoryTooltip
												flyoutWidth={screenWidth <= 640 ? 160 : 180}
												flyoutHeight={screenWidth <= 640 ? 110 : 120}
												cornerRadius={8}
												pointerLength={6}
												orientation="top"
												flyoutStyle={{
													fill: "rgba(0, 0, 0, 0.9)",
													stroke: "rgba(255, 255, 255, 0.2)",
													strokeWidth: 1,
												}}
												flyoutPadding={{ top: 16, bottom: 16, left: 20, right: 20 }}
												style={[
													// Time style (white)
													{
														fontSize: screenWidth <= 640 ? 14 : 15,
														fontWeight: "600",
														fill: "#FFFFFF",
														textAnchor: "middle",
														fontFamily: "system-ui",
													},
													// Farm styles (each with their line color)
													...underlyingChartsData.map((farm) => ({
														fontSize: screenWidth <= 640 ? 13 : 14,
														fontWeight: "500",
														fill: farm.color,
														textAnchor: "middle",
														fontFamily: "system-ui",
													})),
												]}
												dy={-15}
												centerOffset={{ x: 0 }}
												constrainToVisibleArea
											/>
										}
									/>
								}
							>
								<VictoryAxis
									style={{
										axis: { stroke: "#888" },
										tickLabels: { fill: "#ccc", fontSize: screenWidth < 576 ? 8 : 10, padding: 5 },
									}}
									tickCount={xAxisTickCount}
								/>
								<VictoryAxis
									dependentAxis
									style={{
										axis: { stroke: "#888" },
										tickLabels: { fill: "#ccc", fontSize: screenWidth < 576 ? 8 : 10, padding: 5 },
									}}
									tickFormat={(y) => `$${y.toFixed(screenWidth < 576 ? 2 : 4)}`}
									tickCount={yAxisTickCount}
								/>

								{underlyingChartsData.map(
									(farm, index) =>
										farm.data.length > 0 && (
											<VictoryLine
												key={`line-${index}`}
												name={`underlyingLine-${index}`}
												data={farm.data}
												style={{
													data: {
														stroke: farm.color,
														strokeWidth: 2,
													},
												}}
											/>
										)
								)}
							</VictoryChart>
						)}
					</>
				)}
			</View>

			{/* Legend */}
			{hasData && (
				<View className="flex flex-row flex-wrap justify-center gap-3 mt-2 mb-2">
					{underlyingChartsData
						.filter((farm) => farm.data.length > 0)
						.map((farm, index) => (
							<View key={index} className="flex flex-row items-center gap-1">
								<View
									style={{
										width: 12,
										height: 2,
										backgroundColor: farm.color,
										borderRadius: 1,
									}}
								/>
								<Text className="text-xs text-textWhite font-league-spartan">{farm.name}</Text>
							</View>
						))}
				</View>
			)}

			<View className="flex flex-row justify-center gap-2 sm:gap-4 pt-2">
				{graphFiltersList.map((filter, index) => (
					<GraphFilter key={index} text={filter.text} isSelected={graphFilter === filter.type} onClick={filterCallbacks[filter.type]} />
				))}
			</View>
			<View>
				<Text className="text-xs sm:text-sm text-textSecondary text-center my-3 sm:my-4 font-league-spartan px-4">
					Historical prices of the underlying assets in the XTF
				</Text>
			</View>
		</View>
	);
};

export default ETFUnderlyingPriceGraph;
