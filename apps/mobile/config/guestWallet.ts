import { privateKeyToAccount } from "viem/accounts";
import { Account, createWalletClient, custom, EIP1193Provider, WalletClient } from "viem";
import { supportedChains } from "@beratrax/core/src/config/baseWalletConfig";
import { ChainNamespace } from "@web3auth/react-native-sdk";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";

export interface GuestWalletResult {
	client: WalletClient;
	account: Account;
	privateKey: string;
}

export const GUEST_PRIVATE_KEY = "0x1d4af68e0f5fc66152426a1247e5339fe52a9281c873761f3285c17cde7842d7";

export const GUEST_EMAIL = "tester.trax.finance@gmail.com"; // The email that triggers guest login

export async function createGuestWallet(chainId: number): Promise<GuestWalletResult> {
	try {
		// Find the chain configuration
		const chain = supportedChains.find((item) => item.id === chainId);
		if (!chain) throw new Error("chain not found");

		// Create account from private key
		const account = privateKeyToAccount(GUEST_PRIVATE_KEY as `0x${string}`);

		// Create a separate ethereum provider for guest wallet
		const guestChainConfig = {
			chainNamespace: ChainNamespace.EIP155,
			chainId: "0x" + chainId.toString(16),
			rpcTarget: chain.rpcUrls?.default?.http[0] || "https://rpc.berachain.com",
			displayName: chain.name,
			tickerName: chain.nativeCurrency.name,
			ticker: chain.nativeCurrency.symbol,
			blockExplorerUrl: chain.blockExplorers?.default.url,
		};

		const guestProvider = new EthereumPrivateKeyProvider({
			config: {
				chainConfig: guestChainConfig,
			},
		});

		// Set up the provider with the guest private key (without 0x prefix)
		const cleanPrivateKey = GUEST_PRIVATE_KEY.startsWith("0x") ? GUEST_PRIVATE_KEY.slice(2) : GUEST_PRIVATE_KEY;
		await guestProvider.setupProvider(cleanPrivateKey);

		// Create wallet client using the guest provider
		const client = createWalletClient({
			transport: custom(guestProvider as EIP1193Provider),
			chain,
			account,
		});

		return {
			client,
			account,
			privateKey: GUEST_PRIVATE_KEY,
		};
	} catch (error) {
		console.error("Error creating guest wallet:", error);
		throw error;
	}
}

export function isGuestEmail(email: string): boolean {
	return email.toLowerCase() === GUEST_EMAIL.toLowerCase();
}
