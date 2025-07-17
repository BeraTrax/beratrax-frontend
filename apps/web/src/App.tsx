import { queryClient } from "@beratrax/core/src/config/reactQuery";
import WalletProvider from "@beratrax/web/src/context/WalletProvider";
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
import { initGA, trackDailyDAppVisit, trackLanguage } from "@beratrax/core/src/utils/analytics";
import { rainbowConfig } from "./config/walletConfig";
import { WagmiProvider } from "wagmi";
// import OnChainKitProvider from "@beratrax/core/src/context/OnChainKitProvider";
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
						{/* <OnChainKitProvider> */}
						<Router>
							<Body />
						</Router>
						<ReactHooksWrapper />
						{/* </OnChainKitProvider> */}
					</WalletProvider>
				</RainbowKitProvider>
			</WagmiProvider>
			<ReactQueryDevtools />
		</QueryClientProvider>
	);
}

export default App;
