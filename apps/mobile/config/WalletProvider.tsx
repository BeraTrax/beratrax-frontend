import * as WebBrowser from "@toruslabs/react-native-web-browser";
import {
  AccountAbstractionProvider,
  BiconomySmartAccount,
  ISmartAccount,
  KernelSmartAccount,
  SafeSmartAccount,
  TrustSmartAccount,
} from "@web3auth/account-abstraction-provider";
import { WEB3AUTH_NETWORK } from '@web3auth/base';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import Web3Auth, { LOGIN_PROVIDER } from '@web3auth/react-native-sdk';
import { ethers } from 'ethers';
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { MMKVLoader, useMMKVStorage } from "react-native-mmkv-storage";
import { formatEther } from 'viem';
import { useAccount, useBalance, useChainId, useConnect, useDisconnect, useSignMessage, useSwitchChain, WagmiProvider } from 'wagmi';
import { chainConfig, PIMLICO_API_KEY, SupportedChains, WEB3AUTH_CLIENT_ID } from './chain';
import { wagmiConfig } from './walletConfig';

// Define the type for connector IDs that can be passed to connect method
type ConnectorId = 'google' | 'facebook' | 'twitter' | 'github' | 'discord' | 'walletConnect' | 'injected';

// Define the wallet context interface
export interface IWalletContext {
  address: string | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  connect: (connectorId: ConnectorId) => Promise<void>;
  disconnect: () => void;
  balance: string;
  formattedBalance: string;
  chainId: number | undefined;
  switchNetwork: (chainId: number) => Promise<void>;
  provider: any;
  currentNetwork: string;
  gasPrice: string;
  signMessage: (message: string) => Promise<string>;
  getUserInfo: () => Promise<any>;
}

// Create the redirect URL for web3auth
const redirectUrl =
  Constants.appOwnership === "expo" || Constants.appOwnership === "guest"
    ? Linking.createURL("web3auth", {})
    : Linking.createURL("web3auth", { scheme: "web3authexpoexample" });

// Helper function to get default bundler URL
export const getDefaultBundlerUrl = (chainId: string): string => {
  return `https://api.pimlico.io/v2/${Number(chainId)}/rpc?apikey=${PIMLICO_API_KEY}`;
};

// Define smart account types
export type SmartAccountType = "safe" | "kernel" | "biconomy" | "trust";

// Define account abstraction configuration type
export type AccountAbstractionConfig = {
  bundlerUrl?: string;
  paymasterUrl?: string;
  smartAccountType?: SmartAccountType;
};

// Initialize account abstraction configuration
const AAConfig: AccountAbstractionConfig = {
  smartAccountType: "safe",
};

// Initialize storage
const storage = new MMKVLoader().initialize();

// Create the wallet context
export const WalletContext = createContext<IWalletContext | undefined>(undefined);

// Hook to use the wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

// WalletProvider props interface
interface WalletProviderProps {
  children: ReactNode;
}

