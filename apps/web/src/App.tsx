import { queryClient } from "@beratrax/core/src/config/reactQuery";
import { WalletProvider } from "@beratrax/core/src/context";
import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect } from "react";
import { ReactHooksWrapper, setHook } from "react-hooks-outside";
import { BrowserRouter as Router } from "react-router-dom";
import "react-tooltip/dist/react-tooltip.css";
import { useNotifications } from "reapop";
import "./App.css";
import Body from "./Body";
import WalletDisclaimer from "./components/WalletDisclaimer/WalletDisclaimer";
import "./styles/global.css";
import {
  initGA,
  trackDailyDAppVisit,
  trackLanguage,
} from "@beratrax/core/src/utils/analytics";
import { webWalletConfig, web3AuthInstance } from "./config/webWalletConfig";
setHook("notifications", useNotifications);

function App() {
  useEffect(() => {
    // Initialize analytics
    initGA();

    // Track daily visit
    trackDailyDAppVisit();

    // Track user's language
    trackLanguage();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider
        theme={darkTheme({
          accentColor: "var( --new-color_primary)",
          accentColorForeground: "white",
        })}
        showRecentTransactions={false}
        appInfo={{ appName: "Beratrax", disclaimer: WalletDisclaimer }}
      >
        <WalletProvider
          walletConfig={webWalletConfig}
          getWeb3AuthPk={() => {
            return web3AuthInstance.provider?.request({
              method: "eth_private_key",
            }) as Promise<string>;
          }}
          isWeb3AuthConnected={() => web3AuthInstance.connected}
          logoutWeb3Auth={() => web3AuthInstance.logout()}
        >
          <Router>
            <Body />
          </Router>
          <ReactHooksWrapper />
        </WalletProvider>
        <ReactQueryDevtools />
      </RainbowKitProvider>
    </QueryClientProvider>
  );
}

export default App;
