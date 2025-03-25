import '@walletconnect/react-native-compat'
import './../global.css'
/**
 * to keep the first import on top
 */
import { AppKit, createAppKit } from '@reown/appkit-wagmi-react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { berachain, reownProjectId, wagmiConfig } from '@/config/chainConfig'
import { Ionicons } from '@expo/vector-icons'
import { useFonts } from 'expo-font'
import { Tabs } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import 'react-native-reanimated'

import WalletProvider from '@/config/walletProvider'
import { useColorScheme } from '@/hooks/useColorScheme'
import * as Haptics from 'expo-haptics'
import { StyleSheet } from 'react-native'
import { WagmiProvider } from 'wagmi'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
// import 'nattivewind/css';
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Setup queryClient
const queryClient = new QueryClient();

// Create modal
createAppKit({
  projectId: reownProjectId,
  wagmiConfig,
  defaultChain: berachain,
  enableAnalytics: true,
  features: {
    socials: ['x', 'discord', 'apple'],
  }
})


const RootLayout = () => {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    LeagueSpartan: require('@beratrax/core/src/assets/fonts/LeagueSpartan/LeagueSpartan-VariableFont_wght.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const handleTabPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {/* <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}> */}
        <WalletProvider>
          <SafeAreaProvider>
            <SafeAreaView style={{flex:1}}>
              {/* <ConnectView />
                <Test /> */}
              <Tabs
                screenOptions={{
                  tabBarActiveTintColor: '#3772FF',
                  tabBarInactiveTintColor: colorScheme === 'dark' ? '#888' : '#666',
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
              <AppKit />
            </SafeAreaView>
          </SafeAreaProvider>
        </WalletProvider>
        {/* </ThemeProvider> */}
      </QueryClientProvider>
    </WagmiProvider >
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    height: 60,
    paddingBottom: 5,
    paddingTop: 5,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});


const tabOptions = {
  Dashboard: {
    name: 'Dashboard',
    icon: 'home-outline',
    title: 'Dashboard',
    tabBarIcon: ({ color, size }: { color: string, size: number }) => (
      <Ionicons name="home-outline" size={size} color={color} />
    ),
    tabBarLabel: 'Dashboard',
  },
  Earn: {
    name: 'Earn',
    icon: 'wallet-outline',
    title: 'Earn',
    tabBarIcon: ({ color, size }: { color: string, size: number }) => (
      <Ionicons name="wallet-outline" size={size} color={color} />
    ),
    tabBarLabel: 'Earn',
  },
  'User Guide': {
    name: 'User Guide',
    icon: 'book-outline',
    title: 'User Guide',
    tabBarIcon: ({ color, size }: { color: string, size: number }) => (
      <Ionicons name="book-outline" size={size} color={color} />
    ),
    tabBarLabel: 'User Guide',
  },
  Stats: {
    name: 'Stats',
    icon: 'bookmark-outline',
    title: 'Stats',
    tabBarIcon: ({ color, size }: { color: string, size: number }) => (
      <Ionicons name="bookmark-outline" size={size} color={color} />
    ),
    tabBarLabel: 'Stats',
  },
}

export default RootLayout;