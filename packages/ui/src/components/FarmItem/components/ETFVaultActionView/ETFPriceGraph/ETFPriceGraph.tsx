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

interface ETFPriceGraphProps {
	vault: ETFVaultDef;
}

const ETFPriceGraph: React.FC<ETFPriceGraphProps> = ({ vault }) => {
	console.log("vault", vault);
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

	// Calculate ETF price based on underlying assets
	const etfPriceData = useMemo(() => {
		// Check if any hook is still loading
		const isAnyLoading = underlyingLpDataHooks.some((hook) => hook.isLpPriceLoading);
		if (isAnyLoading) return [];

		// For now, we'll calculate a weighted average of underlying prices
		// This is a simplified calculation - in real implementation you'd have proper ETF pricing logic
		const weights = vault.underlyingVaults.map(() => 1 / vault.underlyingVaults.length); // Equal weights for now

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

		// Aggregate price data from all underlying farms
		const aggregatedData: { [timestamp: number]: { total: number; count: number } } = {};

		underlyingLpDataHooks.forEach((farmLpHook, farmIndex) => {
			const farmLpData = farmLpHook?.lp;
			if (!farmLpData) return;

			farmLpData
				.filter((entry: any) => entry.timestamp >= filterTimestamp && entry.lp > 0)
				.forEach((entry: any) => {
					if (!aggregatedData[entry.timestamp]) {
						aggregatedData[entry.timestamp] = { total: 0, count: 0 };
					}
					aggregatedData[entry.timestamp].total += entry.lp * weights[farmIndex];
					aggregatedData[entry.timestamp].count += weights[farmIndex];
				});
		});

		// Convert to chart data format
		return Object.entries(aggregatedData)
			.map(([timestamp, data]) => ({
				x: formatDate(parseInt(timestamp), graphFilter),
				y: data.total / Math.max(data.count, 1), // Avoid division by zero
				timestamp: parseInt(timestamp),
			}))
			.sort((a, b) => a.timestamp - b.timestamp);
	}, [underlyingLpDataHooks, graphFilter, vault.underlyingVaults, underlyingFarms]);

	// Calculate y domain safely handling empty arrays
	const yDomain = useMemo(() => {
		if (etfPriceData.length === 0) {
			return [0, 1] as [number, number]; // Default domain when no data
		}
		const minY = Math.min(...etfPriceData.map((d) => d.y));
		const maxY = Math.max(...etfPriceData.map((d) => d.y));
		// Check if min and max are the same (flat line)
		if (minY === maxY) {
			return [minY * 0.9, minY * 1.1] as [number, number]; // Add some padding
		}
		return [minY * 0.7, maxY * 1.1] as [number, number];
	}, [etfPriceData]);

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

	return (
		<View className="z-10 relative">
			<View style={{ marginTop: 10, width: "100%", height: chartHeight }}>
				{underlyingLpDataHooks.some((hook) => hook.isLpPriceLoading) ? (
					<Skeleton h={chartHeight} w="100%" />
				) : (
					<>
						{etfPriceData.length === 0 ? (
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
										voronoiBlacklist={["etfPriceArea"]}
										labels={({ datum }) => `${datum.x}\nETF Price: $${datum.y.toFixed(4)}`}
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
													{ fontSize: screenWidth <= 640 ? 12 : 14, fontWeight: "bold", fill: Colors.buttonPrimary, textAnchor: "middle" },
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
									tickFormat={(y) => `$${y.toFixed(screenWidth < 576 ? 2 : 4)}`}
									tickCount={yAxisTickCount}
								/>

								<VictoryLine
									name="etfPriceLine"
									data={etfPriceData}
									style={{
										data: {
											stroke: Colors.buttonPrimary,
											strokeWidth: 2,
										},
									}}
								/>

								<VictoryDefsWrapper>
									<LinearGradient id="etfPriceGradient" x1="0" y1="0" x2="0" y2="1">
										<Stop offset="5%" stopColor={Colors.bgPrimary} stopOpacity="0.3" />
										<Stop offset="95%" stopColor={Colors.bgPrimary} stopOpacity="0" />
									</LinearGradient>
								</VictoryDefsWrapper>

								<VictoryArea
									name="etfPriceArea"
									data={etfPriceData}
									style={{
										data: {
											fill: "url(#etfPriceGradient)",
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
					Historical price of the ETF based on underlying assets
				</Text>
			</View>
		</View>
	);
};

export default ETFPriceGraph;
