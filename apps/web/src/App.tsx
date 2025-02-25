import { config as tamaguiConfig } from '@beratrax/ui';
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect } from "react";
import { ReactHooksWrapper, setHook } from "react-hooks-outside";
import { BrowserRouter as Router } from "react-router-dom";
import "react-tooltip/dist/react-tooltip.css";
import { useNotifications } from "reapop";
import { TamaguiProvider } from 'tamagui';
import { WagmiProvider } from "wagmi";
import "./App.css";
import Body from "./Body";
import WalletDisclaimer from "./components/WalletDisclaimer/WalletDisclaimer";
import { queryClient } from "./config/reactQuery";
import { rainbowConfig } from "./config/walletConfig";
import WalletProvider from "./context/WalletProvider";
import "./styles/global.css";
import { initGA, trackDailyDAppVisit, trackLanguage } from "./utils/analytics";

setHook("notifications", useNotifications);


   

function App() {
    const isDarkMode = false; // You can implement your own dark mode logic

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
        <TamaguiProvider config={tamaguiConfig} defaultTheme={isDarkMode ? "dark" : "light"}>
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
                            <Router>
                                <Body />
                            </Router>
                            <ReactHooksWrapper />
                        </WalletProvider>
                        <ReactQueryDevtools />
                    </RainbowKitProvider>
                </WagmiProvider>
            </QueryClientProvider>
        </TamaguiProvider>
    );
}

export default App;
