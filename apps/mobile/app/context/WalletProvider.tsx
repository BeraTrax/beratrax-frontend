import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Address, createPublicClient, createWalletClient, custom, EIP1193Provider, Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { Connector, useAccount, useConnect, useDisconnect, useSwitchChain, useWalletClient } from "wagmi";
import { requestEthForGas } from "@beratrax/core/src/api";
import { EstimateTxGasArgs, IClients } from "@beratrax/core/src/types";
import { trackTransaction } from "@beratrax/core/src/utils/analytics";
import type { Config } from "@wagmi/core";
import { supportedChains } from "@beratrax/core/src/config/baseWalletConfig";
import Web3Auth, { LOGIN_PROVIDER } from "@web3auth/react-native-sdk";
import { initWeb3Auth as initWeb3AuthMobile, web3auth as web3authInstance } from "@beratrax/mobile/config/mobileWalletConfig";
import { ethereumPrivateKeyProvider } from "@beratrax/mobile/config/ethereumProvider";
import { getPublicClientConfiguration } from "@beratrax/core/src/utils/common";
import {
	createGuestWallet,
	isGuestEmail,
	GUEST_PRIVATE_KEY,
	isGuestSessionActive,
	clearGuestSession,
} from "@beratrax/mobile/config/guestWallet";
export interface IWalletContext {
	currentWallet?: Address;
	logout: () => void;
	getPkey: () => Promise<string | undefined>;
	isSocial: boolean;
	isGuest?: boolean; // Optional since it's mobile-only
	isConnecting: boolean;
	isSponsored: boolean;
	getPublicClient: (chainId: number) => IClients["public"];
	getWalletClient: (chainId: number) => Promise<IClients["wallet"]>;
	getClients: (chainId: number) => Promise<IClients>;
	estimateTxGas: (args: EstimateTxGasArgs) => Promise<bigint>;
	connector?: Connector;
	connectWallet: (provider: (typeof LOGIN_PROVIDER)[keyof typeof LOGIN_PROVIDER]) => Promise<void>;
}

export const WalletContext = React.createContext<IWalletContext>({} as IWalletContext);

interface IProps {
	children: React.ReactNode;
	walletConfig: Config;
	getWeb3AuthPk?: () => Promise<string | undefined>;
	isWeb3AuthConnected?: () => boolean;
	logoutWeb3Auth?: () => Promise<void>;
}

