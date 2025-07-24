import { useMemo, useState, memo, useCallback } from "react";
import { VaultsApy } from "@beratrax/core/src/api/stats";
import { Skeleton } from "@beratrax/ui/src/components/Skeleton/Skeleton";
import { PoolDef } from "@beratrax/core/src/config/constants/pools_json";
import { useSpecificVaultApy } from "@beratrax/core/src/hooks/useVaults";
import { useFarmApy } from "@beratrax/core/src/state/farms/hooks";
import { Dimensions, Platform, Pressable, Text, View } from "react-native";

// Import victory libraries based on platform
import * as Victory from "victory";
import * as VictoryNative from "victory-native";
import { LinearGradient, Stop } from "react-native-svg";
import { Defs } from "react-native-svg";
import { customCommify } from "@beratrax/core/src/utils/common";
import Colors from "@beratrax/typescript-config/Colors";

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

const FarmApyGraph = ({ farm }: { farm: PoolDef }) => {
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

	const downsampleData = (data: VaultsApy[], filter: GraphFilterType) => {
		if (!data || data.length === 0) return [];

		const filteredData: { date: string; apy: string; timestamp: number }[] = [];

		// Filter and sort entries by timestamp
		const filteredEntries = data.filter((entry) => entry.timestamp && entry.apy && entry.apy > 0).sort((a, b) => a.timestamp - b.timestamp);

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
				const today = new Date();
				today.setHours(0, 0, 0, 0); // midnight today
				filterTimestamp = today.getTime() / 1000 - 6 * 24 * 60 * 60;
				break;
			case "month":
				filterTimestamp = now - 30 * 24 * 60 * 60;
				break;
		}

		// Use the later of filterTimestamp or firstValidTimestamp
		filterTimestamp = Math.max(filterTimestamp, firstValidTimestamp);

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

		// Process entries into appropriate time slots
		timeSlots.forEach((slotTime) => {
			const slotEntries = filteredEntries.filter((entry) => entry.timestamp >= slotTime && entry.timestamp < slotTime + interval);

			if (slotEntries.length > 0) {
				const key = formatDate(slotTime, filter);
				const totalApy = slotEntries.reduce((sum, entry) => sum + (entry.apy || 0), 0);
				const avgApy = totalApy / slotEntries.length;

				if (avgApy > 0) {
					filteredData.push({
						date: key,
						apy: avgApy.toFixed(3),
						timestamp: slotTime,
					});
				}
			}
		});

		return filteredData;
	};

	const { vaultApy, isLoading: isLoadingVaultApy, isFetched: isFetchedVaultApy } = useSpecificVaultApy(farm.id);
	const { apy: farmApys, isLoading: isApyLoading } = useFarmApy(farm);
	// Update the first entry in vaultApy with the current APY from farmApys if available

	const beratraxApy = useMemo(() => downsampleData(vaultApy?.beratraxApy || [], graphFilter), [vaultApy, graphFilter]);
	const underlyingApr = useMemo(() => downsampleData(vaultApy?.underlyingApr || [], graphFilter), [vaultApy, graphFilter]);
	const updatedBeratraxApy = useMemo(() => {
		if (!beratraxApy || beratraxApy.length === 0 || !farmApys || !farmApys.apy) {
			return beratraxApy;
		}

		const result = [...beratraxApy];
		if (result[result.length - 1]) {
			result[result.length - 1] = {
				...result[result.length - 1],
				apy: farm.isAutoCompounded ? farmApys.apy.toFixed(2).toString() : String((farmApys.feeApr + farmApys.rewardsApr).toFixed(2)),
			};
		}

		return result;
	}, [beratraxApy, farmApys]);

	const updatedUnderlyingApr = useMemo(() => {
		if (!underlyingApr || underlyingApr.length === 0 || !farmApys || !farmApys.apy) {
			return underlyingApr;
		}

		const result = [...underlyingApr];
		if (result[result.length - 1]) {
			result[result.length - 1] = {
				...result[result.length - 1],
				apy: String((farmApys.feeApr + farmApys.rewardsApr).toFixed(2)),
			};
		}

		return result;
	}, [underlyingApr, farmApys]);

	const [minApy, maxApy] = useMemo(() => {
		if (!updatedBeratraxApy || updatedBeratraxApy.length === 0) {
			if (!updatedUnderlyingApr || updatedUnderlyingApr.length === 0) return [0, 100];
			const values = updatedUnderlyingApr.map((d) => parseFloat(d.apy));
			return [Math.min(...values), Math.max(...values)];
		}

		const beratraxValues = updatedBeratraxApy.map((d) => parseFloat(d.apy));
		const underlyingValues = updatedUnderlyingApr?.map((d) => parseFloat(d.apy)) || [];
		const allValues = [...beratraxValues, ...underlyingValues];

		return [Math.min(...allValues), Math.max(...allValues)];
	}, [updatedBeratraxApy, updatedUnderlyingApr]);

	const underlyingAprChartData = useMemo(() => {
		const result = updatedUnderlyingApr.map((d) => ({
			x: d.date,
			y: parseFloat(d.apy),
		}));
		return result;
	}, [updatedUnderlyingApr]);

	const beratraxApyChartData = useMemo(() => {
		const result = updatedBeratraxApy.map((d) => ({
			x: d.date,
			y: parseFloat(d.apy),
		}));
		return result;
	}, [updatedBeratraxApy]);

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
				{isLoadingVaultApy ? (
					<Skeleton h={300} w={"100%"} />
				) : (
					<>
						{underlyingAprChartData.length === 0 ? (
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
									y: [minApy, maxApy],
								}}
								containerComponent={
									<VoronoiContainer
										voronoiDimension="x"
										voronoiBlacklist={["underlyingAprArea", "beratraxApyArea", farm.isAutoCompounded ? "underlyingApr" : ""]}
										labels={({ datum }) => {
											const beratraxApy = datum.y ? datum.y : 0;
											const underlyingApr = farm.isAutoCompounded
												? underlyingAprChartData.find((d) => d.x === datum.x)?.y || 0
												: datum.y || 0;

											return `${datum.x}${farm.isAutoCompounded ? `\nBeraTrax APY : ${beratraxApy.toFixed(2)}%` : ""}\nUnderlying APR : ${underlyingApr.toFixed(2)}%`;
										}}
										labelComponent={
											<VictoryTooltip
												flyoutWidth={200}
												flyoutHeight={90}
												cornerRadius={8}
												pointerLength={10}
												flyoutStyle={{
													fill: "#111111",
													stroke: "#333333",
													strokeWidth: 1,
													filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.3))",
												}}
												style={[
													{ fontSize: 14, fontWeight: "bold", fill: "#FFFFFF", textAnchor: "middle" }, // Date
													{ fontSize: 14, fontWeight: "bold", fill: Colors.textPrimary, textAnchor: "middle" }, // Trax APY
													{ fontSize: 14, fontWeight: "bold", fill: Colors.textSecondary, textAnchor: "middle" }, // Underlying APR
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
									name="underlyingApr"
									data={underlyingAprChartData}
									style={{
										data: {
											stroke: farm.isAutoCompounded ? Colors.textSecondary : Colors.textPrimary,
											strokeWidth: 2,
										},
									}}
								/>

								<VictoryArea
									name="underlyingAprArea"
									data={underlyingAprChartData}
									style={{
										data: {
											fill: farm.isAutoCompounded ? "url(#colorBeraTraxApy)" : "url(#areaGradient)",
											strokeWidth: 0,
										},
									}}
								/>

								<VictoryLine
									name="beratraxApy"
									data={beratraxApyChartData}
									style={{
										data: {
											stroke: farm.isAutoCompounded ? Colors.textPrimary : Colors.textSecondary,
											strokeWidth: 2,
										},
									}}
								/>

								<VictoryArea
									name="beratraxApyArea"
									data={beratraxApyChartData}
									style={{
										data: {
											fill: farm.isAutoCompounded ? "url(#areaGradient)" : "url(#colorBeraTraxApy)",
											strokeWidth: 0,
										},
									}}
								/>

								<VictoryDefsWrapper>
									<LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
										<Stop offset="5%" stopColor={Colors.bgPrimary} stopOpacity="0.3" />
										<Stop offset="95%" stopColor={Colors.bgPrimary} stopOpacity="0" />
									</LinearGradient>
								</VictoryDefsWrapper>

								<VictoryDefsWrapper>
									<LinearGradient id="colorBeraTraxApy" x1="0" y1="0" x2="0" y2="1">
										<Stop offset="5%" stopColor={Colors.textSecondary} stopOpacity="0.3" />
										<Stop offset="95%" stopColor={Colors.textSecondary} stopOpacity="0" />
									</LinearGradient>
								</VictoryDefsWrapper>
							</VictoryChart>
						)}
					</>
				)}
			</View>
			<View className="flex flex-row justify-around pt-2 sm:justify-center sm:gap-4">
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
export default FarmApyGraph;
