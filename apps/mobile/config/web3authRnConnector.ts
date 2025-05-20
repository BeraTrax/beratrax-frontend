import { createConnector } from "@wagmi/core";
import type { IWeb3Auth } from "@web3auth/react-native-sdk";
import { privateKeyToAccount } from "viem/accounts";
import { Chain, getAddress } from "viem";

export type Web3AuthConnectorOptions = {
	web3AuthInstance: IWeb3Auth;
	loginParams?: {
		loginProvider: string;
		redirectUrl?: string;
		mfaLevel?: "default" | "optional" | "mandatory" | "none";
	};
};

export function Web3AuthConnector({ web3AuthInstance, loginParams = { loginProvider: "google" } }: Web3AuthConnectorOptions) {
	return createConnector((config) => {
		const connector = {
			id: "web3Auth",
			name: "Web3Auth",
			type: "web3Auth",

			async connect({ chainId }: { chainId?: number } = {}) {
				await web3AuthInstance.login(loginParams);

				if (!web3AuthInstance.provider) {
					throw new Error("Web3Auth provider not available after login");
				}

				const privateKey = (await web3AuthInstance.provider.request({
					method: "eth_private_key",
				})) as string;

				// Convert to proper hex format
				const hexPrivateKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;

				// Create a Viem account from the private key
				const account = privateKeyToAccount(hexPrivateKey as `0x${string}`);

				// Get current chain ID from provider
				const currentChainId = await web3AuthInstance.provider.request({
					method: "eth_chainId",
				});

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
				if (!web3AuthInstance.provider) {
					return [];
				}

				const privateKey = (await web3AuthInstance.provider.request({
					method: "eth_private_key",
				})) as string;

				const hexPrivateKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
				const account = privateKeyToAccount(hexPrivateKey as `0x${string}`);

				return [account.address];
			},

			async getChainId() {
				if (!web3AuthInstance.provider) {
					return 1; // Default to mainnet
				}

				const chainId = await web3AuthInstance.provider.request({
					method: "eth_chainId",
				});

				return Number(chainId || "0x1");
			},

			async getProvider() {
				return web3AuthInstance.provider;
			},

			async isAuthorized() {
				return web3AuthInstance.connected;
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

		// Set up event listeners
		if (web3AuthInstance.provider) {
			web3AuthInstance.provider.on("accountsChanged", connector.onAccountsChanged);
			web3AuthInstance.provider.on("chainChanged", connector.onChainChanged);
			web3AuthInstance.provider.on("disconnect", connector.onDisconnect);
		}

		return connector;
	});
}
