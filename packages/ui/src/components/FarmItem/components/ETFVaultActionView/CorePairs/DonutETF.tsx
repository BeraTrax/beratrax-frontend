import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, DoughnutController, TooltipItem } from "chart.js";

// Register Chart.js components including DoughnutController
ChartJS.register(ArcElement, Tooltip, Legend, DoughnutController);

interface ChordDiagramProps {
	data: Array<{ name: string; volume: number; swaps: number; color: string }>;
}

type DataType = "volume" | "swaps";

const DonutETF: React.FC<ChordDiagramProps> = ({ data }) => {
	const [dataType, setDataType] = useState<DataType>("volume");
	const [hoveredSegment, setHoveredSegment] = useState<{ name: string; value: number; color: string } | null>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const chartRef = useRef<ChartJS | null>(null);

	// Format display values
	const formatDisplayValue = useCallback((value: number, type: DataType): string => {
		if (type === "volume") {
			return value >= 1000000 ? `$${(value / 1000000).toFixed(1)}M` : `$${(value / 1000).toFixed(0)}K`;
		}
		return value.toLocaleString();
	}, []);

	// Function to brighten colors when hovering
	const brightenColor = useCallback((hex: string, factor: number = 0.3): string => {
		// Remove '#' if present
		hex = hex.replace(/^#/, "");

		if (hex.length !== 6) {
			throw new Error("Only 6-digit hex colors are supported.");
		}

		const r = parseInt(hex.slice(0, 2), 16);
		const g = parseInt(hex.slice(2, 4), 16);
		const b = parseInt(hex.slice(4, 6), 16);

		const brighten = (channel: number) => Math.min(255, Math.round(channel + (255 - channel) * factor));

		const newR = brighten(r);
		const newG = brighten(g);
		const newB = brighten(b);

		return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
	}, []);

	// Memoize chart data to prevent unnecessary recalculations
	const chartData = useMemo(() => {
		const values = data.map((item) => (dataType === "volume" ? item.volume : item.swaps));
		const labels = data.map((item) => item.name);
		const colors = data.map((item) => item.color);

		return {
			labels,
			datasets: [
				{
					data: values,
					backgroundColor: colors,
					borderColor: colors,
					borderWidth: 2,
					hoverOffset: 8,
					hoverBackgroundColor: colors.map((color) => brightenColor(color)),
					hoverBorderColor: colors.map((color) => brightenColor(color)),
					hoverBorderWidth: 3,
				},
			],
		};
	}, [data, dataType]);

	// Memoize chart options to prevent object recreation
	const chartOptions = useMemo(
		() =>
			({
				responsive: true,
				maintainAspectRatio: false,
				interaction: {
					intersect: false,
					mode: "point" as const,
				},
				plugins: {
					legend: {
						display: false,
					},
					tooltip: {
						enabled: false, // Disable default tooltip since we're using custom hover display
					},
				},
				cutout: "50%",
				radius: "90%",
				onHover: (event: any, elements: any[]) => {
					// Change cursor to pointer when hovering over segments
					if (canvasRef.current) {
						canvasRef.current.style.cursor = elements.length > 0 ? "pointer" : "default";
					}
					if (elements.length > 0) {
						const elementIndex = elements[0].index;
						const dataItem = data[elementIndex];
						const value = dataType === "volume" ? dataItem.volume : dataItem.swaps;

						setHoveredSegment({
							name: dataItem.name,
							value: value,
							color: dataItem.color,
						});
					} else {
						setHoveredSegment(null);
					}
				},
			}) as any,
		[data, dataType]
	);

	// Update chart data when dataType or data changes
	useEffect(() => {
		if (chartRef.current && Platform.OS === "web") {
			chartRef.current.data = chartData;
			chartRef.current.options = chartOptions;
			chartRef.current.update("none");
		}
	}, [chartData, chartOptions]);

	useEffect(() => {
		if (!canvasRef.current || Platform.OS !== "web" || chartRef.current) return;

		const ctx = canvasRef.current.getContext("2d");
		if (ctx) {
			try {
				chartRef.current = new ChartJS(ctx, {
					type: "doughnut",
					data: chartData,
					options: chartOptions,
				});
			} catch (error) {
				console.error("Error creating chart:", error);
			}
		}
	}, []); // Empty dependency array - only run once

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (chartRef.current) {
				chartRef.current.destroy();
				chartRef.current = null;
			}
		};
	}, []);

	// Toggle button component
	const ToggleButton = ({ isActive, onPress, label }: { isActive: boolean; onPress: () => void; label: string }) => (
		<Pressable onPress={onPress} className={`px-4 py-2 rounded-lg ${isActive ? "bg-buttonPrimary" : "bg-bgDark"}`}>
			<Text className={`text-sm font-medium font-league-spartan ${isActive ? "text-white" : "text-textSecondary"}`}>{label}</Text>
		</Pressable>
	);

	// Calculate total for percentage display
	const totalValue = useMemo(() => {
		return data.reduce((sum, item) => sum + (dataType === "volume" ? item.volume : item.swaps), 0);
	}, [data, dataType]);

	// Calculate percentage for hovered segment
	const hoveredPercentage = useMemo(() => {
		if (!hoveredSegment) return null;
		return ((hoveredSegment.value / totalValue) * 100).toFixed(1);
	}, [hoveredSegment, totalValue]);

	return (
		<View className="rounded-3xl p-6 mb-4">
			{/* Header with Title and Toggle */}
			<View className="flex items-center mb-6 relative">
				<Text className="text-white text-xl font-bold font-league-spartan">Core Pairs</Text>
				<View className="absolute right-0 flex flex-row bg-bgSecondary rounded-lg p-1">
					<ToggleButton isActive={dataType === "volume"} onPress={() => setDataType("volume")} label="$Volume" />
					<ToggleButton isActive={dataType === "swaps"} onPress={() => setDataType("swaps")} label="#Swaps" />
				</View>
			</View>

			{/* Doughnut Chart */}
			<View className="items-center relative">
				<View style={{ width: 340, height: 340 }}>
					{Platform.OS === "web" ? (
						<canvas
							ref={canvasRef}
							style={{
								maxWidth: "100%",
								maxHeight: "100%",
							}}
						/>
					) : (
						<View className="items-center justify-center w-full h-full bg-bgSecondary rounded-full">
							<Text className="text-textSecondary text-center font-league-spartan">
								Chart.js doughnut charts are only supported on web platform.
								{"\n"}Please use the web version to view this chart.
							</Text>
						</View>
					)}
				</View>

				{/* Center Text */}
				{Platform.OS === "web" && (
					<View className="absolute inset-0 flex items-center justify-center pointer-events-none">
						<View className="text-center">
							{hoveredSegment ? (
								<>
									{/* Hovered Segment Info */}
									<View className="w-4 h-4 rounded-full mx-auto mb-2" style={{ backgroundColor: hoveredSegment.color }} />
									<Text className="text-white text-lg font-bold font-league-spartan">{hoveredSegment.name}</Text>
									<Text className="text-textSecondary text-sm font-league-spartan">
										{formatDisplayValue(hoveredSegment.value, dataType)}
									</Text>
									<Text className="text-textSecondary text-xs font-league-spartan mt-1">{hoveredPercentage}% of total</Text>
								</>
							) : (
								<>
									{/* Default Total Info */}
									<Text className="text-white text-lg font-bold font-league-spartan">
										{dataType === "volume" ? "Total Volume" : "Total Swaps"}
									</Text>
									<Text className="text-textSecondary text-sm font-league-spartan">{formatDisplayValue(totalValue, dataType)}</Text>
								</>
							)}
						</View>
					</View>
				)}
			</View>
		</View>
	);
};

export default DonutETF;
