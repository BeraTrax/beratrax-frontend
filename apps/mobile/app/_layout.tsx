import "@walletconnect/react-native-compat";
import "./../global.css";
/**
 * to keep the first import on top
 */
import { AppKit } from "@reown/appkit-wagmi-react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";

import { mobileWalletConfig } from "@/config/mobileWalletConfig";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Tabs, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import WalletProvider from "@beratrax/core/src/context/WalletProvider";
import * as Haptics from "expo-haptics";
import { StyleSheet } from "react-native";
import { WagmiProvider } from "wagmi";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import store from "@beratrax/core/src/state";
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Setup queryClient
const queryClient = new QueryClient();

const RootLayout = () => {
  const router = useRouter();
  const [loaded] = useFonts({
    LeagueSpartan: require("@beratrax/core/src/assets/fonts/LeagueSpartan/LeagueSpartan-VariableFont_wght.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      router.push("/Dashboard");
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
                <Tabs
                  initialRouteName="Dashboard"
                  screenOptions={{
                    tabBarActiveTintColor: "#3772FF",
                    tabBarInactiveTintColor: "#888",
                    tabBarStyle: styles.tabBar,
                    tabBarShowLabel: true,
                    headerShown: false,
                  }}
                >
                  {Object.entries(tabOptions).map(([key, value]) => (
                    <Tabs.Screen
                      key={key}
                      name={key}
                      options={{
                        ...value,
                      }}
                      listeners={{
                        tabPress: () => handleTabPress(),
                      }}
                    />
                  ))}
                </Tabs>
              </SafeAreaView>
            </SafeAreaProvider>
          </Provider>
        </WalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
    height: 60,
    paddingBottom: 5,
    paddingTop: 5,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
});

const tabOptions = {
  Dashboard: {
    name: "Dashboard",
    icon: "home-outline",
    title: "Dashboard",
    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
      <Ionicons name="home-outline" size={size} color={color} />
    ),
    tabBarLabel: "Dashboard",
  },
  Earn: {
    name: "Earn",
    icon: "wallet-outline",
    title: "Earn",
    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
      <Ionicons name="wallet-outline" size={size} color={color} />
    ),
    tabBarLabel: "Earn",
  },
  "User Guide": {
    name: "User Guide",
    icon: "book-outline",
    title: "User Guide",
    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
      <Ionicons name="book-outline" size={size} color={color} />
    ),
    tabBarLabel: "User Guide",
  },
  Stats: {
    name: "Stats",
    icon: "bookmark-outline",
    title: "Stats",
    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
      <Ionicons name="bookmark-outline" size={size} color={color} />
    ),
    tabBarLabel: "Stats",
  },
};

export default RootLayout;
