import { useMemo, useState, memo, useCallback } from "react";
import { Skeleton } from "@beratrax/ui/src/components/Skeleton/Skeleton";
import { PoolDef, ETFVaultDef } from "@beratrax/core/src/config/constants/pools_json";
import { useSpecificVaultTvl } from "@beratrax/core/src/hooks/useVaults";
import { customCommify } from "@beratrax/core/src/utils/common";
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

interface ETFTvlGraphProps {
	vault: ETFVaultDef;
	underlyingFarms: PoolDef[];
}

const ETFTvlGraph: React.FC<ETFTvlGraphProps> = ({ vault, underlyingFarms }) => {
	const [graphFilter, setGraphFilter] = useState<GraphFilterType>("week");

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

	// Get TVL data for all underlying farms
	const underlyingTvlData = underlyingFarms.map((farm) => useSpecificVaultTvl(farm.id));

	// Calculate aggregated ETF TVL based on underlying farms
	const etfTvlData = useMemo(() => {
		const allTvlData = underlyingTvlData.map((data) => data.vaultTvl).filter(Boolean);

		if (allTvlData.length === 0) return [];

		// Aggregate TVL data from all underlying farms
		const aggregatedData: { [timestamp: number]: { total: number; count: number } } = {};

		allTvlData.forEach((farmTvlData) => {
			if (!farmTvlData) return;

			farmTvlData.forEach((entry) => {
				if (entry.timestamp && entry.tvl && entry.tvl > 0) {
					if (!aggregatedData[entry.timestamp]) {
						aggregatedData[entry.timestamp] = { total: 0, count: 0 };
					}
					aggregatedData[entry.timestamp].total += entry.tvl;
					aggregatedData[entry.timestamp].count += 1;
				}
			});
		});

		// Get the timestamp range we want based on filter
		const now = Date.now() / 1000;
		let filterTimestamp = now;

		switch (graphFilter) {
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

		// Filter by timestamp and convert to chart data format
		return Object.entries(aggregatedData)
			.filter(([timestamp]) => parseInt(timestamp) >= filterTimestamp)
			.map(([timestamp, data]) => ({
				x: formatDate(parseInt(timestamp), graphFilter),
				y: data.total, // Total TVL across all underlying farms
				timestamp: parseInt(timestamp),
			}))
			.sort((a, b) => a.timestamp - b.timestamp);
	}, [underlyingTvlData, graphFilter]);

	// Calculate y domain safely handling empty arrays
	const yDomain = useMemo(() => {
		if (etfTvlData.length === 0) {
			return [0, 1] as [number, number]; // Default domain when no data
		}
		const minY = Math.min(...etfTvlData.map((d) => d.y));
		const maxY = Math.max(...etfTvlData.map((d) => d.y));
		// Check if min and max are the same (flat line)
		if (minY === maxY) {
			return [minY * 0.9, minY * 1.1] as [number, number]; // Add some padding
		}
		return [minY * 0.7, maxY * 1.1] as [number, number];
	}, [etfTvlData]);

	const screenWidth = Dimensions.get("window").width;
	const isLoading = underlyingTvlData.some((data) => data.isLoading);

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

	return (
		<View className="z-10 relative">
			<View style={{ marginTop: 10, width: "100%", height: chartHeight }}>
				{isLoading ? (
					<Skeleton h={chartHeight} w="100%" />
				) : (
					<>
						{etfTvlData.length === 0 ? (
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
										voronoiBlacklist={["etfTvlArea"]}
										labels={({ datum }) => `${datum.x}\nETF TVL: $${customCommify(datum.y.toFixed(2))}`}
										labelComponent={
											<VictoryTooltip
												flyoutWidth={screenWidth <= 640 ? 140 : 160}
												flyoutHeight={screenWidth <= 640 ? 60 : 70}
												cornerRadius={8}
												pointerLength={10}
												flyoutStyle={{
													fill: "#111111",
													stroke: "#333333",
													strokeWidth: 1,
													filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.3))",
												}}
												style={[
													{ fontSize: screenWidth <= 640 ? 12 : 14, fontWeight: "bold", fill: "#FFFFFF", textAnchor: "middle" },
													{ fontSize: screenWidth <= 640 ? 12 : 14, fontWeight: "bold", fill: Colors.textPrimary, textAnchor: "middle" },
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
									name="etfTvlLine"
									data={etfTvlData}
									style={{
										data: {
											stroke: Colors.textPrimary,
											strokeWidth: 2,
										},
									}}
								/>

								<VictoryDefsWrapper>
									<LinearGradient id="etfTvlGradient" x1="0" y1="0" x2="0" y2="1">
										<Stop offset="5%" stopColor={Colors.textPrimary} stopOpacity="0.3" />
										<Stop offset="95%" stopColor={Colors.textPrimary} stopOpacity="0" />
									</LinearGradient>
								</VictoryDefsWrapper>

								<VictoryArea
									name="etfTvlArea"
									data={etfTvlData}
									style={{
										data: {
											fill: "url(#etfTvlGradient)",
											strokeWidth: 0,
										},
									}}
								/>
							</VictoryChart>
						)}
					</>
				)}
			</View>
			<View className="flex flex-row justify-center gap-2 sm:gap-4 pt-2">
				{graphFiltersList.map((filter, index) => (
					<GraphFilter key={index} text={filter.text} isSelected={graphFilter === filter.type} onClick={filterCallbacks[filter.type]} />
				))}
			</View>
			<View>
				<Text className="text-xs sm:text-sm text-textSecondary text-center my-3 sm:my-4 font-league-spartan px-4">
					Historical Total Value Locked in the ETF
				</Text>
			</View>
		</View>
	);
};

export default ETFTvlGraph;
