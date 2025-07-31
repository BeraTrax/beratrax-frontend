import { createConnector } from "wagmi";
import { privateKeyToAccount } from "viem/accounts";
import { GUEST_PRIVATE_KEY, setGuestSessionActive, clearGuestSession, isGuestSessionActive } from "./guestWallet";

export function GuestConnector() {
	return createConnector((config) => {
		let isConnected = false; // Track connection state

		// Check for existing guest session on initialization
		const checkGuestSession = async () => {
			try {
				const hasSession = await isGuestSessionActive();
				if (hasSession) {
					console.log("Found existing guest session, restoring...");
					isConnected = true;
				}
			} catch (error) {
				console.error("Error checking guest session:", error);
			}
		};

		// Initialize session check (fire and forget)
		checkGuestSession().catch(console.error);

		const connector = {
			id: "guest",
			name: "Guest Wallet",
			type: "guest",
			supportsSimulation: false,

			async connect({ chainId }: { chainId?: number } = {}) {
				// Create account from private key
				const account = privateKeyToAccount(GUEST_PRIVATE_KEY as `0x${string}`);

				console.log("Guest connector connecting with address:", account.address);
				isConnected = true; // Mark as connected

				// Save session to SecureStore
				await setGuestSessionActive();

				return {
					accounts: [account.address],
					chainId: chainId || 80094, // Default to Berachain
				};
			},

			async disconnect() {
				// Guest wallet doesn't need special disconnect logic
				isConnected = false; // Mark as disconnected
				await clearGuestSession(); // Clear session from SecureStore
			},

			async getAccounts() {
				const account = privateKeyToAccount(GUEST_PRIVATE_KEY as `0x${string}`);
				return [account.address];
			},

			async getChainId() {
				return 80094; // Default to Berachain
			},

			async getProvider() {
				// Return a simple provider that just returns the guest account
				return {
					request: async ({ method, params }: { method: string; params: any[] }) => {
						if (method === "eth_accounts") {
							const account = privateKeyToAccount(GUEST_PRIVATE_KEY as `0x${string}`);
							return [account.address];
						}
						if (method === "eth_chainId") {
							return "0x" + (80094).toString(16);
						}
						// For other methods, we'll need to implement them or throw
						throw new Error(`Method ${method} not supported by guest wallet`);
					},
				};
			},

			async isAuthorized() {
				// Guest wallet is only authorized when explicitly connected
				return isConnected;
			},

			onAccountsChanged(accounts: string[]) {
				if (accounts.length === 0) return;
				config.emitter.emit("change", {
					accounts: accounts.map((account) => account as `0x${string}`),
				});
			},

			onChainChanged(chainId: string) {
				const id = Number(chainId);
				config.emitter.emit("change", { chainId: id });
			},

			onDisconnect() {
				isConnected = false; // Mark as disconnected
				clearGuestSession(); // Clear session from SecureStore
				config.emitter.emit("disconnect");
			},
		};

		return connector;
	});
}
