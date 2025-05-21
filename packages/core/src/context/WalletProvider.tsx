import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Address, createPublicClient, createWalletClient, EIP1193Provider, Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { Connector, useAccount, useDisconnect, useSwitchChain, useWalletClient } from "wagmi";
import { requestEthForGas } from "./../api";
import { EstimateTxGasArgs, IClients } from "./../types";
import { trackTransaction } from "./../utils/analytics";
import type { Config } from "@wagmi/core";
import { supportedChains } from "../config/baseWalletConfig";
// import { CHAIN_ID } from "src/types/enums";
import Web3Auth, { WEB3AUTH_NETWORK, LOGIN_PROVIDER, ChainNamespace } from "@web3auth/react-native-sdk";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Linking from "expo-linking";
import { web3authClientId } from "../config/constants";

export interface IWalletContext {
	currentWallet?: Address;
	logout: () => void;
	getPkey: () => Promise<string | undefined>;
	isSocial: boolean;
	isConnecting: boolean;
	getPublicClient: (chainId: number) => IClients["public"];
	getWalletClient: (chainId: number) => Promise<IClients["wallet"]>;
	getClients: (chainId: number) => Promise<IClients>;
	estimateTxGas: (args: EstimateTxGasArgs) => Promise<bigint>;
	connector?: Connector;
	login: () => Promise<void>;
}

export const WalletContext = React.createContext<IWalletContext>({} as IWalletContext);

interface IProps {
	children: React.ReactNode;
	walletConfig: Config;
	getWeb3AuthPk?: () => Promise<string | undefined>;
	isWeb3AuthConnected?: () => boolean;
	logoutWeb3Auth?: () => Promise<void>;
}

const WalletProvider: React.FC<IProps> = ({ children, walletConfig, getWeb3AuthPk, isWeb3AuthConnected, logoutWeb3Auth }) => {
	const { data: getWalletClientHook } = useWalletClient({
		config: walletConfig,
	});
	const { switchChainAsync: switchChainAsyncHook } = useSwitchChain({
		config: walletConfig,
	});

	const { address, status, isConnecting: wagmiIsConnecting, isReconnecting: wagmiIsReconnecting, connector } = useAccount();
	const publicClients = useRef<Record<number, IClients["public"]>>({});
	const walletClients = useRef<Record<number, IClients["wallet"]>>({});
	const { disconnectAsync } = useDisconnect();
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const [isReconnectingTimeout, setIsReconnectingTimeout] = useState(false);
	// const [externalChainId, setExternalChainId] = useState(CHAIN_ID.BERACHAIN);
	const [isConnecting, setIsConnecting] = useState(false);
	const [isSocial, setIsSocial] = useState(false);
	const [currentWallet, setCurrentWallet] = useState<Address | undefined>();
	const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
	const [provider, setProvider] = useState<any>(null);

	// Initialize Web3Auth and check for existing session
	useEffect(() => {
		const initWeb3Auth = async () => {
			const scheme = "com.beratrax.mobile";
			const redirectUrl = `${scheme}://auth`;
			const resolvedRedirectUrl =
				Constants.executionEnvironment === ExecutionEnvironment.Standalone
					? Linking.createURL("web3auth", {})
					: Linking.createURL("web3auth", { scheme });

			const clientId = web3authClientId;

			const chainConfig = {
				chainNamespace: ChainNamespace.EIP155,
				chainId: "0x" + (80094).toString(16),
				rpcTarget: "https://rpc.berachain.com",
				displayName: "Berachain",
				tickerName: "Berachain",
				ticker: "BERA",
				blockExplorerUrl: "https://berascan.com",
			};

			const ethereumPrivateKeyProvider = new EthereumPrivateKeyProvider({
				config: {
					chainConfig,
				},
			});

			const web3authInstance = new Web3Auth(WebBrowser, SecureStore, {
				clientId,
				network: WEB3AUTH_NETWORK.CYAN,
				privateKeyProvider: ethereumPrivateKeyProvider,
				redirectUrl,
				enableLogging: true, // Enable logging for debugging
			});

			try {
				await web3authInstance.init();
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
	const login = async () => {
		if (!web3auth) {
			console.error("Web3Auth not initialized");
			return;
		}

		try {
			setIsConnecting(true);
			const web3authResponse = await web3auth.login({
				redirectUrl: Linking.createURL("web3auth", { scheme: "com.beratrax.mobile" }),
				mfaLevel: "default",
				loginProvider: "google",
			});

			if (web3auth.connected) {
				const privateKey = await web3auth.provider?.request({
					method: "eth_private_key",
				});

				// Ensure private key is properly formatted
				if (typeof privateKey === "string") {
					// Remove '0x' prefix if present and ensure it's a valid hex string
					const cleanPrivateKey = privateKey.startsWith("0x") ? privateKey.slice(2) : privateKey;
					const formattedPrivateKey = `0x${cleanPrivateKey}` as Hex;

					try {
						const account = privateKeyToAccount(formattedPrivateKey);
						setCurrentWallet(account.address);
						setIsSocial(true);
					} catch (error) {
						console.error("Error creating account from private key:", error);
						throw new Error("Invalid private key format");
					}
				} else {
					throw new Error("Invalid private key received from Web3Auth");
				}
			}
		} catch (error) {
			console.error("Login error:", error);
			throw error;
		} finally {
			setIsConnecting(false);
		}
	};

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
			if (walletClients.current[chainId]) return walletClients.current[chainId];

			if (!address) throw new Error("provider not found");

			const chain = supportedChains.find((item) => item.id === chainId);
			if (!chain) throw new Error("chain not found");

			let client: IClients["wallet"];
			if (isSocial) {
				const pkey = await getPkey();
				if (!pkey) throw new Error("Invalid wallet connector");

				client = createWalletClient({
					account: privateKeyToAccount(pkey),
					transport: http(chain.rpcUrls?.default?.http[0]),
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
			if (web3auth?.connected) {
				await web3auth.logout();
			}
			await disconnectAsync();
			// Clear timeout on logout
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
				reconnectTimeoutRef.current = null;
			}
			if (isWeb3AuthConnected?.()) await logoutWeb3Auth?.();
			walletClients.current = {};
			setIsReconnectingTimeout(false);
			setCurrentWallet(undefined);
			setIsSocial(false);
		} catch (error) {
			console.error("Error during logout:", error);
		}
	}

	const getPkey = async (): Promise<Hex | undefined> => {
		try {
			const pkey = await getWeb3AuthPk?.();
			return ("0x" + pkey) as Hex;
		} catch (error) {
			return;
		}
	};

	useEffect(() => {
		if (status === "disconnected") logout();
	}, [status]);

	return (
		<WalletContext.Provider
			value={{
				currentWallet,
				isSocial,
				isConnecting,
				connector,
				logout,
				getPkey,
				estimateTxGas,
				getPublicClient,
				getWalletClient,
				getClients,
				login,
			}}
		>
			{children}
		</WalletContext.Provider>
	);
};

export default WalletProvider;
