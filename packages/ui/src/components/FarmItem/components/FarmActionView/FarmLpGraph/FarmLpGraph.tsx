import { useMemo, useState, memo, useCallback } from "react";
import { Skeleton } from "@beratrax/ui/src/components/Skeleton/Skeleton";
import { LP_Prices } from "@beratrax/core/src/api/stats";
import { useLp } from "@beratrax/core/src/hooks";
import { PoolDef } from "@beratrax/core/src/config/constants/pools_json";
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

const { VictoryChart, VictoryLine, VictoryTheme, VictoryAxis, VictoryArea, VictoryTooltip } =
	Platform.OS === "web" ? Victory : VictoryNative;

type GraphFilterType = "hour" | "day" | "week" | "month";

const GraphFilter = memo(({ text, onClick, isSelected }: { text: string; onClick?: () => void; isSelected?: boolean }) => {
	return (
		<Pressable onPress={onClick}>
			<Text
				className={` px-5 py-2 font-light rounded-2xl  text-[16px] font-league-spartan ${
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

const FarmLpGraph = ({ farm }: { farm: PoolDef }) => {
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

	const downsampleData = (data: LP_Prices[], filter: GraphFilterType) => {
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
	};

	const { lp, isLpPriceLoading } = useLp(farm.id);

	const newData = useMemo(() => {
		const result = downsampleData(lp || [], graphFilter);
		return result;
	}, [lp, graphFilter]);

	const chartData = useMemo(() => {
		const result = newData.map((d) => ({
			x: d.date,
			y: parseFloat(d.lp), // ensure y is a number
		}));
		return result;
	}, [newData]);

	// Calculate y domain safely handling empty arrays
	const yDomain = useMemo(() => {
		if (chartData.length === 0) {
			return [0, 1] as [number, number]; // Default domain when no data
		}
		const minY = Math.min(...chartData.map((d) => d.y));
		const maxY = Math.max(...chartData.map((d) => d.y));
		// Check if min and max are the same (flat line)
		if (minY === maxY) {
			return [minY * 0.9, minY * 1.1] as [number, number]; // Add some padding
		}
		return [minY * 0.7, maxY * 1.1] as [number, number];
	}, [chartData]);

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

	return (
		<View className="z-10 relative">
			<View style={{ marginTop: 10, width: "100%", height: 300 }}>
				{isLpPriceLoading ? (
					<Skeleton h={300} w={1200} />
				) : (
					<>
						{chartData.length === 0 ? (
							<View style={{ height: 300, justifyContent: "center", alignItems: "center" }}>
								<Text className="text-textWhite">No data available for this time period</Text>
							</View>
						) : (
							<VictoryChart
								width={screenWidth}
								height={300}
								theme={VictoryTheme.clean}
								padding={chartPadding}
								animate={false}
								domain={{
									y: yDomain,
								}}
								containerComponent={
									<VoronoiContainer
										voronoiDimension="x"
										voronoiBlacklist={["priceArea"]}
										labels={({ datum }) => `${datum.x}\nPrice: $${datum.y.toFixed(2)}`}
										labelComponent={
											<VictoryTooltip
												flyoutWidth={130}
												flyoutHeight={70}
												cornerRadius={8}
												pointerLength={10}
												flyoutStyle={{
													fill: "#111111",
													stroke: "#333333",
													strokeWidth: 1,
													filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.3))",
												}}
												style={[
													{ fontSize: 14, fontWeight: "bold", fill: "#FFFFFF", textAnchor: "middle" }, // First line style
													{ fontSize: 14, fontWeight: "bold", fill: Colors.buttonPrimary, textAnchor: "middle" }, // Second line style
												]}
												dy={-10}
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
								{/* Y Axis */}
								<VictoryAxis
									dependentAxis
									style={{
										axis: { stroke: "#888" },
										tickLabels: { fill: "#ccc", fontSize: screenWidth < 576 ? 8 : 10, padding: 5 },
									}}
									tickFormat={(y) => y.toFixed(screenWidth < 576 ? 1 : 2)}
									tickCount={yAxisTickCount}
								/>

								<VictoryLine
									name="priceLine"
									data={chartData}
									style={{
										data: {
											stroke: Colors.buttonPrimary,
											strokeWidth: 2,
										},
									}}
								/>

								<VictoryDefsWrapper>
									<LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
										<Stop offset="5%" stopColor={Colors.bgPrimary} stopOpacity="0.3" />
										<Stop offset="95%" stopColor={Colors.bgPrimary} stopOpacity="0" />
									</LinearGradient>
								</VictoryDefsWrapper>

								<VictoryArea
									name="priceArea"
									data={chartData}
									style={{
										data: {
											fill: "url(#areaGradient)",
											strokeWidth: 0,
										},
									}}
								/>
							</VictoryChart>
						)}
					</>
				)}
			</View>
			<View className="flex flex-row justify-around sm:justify-center sm:gap-4">
				{graphFiltersList.map((filter, index) => (
					<GraphFilter key={index} text={filter.text} isSelected={graphFilter === filter.type} onClick={filterCallbacks[filter.type]} />
				))}
			</View>
			<View>
				<Text className="text-sm text-textSecondary text-center my-4 font-league-spartan">
					Historical {farm.isAutoCompounded ? "Trax APY" : "Underlying APR"} of the vault
				</Text>
			</View>
		</View>
	);
};
export default FarmLpGraph;
