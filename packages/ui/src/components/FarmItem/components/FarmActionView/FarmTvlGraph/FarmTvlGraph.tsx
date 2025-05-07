import { useMemo, useState } from "react";
import { TVLHistory } from "@beratrax/core/src/api/stats";
import { useSpecificVaultTvl } from "@beratrax/core/src/hooks/useVaults";
import { PoolDef } from "@beratrax/core/src/config/constants/pools_json";
import { customCommify } from "@beratrax/core/src/utils/common";
import { Skeleton } from "@beratrax/ui/src/components/Skeleton/Skeleton";
// Import victory libraries based on platform
import * as Victory from "victory";
import * as VictoryNative from "victory-native";
import { Dimensions, Platform, Pressable, Text, View } from "react-native";
import { LinearGradient, Stop } from "react-native-svg";
import { Defs } from "react-native-svg";

const { VictoryChart, VictoryLine, VictoryTheme, VictoryAxis, VictoryArea, VictoryTooltip, VictoryVoronoiContainer } =
	Platform.OS === "web" ? Victory : VictoryNative;

type GraphFilterType = "hour" | "day" | "week" | "month";

const GraphFilter = ({ text, onClick, isSelected }: { text: string; onClick?: () => void; isSelected?: boolean }) => {
	return (
		<Pressable onPress={onClick}>
			<Text
				className={` px-5 py-2 font-light rounded-2xl  text-[16px] ${
					isSelected ? "bg-gradientSecondary text-textPrimary" : "bg-bgDark text-textWhite"
				}`}
			>
				{text}
			</Text>
		</Pressable>
	);
};

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

const FarmTvlGraph = ({ farm }: { farm: PoolDef }) => {
	const [graphFilter, setGraphFilter] = useState<GraphFilterType>("week");

	const graphFiltersList: { text: string; type: GraphFilterType }[] = [
		{ text: "1H", type: "hour" },
		{ text: "1D", type: "day" },
		{ text: "1W", type: "week" },
		{ text: "1M", type: "month" },
	];

	const downsampleData = (data: TVLHistory[], filter: GraphFilterType) => {
		if (!data || data.length === 0) return [];

		const filteredData: { date: string; tvl: string; timestamp: number }[] = [];

		// Filter and sort entries by timestamp
		const filteredEntries = data.filter((entry) => entry.timestamp && entry.tvl && entry.tvl > 0).sort((a, b) => a.timestamp - b.timestamp);

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
				const totalTvl = slotEntries.reduce((sum, entry) => sum + (entry.tvl || 0), 0);
				const avgTvl = totalTvl / slotEntries.length;

				if (avgTvl > 0) {
					filteredData.push({
						date: key,
						tvl: avgTvl.toFixed(3),
						timestamp: slotTime,
					});
				}
			}
		});
		return filteredData;
	};

	const { vaultTvl, isLoading: isLoadingVaultTvl, isFetched: isFetchedVaultTvl } = useSpecificVaultTvl(farm.id);
	const newData = useMemo(() => downsampleData(vaultTvl || [], graphFilter), [vaultTvl, graphFilter]);
	const chartData = useMemo(() => {
		const result = newData.map((d) => ({
			x: d.date,
			y: parseFloat(d.tvl), // ensure y is a number
		}));
		return result;
	}, [newData]);
	const [minTvl, maxTvl] = useMemo(() => {
		if (!newData || newData.length === 0) return [0, 100];

		const values = newData.map((d) => parseFloat(d.tvl));
		return [Math.min(...values), Math.max(...values)];
	}, [newData]);

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
				{isLoadingVaultTvl ? (
					<Skeleton h={300} w={1200} />
				) : (
					<>
						<VictoryChart
							width={screenWidth}
							height={300}
							theme={VictoryTheme.clean}
							padding={chartPadding}
							animate={false}
							domain={{
								y: [minTvl, maxTvl],
							}}
							containerComponent={
								<VictoryVoronoiContainer
									voronoiDimension="x"
									voronoiBlacklist={["priceArea"]}
									labels={({ datum }) => `${datum.x}\nPrice: $${customCommify(datum.y.toFixed(2))}`}
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
												{ fontSize: 14, fontWeight: "bold", fill: "#90BB62", textAnchor: "middle" }, // Second line style
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
									grid: { stroke: "#444", strokeDasharray: "4,8" },
									tickLabels: { fill: "#ccc", fontSize: screenWidth < 576 ? 8 : 10, padding: 5 },
								}}
								tickCount={xAxisTickCount}
							/>
							{/* Y Axis */}
							<VictoryAxis
								dependentAxis
								style={{
									axis: { stroke: "#888" },
									grid: { stroke: "#444", strokeDasharray: "4,8" },
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
										stroke: "#90BB62",
										strokeWidth: 2,
									},
								}}
							/>

							<Defs>
								<LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
									<Stop offset="5%" stopColor="#90BB62" stopOpacity="0.3" />
									<Stop offset="95%" stopColor="#90BB62" stopOpacity="0" />
								</LinearGradient>
							</Defs>

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
					</>
				)}
			</View>
			<View className="flex flex-row justify-around sm:justify-center sm:gap-4">
				{graphFiltersList.map((filter, index) => (
					<GraphFilter
						key={index}
						text={filter.text}
						isSelected={graphFilter === filter.type}
						onClick={() => setGraphFilter(filter.type)}
					/>
				))}
			</View>
			<View className="text-center my-4">
				<Text className="text-sm text-textSecondary">Historical Total Value Locked in the vault</Text>
			</View>
		</View>
	);
};
export default FarmTvlGraph;
