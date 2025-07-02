import React, { FC, useState, useEffect, useRef, useCallback } from "react";
import { Platform, View, Text, Pressable, Image, LayoutChangeEvent, Dimensions, Modal, SafeAreaView, ScrollView } from "react-native";
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
	const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
	const selectRef = useRef<View>(null);
	const dropdownRef = useRef<View>(null);

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
					width: dropdownWidth === "content" ? rect.width : dropdownWidth === "full" ? window.innerWidth * 0.9 : rect.width,
				});
			}
		}
	}, [openSelect, dropdownWidth]);

	useEffect(() => {
		updatePosition();
	}, [openSelect, updatePosition]);

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

		// Different rendering for web vs mobile
		if (Platform.OS === "web") {
			const dropdownContent = (
				<View
					ref={dropdownRef}
					className={`rounded-2xl overflow-hidden shadow-xl border ${bgSecondary ? "bg-bgSecondary border-gray-700" : "bg-bgDark border-gray-800"}`}
					style={{
						position: "absolute",
						top: position.top,
						left: position.left,
						width: position.width,
						maxWidth: 300, // Prevent dropdown from getting too wide
						zIndex: 9999,
						boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.4), 0px 2px 8px rgba(0, 0, 0, 0.2)",
					}}
				>
					{options.map((option, index) => (
						<Pressable
							key={option}
							onPress={() => {
								setValue(option);
								setOpenSelect(false);
							}}
							className="w-full z-[9999] group hover:bg-white5 active:bg-white/10 transition-colors duration-200"
							style={({ pressed }) => ({
								backgroundColor: pressed ? "rgba(255, 255, 255, 0.1)" : "transparent",
							})}
						>
							<View
								className={`flex flex-row items-center justify-between px-4 py-3.5 cursor-pointer transition-all duration-200 ${
									index !== options.length - 1 ? "border-b border-gray-700/50" : ""
								} ${value === option ? "bg-textPrimary/20 border-textPrimary/30" : ""}`}
							>
								<View className="flex flex-row gap-x-3 items-center flex-1">
									{images && images[option] && (
										<View className="flex flex-row relative">
											<Image source={{ uri: images[option][0] }} className="w-6 h-6 rounded-full border border-gray-600/50" />
											{images[option].length > 1 && (
												<Image source={{ uri: images[option][1] }} className="w-6 h-6 -ml-3 rounded-full border border-gray-600/50" />
											)}
										</View>
									)}
									<View className="flex flex-row flex-wrap flex-1">
										<Text
											className={`font-league-spartan text-base ${value === option ? "text-textPrimary" : "text-textWhite"}`}
											numberOfLines={1}
											ellipsizeMode="tail"
										>
											{option}
										</Text>
										{extraText && extraText[index] && (
											<Text
												className={`ml-1 ${value === option ? "text-textPrimary" : "text-gray-400"}`}
												numberOfLines={1}
												ellipsizeMode="tail"
											>
												{extraText[index]}
											</Text>
										)}
									</View>
								</View>
								{value === option && <View className="w-2 h-2 bg-textPrimary rounded-full ml-2" />}
							</View>
						</Pressable>
					))}
				</View>
			);

			// Use createPortal for web
			return createPortal(dropdownContent, document.body);
		} else {
			// For mobile, render a Modal instead of absolute positioning
			const screenHeight = Dimensions.get("window").height;
			const maxDropdownHeight = screenHeight * 0.5; // Maximum 50% of screen height

			return (
				<Modal transparent={true} visible={openSelect} animationType="fade" onRequestClose={() => setOpenSelect(false)}>
					<SafeAreaView className="flex-1">
						<Pressable className="flex-1 justify-end" onPress={() => setOpenSelect(false)}>
							<View className="bg-black/60 flex-1 w-full justify-end">
								<View className="w-full" style={{ maxHeight: maxDropdownHeight }}>
									<View
										ref={dropdownRef}
										className={`rounded-t-2xl shadow-2xl border-t border-l border-r ${bgSecondary ? "bg-bgSecondary border-gray-700" : "bg-bgDark border-gray-800"}`}
									>
										{/* Header handle */}
										<View className="flex items-center py-3">
											<View className="w-12 h-1 bg-gray-600 rounded-full" />
										</View>
										<ScrollView
											showsVerticalScrollIndicator={false}
											style={{ maxHeight: maxDropdownHeight - 80 }} // Account for header and padding
											contentContainerStyle={{ paddingBottom: 20 }}
										>
											{options.map((option, index) => (
												<Pressable
													key={option}
													onPress={() => {
														setValue(option);
														setOpenSelect(false);
													}}
													className="w-full"
													style={({ pressed }) => ({
														backgroundColor: pressed ? "rgba(255, 255, 255, 0.1)" : "transparent",
													})}
												>
													<View
														className={`flex flex-row items-center justify-between px-6 py-4 ${
															index !== options.length - 1 ? "border-b border-gray-700/30" : ""
														} ${value === option ? "bg-textPrimary/20 border-textPrimary/30" : ""}`}
													>
														<View className="flex flex-row gap-x-3 items-center flex-1">
															{images && images[option] && (
																<View className="flex flex-row relative">
																	<Image source={{ uri: images[option][0] }} className="w-6 h-6 rounded-full border border-gray-600/50" />
																	{images[option].length > 1 && (
																		<Image
																			source={{ uri: images[option][1] }}
																			className="w-6 h-6 -ml-3 rounded-full border border-gray-600/50"
																		/>
																	)}
																</View>
															)}
															<View className="flex flex-row flex-wrap flex-1 items-center">
																<Text
																	className={`font-medium text-base ${value === option ? "text-textPrimary" : "text-textWhite"}`}
																	numberOfLines={1}
																	ellipsizeMode="tail"
																>
																	{option}
																</Text>
																{extraText && extraText[index] && (
																	<Text
																		className={`ml-1 text-sm ${value === option ? "text-textPrimary" : "text-gray-400"}`}
																		numberOfLines={1}
																		ellipsizeMode="tail"
																	>
																		{extraText[index]}
																	</Text>
																)}
															</View>
														</View>
														{value === option && <View className="w-2.5 h-2.5 bg-textPrimary rounded-full ml-3" />}
													</View>
												</Pressable>
											))}
										</ScrollView>
									</View>
								</View>
							</View>
						</Pressable>
					</SafeAreaView>
				</Modal>
			);
		}
	};

	return (
		<View className={className + " relative"} ref={selectRef}>
			{/* The main select button */}
			<Pressable onPress={() => setOpenSelect(!openSelect)}>
				<View
					className={`relative rounded-2xl flex flex-row items-center justify-between px-3 py-4 ${bgSecondary ? "bg-bgSecondary" : "bg-bgDark"} ${size === "small" ? "w-[50px]" : "w-full"}`}
					style={{
						alignSelf: "flex-start", // Allow the component to size to content
						minWidth: customWidth || 120, // Reasonable minimum width
						maxWidth: Platform.OS === "web" ? 400 : "80%", // Reasonable maximum width
					}}
				>
					<View className="flex flex-row items-center gap-2 flex-1 pr-2">
						{/* Render images if provided */}
						{images && images[value] && (
							<View className="flex flex-row">
								<Image source={{ uri: images[value][0] }} className="w-5 h-5 rounded-full" />
								{images[value].length > 1 && <Image source={{ uri: images[value][1] }} className="w-5 h-5 -ml-2.5 rounded-full" />}
							</View>
						)}
						<Text className="text-textWhite flex-1">
							{value} {extraText ? extraText[options.findIndex((opt) => opt === value)] : ""}
						</Text>
					</View>
					<View className="flex-shrink-0 ml-2" style={{ transform: [{ rotate: openSelect ? "180deg" : "0deg" }] }}>
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
