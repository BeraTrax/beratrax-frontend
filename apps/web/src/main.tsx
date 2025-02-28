import { tamaguiConfig } from '@beratrax/ui';
import { createConfig } from "@lifi/sdk";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { NotificationsProvider, setUpNotifications } from "reapop";
import { PersistGate } from "redux-persist/integration/react";
import "src/api/interceptor";
import { TamaguiInternalConfig, TamaguiProvider, Theme, YStack } from 'tamagui';
import App from "./App";
import Notifications from "./components/Notifications/Notifications";
import "./config/walletConfig";
import AppProvider from "./context/AppProvider";
import "./index.css";
import "./polyfills";
import store, { persistor } from "./state";

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
        <TamaguiProvider config={tamaguiConfig as unknown as TamaguiInternalConfig} defaultTheme="light">
            <Theme name="light">
                <YStack flex={1} padding="$4" backgroundColor="$background">
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
                </YStack>
            </Theme>
        </TamaguiProvider>
    </React.StrictMode>
);
