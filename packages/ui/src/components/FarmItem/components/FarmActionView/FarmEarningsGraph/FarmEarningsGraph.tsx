import { useMemo, useState, useEffect } from "react";
import { Skeleton } from "@beratrax/ui/src/components/Skeleton/Skeleton";
import Select from "@beratrax/ui/src/components/Select/Select";
import { PoolDef } from "@beratrax/core/src/config/constants/pools_json";
import useFarmApy from "@beratrax/core/src/state/farms/hooks/useFarmApy";
import useWallet from "@beratrax/core/src/hooks/useWallet";
import useTokens from "@beratrax/core/src/state/tokens/useTokens";
import { customCommify, formatCurrency } from "@beratrax/core/src/utils/common";
import { View, Text, Platform, Dimensions, TextInput } from "react-native";
import { Defs, LinearGradient, Stop } from "react-native-svg";

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

const FarmEarningsGraph = ({ farm }: { farm: PoolDef }) => {
	const { currentWallet } = useWallet();
	const { balances } = useTokens();
	const [investmentAmount, setInvestmentAmount] = useState<number>(1000);
	const [months, setMonths] = useState<number>(12);

	const { apy: farmApys, isLoading: isApyLoading } = useFarmApy(farm);

	const isAutoCompounded = farm.isAutoCompounded;
	const underlyingApr = farmApys?.rewardsApr + farmApys?.feeApr;
	const autoCompoundedApy = farmApys?.apy;
	const userStake = useMemo(() => Number(balances[farm.chainId][farm.vault_addr]?.valueUsd), [balances]);

	useEffect(() => {
		if (currentWallet && userStake > 0) {
			setInvestmentAmount(Number(userStake.toFixed(2)));
		}
	}, [currentWallet, userStake]);

	const handleInvestmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (value === "") {
			setInvestmentAmount(0);
		} else {
			const numValue = parseFloat(value);
			if (!isNaN(numValue) && numValue >= 0) {
				setInvestmentAmount(numValue);
			}
		}
	};

	const handleMonthsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (value === "") {
			setMonths(0);
		} else {
			const numValue = parseInt(value);
			if (!isNaN(numValue) && numValue >= 1 && numValue <= 60) {
				setMonths(numValue);
			}
		}
	};

	const projectedAutoCompoundedEarnings = useMemo(() => {
		if (!underlyingApr || !investmentAmount) return [];
		if (isAutoCompounded && !autoCompoundedApy) return [];

		const initialInvestment = investmentAmount;
		const projectedData = [];

		// Determine if we should use daily or monthly intervals
		const useDailyIntervals = months <= 12;
		const totalDays = months * 30; // Approximate days in the period
		const intervalCount = useDailyIntervals ? totalDays : months;

		for (let i = 0; i <= intervalCount; i++) {
			const date = new Date();
			if (useDailyIntervals) {
				date.setDate(date.getDate() + i);
			} else {
				date.setMonth(date.getMonth() + i);
			}

			// Calculate time in years for the projection
			const timeInYears = useDailyIntervals ? i / 365 : i / 12;

			const simpleAprEarnings = initialInvestment * (1 + (underlyingApr / 100) * timeInYears);

			const dataPoint: any = {
				date: useDailyIntervals
					? date.toLocaleDateString(undefined, { day: "numeric", month: "short" })
					: date.toLocaleDateString(undefined, { month: "short", year: "numeric" }),
				simpleApr: simpleAprEarnings,
				timestamp: Math.floor(date.getTime() / 1000),
			};

			if (isAutoCompounded && autoCompoundedApy) {
				const frequency = 525600; // per minute
				const rewardsRate = (farmApys?.rewardsApr + farmApys.extraRewardsApr) / 100;
				const feeRate = farmApys?.feeApr / 100;

				const compoundedRewards = initialInvestment * Math.pow(1 + rewardsRate / frequency, frequency * timeInYears);
				const linearFeeEarnings = initialInvestment * (feeRate * timeInYears);

				dataPoint.autoCompounded = compoundedRewards + linearFeeEarnings;
			}

			projectedData.push(dataPoint);
		}

		return projectedData;
	}, [underlyingApr, autoCompoundedApy, investmentAmount, isAutoCompounded, months]);

	const [minEarnings, maxEarnings] = useMemo(() => {
		if (!projectedAutoCompoundedEarnings || projectedAutoCompoundedEarnings.length === 0) return [investmentAmount, investmentAmount * 2];

		const values = projectedAutoCompoundedEarnings.map((d) => (isAutoCompounded ? Math.max(d.autoCompounded, d.simpleApr) : d.simpleApr));

		return [investmentAmount, Math.max(...values) * 1.1];
	}, [projectedAutoCompoundedEarnings, investmentAmount, isAutoCompounded]);

	const simpleAprChartData = useMemo(() => {
		const result = projectedAutoCompoundedEarnings.map((d) => {
			const y = parseFloat(d.simpleApr);
			return {
				x: d.date,
				y: isNaN(y) ? 0 : y, // Replace NaN with 0
			};
		});
		return result;
	}, [projectedAutoCompoundedEarnings]);

	const autoCompoundedChartData = useMemo(() => {
		const result = projectedAutoCompoundedEarnings.map((d) => {
			const y = parseFloat(d.autoCompounded);
			return {
				x: d.date,
				y: isNaN(y) ? 0 : y, // Replace NaN with 0
			};
		});
		return result;
	}, [projectedAutoCompoundedEarnings]);

	// Calculate y domain safely handling empty arrays
	const yDomain = useMemo(() => {
		const chartData = isAutoCompounded ? autoCompoundedChartData : simpleAprChartData;
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
	}, [simpleAprChartData, autoCompoundedChartData, isAutoCompounded]);

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
		<View className="relative">
			<View className="flex flex-col items-center mb-4">
				<View className="flex flex-row gap-4 mb-2 items-center">
					<View className="relative h-12">
						<View className="absolute left-3 top-1/2 -translate-y-1/2 z-10" style={Platform.OS === "ios" ? { zIndex: 1 } : undefined}>
							<Text className="text-textSecondary">$</Text>
						</View>
						{Platform.OS === "ios" ? (
							<View className="bg-bgDark rounded-lg h-full w-32 items-center justify-center">
								<TextInput
									keyboardType="numeric"
									value={investmentAmount ? investmentAmount.toString() : ""}
									onChangeText={(value) => {
										if (value === "") {
											setInvestmentAmount(0);
										} else {
											const numValue = parseFloat(value);
											if (!isNaN(numValue) && numValue >= 0) {
												setInvestmentAmount(numValue);
											}
										}
									}}
									style={{
										color: "white",
										fontSize: 18,
										paddingLeft: 16,
										width: "100%",
										textAlign: "center",
									}}
									placeholder="Enter amount"
									placeholderTextColor="transparent"
								/>
							</View>
						) : (
							<TextInput
								keyboardType="numeric"
								value={investmentAmount ? investmentAmount.toString() : ""}
								onChangeText={(value) => {
									if (value === "") {
										setInvestmentAmount(0);
									} else {
										const numValue = parseFloat(value);
										if (!isNaN(numValue) && numValue >= 0) {
											setInvestmentAmount(numValue);
										}
									}
								}}
								className="bg-bgDark text-textWhite text-center text-lg h-full pl-8 pr-4 rounded-lg w-32"
								placeholder="Enter amount"
								placeholderTextColor="transparent"
							/>
						)}
					</View>
					<View className="relative h-12">
						<View className="h-full">
							<Select
								value={months.toString()}
								setValue={(value) => setMonths(Number(value))}
								options={["3", "6", "12", "24"]}
								extraText={["months", "months", "months", "months"]}
								className="h-full bg-bgDark text-textWhite rounded-lg"
								customWidth={120}
							/>
						</View>
					</View>
				</View>
				<Text className="text-sm text-textSecondary">Enter investment amount and period to see projection</Text>
			</View>
			<View className="mt-4 w-full h-80">
				{isApyLoading ? (
					<Skeleton h={300} w={"100%"} />
				) : (
					<View>
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
									voronoiBlacklist={["simpleAprArea", "autoCompoundedApyArea", farm.isAutoCompounded ? "simpleApr" : "autoCompoundedApy"]}
									labels={({ datum }) => {
										const autoCompoundedValue = isAutoCompounded && datum.y ? datum.y : 0;
										const simpleAprValue = simpleAprChartData.find((d) => d.x === datum.x)?.y || 0;

										return `${datum.x}${farm.isAutoCompounded ? `\nBeraTrax APY : $${customCommify(autoCompoundedValue.toFixed(2))}` : ""}\nUnderlying APR : $${customCommify(simpleAprValue.toFixed(2))}`;
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
												{ fontSize: 14, fontWeight: "bold", fill: "#90BB62", textAnchor: "middle" }, // BeraTrax APY
												{ fontSize: 14, fontWeight: "bold", fill: "#8884d8", textAnchor: "middle" }, // Underlying APR
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
								name="simpleApr"
								data={simpleAprChartData}
								style={{
									data: {
										stroke: farm.isAutoCompounded ? "#8884d8" : "#90BB62",
										strokeWidth: 2,
									},
								}}
							/>

							<VictoryArea
								name="simpleAprArea"
								data={simpleAprChartData}
								style={{
									data: {
										fill: farm.isAutoCompounded ? "url(#colorAutoCompounded)" : "url(#areaGradient)",
										strokeWidth: 0,
									},
								}}
							/>

							<VictoryLine
								name="autoCompoundedApy"
								data={autoCompoundedChartData}
								style={{
									data: {
										stroke: farm.isAutoCompounded ? "#90BB62" : "#8884d8",
										strokeWidth: 2,
									},
								}}
							/>

							<VictoryArea
								name="autoCompoundedApyArea"
								data={autoCompoundedChartData}
								style={{
									data: {
										fill: farm.isAutoCompounded ? "url(#areaGradient)" : "url(#colorAutoCompounded)",
										strokeWidth: 0,
									},
								}}
							/>

							<VictoryDefsWrapper>
								<LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
									<Stop offset="5%" stopColor="#90BB62" stopOpacity="0.3" />
									<Stop offset="95%" stopColor="#90BB62" stopOpacity="0" />
								</LinearGradient>
							</VictoryDefsWrapper>

							<VictoryDefsWrapper>
								<LinearGradient id="colorAutoCompounded" x1="0" y1="0" x2="0" y2="1">
									<Stop offset="5%" stopColor="#8884d8" stopOpacity="0.3" />
									<Stop offset="95%" stopColor="#8884d8" stopOpacity="0" />
								</LinearGradient>
							</VictoryDefsWrapper>
						</VictoryChart>
					</View>
				)}
			</View>
			{/* Fix positioning for smaller screens to move text lower */}
			<View
				className={`text-center ${screenWidth >= 768 ? "absolute bottom-0 left-0 right-0 mb-4" : screenWidth >= 576 ? "mt-6" : "mt-12"}`}
			>
				<Text className="text-sm text-center text-textSecondary">
					{months}-Month Projection of ${formatCurrency(investmentAmount)} Investment
				</Text>
			</View>
		</View>
	);
};
export default FarmEarningsGraph;
