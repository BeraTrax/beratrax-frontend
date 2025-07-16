import { useState, useMemo, memo, useCallback } from "react";
import FarmRowChip from "ui/src/components/FarmItem/components/FarmRowChip/FarmRowChip";
import { View, Text, Image, Pressable, Platform, Dimensions } from "react-native";
import { ETF_VAULTS } from "@beratrax/core/src/config/constants/pools_json";
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
type TabType = "price" | "underlying-price" | "tvl" | "underlying-tvl" | "volume";

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

// Define underlying pools for the ETF
const UNDERLYING_POOLS = [
	{ name: "wBERA/Honey", color: Colors.buttonPrimary, weight: 0.4 },
	{ name: "Honey/USDT", color: "#4FC3F7", weight: 0.3 },
	{ name: "USDT/styBGT", color: "#1976D2", weight: 0.2 },
	{ name: "styBGT/wBERA", color: "#64B5F6", weight: 0.1 },
];

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
			// For day view, show cleaner time format like "9 AM", "12 PM"
			const ampm = hours >= 12 ? "PM" : "AM";
			const displayHour = hours % 12 || 12;
			return `${displayHour} ${ampm}`;
		case "week":
		case "month":
			return `${day}/${month}`;
		default:
			return `${day}/${month}`;
	}
};

// Mock data generators
const generateMockData = (type: TabType, filter: GraphFilterType) => {
	const now = Date.now();
	// Reduce data points for day view to avoid overcrowding
	const dataPoints = filter === "hour" ? 24 : filter === "day" ? 8 : filter === "week" ? 7 : 30;
	// Adjust intervals - for day view, show every 3 hours instead of every hour
	const interval = filter === "hour" ? 3600000 : filter === "day" ? 10800000 : filter === "week" ? 86400000 : 86400000;

	const baseValues = {
		price: 1.24,
		"underlying-price": 1.24,
		tvl: 2450000,
		"underlying-tvl": 2450000,
		volume: 156000,
	};

	// For underlying tabs, generate data for multiple pools
	if (type === "underlying-price" || type === "underlying-tvl") {
		return UNDERLYING_POOLS.map((pool) => {
			const data = [];
			const baseValue = type === "underlying-price" ? 1.24 * pool.weight * 2.5 : baseValues.tvl * pool.weight;

			for (let i = dataPoints - 1; i >= 0; i--) {
				const timestamp = Math.floor((now - i * interval) / 1000);
				// Adding some realistic variation per pool
				const variation = 1 + Math.sin(i * 0.5 + pool.weight * 10) * 0.15 + (Math.random() * 0.1 - 0.05);
				const value = baseValue * variation;

				data.push({
					x: formatDate(timestamp, filter),
					y: Number(value.toFixed(2)),
				});
			}
			return { name: pool.name, color: pool.color, data };
		});
	}

	// Single line data for regular tabs
	const data = [];
	const baseValue = baseValues[type];
	for (let i = dataPoints - 1; i >= 0; i--) {
		const timestamp = Math.floor((now - i * interval) / 1000);
		// Adding some realistic variation
		const variation = 1 + Math.sin(i * 0.5) * 0.1 + (Math.random() * 0.1 - 0.05);
		const value = baseValue * variation;

		data.push({
			x: formatDate(timestamp, filter),
			y: Number(value.toFixed(2)),
		});
	}
	return data;
};

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