// WalletProvider component
export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  // State variables
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [balance, setBalance] = useState<string>('0');
  const [formattedBalance, setFormattedBalance] = useState<string>('0.00 ETH');
  const [currentNetwork, setCurrentNetwork] = useState<string>('');
  const [gasPrice, setGasPrice] = useState<string>('0');
  const [useAccountAbstraction, setUseAccountAbstraction] = useMMKVStorage<boolean>("useAccountAbstraction", storage, false);

  // Wagmi hooks
  const { address, isConnected, isConnecting } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { data: balanceData } = useBalance({ address });
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { signMessageAsync } = useSignMessage();

  // Toggle account abstraction
  const toggleAccountAbstraction = () => {
    setUseAccountAbstraction((prevState: boolean) => !prevState);
  };

  // Initialize Web3Auth
  useEffect(() => {
    const init = async () => {
      // Setup account abstraction provider if enabled
      let aaProvider: AccountAbstractionProvider | undefined;
      if (useAccountAbstraction) {
        const { bundlerUrl, paymasterUrl, smartAccountType } = AAConfig;

        let smartAccountInit: ISmartAccount;
        switch (smartAccountType) {
          case "biconomy":
            smartAccountInit = new BiconomySmartAccount();
            break;
          case "kernel":
            smartAccountInit = new KernelSmartAccount();
            break;
          case "trust":
            smartAccountInit = new TrustSmartAccount();
            break;
          case "safe":
          default:
            smartAccountInit = new SafeSmartAccount();
            break;
        }

        aaProvider = new AccountAbstractionProvider({
          config: {
            chainConfig,
            bundlerConfig: {
              url: bundlerUrl ?? getDefaultBundlerUrl(chainConfig.chainId),
            },
            paymasterConfig: paymasterUrl
              ? {
                  url: paymasterUrl,
                }
              : undefined,
            smartAccountInit,
          },
        });
      }

      // Initialize Ethereum private key provider
      const ethereumPrivateKeyProvider = new EthereumPrivateKeyProvider({
        config: {
          chainConfig,
        },
      });

      // Initialize Web3Auth
      const web3authInstance = new Web3Auth(WebBrowser, SecureStore, {
        clientId: WEB3AUTH_CLIENT_ID,
        privateKeyProvider: ethereumPrivateKeyProvider,
        accountAbstractionProvider: aaProvider,
        redirectUrl,
        network: WEB3AUTH_NETWORK.CYAN,
      });
      
      setWeb3auth(web3authInstance);
      await web3authInstance.init();

      if (web3authInstance.connected) {
        setProvider(web3authInstance.provider);
      }
    };
    
    init();
  }, [useAccountAbstraction]);

  // Update balance when balance data changes
  useEffect(() => {
    if (balanceData) {
      setBalance(balanceData.formatted);
      setFormattedBalance(`${parseFloat(balanceData.formatted).toFixed(4)} ${balanceData.symbol}`);
    }
  }, [balanceData]);

  // Update network info when chainId changes
  useEffect(() => {
    if (chainId) {
      const chain = SupportedChains.find(chain => chain.id === chainId);
      setCurrentNetwork(chain?.name || 'Unknown Network');
      
      // Fetch gas price
      const fetchGasPrice = async () => {
        if (provider) {
          try {
            const result = await provider.request({ 
              method: 'eth_gasPrice', 
              params: [] 
            });
            const gasPriceInGwei = parseFloat(formatEther(BigInt(result as string))) * 1e9;
            setGasPrice(`${gasPriceInGwei.toFixed(2)} Gwei`);
          } catch (error) {
            console.error('Failed to fetch gas price:', error);
            setGasPrice('Unknown');
          }
        }
      };
      
      fetchGasPrice();
    }
  }, [chainId, provider]);

  // Connect to wallet
  const connect = async (connectorId: ConnectorId) => {
    try {
      // Social wallet login
      if (web3auth && ['google', 'facebook', 'twitter', 'github', 'discord'].includes(connectorId)) {
        if (!web3auth.ready) {
          console.log("Web3auth not initialized");
          return;
        }

        console.log(`Logging in with ${connectorId}`);
        
        const loginProviderMap: Record<string, keyof typeof LOGIN_PROVIDER> = {
          'google': 'GOOGLE',
          'facebook': 'FACEBOOK',
          'twitter': 'TWITTER',
          'github': 'GITHUB',
          'discord': 'DISCORD'
        };
        
        await web3auth.login({
          loginProvider: loginProviderMap[connectorId],
        });

        if (web3auth.connected) {
          setProvider(web3auth.provider);
          console.log("Logged in with Web3Auth");
          return;
        }
      } 
      // WalletConnect or injected wallet connection
      else {
        const selectedConnector = connectors.find(c => c.id === connectorId);
        if (!selectedConnector) {
          throw new Error(`Connector ${connectorId} not found`);
        }
        await connectAsync({ connector: selectedConnector });
        console.log(`Connected with ${connectorId}`);
      }
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  };

  // Disconnect from wallet
  const disconnect = async () => {
    try {
      // If connected with Web3Auth
      if (web3auth?.connected) {
        console.log("Logging out from Web3Auth");
        await web3auth.logout();
        setProvider(null);
        console.log("Logged out from Web3Auth");
      } 
      // If connected with WalletConnect or injected
      else if (isConnected) {
        await disconnectAsync();
        console.log("Disconnected from wallet");
      }
    } catch (error) {
      console.error('Disconnect error:', error);
      throw error;
    }
  };

  // Switch network
  const switchNetwork = async (chainId: number) => {
    if (switchChainAsync) {
      await switchChainAsync({ chainId });
    }
  };

  // Sign a message
  const signMessage = async (message: string): Promise<string> => {
    if (!isConnected && !web3auth?.connected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      // If using Web3Auth
      if (web3auth?.connected && provider) {
        const ethProvider = new ethers.BrowserProvider(provider);
        const signer = await ethProvider.getSigner();
        return await signer.signMessage(message);
      } 
      // If using WalletConnect or injected
      else {
        return await signMessageAsync({ message });
      }
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  };

  // Get user info
  const getUserInfo = async (): Promise<any> => {
    if (!isConnected && !web3auth?.connected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      // If using Web3Auth
      if (web3auth?.connected) {
        return web3auth.userInfo();
      } 
      // For WalletConnect or injected providers
      else {
        return {
          address,
          chainId,
          provider: 'External Wallet'
        };
      }
    } catch (error) {
      console.error('Error getting user info:', error);
      return {
        address,
        error: 'Could not retrieve detailed user info'
      };
    }
  };

  // Context value
  const value = {
    address: address as string | undefined,
    isConnected: isConnected || (web3auth?.connected || false),
    isConnecting,
    connect,
    disconnect,
    balance,
    formattedBalance,
    chainId,
    switchNetwork,
    provider: provider,
    currentNetwork,
    gasPrice,
    signMessage,
    getUserInfo,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Root wallet provider with Wagmi
export const AppWalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <WalletProvider>
        {children}
      </WalletProvider>
    </WagmiProvider>
  );
};
