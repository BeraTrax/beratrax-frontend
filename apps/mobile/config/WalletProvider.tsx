import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { formatEther } from 'viem';
import { useAccount, useBalance, useChainId, useConnect, useDisconnect, useSwitchChain, WagmiProvider } from 'wagmi';
import { SupportedChains } from './chain';
import { wagmiConfig, web3authProvider } from './walletConfig';

export interface IWalletContext {
  address: string | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  connect: (connector: string) => Promise<void>;
  disconnect: () => void;
  balance: string;
  chainId: number | undefined;
  switchNetwork: (chainId: number) => Promise<void>;
  provider: any;
  formattedBalance: string;
  currentNetwork: string;
  gasPrice: string;
}

export const WalletContext = createContext<IWalletContext | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const { address, isConnected, isConnecting } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { data: balanceData } = useBalance({ address });
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  
  const [balance, setBalance] = useState<string>('0');
  const [formattedBalance, setFormattedBalance] = useState<string>('0.00 ETH');
  const [currentNetwork, setCurrentNetwork] = useState<string>('');
  const [gasPrice, setGasPrice] = useState<string>('0');

  useEffect(() => {
    if (balanceData) {
      setBalance(balanceData.formatted);
      setFormattedBalance(`${parseFloat(balanceData.formatted).toFixed(4)} ${balanceData.symbol}`);
    }
  }, [balanceData]);

  useEffect(() => {
    if (chainId) {
      const chain = SupportedChains.find(chain => chain.id === chainId);
      setCurrentNetwork(chain?.name || 'Unknown Network');
      
      // Fetch gas price
      const fetchGasPrice = async () => {
        if (web3authProvider) {
          try {
            console.log('========= fetching gas price')
            const result = await web3authProvider.request({ 
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
  }, [chainId, web3authProvider]);

  const connect = async (connectorId: string) => {
    try {
      const selectedConnector = connectors.find(c => c.id === connectorId);
      if (!selectedConnector) {
        throw new Error(`Connector ${connectorId} not found`);
      }
      await connectAsync({ connector: selectedConnector });
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  };

  const disconnect = async () => {
    if (isConnected) {
      await disconnectAsync();
    }
  };

  const switchToNetwork = async (chainId: number) => {
    if (switchChainAsync) {
      await switchChainAsync({ chainId });
    }
  };

  const value = {
    address: address as string | undefined,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    balance,
    chainId,
    switchNetwork: switchToNetwork,
    provider: web3authProvider,
    formattedBalance,
    currentNetwork,
    gasPrice,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const AppWalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <WalletProvider>
        {children}
      </WalletProvider>
    </WagmiProvider>
  );
};
