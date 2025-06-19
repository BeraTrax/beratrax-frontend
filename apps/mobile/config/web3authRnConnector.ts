import { createConnector } from "@wagmi/core";
import type { IWeb3Auth } from "@web3auth/react-native-sdk";
import { privateKeyToAccount } from "viem/accounts";
import { getAddress } from "viem";
import { ethereumPrivateKeyProvider } from "./ethereumProvider";

export type Web3AuthConnectorOptions = {
	web3AuthInstance: IWeb3Auth;
	loginParams?: {
		loginProvider: string;
		redirectUrl?: string;
		mfaLevel?: "default" | "optional" | "mandatory" | "none";
		extraLoginOptions?: {
			login_hint?: string;
		};
	};
};

export function Web3AuthConnector({ web3AuthInstance, loginParams = { loginProvider: "google" } }: Web3AuthConnectorOptions) {
	let currentLoginParams = loginParams;

	return createConnector((config) => {
		const connector = {
			id: "web3Auth",
			name: "Web3Auth",
			type: "web3Auth",
			// Enable auto-reconnection for wagmi
			supportsSimulation: false,

			async connect({ chainId }: { chainId?: number } = {}) {
				// Check if user is already logged in, if not then login
				if (!web3AuthInstance.privKey) {
					await web3AuthInstance.login(currentLoginParams);
				}

				if (!web3AuthInstance.privKey) {
					throw new Error("Web3Auth private key not available after login");
				}

				// Convert to proper hex format
				const hexPrivateKey = web3AuthInstance.privKey.startsWith("0x") ? web3AuthInstance.privKey : `0x${web3AuthInstance.privKey}`;

				// Create a Viem account from the private key
				const account = privateKeyToAccount(hexPrivateKey as `0x${string}`);

				// Set up the ethereum provider with the private key
				await ethereumPrivateKeyProvider.setupProvider(web3AuthInstance.privKey);

				// Get current chain ID from ethereum provider or use provided chainId
				let currentChainId;
				try {
					currentChainId = await ethereumPrivateKeyProvider.request({
						method: "eth_chainId",
					});
				} catch (error) {
					console.log("Could not get chainId from provider, using provided chainId");
					currentChainId = chainId ? `0x${chainId.toString(16)}` : "0x1";
				}

				const id = Number(currentChainId || chainId || "0x1");

				return {
					accounts: [account.address],
					chainId: id,
				};
			},

			async disconnect() {
				await web3AuthInstance.logout();
			},

			async getAccounts() {
				if (!web3AuthInstance.privKey) {
					return [];
				}

				const hexPrivateKey = web3AuthInstance.privKey.startsWith("0x") ? web3AuthInstance.privKey : `0x${web3AuthInstance.privKey}`;
				const account = privateKeyToAccount(hexPrivateKey as `0x${string}`);

				return [account.address];
			},

			async getChainId() {
				if (!web3AuthInstance.privKey) {
					return 1; // Default to mainnet
				}

				try {
					const chainId = await ethereumPrivateKeyProvider.request({
						method: "eth_chainId",
					});
					return Number(chainId || "0x1");
				} catch (error) {
					return 80094; // Default to Berachain if request fails
				}
			},

			async getProvider() {
				return ethereumPrivateKeyProvider;
			},

			async isAuthorized() {
				return !!web3AuthInstance.privKey;
			},

			onAccountsChanged(accounts: string[]) {
				if (accounts.length === 0) return;

				// Notify wagmi of account changes
				config.emitter.emit("change", {
					accounts: accounts.map((account) => getAddress(account)),
				});
			},

			onChainChanged(chainId: string) {
				const id = Number(chainId);
				config.emitter.emit("change", { chainId: id });
			},

			onDisconnect() {
				config.emitter.emit("disconnect");
			},
		};

		// Set up event listeners on the ethereum provider
		if (ethereumPrivateKeyProvider) {
			try {
				ethereumPrivateKeyProvider.on("accountsChanged", connector.onAccountsChanged);
				ethereumPrivateKeyProvider.on("chainChanged", connector.onChainChanged);
				ethereumPrivateKeyProvider.on("disconnect", connector.onDisconnect);
			} catch (error) {
				console.log("Could not set up provider event listeners:", error);
			}
		}

		// Expose the setLoginParams method on the connector
		(connector as any).setLoginParams = (newParams: typeof loginParams) => {
			currentLoginParams = { ...currentLoginParams, ...newParams };
		};

		return connector;
	});
}
