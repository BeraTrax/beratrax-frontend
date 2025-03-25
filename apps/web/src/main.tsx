import "./global.css";
import { createConfig } from "@lifi/sdk";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { NotificationsProvider, setUpNotifications } from "reapop";
import { PersistGate } from "redux-persist/integration/react";
import "@beratrax/core/src/api/interceptor";
import App from "./App";
import Notifications from "./components/Notifications/Notifications";
import "@beratrax/core/src/config/walletConfig";
import { AppProvider } from "@beratrax/core/src/context";
import "./polyfills";
import store, { persistor } from "@beratrax/core/src/state";
import { WagmiProvider } from "wagmi";
import { rainbowConfig } from "@beratrax/core/src/config/walletConfig";

createConfig({
  integrator: "Beratrax",
  // rpcUrls: {
  //   [ChainId.ARB]: ['https://arbitrum-example.node.com/'],
  //   [ChainId.SOL]: ['https://solana-example.node.com/'],
  // },
});

// Configuration for toast notifications
setUpNotifications({
  defaultProps: {
    position: "top-right",
    dismissible: true,
    showDismissButton: true,
    dismissAfter: 3000,
  },
});
// supportChatConfig(window, document);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={rainbowConfig}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <NotificationsProvider>
            <AppProvider>
              <App />
              <Notifications />
            </AppProvider>
          </NotificationsProvider>
        </PersistGate>
      </Provider>
    </WagmiProvider>
  </React.StrictMode>
);