const ETFGraph = memo(({ type, filter }: { type: TabType; filter: GraphFilterType }) => {
	const screenWidth = Dimensions.get("window").width;
	const chartData = useMemo(() => generateMockData(type, filter), [type, filter]);

	// Handle both single line data and multiple line data
	const isMultiLine = type === "underlying-price" || type === "underlying-tvl";

	// Calculate domain for both single and multi-line data
	const { minValue, maxValue } = useMemo(() => {
		if (isMultiLine && Array.isArray(chartData)) {
			const allValues = chartData.flatMap((pool: any) => pool.data.map((d: any) => d.y));
			return {
				minValue: Math.min(...allValues),
				maxValue: Math.max(...allValues),
			};
		} else if (!isMultiLine && Array.isArray(chartData)) {
			const values = chartData.map((d: any) => d.y);
			return {
				minValue: Math.min(...values),
				maxValue: Math.max(...values),
			};
		}
		return { minValue: 0, maxValue: 1 };
	}, [chartData, isMultiLine]);

	const padding = (maxValue - minValue) * 0.1;
	const yDomain = [minValue - padding, maxValue + padding];

	const getTickCount = (width: number) => Math.floor(width / 100);
	const xAxisTickCount = Math.min(5, getTickCount(screenWidth));
	const yAxisTickCount = Math.min(5, getTickCount(screenWidth) - 1);

	const chartPadding = useMemo(() => {
		const leftPadding = screenWidth < 576 ? 50 : 60;
		const rightPadding = screenWidth < 576 ? 10 : 20;
		return { top: 40, bottom: 20, left: leftPadding, right: rightPadding };
	}, [screenWidth]);

	const formatValue = (value: number) => {
		if (type === "price" || type === "underlying-price") return `$${value.toFixed(2)}`;
		if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
		if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
		return `$${value.toFixed(0)}`;
	};

	const getTitle = () => {
		switch (type) {
			case "price":
				return "ETF Price";
			case "underlying-price":
				return "Underlying Price";
			case "tvl":
				return "Total Value Locked";
			case "underlying-tvl":
				return "Underlying TVL";
			case "volume":
				return "Trading Volume";
			default:
				return "ETF Data";
		}
	};

	// Generate tooltip labels based on data type
	const getTooltipLabel = (datum: any, poolName?: string) => {
		const title = poolName ? `${poolName}` : getTitle();
		return `${datum.x}\n${title}: ${formatValue(datum.y)}`;
	};

	return (
		<View className="z-10 relative">
			<View style={{ marginTop: 10, width: "100%", height: 300 }}>
				<VictoryChart
					width={screenWidth}
					height={300}
					theme={VictoryTheme.clean}
					padding={chartPadding}
					animate={false}
					domain={{
						y: yDomain as [number, number],
					}}
					containerComponent={
						<VoronoiContainer
							voronoiDimension="x"
							voronoiBlacklist={isMultiLine ? UNDERLYING_POOLS.map((_, i) => `etfArea-${i}`) : ["etfArea"]}
							labels={({ datum }) => getTooltipLabel(datum, datum.poolName)}
							labelComponent={
								<VictoryTooltip
									flyoutWidth={160}
									flyoutHeight={70}
									cornerRadius={8}
									pointerLength={10}
									flyoutStyle={{
										fill: "#111111",
										stroke: "#333333",
										strokeWidth: 1,
										filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.3))",
									}}
									style={[{ fontSize: 14, fontWeight: "bold", fill: "#FFFFFF", textAnchor: "middle" }]}
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
							grid: { stroke: "#444", strokeDasharray: "4,8" },
							tickLabels: { fill: "#ccc", fontSize: screenWidth < 576 ? 8 : 10, padding: 5 },
						}}
						tickCount={xAxisTickCount}
					/>
					<VictoryAxis
						dependentAxis
						style={{
							axis: { stroke: "#888" },
							grid: { stroke: "#444", strokeDasharray: "4,8" },
							tickLabels: { fill: "#ccc", fontSize: screenWidth < 576 ? 8 : 10, padding: 5 },
						}}
						tickFormat={(y) => formatValue(y)}
						tickCount={yAxisTickCount}
					/>

					{isMultiLine && Array.isArray(chartData) ? (
						// Render multiple lines for underlying tabs
						chartData.map((pool: any, index: number) => (
							<VictoryLine
								key={`line-${index}`}
								name={`etfLine-${index}`}
								data={pool.data.map((d: any) => ({ ...d, poolName: pool.name }))}
								style={{
									data: {
										stroke: pool.color,
										strokeWidth: 2,
									},
								}}
							/>
						))
					) : (
						// Render single line for regular tabs
						<VictoryLine
							name="etfLine"
							data={chartData as any}
							style={{
								data: {
									stroke: Colors.buttonPrimary,
									strokeWidth: 2,
								},
							}}
						/>
					)}

					<VictoryDefsWrapper>
						<LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
							<Stop offset="5%" stopColor={Colors.bgPrimary} stopOpacity="0.3" />
							<Stop offset="95%" stopColor={Colors.bgPrimary} stopOpacity="0" />
						</LinearGradient>
					</VictoryDefsWrapper>

					{!isMultiLine && (
						<VictoryArea
							name="etfArea"
							data={chartData}
							style={{
								data: {
									fill: "url(#areaGradient)",
									strokeWidth: 0,
								},
							}}
						/>
					)}
				</VictoryChart>
			</View>
		</View>
	);
});

