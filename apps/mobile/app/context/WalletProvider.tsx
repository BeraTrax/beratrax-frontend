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
import {
	initWeb3Auth as initWeb3AuthMobile,
	web3auth as web3authInstance,
	createMobileWalletConfig,
} from "@beratrax/mobile/config/mobileWalletConfig";

export interface IWalletContext {
	currentWallet?: Address;
	logout: () => void;
	getPkey: () => Promise<string | undefined>;
	isSocial: boolean;
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
	const [walletConfig, setWalletConfig] = useState<Config>(initialWalletConfig);
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
	const [currentWallet, setCurrentWallet] = useState<Address | undefined>();
	const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);

	// Initialize Web3Auth and check for existing session
	useEffect(() => {
		const initWeb3Auth = async () => {
			try {
				await initWeb3AuthMobile();
				setWeb3auth(web3authInstance);

				// Check if user is already logged in
				if (web3authInstance.connected) {
					setIsConnecting(true);
					try {
						const privateKey = await web3authInstance.provider?.request({
							method: "eth_private_key",
						});

						if (typeof privateKey === "string") {
							const cleanPrivateKey = privateKey.startsWith("0x") ? privateKey.slice(2) : privateKey;
							const formattedPrivateKey = `0x${cleanPrivateKey}` as Hex;

							const account = privateKeyToAccount(formattedPrivateKey);
							setCurrentWallet(account.address);
							setIsSocial(true);
						}
					} catch (error) {
						console.error("Error restoring session:", error);
						// If there's an error restoring the session, log out
						await web3authInstance.logout();
					} finally {
						setIsConnecting(false);
					}
				}
			} catch (error) {
				console.error("Error initializing Web3Auth:", error);
			}
		};

		initWeb3Auth();
	}, []);

	// Login function
	const connectWallet = useCallback(
		async (provider: (typeof LOGIN_PROVIDER)[keyof typeof LOGIN_PROVIDER], email?: string) => {
			try {
				console.log("connectWallet clicked");
				setIsConnecting(true);

				// Create new config with the selected provider
				const newConfig = createMobileWalletConfig(email, provider);
				setWalletConfig(newConfig);

				const { accounts } = await connectAsync({
					connector: newConfig.connectors[0],
				});

				setCurrentWallet(accounts[0]);
				setIsSocial(true);
			} catch (error) {
				console.error("Login error:", error);
				throw error;
			} finally {
				setIsConnecting(false);
			}
		},
		[connectAsync]
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
			const chain = supportedChains.find((item) => item.id === chainId);
			if (!chain) throw new Error("chain not found");
			const client = createPublicClient({
				chain: chain,
				transport: http(chain.rpcUrls?.default?.http[0], {
					timeout: 60_000,
				}),
				batch: {
					multicall: {
						batchSize: 4096,
						wait: 250,
					},
				},
			}) as IClients["public"];

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

				if (!address) throw new Error("provider not found");

				const chain = supportedChains.find((item) => item.id === chainId);
				if (!chain) throw new Error("chain not found");

				let client: IClients["wallet"];
				if (isSocial) {
					if (!web3auth || !web3auth.provider) {
						throw new Error("Web3Auth not initialized");
					}

					const rawKey = await web3auth.provider.request({
						method: "eth_private_key",
					});
					if (typeof rawKey !== "string") {
						throw new Error("Failed to retrieve private key from Web3Auth");
					}

					client = createWalletClient({
						transport: custom(web3auth.provider),
						chain,
					});
				} else {
					// @ts-ignore
					client = getWalletClientHook;
					await switchChainAsyncHook({ chainId });
				}

				client = client.extend((client) => ({
					async sendTransaction(args) {
						const publicClient = getPublicClient(chainId);
						const gas =
							((await publicClient.estimateGas({
								to: args.to,
								data: args.data,
								value: args.value,
								account: address,
							})) *
								120n) /
							100n; // increase gas by 20%
						const gasPrice = ((await publicClient.getGasPrice()) * 120n) / 100n; // increase gas price by 20%
						const gasLimit = gasPrice * gas;
						const sponsored = await requestEthForGas({
							chainId: chainId,
							from: address,
							to: args.to!,
							data: args.data as any,
							value: args.value,
							ethAmountForGas: gasLimit,
						});
						if (!sponsored.status && args.value) {
							const userBalance = await publicClient.getBalance({ address });
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
		[address, isSocial, getWalletClientHook, switchChainAsyncHook]
	);

	const estimateTxGas = async (args: EstimateTxGasArgs) => {
		const publicClient = getPublicClient(args.chainId);
		return await publicClient.estimateGas({
			account: address,
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

			// Clean up local state
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
				reconnectTimeoutRef.current = null;
			}
			walletClients.current = {};
			setIsReconnectingTimeout(false);
			setCurrentWallet(undefined);
			setIsSocial(false);
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
		}
	}, [status]);

	const getPkey = async (): Promise<Hex | undefined> => {
		try {
			const pkey = await getWeb3AuthPk?.();
			return ("0x" + pkey) as Hex;
		} catch (error) {
			return;
		}
	};

	const contextValue = useMemo(
		() => ({
			currentWallet,
			isSocial,
			isConnecting,
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
			currentWallet,
			isSocial,
			isConnecting,
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
