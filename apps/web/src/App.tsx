import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect } from "react";
import { ReactHooksWrapper, setHook } from "react-hooks-outside";
import { BrowserRouter as Router } from "react-router-dom";
import "react-tooltip/dist/react-tooltip.css";
import { useNotifications } from "reapop";
import { WagmiProvider } from "wagmi";
import "./App.css";
import Body from "./Body";
import WalletDisclaimer from "./components/WalletDisclaimer/WalletDisclaimer";
import { queryClient } from "./config/reactQuery";
import { rainbowConfig } from "./config/walletConfig";
import { WalletProvider } from "@beratrax/core/src/context";
import "./styles/global.css";
import { initGA, trackDailyDAppVisit, trackLanguage } from "./utils/analytics";

setHook("notifications", useNotifications);

function App() {
  useEffect(() => {
    // Initialize analytics
    initGA();

    // Track daily visit
    trackDailyDAppVisit();

    // Track user location using browser's geolocation
    // if (navigator.geolocation) {
    //     navigator.geolocation.getCurrentPosition((position) => {
    //         const location = `${position.coords.latitude},${position.coords.longitude}`;
    //         trackUserLocation(location);
    //     });
    // }

    // Track user's language
    trackLanguage();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={rainbowConfig}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "var( --new-color_primary)",
            accentColorForeground: "white",
          })}
          showRecentTransactions={false}
          appInfo={{ appName: "Beratrax", disclaimer: WalletDisclaimer }}
        >
          <WalletProvider>
            {/* <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
                            <Theme name="light">
                                <YStack flex={1} padding="$4" backgroundColor="$background"> */}
            <Router>
              <Body />
            </Router>
            {/* </YStack>
                            </Theme>
                        </TamaguiProvider> */}
            <ReactHooksWrapper />
          </WalletProvider>
          <ReactQueryDevtools />
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

export default App;
