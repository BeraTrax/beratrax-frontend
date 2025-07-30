import { Chain, createWalletClient, CustomTransport, http, JsonRpcAccount, LocalAccount, PublicClient, Transport } from "viem";
import { chains } from "@beratrax/core/src/config/baseWalletConfig";
import * as Linking from "expo-linking";
import Web3Auth, { OPENLOGIN_NETWORK, LOGIN_PROVIDER } from "@web3auth/react-native-sdk";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import { Web3AuthConnector } from "./web3authRnConnector";
import { GuestConnector } from "./guestConnector";
import { createConfig } from "wagmi";

const scheme = "com.trax.mobile";
const redirectUrl = `${scheme}://auth`;

const clientId = "BFMP__u_AAiJT5_Hj1dDBpCCHKB0tLxRbFuUQsBE2BBqxamxWKkSwNW_hk7zHjfbHr0eHV7nWC8qukXPCZL9Ov4";

export const web3auth = new Web3Auth(WebBrowser, SecureStore, {
	clientId,
	network: OPENLOGIN_NETWORK.CYAN,
	redirectUrl,
	enableLogging: false,
	sessionTime: 60 * 60 * 24, // 1 day
});

// Initialize Web3Auth and return a promise
export const initWeb3Auth = async () => {
	try {
		await web3auth.init();
		return web3auth;
	} catch (error) {
		console.error("Failed to initialize Web3Auth:", error);
		throw error;
	}
};

// Helper function to get the private key
export const getWeb3AuthPrivateKey = async (): Promise<string | undefined> => {
	try {
		return web3auth.privKey;
	} catch (error) {
		console.error("Error getting private key:", error);
		return undefined;
	}
};

// Check if Web3Auth is connected
export const isWeb3AuthConnected = (): boolean => {
	return web3auth.privKey !== undefined;
};

// Logout from Web3Auth
export const logoutWeb3Auth = async (): Promise<void> => {
	if (!web3auth.ready) {
		console.log("Web3auth not initialized");
		return;
	}

	await web3auth.logout();
};

// Create the connector for Wagmi
const createWeb3AuthConnector = (
	email?: string,
	provider: (typeof LOGIN_PROVIDER)[keyof typeof LOGIN_PROVIDER] = LOGIN_PROVIDER.GOOGLE
) => {
	return Web3AuthConnector({
		web3AuthInstance: web3auth,
		loginParams: {
			redirectUrl: Linking.createURL("web3auth", { scheme: "com.trax.mobile" }),
			mfaLevel: "default",
			loginProvider: provider,
			extraLoginOptions: {
				login_hint: email,
			},
		},
	});
};

// Create a stable connector for the initial config
const web3AuthConnector = Web3AuthConnector({
	web3AuthInstance: web3auth,
	loginParams: {
		redirectUrl: Linking.createURL("web3auth", { scheme: "com.trax.mobile" }),
		mfaLevel: "default",
		loginProvider: LOGIN_PROVIDER.GOOGLE, // Default provider
	},
});

// Create Wagmi config with Web3Auth connector
export const createMobileWalletConfig = (
	email?: string,
	provider: (typeof LOGIN_PROVIDER)[keyof typeof LOGIN_PROVIDER] = LOGIN_PROVIDER.GOOGLE
) => {
	return createConfig({
		chains,
		connectors: [createWeb3AuthConnector(email, provider)],
		transports: chains.reduce<Record<number, Transport>>((acc, chain) => {
			return {
				...acc,
				[chain.id]: http(chain.rpcUrls.default.http[0]),
			};
		}, {}),
	});
};

// Export the default config for initial setup with stable connector
export const mobileWalletConfig = createConfig({
	chains,
	connectors: [web3AuthConnector, GuestConnector()],
	transports: chains.reduce<Record<number, Transport>>((acc, chain) => {
		return {
			...acc,
			[chain.id]: http(chain.rpcUrls.default.http[0]),
		};
	}, {}),
});

export interface IClients {
	wallet: ReturnType<typeof createWalletClient<CustomTransport | Transport, Chain, JsonRpcAccount | LocalAccount, undefined>>;
	public: PublicClient<Transport, Chain, undefined, undefined>;
}
