import { useEffect, useRef } from "react";
import { logPageView } from "./../utils/analytics";
import { Platform } from "react-native";

/**
 * A universal hook for page view tracking that works across platforms and routing systems.
 * Uses direct browser APIs instead of routing-specific hooks to be compatible with
 * both React Router DOM (web) and Expo Router (native).
 */
function usePageTracking() {
	const lastTrackedPath = useRef<string | null>(null);

	useEffect(() => {
		// Function to track the current page
		const trackCurrentPage = () => {
			try {
				// Use direct window.location on web (with React Router)
				if (Platform.OS === "web") {
					const currentPath = window.location.pathname + window.location.search;

					// Only track if the path changed
					if (currentPath !== lastTrackedPath.current) {
						logPageView();
						lastTrackedPath.current = currentPath;
					}
				}
				// For React Native, we need to get the path from the navigation state
				else {
					// React Native doesn't have window.location.pathname by default
					// This will be implemented in native-specific code that detects current screen
					// We use a timeout to ensure this code runs after navigation is complete
					setTimeout(() => {
						// We'll rely on the application to set these values somewhere in the global scope
						// as we can't directly access the navigation state from here

						// Use global.currentScreen if available, or a default value
						const currentScreen = (global as any).currentScreen || "/";

						// Track only if we haven't tracked this path before
						if (currentScreen !== lastTrackedPath.current) {
							// For native platforms, we need to mock window.location
							if (typeof window !== "undefined") {
								const originalLocation = { ...window.location };

								// Create mock location for tracking
								Object.defineProperty(window, "location", {
									value: {
										...window.location,
										pathname: currentScreen,
										search: "",
									},
									writable: true,
								});

								// Track the view
								logPageView();

								// Restore original window.location
								Object.defineProperty(window, "location", {
									value: originalLocation,
									writable: true,
								});
							} else {
								// If window is not available, we can't track the page view
								console.error("Window object not available for tracking");
							}

							lastTrackedPath.current = currentScreen;
						}
					}, 100);
				}
			} catch (error) {
				console.error("Failed to track page view", error);
			}
		};

		// Track on initial render
		trackCurrentPage();

		// For web, add listeners for route changes
		if (Platform.OS === "web") {
			// Listen for popstate events (browser back/forward buttons)
			window.addEventListener("popstate", trackCurrentPage);

			// Create custom event listener for programmatic navigation
			document.addEventListener("router:update", trackCurrentPage);

			// Clean up event listeners
			return () => {
				window.removeEventListener("popstate", trackCurrentPage);
				document.removeEventListener("router:update", trackCurrentPage);
			};
		}
	}, []);

	return null;
}

/**
 * Helper function to manually track page views on specific screens
 * in React Native where automatic tracking doesn't work
 */
export const trackScreen = (screenName: string) => {
	// Store the current screen globally
	if (typeof global !== "undefined") {
		(global as any).currentScreen = screenName;
	}

	// Mock window.location and call logPageView directly
	if (Platform.OS !== "web" && typeof window !== "undefined") {
		const originalLocation = { ...window.location };

		Object.defineProperty(window, "location", {
			value: {
				...window.location,
				pathname: screenName,
				search: "",
			},
			writable: true,
		});

		logPageView();

		Object.defineProperty(window, "location", {
			value: originalLocation,
			writable: true,
		});
	}
};

export default usePageTracking;
