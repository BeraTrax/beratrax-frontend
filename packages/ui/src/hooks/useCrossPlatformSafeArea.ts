import { Platform } from "react-native";
import { useMemo } from "react";

// Define SafeAreaInsets interface for consistency
export interface SafeAreaInsets {
	top: number;
	bottom: number;
	left: number;
	right: number;
}

/**
 * Cross-platform hook that provides safe area insets
 * Works on React Native (using react-native-safe-area-context) and web (with fallbacks)
 */
export const useCrossPlatformSafeArea = (): SafeAreaInsets => {
	// On web, always return zero insets
	if (Platform.OS === "web") {
		return useMemo(
			() => ({
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
			}),
			[]
		);
	}

	// On React Native, try to use the actual hook
	try {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const { useSafeAreaInsets } = require("react-native-safe-area-context");
		return useSafeAreaInsets();
	} catch (error) {
		console.warn("react-native-safe-area-context not available, using fallback");
		return useMemo(
			() => ({
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
			}),
			[]
		);
	}
};

export interface AndroidNavigationInfo {
	isAndroid: boolean;
	isGestureNavigation: boolean;
	isButtonNavigation: boolean;
	bottomInset: number;
	navigationType: "gesture" | "button" | "unknown" | "not-android";
	recommendedBottomPadding: number;
}

/**
 * Cross-platform hook to detect Android navigation type and provide appropriate padding
 * Works on both React Native and web
 */
export const useAndroidNavigation = (): AndroidNavigationInfo => {
	const insets = useCrossPlatformSafeArea();

	return useMemo(() => {
		if (Platform.OS === "web" || Platform.OS !== "android") {
			return {
				isAndroid: false,
				isGestureNavigation: false,
				isButtonNavigation: false,
				bottomInset: insets.bottom,
				navigationType: "not-android" as const,
				recommendedBottomPadding: 32, // Standard web/iOS padding
			};
		}

		// Android navigation detection based on bottom inset
		const isGestureNavigation = insets.bottom <= 24;
		const isButtonNavigation = insets.bottom >= 48;

		let navigationType: "gesture" | "button" | "unknown";
		let recommendedBottomPadding: number;

		if (isGestureNavigation) {
			navigationType = "gesture";
			// Gesture navigation needs less padding since the gesture area is smaller
			recommendedBottomPadding = Math.max(50, insets.bottom + 30);
		} else if (isButtonNavigation) {
			navigationType = "button";
			// Button navigation needs more padding to clear the navigation bar
			recommendedBottomPadding = Math.max(80, insets.bottom + 20);
		} else {
			navigationType = "unknown";
			// Unknown type - use generous padding for safety
			recommendedBottomPadding = Math.max(70, insets.bottom + 40);
		}

		return {
			isAndroid: true,
			isGestureNavigation,
			isButtonNavigation,
			bottomInset: insets.bottom,
			navigationType,
			recommendedBottomPadding,
		};
	}, [insets.bottom]);
};
