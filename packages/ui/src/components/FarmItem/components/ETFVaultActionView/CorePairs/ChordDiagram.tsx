import React, { useMemo, useState, useRef } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import Svg, { G, Path, Text as SvgText } from "react-native-svg";
import * as d3 from "d3";

interface ChordDiagramProps {
	data: Array<{ name: string; volume: number; swaps: number; color: string }>;
}

type DataType = "volume" | "swaps";

const ChordDiagram: React.FC<ChordDiagramProps> = ({ data }) => {
	const [dataType, setDataType] = useState<DataType>("volume");
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; content: string }>({
		visible: false,
		x: 0,
		y: 0,
		content: "",
	});
	const containerRef = useRef<View>(null);

	// Define dimensions and radii
	const width = 340;
	const height = width;
	const outerRadius = Math.min(width, height) * 0.5 - 30;
	const innerRadius = outerRadius - 20;

	// Generate matrix based on selected data type
	const generateMatrix = (pairs: typeof data, type: DataType) => {
		const n = pairs.length;
		const matrix: number[][] = [];

		for (let i = 0; i < n; i++) {
			matrix[i] = [];
			for (let j = 0; j < n; j++) {
				if (i === j) {
					matrix[i][j] = 0;
				} else {
					const valueI = type === "volume" ? pairs[i].volume : pairs[i].swaps;
					const valueJ = type === "volume" ? pairs[j].volume : pairs[j].swaps;
					const totalValue = pairs.reduce((sum, p) => sum + (type === "volume" ? p.volume : p.swaps), 0);
					const flow = Math.floor((valueI * valueJ) / (totalValue * (type === "volume" ? 1000 : 10)));
					matrix[i][j] = flow;
				}
			}
		}
		return matrix;
	};

	const matrix = generateMatrix(data, dataType);
	const names = data.map((item) => item.name);
	const colors = data.map((item) => item.color);

	// D3.js calculations
	const sum = d3.sum(matrix.flat());
	const tickStep = d3.tickStep(0, sum, 100);
	const tickStepMajor = d3.tickStep(0, sum, 20);
	const formatValue = d3.formatPrefix(",.0", tickStep);

	const chord = d3
		.chord()
		.padAngle(20 / innerRadius)
		.sortSubgroups(d3.descending);
	const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
	const ribbon = d3.ribbon().radius(innerRadius);

	const chords = chord(matrix);

	// Function to generate tick data
	const groupTicks = (d: any, step: number) => {
		const k = (d.endAngle - d.startAngle) / d.value;
		return d3.range(0, d.value, step).map((value) => ({
			value,
			angle: value * k + d.startAngle,
		}));
	};

	// Format display values
	const formatDisplayValue = (value: number, type: DataType): string => {
		if (type === "volume") {
			return value >= 1000000 ? `$${(value / 1000000).toFixed(1)}M` : `$${(value / 1000).toFixed(0)}K`;
		}
		return value.toLocaleString();
	};

	// Handle hover events for web and mobile
	const handleHover = (index: number, event: any, pairName: string) => {
		setHoveredIndex(index);
		const value = dataType === "volume" ? data[index].volume : data[index].swaps;

		// Get coordinates for tooltip positioning
		let coords = { x: 0, y: 0 };

		if (Platform.OS === "web") {
			// Use clientX/clientY for accurate screen positioning
			const clientX = event.nativeEvent?.clientX || event.clientX || 0;
			const clientY = event.nativeEvent?.clientY || event.clientY || 0;

			// Get container position if available
			if (containerRef.current && (containerRef.current as any).getBoundingClientRect) {
				const rect = (containerRef.current as any).getBoundingClientRect();
				coords = {
					x: clientX - rect.left,
					y: clientY - rect.top,
				};
			} else {
				// Fallback: use offset coordinates
				coords = {
					x: event.nativeEvent?.offsetX || 0,
					y: event.nativeEvent?.offsetY || 0,
				};
			}
		} else {
			// Mobile: use location coordinates
			coords = {
				x: event.nativeEvent?.locationX || 0,
				y: event.nativeEvent?.locationY || 0,
			};
		}

		setTooltip({
			visible: true,
			x: coords.x,
			y: coords.y - 20, // Position above cursor
			content: `${pairName}: ${formatDisplayValue(value, dataType)}`,
		});
	};

	const handleHoverOut = () => {
		setHoveredIndex(null);
		setTooltip({ visible: false, x: 0, y: 0, content: "" });
	};

	const handleRibbonHover = (chord: any, event: any) => {
		const sourceName = names[chord.source.index];
		const targetName = names[chord.target.index];
		const sourceValue = dataType === "volume" ? data[chord.source.index].volume : data[chord.source.index].swaps;

		// Get coordinates for tooltip positioning
		let coords = { x: 0, y: 0 };

		if (Platform.OS === "web") {
			// Use clientX/clientY for accurate screen positioning
			const clientX = event.nativeEvent?.clientX || event.clientX || 0;
			const clientY = event.nativeEvent?.clientY || event.clientY || 0;

			// Get container position if available
			if (containerRef.current && (containerRef.current as any).getBoundingClientRect) {
				const rect = (containerRef.current as any).getBoundingClientRect();
				coords = {
					x: clientX - rect.left,
					y: clientY - rect.top,
				};
			} else {
				// Fallback: use offset coordinates
				coords = {
					x: event.nativeEvent?.offsetX || 0,
					y: event.nativeEvent?.offsetY || 0,
				};
			}
		} else {
			// Mobile: use location coordinates
			coords = {
				x: event.nativeEvent?.locationX || 0,
				y: event.nativeEvent?.locationY || 0,
			};
		}

		setTooltip({
			visible: true,
			x: coords.x,
			y: coords.y - 20, // Position above cursor
			content: `${sourceName} ↔ ${targetName}: ${formatDisplayValue(sourceValue, dataType)}`,
		});
	};

	// Create hover props based on platform
	const createHoverProps = (index: number, pairName: string) => {
		if (Platform.OS === "web") {
			return {
				onMouseEnter: (event: any) => handleHover(index, event, pairName),
				onMouseLeave: handleHoverOut,
			};
		} else {
			return {
				onPressIn: (event: any) => handleHover(index, event, pairName),
				onPressOut: handleHoverOut,
			};
		}
	};

	const createRibbonHoverProps = (chord: any) => {
		if (Platform.OS === "web") {
			return {
				onMouseEnter: (event: any) => handleRibbonHover(chord, event),
				onMouseLeave: handleHoverOut,
			};
		} else {
			return {
				onPressIn: (event: any) => handleRibbonHover(chord, event),
				onPressOut: handleHoverOut,
			};
		}
	};

	// Toggle button component
	const ToggleButton = ({ isActive, onPress, label }: { isActive: boolean; onPress: () => void; label: string }) => (
		<Pressable onPress={onPress} className={`px-4 py-2 rounded-lg ${isActive ? "bg-buttonPrimary" : "bg-bgDark"}`}>
			<Text className={`text-sm font-medium font-league-spartan ${isActive ? "text-white" : "text-textSecondary"}`}>{label}</Text>
		</Pressable>
	);

	// Memoized rendering of the chord diagram
	const renderChordDiagram = useMemo(() => {
		return (
			<Svg
				width={width}
				height={height}
				viewBox={`-${width / 2} -${height / 2} ${width} ${height}`}
				style={{ maxWidth: "100%", height: "auto" }}
			>
				<G>
					{/* Render group arcs */}
					{chords.groups.map((group, index) => (
						<G key={index}>
							<Path
								fill={
									hoveredIndex === index
										? d3.color(colors[group.index])?.brighter(0.8)?.toString() || colors[group.index]
										: colors[group.index]
								}
								d={arc(group as any) as string}
								stroke={hoveredIndex === index ? "#fff" : "none"}
								strokeWidth={hoveredIndex === index ? 2 : 0}
								{...createHoverProps(index, names[group.index])}
							/>
						</G>
					))}
					{/* Render ribbons - maintain source color identity */}
					<G>
						{chords.map((chord, index) => {
							const ribbonPath = ribbon(chord as any) as unknown as string;
							const isHovered = hoveredIndex === chord.target.index || hoveredIndex === chord.source.index;

							// Use source color for the entire ribbon to maintain token identity
							const sourceColor = colors[chord.source.index];
							const ribbonColor = isHovered ? d3.color(sourceColor)?.brighter(0.6)?.toString() || sourceColor : sourceColor;

							return (
								<Path
									key={index}
									d={ribbonPath}
									fill={ribbonColor}
									fillOpacity={0.8}
									stroke="rgba(255, 255, 255, 0.2)"
									strokeWidth={isHovered ? 2 : 0.5}
									{...createRibbonHoverProps(chord)}
								/>
							);
						})}
					</G>

					<defs>
						{colors.map((color, index) => (
							<linearGradient key={index} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
								<stop offset="0%" stopColor={color} stopOpacity={0.9} />
								<stop offset="100%" stopColor={d3.color(color)?.darker(0.3)?.toString() || color} stopOpacity={0.7} />
							</linearGradient>
						))}
					</defs>
				</G>
			</Svg>
		);
	}, [matrix, names, colors, hoveredIndex, dataType]);

	return (
		<View ref={containerRef} className="rounded-3xl p-6 mb-4">
			{/* Header with Title and Toggle */}
			<View className="flex items-center mb-6 relative">
				<Text className="text-white text-xl font-bold font-league-spartan">Core Pairs</Text>
				<View className="absolute right-0 flex flex-row bg-bgSecondary rounded-lg p-1">
					<ToggleButton isActive={dataType === "volume"} onPress={() => setDataType("volume")} label="$Volume" />
					<ToggleButton isActive={dataType === "swaps"} onPress={() => setDataType("swaps")} label="#Swaps" />
				</View>
			</View>

			{/* Chord Diagram */}
			<View className="items-center relative">
				{renderChordDiagram}

				{/* Enhanced Tooltip */}
				{tooltip.visible && (
					<View
						className="absolute bg-black/90 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/20 shadow-xl pointer-events-none"
						style={{
							left: tooltip.x - 60, // Center horizontally on cursor
							top: tooltip.y - 50, // Position above cursor
							zIndex: 1000,
							minWidth: 120,
							maxWidth: 200,
						}}
					>
						<Text className="text-white text-sm font-bold font-league-spartan text-center">{tooltip.content}</Text>
						{/* Tooltip arrow pointing down */}
						<View
							className="absolute w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black/90"
							style={{
								left: "50%",
								marginLeft: -4,
								bottom: -4,
							}}
						/>
					</View>
				)}
			</View>
		</View>
	);
};

export default ChordDiagram;
