import { DemoComponent, tamaguiConfig } from '@beratrax/ui';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { H1, Paragraph, TamaguiProvider, Theme, YStack } from 'tamagui';


import { useColorScheme } from '@/apps/mobile/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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
    <TamaguiProvider config={tamaguiConfig}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Theme name={colorScheme === 'dark' ? 'dark' : 'light'}>
          <YStack f={1} padding="$4" backgroundColor="$background">
            <H1>Beratrax Mobile</H1>
            <Paragraph marginBottom="$4">A DeFi platform that your friends can actually use.</Paragraph>
            
            <DemoComponent />
            
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </YStack>
        </Theme>
      </ThemeProvider>
    </TamaguiProvider>
  );
}
