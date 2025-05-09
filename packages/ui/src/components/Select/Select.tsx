import React, { FC, useState, useEffect, useRef, useCallback } from "react";
import { Platform, View, Text, Pressable, Image, LayoutChangeEvent, Dimensions, Modal } from "react-native";
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
	dropdownWidth?: "auto" | "content" | "full"; // Control dropdown width
	customWidth?: number; // Custom width in pixels
}

const Select: FC<IProps> = ({
	value,
	setValue,
	options,
	extraText,
	size,
	className = "",
	images,
	bgSecondary = false,
	dropdownWidth = "auto", // Default to auto which uses component width
	customWidth,
}) => {
	const [openSelect, setOpenSelect] = useState(false);
	const [maxWidth, setMaxWidth] = useState<number>(100);
	const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
	const selectRef = useRef<View>(null);
	const dropdownRef = useRef<View>(null);
	const optionWidths = useRef<number[]>([]);
	const [selectWidth, setSelectWidth] = useState<number>(0);

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

			// If customWidth is provided, use it
			if (customWidth) {
				setMaxWidth(customWidth);
			} else {
				setMaxWidth(Math.max(maxOptionWidth, 100));
			}
		} else if (Platform.OS !== "web" && options.length > 0) {
			// For mobile, calculate appropriate width
			const screenWidth = Dimensions.get("window").width;

			// If customWidth is provided, use it
			if (customWidth) {
				setMaxWidth(customWidth);
			} else {
				// For smaller dropdowns like dates or numbers
				if (options.every((opt) => opt.length <= 12)) {
					setMaxWidth(Math.min(screenWidth * 0.5, 200)); // Narrower for short options
				} else {
					setMaxWidth(Math.min(screenWidth * 0.9, 300)); // 90% of screen width for longer options
				}
			}
		}
	}, [options, extraText, images, customWidth]);

	useEffect(() => {
		if (options && options.length > 0 && !options.includes(value)) {
			setValue(options[0]);
		}
	}, [options, value, setValue]);

	// Calculate dropdown position (web only)
	const updatePosition = useCallback(() => {
		if (openSelect && Platform.OS === "web" && selectRef.current) {
			// @ts-ignore - getBoundingClientRect is available in web environment
			const rect = selectRef.current.getBoundingClientRect();
			if (rect) {
				setPosition({
					top: rect.bottom + window.scrollY,
					left: rect.left + window.scrollX,
					width: dropdownWidth === "content" ? maxWidth : dropdownWidth === "full" ? window.innerWidth * 0.9 : rect.width,
				});
			}
		}
	}, [openSelect, maxWidth, dropdownWidth]);

	useEffect(() => {
		updatePosition();
	}, [openSelect, maxWidth, updatePosition]);

	// Add event listener to close dropdown when clicking outside (web only)
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
		if (Platform.OS === "web") {
			const { width } = event.nativeEvent.layout;
			optionWidths.current[index] = width;

			// Find the maximum width
			const newMaxWidth = Math.max(...optionWidths.current.filter(Boolean), 100);
			if (newMaxWidth > maxWidth && !customWidth) {
				setMaxWidth(newMaxWidth + 40); // Add some padding
			}
		}
	};

	// Handle select component layout to get its width
	const handleSelectLayout = (event: LayoutChangeEvent) => {
		const { width } = event.nativeEvent.layout;
		setSelectWidth(width);
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

	// Calculate mobile dropdown width
	const getMobileDropdownWidth = () => {
		// This is now only used for the select component's width, not the dropdown
		const screenWidth = Dimensions.get("window").width;

		// Determine if this is a narrow dropdown based on content
		const isShortOptions = options.every((opt) => opt.length <= 12);

		if (customWidth) {
			return Math.min(customWidth, screenWidth);
		} else if (isShortOptions) {
			return Math.min(screenWidth * 0.4, 200); // Narrower for select button with short options
		} else {
			return Math.min(screenWidth * 0.9, 300); // Default for select button
		}
	};

	// Create dropdown element
	const renderDropdown = () => {
		if (!openSelect) return null;

		// Different rendering for web vs mobile
		if (Platform.OS === "web") {
			const dropdownContent = (
				<View
					ref={dropdownRef}
					className={`rounded-2xl p-4 flex flex-wrap justify-around ${bgSecondary ? "bg-bgSecondary" : "bg-bgDark"}`}
					style={{
						position: "absolute",
						top: position.top,
						left: position.left,
						width: position.width,
						minWidth: dropdownWidth === "content" ? maxWidth : undefined,
						zIndex: 9999,
						boxShadow: "0px 2px 3.84px rgba(0, 0, 0, 0.25)",
					}}
				>
					{options.map((option, index) => (
						<Pressable
							key={option}
							onPress={() => {
								setValue(option);
								setOpenSelect(false);
							}}
							className="w-full z-[9999]"
						>
							<View
								className="flex flex-row items-center justify-between px-3 py-3 border-b last:border-b-0 cursor-pointer"
								onLayout={(e) => handleOptionLayout(e, index)}
							>
								<View className="flex flex-row gap-x-2">
									{images && images[option] && (
										<View className="flex flex-row">
											<Image source={{ uri: images[option][0] }} className="w-5 h-5 rounded-full" />
											{images[option].length > 1 && <Image source={{ uri: images[option][1] }} className="w-5 h-5 -ml-2.5 rounded-full" />}
										</View>
									)}
									<View className="flex flex-row flex-wrap">
										<Text className="text-textWhite" numberOfLines={1} ellipsizeMode="tail">
											{option}
										</Text>
										{extraText && (
											<Text className="text-textWhite" numberOfLines={1} ellipsizeMode="tail">
												{" " + extraText[index]}
											</Text>
										)}
									</View>
								</View>
							</View>
						</Pressable>
					))}
				</View>
			);

			// Use createPortal for web
			return createPortal(dropdownContent, document.body);
		} else {
			// For mobile, render a Modal instead of absolute positioning
			const mobileWidth = getMobileDropdownWidth();

			return (
				<Modal transparent={true} visible={openSelect} animationType="fade" onRequestClose={() => setOpenSelect(false)}>
					<Pressable className="flex-1 justify-end" onPress={() => setOpenSelect(false)}>
						<View className="bg-black/50 flex-1 w-full justify-end">
							<Pressable onPress={(e) => e.stopPropagation()} className="max-h-[300px] w-full">
								<View
									ref={dropdownRef}
									className={`rounded-t-2xl p-4 flex flex-wrap justify-around w-full shadow-md ${
										bgSecondary ? "bg-bgSecondary" : "bg-bgDark"
									}`}
								>
									{options.map((option, index) => (
										<Pressable
											key={option}
											onPress={() => {
												setValue(option);
												setOpenSelect(false);
											}}
											className="w-full"
										>
											<View className="flex flex-row items-center justify-between px-3 py-3 border-b last:border-b-0">
												<View className="flex flex-row gap-x-2">
													{images && images[option] && (
														<View className="flex flex-row">
															<Image source={{ uri: images[option][0] }} className="w-5 h-5 rounded-full" />
															{images[option].length > 1 && (
																<Image source={{ uri: images[option][1] }} className="w-5 h-5 -ml-2.5 rounded-full" />
															)}
														</View>
													)}
													<View className="flex flex-row flex-wrap">
														<Text className="text-textWhite" numberOfLines={1} ellipsizeMode="tail">
															{option}
														</Text>
														{extraText && (
															<Text className="text-textWhite" numberOfLines={1} ellipsizeMode="tail">
																{" " + extraText[index]}
															</Text>
														)}
													</View>
												</View>
											</View>
										</Pressable>
									))}
								</View>
							</Pressable>
						</View>
					</Pressable>
				</Modal>
			);
		}
	};

	return (
		<View className={className + " relative"} style={{ minWidth: maxWidth }} ref={selectRef} onLayout={handleSelectLayout}>
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
								<Image source={{ uri: images[value][0] }} className="w-5 h-5 rounded-full" />
								{images[value].length > 1 && <Image source={{ uri: images[value][1] }} className="w-5 h-5 -ml-2.5 rounded-full" />}
							</View>
						)}
						<Text className="text-textWhite" numberOfLines={1} ellipsizeMode="tail">
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