const WalletProvider: React.FC<IProps> = ({
	children,
	walletConfig: initialWalletConfig,
	getWeb3AuthPk,
	isWeb3AuthConnected,
	logoutWeb3Auth,
}) => {
	const [walletConfig] = useState<Config>(initialWalletConfig);
	const { data: getWalletClientHook } = useWalletClient({
		config: walletConfig,
	});
	const { switchChainAsync: switchChainAsyncHook } = useSwitchChain({
		config: walletConfig,
	});

	const { address, status, isConnecting: wagmiIsConnecting, isReconnecting: wagmiIsReconnecting, connector } = useAccount();
	const { connectAsync } = useConnect();
	const [isSponsored] = useState(true);
	const publicClients = useRef<Record<number, IClients["public"]>>({});
	const walletClients = useRef<Record<number, IClients["wallet"]>>({});
	const { disconnectAsync } = useDisconnect();
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const [isReconnectingTimeout, setIsReconnectingTimeout] = useState(false);
	const [isConnecting, setIsConnecting] = useState(false);
	const [isSocial, setIsSocial] = useState(false);
	const [isGuest, setIsGuest] = useState(false);
	const [currentWallet, setCurrentWallet] = useState<Address | undefined>();
	const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
	const [hasInitialized, setHasInitialized] = useState(false);

	// Initialize Web3Auth and check for existing session
	useEffect(() => {
		const initWeb3Auth = async () => {
			if (hasInitialized) return;

			try {
				await initWeb3AuthMobile();
				setWeb3auth(web3authInstance);
				setHasInitialized(true);

				// Check if user is already logged in
				if (web3authInstance.privKey) {
					setIsConnecting(true);
					setIsSocial(true); // Set this early

					try {
						// Use wagmi's connectAsync to inform wagmi about the restored session
						const { accounts } = await connectAsync({
							connector: walletConfig.connectors[0],
						});

						setCurrentWallet(accounts[0]);
					} catch (error) {
						console.error("Error restoring session:", error);
						// If there's an error restoring the session, log out
						await web3authInstance.logout();
						setIsSocial(false);
					} finally {
						setIsConnecting(false);
					}
				} else {
					// Check for guest session if no Web3Auth session
					const hasGuestSession = await isGuestSessionActive();
					if (hasGuestSession) {
						setIsConnecting(true);
						setIsGuest(true);
						setIsSocial(false);

						try {
							// Use wagmi's connectAsync to inform wagmi about the restored guest session
							const { accounts } = await connectAsync({
								connector: walletConfig.connectors[1], // Guest connector
							});

							setCurrentWallet(accounts[0]);
						} catch (error) {
							console.error("Error restoring guest session:", error);
							setIsGuest(false);
						} finally {
							setIsConnecting(false);
						}
					} else {
						console.log("No existing guest session found");
					}
				}
			} catch (error) {
				console.error("Error initializing Web3Auth:", error);
				setIsConnecting(false);
			}
		};

		initWeb3Auth();
	}, [hasInitialized]);

	// Login function
	const connectWallet = useCallback(
		async (provider: (typeof LOGIN_PROVIDER)[keyof typeof LOGIN_PROVIDER], email?: string) => {
			try {
				setIsConnecting(true);

				// Check if this is a guest login
				if (email && isGuestEmail(email)) {
					setIsGuest(true);
					setIsSocial(false); // Guest is not social login

					// Use the guest connector to connect with wagmi
					const { accounts } = await connectAsync({
						connector: walletConfig.connectors[1], // Guest connector is the second one
					});
					setCurrentWallet(accounts[0]);
					return;
				}

				// Regular Web3Auth login
				setIsGuest(false);

				// Update the connector's login parameters before connecting
				const connector = walletConfig.connectors[0] as any;
				if (connector.setLoginParams) {
					connector.setLoginParams({
						loginProvider: provider,
						extraLoginOptions: {
							login_hint: email,
						},
					});
				}

				// Use the existing connector with updated parameters
				const { accounts } = await connectAsync({
					connector: walletConfig.connectors[0],
				});

				setCurrentWallet(accounts[0]);
				setIsSocial(true);
			} catch (error) {
				console.error("Login error:", error);
				setIsSocial(false);
				setIsGuest(false);
				throw error;
			} finally {
				setIsConnecting(false);
			}
		},
		[connectAsync, walletConfig.connectors]
	);

	// Set a timeout for reconnecting to prevent infinite reconnection attempts
	useEffect(() => {
		if (wagmiIsReconnecting) {
			// Clear any existing timeout
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
			}

			// Set a timeout to stop the reconnecting state after 10 seconds
			reconnectTimeoutRef.current = setTimeout(() => {
				setIsReconnectingTimeout(true);
				if (isSocial && isWeb3AuthConnected?.()) {
					// Force logout if Web3Auth is still connected but wagmi is stuck reconnecting
					logoutWeb3Auth?.().catch(console.error);
				}
			}, 5000); // 5 seconds timeout
		} else {
			setIsReconnectingTimeout(false);
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
				reconnectTimeoutRef.current = null;
			}
		}

		return () => {
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
			}
		};
	}, [wagmiIsReconnecting, isSocial]);

	const getPublicClient = (chainId: number): IClients["public"] => {
		if (publicClients.current[chainId]) return publicClients.current[chainId];
		else {
			const client = createPublicClient(getPublicClientConfiguration(chainId)) as IClients["public"];
			publicClients.current[chainId] = client;
			return client;
		}
	};

	// If External, check for chain and switch chain then give wallet client
	// If social return wallet client
	const getWalletClient = useCallback(
		async (chainId: number, _isSocial: boolean | null = isSocial): Promise<IClients["wallet"]> => {
			try {
				if (walletClients.current[chainId]) return walletClients.current[chainId];

				// Use wagmi's address as primary source, fall back to currentWallet for guest mode
				const walletAddress = isGuest || connector?.id === "guest" ? address || currentWallet : address;
				if (!walletAddress) throw new Error("provider not found");

				const chain = supportedChains.find((item) => item.id === chainId);
				if (!chain) throw new Error("chain not found");

				let client: IClients["wallet"];

				// Check if we're using guest mode
				if (isGuest || connector?.id === "guest") {
					const guestWallet = await createGuestWallet(chainId);
					client = guestWallet.client as IClients["wallet"];
				}
				// Check if we're using Web3Auth - multiple ways to detect this
				else if (isSocial || web3auth?.privKey || connector?.id === "web3Auth") {
					// If we detect Web3Auth but don't have the private key yet, it might be a timing issue
					if (!web3auth || !web3auth.privKey) {
						// If wagmi thinks we're connected but Web34Auth isn't ready, this might be a timing issue
						// Try to fall back to external wallet logic if available
						if (getWalletClientHook && connector?.id !== "web3Auth") {
							client = getWalletClientHook as any;
						} else {
							throw new Error("Web3Auth detected but private key not available. This might be a timing issue - please try again.");
						}
					} else {
						// Format the private key properly - same logic as in getPkey
						const cleanPrivateKey = web3auth.privKey.startsWith("0x") ? web3auth.privKey.slice(2) : web3auth.privKey;
						const formattedPrivateKey = `0x${cleanPrivateKey}` as Hex;
						await ethereumPrivateKeyProvider.setupProvider(web3auth.privKey);

						client = createWalletClient({
							transport: custom(ethereumPrivateKeyProvider as EIP1193Provider),
							chain,
							account: privateKeyToAccount(formattedPrivateKey),
						});
					}
				} else {
					// For external wallets or guest wallet, use the wagmi client but skip chain switching for now
					if (!getWalletClientHook) {
						// If no wagmi wallet client is available, try to create one from the connector
						if (connector?.id === "guest") {
							// For guest wallet, create the wallet client directly
							const guestWallet = await createGuestWallet(chainId);
							client = guestWallet.client as IClients["wallet"];
						} else {
							throw new Error("External wallet client not available - no wagmi wallet client found");
						}
					} else {
						// For external wallets, try to switch chain but don't fail if it doesn't work
						try {
							await switchChainAsyncHook({ chainId });
						} catch (error) {
							console.warn("Chain switching failed for external wallet:", error);
							// Continue with current chain
						}

						// Use the wagmi client directly and cast it to our interface
						// This works because both implement the same wallet client interface
						client = getWalletClientHook as any;
					}
				}

				client = client.extend((client) => ({
					async sendTransaction(args) {
						const publicClient = getPublicClient(chainId);
						// For guest mode, use wagmi's address if available, otherwise fall back to currentWallet
						const walletAddress = isGuest || connector?.id === "guest" ? address || currentWallet : address;

						if (!walletAddress) {
							throw new Error("Wallet address not found");
						}

						const gas =
							((await publicClient.estimateGas({
								to: args.to,
								data: args.data,
								value: args.value,
								account: walletAddress,
							})) *
								120n) /
							100n; // increase gas by 20%
						const gasPrice = ((await publicClient.getGasPrice()) * 120n) / 100n; // increase gas price by 20%
						const gasLimit = gasPrice * gas;
						const sponsored = await requestEthForGas({
							chainId: chainId,
							from: walletAddress,
							to: args.to!,
							data: args.data as any,
							value: args.value,
							ethAmountForGas: gasLimit,
						});
						if (!sponsored.status && args.value) {
							const userBalance = await publicClient.getBalance({ address: walletAddress });
							if (userBalance >= args.value + gasLimit) {
								// User has sufficient balance, no need to modify args.value
							} else {
								args.value = userBalance - gasLimit;
								if (args.value <= 0n) {
									throw new Error("Not enough funds to cover gas");
								}
							}
						}
						args.gasPrice = gasPrice;
						args.gas = gas;
						const tx = await client.sendTransaction(args);
						trackTransaction(tx); // this to track the transaction for analytics
						return tx;
					},
				}));

				walletClients.current[chainId] = client;
				return client;
			} catch (error) {
				console.error("Error getting wallet client:", error);
				throw error;
			}
		},
		[address, currentWallet, isSocial, isGuest, getWalletClientHook, switchChainAsyncHook, web3auth, connector, hasInitialized]
	);

	const estimateTxGas = async (args: EstimateTxGasArgs) => {
		const publicClient = getPublicClient(args.chainId);
		// For guest mode, use wagmi's address if available, otherwise fall back to currentWallet
		const walletAddress = isGuest || connector?.id === "guest" ? address || currentWallet : address;

		if (!walletAddress) {
			throw new Error("Wallet address not found");
		}

		return await publicClient.estimateGas({
			account: walletAddress,
			data: args.data,
			to: args.to,
			value: args.value ? BigInt(args.value) : undefined,
		});
	};

	const getClients = async (chainId: number): Promise<IClients> => {
		const wallet = await getWalletClient(chainId);
		return {
			public: getPublicClient(chainId),
			wallet,
		};
	};

	// Update logout function to properly clear Web3Auth session
	async function logout() {
		try {
			// Use wagmi's disconnect which will call our connector's disconnect method
			await disconnectAsync();

			// Clear guest session if it was active
			if (isGuest) {
				await clearGuestSession();
			}

			// Clean up local state
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
				reconnectTimeoutRef.current = null;
			}
			walletClients.current = {};
			setIsReconnectingTimeout(false);
			setCurrentWallet(undefined);
			setIsSocial(false);
			setIsGuest(false);
		} catch (error) {
			console.error("Error during logout:", error);
		}
	}

	// Listen to wagmi status changes to clean up state on disconnect
	useEffect(() => {
		if (status === "disconnected") {
			// Clean up local state when wagmi disconnects
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
				reconnectTimeoutRef.current = null;
			}
			walletClients.current = {};
			setIsReconnectingTimeout(false);
			setCurrentWallet(undefined);
			setIsSocial(false);
			setIsGuest(false);
			// Don't reset isWeb3AuthReady here - Web3Auth itself might still be ready
		} else if (status === "connected" && address) {
			// Sync wagmi address with local state
			setCurrentWallet(address);

			// Re-set isSocial flag if this is a Web3Auth connection
			if (connector?.id === "web3Auth" || web3auth?.privKey) {
				setIsSocial(true);
			}
			// Set isGuest flag if this is a guest connection
			if (connector?.id === "guest") {
				setIsGuest(true);
			}
		}
	}, [status, address, connector, web3auth]);

	const getPkey = async (): Promise<Hex | undefined> => {
		try {
			// Return guest private key if in guest mode
			if (isGuest || connector?.id === "guest") {
				return GUEST_PRIVATE_KEY as Hex;
			}

			if (web3auth && web3auth.privKey) {
				const cleanPrivateKey = web3auth.privKey.startsWith("0x") ? web3auth.privKey.slice(2) : web3auth.privKey;
				return ("0x" + cleanPrivateKey) as Hex;
			}
			const pkey = await getWeb3AuthPk?.();
			return ("0x" + pkey) as Hex;
		} catch (error) {
			return;
		}
	};

	const contextValue = useMemo(
		() => ({
			currentWallet: address || currentWallet, // Prefer wagmi address as source of truth
			isSocial,
			isGuest,
			isConnecting: isConnecting || wagmiIsConnecting,
			isSponsored,
			connector,
			logout,
			getPkey,
			estimateTxGas,
			getPublicClient,
			getWalletClient,
			getClients,
			connectWallet,
		}),
		[
			address,
			currentWallet,
			isSocial,
			isGuest,
			isConnecting,
			wagmiIsConnecting,
			isSponsored,
			connector,
			logout,
			getPkey,
			estimateTxGas,
			getPublicClient,
			getWalletClient,
			getClients,
			connectWallet,
		]
	);

	return <WalletContext.Provider value={contextValue}>{children}</WalletContext.Provider>;
};

export default WalletProvider;