export const ETFPriceAndGraph: React.FC = () => {
	const [activeTab, setActiveTab] = useState<TabType>("price");
	const [graphFilter, setGraphFilter] = useState<GraphFilterType>("day");

	const handleTabPress = useCallback((tabId: TabType) => {
		setActiveTab(tabId);
	}, []);

	const handleFilterClick = useCallback((type: GraphFilterType) => {
		setGraphFilter(type);
	}, []);

	const tabHandlers = useMemo(
		() => ({
			price: () => handleTabPress("price"),
			"underlying-price": () => handleTabPress("underlying-price"),
			tvl: () => handleTabPress("tvl"),
			"underlying-tvl": () => handleTabPress("underlying-tvl"),
			volume: () => handleTabPress("volume"),
		}),
		[handleTabPress]
	);

	const tabs = useMemo(
		() => [
			{ id: "price" as TabType, label: "Price" },
			{ id: "underlying-price" as TabType, label: "Underlying Price" },
			{ id: "tvl" as TabType, label: "TVL" },
			{ id: "underlying-tvl" as TabType, label: "Underlying TVL" },
			{ id: "volume" as TabType, label: "Volume" },
		],
		[]
	);

	const graphFiltersList = useMemo(
		() => [
			{ text: "1H", type: "hour" as const },
			{ text: "1D", type: "day" as const },
			{ text: "1W", type: "week" as const },
			{ text: "1M", type: "month" as const },
		],
		[]
	);

	const filterCallbacks = useMemo(() => {
		return graphFiltersList.reduce(
			(acc, filter) => {
				acc[filter.type] = () => handleFilterClick(filter.type);
				return acc;
			},
			{} as Record<GraphFilterType, () => void>
		);
	}, [graphFiltersList, handleFilterClick]);

	return (
		<View className="relative">
			<View className="z-10">
				<View className="flex flex-row justify-between">
					<View>
						<Text className="text-textWhite mt-3 text-xl font-bold">{ETF_VAULTS.name}</Text>
						<View className="mt-2">
							<Text className="text-textWhite text-5xl font-bold">{ETF_VAULTS.currentPrice}</Text>
						</View>
					</View>
					<View className="flex flex-col mt-2 mr-3">
						<View className="flex flex-row items-center gap-2 mb-2 justify-end">
							<FarmRowChip text="BeraTrax ETF" color="invert" />
							<Image
								className="w-4 h-4 rounded-full border border-bgDark"
								source={{ uri: `${ETF_VAULTS.platform_logo}` }}
								style={{ width: 16, height: 16 }}
							/>
						</View>
						<View className="flex flex-row items-center">
							{ETF_VAULTS.logo1 ? (
								<Image alt={ETF_VAULTS.alt1} className="w-16 h-16 rounded-full" source={{ uri: ETF_VAULTS.logo1 }} />
							) : null}
							{ETF_VAULTS.logo2 ? (
								<Image alt={ETF_VAULTS.alt2} className="w-16 h-16 rounded-full -ml-8" source={{ uri: ETF_VAULTS.logo2 }} />
							) : null}
							{ETF_VAULTS.logo3 ? (
								<Image alt={ETF_VAULTS.alt3} className="w-16 h-16 rounded-full -ml-8" source={{ uri: ETF_VAULTS.logo3 }} />
							) : null}
							{ETF_VAULTS.logo4 ? (
								<Image alt={ETF_VAULTS.alt4} className="w-16 h-16 rounded-full -ml-8" source={{ uri: ETF_VAULTS.logo4 }} />
							) : null}
						</View>
					</View>
				</View>
			</View>
			<View className="flex flex-row gap-2 mt-6 mb-4 flex-wrap">
				{tabs.map((tab) => (
					<TabButton key={tab.id} id={tab.id} label={tab.label} isActive={activeTab === tab.id} onPress={tabHandlers[tab.id]} />
				))}
			</View>

			<View>
				<ETFGraph type={activeTab} filter={graphFilter} />
				<View className="flex flex-row justify-around pt-2 sm:justify-center sm:gap-4">
					{graphFiltersList.map((filter, index) => (
						<GraphFilter key={index} text={filter.text} isSelected={graphFilter === filter.type} onClick={filterCallbacks[filter.type]} />
					))}
				</View>
				<View>
					<Text className="text-sm text-textSecondary text-center my-4 font-league-spartan">
						Historical{" "}
						{activeTab === "price"
							? "price"
							: activeTab === "underlying-price"
								? "underlying asset prices"
								: activeTab === "tvl"
									? "total value locked"
									: activeTab === "underlying-tvl"
										? "underlying asset TVL"
										: "trading volume"}{" "}
						of the ETF
					</Text>
				</View>
			</View>
		</View>
	);
};

export default ETFPriceAndGraph;
