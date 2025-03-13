import '@walletconnect/react-native-compat'
/**
 * to keep the first import on top
 */
import { AppKit, createAppKit, defaultWagmiConfig } from '@reown/appkit-wagmi-react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { berachain, reownProjectId } from '@/config/chainConfig'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import 'react-native-reanimated'

import ConnectView from '@/components/ConnectView'
import { useColorScheme } from '@/hooks/useColorScheme'
import { WagmiProvider } from 'wagmi'
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();


// 0. Setup queryClient
const queryClient = new QueryClient();

// 2. Create config
const metadata = {
  name: 'Beratrax',
  description: 'Beratrax',
  url: 'https://beratrax.com',
  icons: ['https://raw.githubusercontent.com/BeraTrax/tokens/main/logos/beratrax-logo/logo.png'],
  redirect: {
    native: 'beratrax://',
    universal: 'beratrax.com'
  }
}

const chains = [berachain] as const

const wagmiConfig = defaultWagmiConfig({ chains, projectId: reownProjectId, metadata })
// 3. Create modal
createAppKit({
  projectId: reownProjectId,
  wagmiConfig,
  defaultChain: berachain, // Optional
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  features: {
    socials: ['x', 'discord', 'apple'],
  }
})


const RootLayout = () => {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <ConnectView />
          <AppKit />
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default RootLayout;