import "./global.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { NotificationsProvider, setUpNotifications } from "reapop";
// import { PersistGate } from "redux-persist/integration/react";
import "@beratrax/core/src/api/interceptor";
import App from "./App";
import Notifications from "./components/Notifications/Notifications";
import { AppProvider } from "@beratrax/core/src/context";
import "./polyfills";
import store from "@beratrax/core/src/state";
import OnChainKitProvider from "@beratrax/core/src/context/OnChainKitProvider";

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
		<Provider store={store}>
			{/* <PersistGate loading={null} persistor={persistor}> */}
			<NotificationsProvider>
				<OnChainKitProvider>
					<AppProvider>
						<App />
						<Notifications />
					</AppProvider>
				</OnChainKitProvider>
			</NotificationsProvider>
			{/* </PersistGate> */}
		</Provider>
	</React.StrictMode>
);
