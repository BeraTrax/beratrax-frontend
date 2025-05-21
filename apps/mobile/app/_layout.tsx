import "@walletconnect/react-native-compat";
import "./../global.css";
import "../globals";
import "@ethersproject/shims";
import "@expo/metro-runtime";
/**
 * to keep the first import on top
 */
import { AppKit } from "@reown/appkit-wagmi-react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";

import { mobileWalletConfig, getWeb3AuthPrivateKey, isWeb3AuthConnected, logoutWeb3Auth } from "@/config/mobileWalletConfig";
import { useFonts } from "expo-font";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import WalletProvider from "@beratrax/mobile/app/context/WalletProvider";
import { View } from "react-native";
import { WagmiProvider } from "wagmi";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import store from "@beratrax/core/src/state";
import BottomBar from "./components/BottomBar";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Setup queryClient
const queryClient = new QueryClient();

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
		route: "/Leaderboard",
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

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
			// router.push("/Dashboard");
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return (
		<WagmiProvider config={mobileWalletConfig}>
			<QueryClientProvider client={queryClient}>
				<WalletProvider
					walletConfig={mobileWalletConfig}
					getWeb3AuthPk={getWeb3AuthPrivateKey}
					isWeb3AuthConnected={isWeb3AuthConnected}
					logoutWeb3Auth={logoutWeb3Auth}
				>
					<Provider store={store}>
						<SafeAreaProvider>
							<SafeAreaView className="flex-1 bg-bgSecondary">
								<AppKit />
								<View className="flex-1 relative">
									<Stack
										screenOptions={{
											headerShown: false,
											contentStyle: { backgroundColor: "#151915" },
										}}
									/>
									<BottomBar tabOptions={tabOptions} />
								</View>
							</SafeAreaView>
						</SafeAreaProvider>
					</Provider>
				</WalletProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
};

export default RootLayout;
