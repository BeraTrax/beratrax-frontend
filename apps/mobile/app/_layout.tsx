import "@walletconnect/react-native-compat";
import "./../global.css";
/**
 * to keep the first import on top
 */
import { AppKit } from "@reown/appkit-wagmi-react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";

import { mobileWalletConfig } from "@/config/mobileWalletConfig";
import { useFonts } from "expo-font";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import WalletProvider from "@beratrax/core/src/context/WalletProvider";
import * as Haptics from "expo-haptics";
import { StyleSheet, View } from "react-native";
import { WagmiProvider } from "wagmi";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import store from "@beratrax/core/src/state";
import BottomBar from "./components/BottomBar";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Setup queryClient
const queryClient = new QueryClient();

// Add routes where tab bar should be hidden
const hiddenTabBarRoutes = [
	/^\/Earn\/[^\/]+$/, // Vault details page
	// Add more route patterns here as needed
	// Example: /^\/Stats\/details$/,
	// Example: /^\/Dashboard\/settings$/,
];

// Matching the web app tabs configuration
const tabOptions = {
	Dashboard: {
		name: "Dashboard",
		tabBarLabel: "Dashboard",
		route: "/",
		// You'll need to have these images in your assets folder:
		activeIcon: require("@beratrax/core/src/assets/images/dashboardactiveicon.svg").default,
		inactiveIcon: require("@beratrax/core/src/assets/images/dashboardnonactiveicon.svg").default,
	},
	Earn: {
		name: "Earn",
		tabBarLabel: "Earn",
		route: "/Earn",
		activeIcon: require("@beratrax/core/src/assets/images/earnactiveicon.svg").default,
		inactiveIcon: require("@beratrax/core/src/assets/images/earnnonactiveicon.svg").default,
	},
	Leaderboard: {
		name: "Leaderboard",
		tabBarLabel: "Leaderboard",
		route: "/Stats",
		activeIcon: require("@beratrax/core/src/assets/images/leaderboardactiveicon.svg").default,
		inactiveIcon: require("@beratrax/core/src/assets/images/leaderboardnonactiveicon.svg").default,
	},
	Buy: {
		name: "Buy",
		tabBarLabel: "Buy (thoon!)",
		route: "/Buy",
		target: "noop", // This will prevent navigation, matching web behavior
		activeIcon: require("@beratrax/core/src/assets/images/coinsactiveicon.svg").default,
		inactiveIcon: require("@beratrax/core/src/assets/images/coinsnonactiveicon.svg").default,
	},
	"User Guide": {
		name: "User Guide",
		tabBarLabel: "User Guide",
		route: "/User Guide",
		activeIcon: require("@beratrax/core/src/assets/images/userguideactiveicon.svg").default,
		inactiveIcon: require("@beratrax/core/src/assets/images/userguidenonactiveicon.svg").default,
	},
};

const RootLayout = () => {
	// const router = useRouter();
	const [loaded] = useFonts({
		LeagueSpartan: require("@beratrax/core/src/assets/fonts/LeagueSpartan/LeagueSpartan-VariableFont_wght.ttf"),
	});
	const pathname = usePathname();

	// Check if the current path matches any route where tab bar should be hidden
	const shouldHideTabBar = hiddenTabBarRoutes.some((pattern) => pathname.match(pattern));

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
			// router.push("/Dashboard");
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	const handleTabPress = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
	};

	return (
		<WagmiProvider config={mobileWalletConfig}>
			<QueryClientProvider client={queryClient}>
				<WalletProvider walletConfig={mobileWalletConfig}>
					<Provider store={store}>
						<SafeAreaProvider>
							<SafeAreaView style={{ flex: 1 }}>
								<AppKit />
								<View style={styles.container}>
									<Stack
										screenOptions={{
											headerShown: false,
										}}
									/>
									<BottomBar tabOptions={tabOptions} hiddenTabBarRoutes={hiddenTabBarRoutes} />
								</View>
							</SafeAreaView>
						</SafeAreaProvider>
					</Provider>
				</WalletProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		position: "relative",
	},
});

export default RootLayout;
