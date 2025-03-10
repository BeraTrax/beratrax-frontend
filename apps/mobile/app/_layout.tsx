import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppWalletProvider } from '../config/WalletProvider';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppWalletProvider>
        <StatusBar style="auto" />
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              title: "Home",
            }}
          />
          <Stack.Screen
            name="wallet"
            options={{
              title: "Wallet",
            }}
          />
        </Stack>
      </AppWalletProvider>
    </SafeAreaProvider>
  );
}
