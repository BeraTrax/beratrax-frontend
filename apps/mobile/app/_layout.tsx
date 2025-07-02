// import "../wdyr";
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
import { useEffect, memo } from "react";
import "react-native-reanimated";

import WalletProvider from "@beratrax/mobile/app/context/WalletProvider";
import { View } from "react-native";
import { WagmiProvider } from "wagmi";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import store from "@beratrax/core/src/state";
import BottomBar from "./components/BottomBar/BottomBar";
import { ReactHooksWrapper, setHook } from "react-hooks-outside";
import { NotificationsProvider, useNotifications } from "reapop";
import { useDataRefresh } from "@beratrax/core/src/hooks";
import { useBackgroundImagePrefetch } from "@beratrax/core/src/hooks/useBackgroundImagePrefetch";

// Set up the notifications hook for react-hooks-outside
setHook("notifications", useNotifications);

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
	// Leaderboard: {
	// 	name: "Leaderboard",
	// 	tabBarLabel: "Leaderboard",
	// 	route: "/Leaderboard",
	// 	activeIcon: require("@beratrax/core/src/assets/images/leaderboardactiveicon.svg").default,
	// 	inactiveIcon: require("@beratrax/core/src/assets/images/leaderboardnonactiveicon.svg").default,
	// },
	Buy: {
		name: "Buy",
		tabBarLabel: "Buy",
		route: "/Buy",
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

const AppContent = memo(() => {
	useDataRefresh();
	useBackgroundImagePrefetch(); // 🖼️ Silently prefetch all pool images in the background

	return (
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
	);
});

const RootLayout = () => {
	// const router = useRouter();
	const [loaded] = useFonts({
		LeagueSpartan: require("@beratrax/core/src/assets/fonts/LeagueSpartan/LeagueSpartan-VariableFont_wght.ttf"),
		"Arame Mono": require("@beratrax/core/src/assets/fonts/ArameMono/0Arame-Regular.otf"),
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
		<NotificationsProvider>
			<WagmiProvider config={mobileWalletConfig}>
				<QueryClientProvider client={queryClient}>
					<WalletProvider
						walletConfig={mobileWalletConfig}
						getWeb3AuthPk={getWeb3AuthPrivateKey}
						isWeb3AuthConnected={isWeb3AuthConnected}
						logoutWeb3Auth={logoutWeb3Auth}
					>
						<Provider store={store}>
							<AppContent />
							<ReactHooksWrapper />
						</Provider>
					</WalletProvider>
				</QueryClientProvider>
			</WagmiProvider>
		</NotificationsProvider>
	);
};

export default RootLayout;
