import { type Address, type Hex, type PublicClient, type WalletClient } from "viem";

export interface IClients {
  public: PublicClient;
  wallet: WalletClient;
}

export interface EstimateTxGasArgs {
  chainId: number;
  to: Address;
  data: Hex;
  value?: string;
}

export interface Web3ProviderConfig {
  clientId: string;
  network: "mainnet" | "cyan" | "testnet";
  chainConfig: any;
}

export interface WalletProviderProps {
  children: React.ReactNode;
} 