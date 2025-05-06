import React, { FC, useState, useEffect, useRef } from "react";
import { Platform, View, Text, Pressable, Image, LayoutChangeEvent } from "react-native";
import Svg, { G, Path, ClipPath, Rect, Defs } from "react-native-svg";
import { createPortal } from "react-dom";

// Define the props for the Select component
interface IProps {
	value: string;
	setValue: (val: string) => void;
	options: string[];
	extraText?: string[];
	size?: "small";
	className?: string;
	bgSecondary?: boolean;
	images?: Record<string, string[]>;
}

const Select: FC<IProps> = ({ value, setValue, options, extraText, size, className = "", images, bgSecondary = false }) => {
	const [openSelect, setOpenSelect] = useState(false);
	const [maxWidth, setMaxWidth] = useState<number>(100);
	const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
	const selectRef = useRef<View>(null);
	const dropdownRef = useRef<View>(null);
	const optionWidths = useRef<number[]>([]);

	// Calculate the required width based on all options
	useEffect(() => {
		if (Platform.OS === "web" && options.length > 0) {
			// Create a temporary div to measure text width
			const measureElement = document.createElement("div");
			measureElement.style.position = "absolute";
			measureElement.style.visibility = "hidden";
			measureElement.style.fontSize = "14px"; // Adjust to match your text size
			measureElement.style.padding = "0 30px 0 0"; // Account for extra padding and images
			document.body.appendChild(measureElement);

			let maxOptionWidth = 0;

			options.forEach((option, index) => {
				// Include both option text and extra text if available
				const displayText = extraText ? `${option} ${extraText[index] || ""}` : option;
				measureElement.textContent = displayText;

				// Add extra width for images if present
				const imageWidth = images && images[option] ? (images[option].length > 1 ? 30 : 20) : 0;
				const totalWidth = measureElement.getBoundingClientRect().width + imageWidth + 40; // 40px for padding

				if (totalWidth > maxOptionWidth) {
					maxOptionWidth = totalWidth;
				}
			});

			document.body.removeChild(measureElement);
			setMaxWidth(Math.max(maxOptionWidth, 100));
		}
	}, [options, extraText, images]);

	useEffect(() => {
		if (options && options.length > 0 && !options.includes(value)) {
			setValue(options[0]);
		}
	}, [options, value]);

	useEffect(() => {
		if (openSelect && Platform.OS === "web" && selectRef.current) {
			// @ts-ignore - getBoundingClientRect is available in web environment
			const rect = selectRef.current.getBoundingClientRect();
			if (rect) {
				setPosition({
					top: rect.bottom + window.scrollY,
					left: rect.left + window.scrollX,
					width: Math.max(rect.width, maxWidth),
				});
			}
		}
	}, [openSelect, maxWidth]);

	// Add event listener to close dropdown when clicking outside
	useEffect(() => {
		if (Platform.OS === "web" && openSelect) {
			const handleClickOutside = (e: MouseEvent) => {
				if (
					selectRef.current &&
					// @ts-ignore - contains is available in web environment
					!selectRef.current.contains(e.target as Node) &&
					dropdownRef.current &&
					// @ts-ignore - contains is available in web environment
					!dropdownRef.current.contains(e.target as Node)
				) {
					setOpenSelect(false);
				}
			};

			document.addEventListener("mousedown", handleClickOutside);
			return () => {
				document.removeEventListener("mousedown", handleClickOutside);
			};
		}
	}, [openSelect]);

	const handleOptionLayout = (event: LayoutChangeEvent, index: number) => {
		const { width } = event.nativeEvent.layout;
		optionWidths.current[index] = width;

		// Find the maximum width
		const newMaxWidth = Math.max(...optionWidths.current.filter(Boolean), 100);
		if (newMaxWidth > maxWidth) {
			setMaxWidth(newMaxWidth + 40); // Add some padding
		}
	};

	// Render the down arrow icon using react-native-svg
	const ArrowIcon = () => (
		<Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
			<Defs>
				<ClipPath id="clip0">
					<Rect width={16} height={16} fill="white" />
				</ClipPath>
			</Defs>
			<G clipPath="url(#clip0)">
				<Path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M13.5244 5.76215L7.82531 11.4612L7.7623 11.3982L7.6994 11.4611L2.0003 5.76203L3.41451 4.34782L7.76241 8.69572L12.1102 4.34793L13.5244 5.76215Z"
					fill="#ffffff"
				/>
			</G>
		</Svg>
	);

	// Create dropdown element
	const renderDropdown = () => {
		if (!openSelect) return null;

		const dropdownContent = (
			<View
				ref={dropdownRef}
				className={`rounded-2xl p-4 flex flex-wrap justify-around ${bgSecondary ? "bg-bgSecondary" : "bg-bgDark"}`}
				style={{
					position: "absolute",
					top: position.top,
					left: position.left,
					width: position.width,
					minWidth: maxWidth,
					zIndex: 9999,
					elevation: 5,
					shadowColor: "#000",
					shadowOffset: { width: 0, height: 2 },
					shadowOpacity: 0.25,
					shadowRadius: 3.84,
				}}
			>
				{options.map((option, index) => (
					<Pressable
						key={option}
						onPress={() => {
							setValue(option);
							setOpenSelect(false);
						}}
						style={{
							width: "100%",
							zIndex: 9999,
						}}
					>
						<View
							className="flex flex-row items-center justify-between px-3 py-3 border-b last:border-b-0 cursor-pointer"
							onLayout={(e) => handleOptionLayout(e, index)}
						>
							<View className="flex flex-row gap-x-2">
								{images && images[option] && (
									<View className="flex flex-row">
										<Image source={{ uri: images[option][0] }} style={{ width: 20, height: 20, borderRadius: 25 }} />
										{images[option].length > 1 && (
											<Image source={{ uri: images[option][1] }} style={{ width: 20, height: 20, marginLeft: -10, borderRadius: 25 }} />
										)}
									</View>
								)}
								<View className="flex flex-row items-between justify-around">
									<Text className="text-textWhite">{option}</Text>
									<Text className="text-textWhite">{extraText ? " " + extraText[index] : ""}</Text>
								</View>
							</View>
						</View>
					</Pressable>
				))}
			</View>
		);

		// Use createPortal only in web environment
		if (Platform.OS === "web") {
			return createPortal(dropdownContent, document.body);
		}

		// In native environment, return the dropdown directly
		return dropdownContent;
	};

	return (
		<View className={className + " relative"} style={{ minWidth: maxWidth }} ref={selectRef}>
			{/* The main select button */}
			<Pressable onPress={() => setOpenSelect(!openSelect)}>
				<View
					className={`relative rounded-2xl flex flex-row items-center gap-x-6 px-3 py-4 ${bgSecondary ? "bg-bgSecondary" : "bg-bgDark"} ${size === "small" ? "w-[50px]" : ""}`}
					style={{ minWidth: maxWidth }}
				>
					<View className="flex flex-row items-center justify-around gap-2 flex-grow">
						{/* Render images if provided */}
						{images && images[value] && (
							<View className="flex flex-row">
								<Image source={{ uri: images[value][0] }} style={{ width: 20, height: 20, borderRadius: 25 }} />
								{images[value].length > 1 && (
									<Image source={{ uri: images[value][1] }} style={{ width: 20, height: 20, marginLeft: -10, borderRadius: 25 }} />
								)}
							</View>
						)}
						<Text className="text-textWhite">
							{value} {extraText ? extraText[options.findIndex((opt) => opt === value)] : ""}
						</Text>
					</View>
					<View style={{ transform: [{ rotate: openSelect ? "180deg" : "0deg" }] }}>
						<ArrowIcon />
					</View>
				</View>
			</Pressable>

			{/* Render dropdown */}
			{renderDropdown()}
		</View>
	);
};

export default Select;
