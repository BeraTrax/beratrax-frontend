import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { rainbowConfig, SupportedChains, web3AuthInstance } from "src/config/walletConfig";
import { Address, Hex, createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { EstimateTxGasArgs, IClients } from "src/types";
import { requestEthForGas } from "src/api";
import { Connector, useAccount, useDisconnect } from "wagmi";
import { getWalletClient as getWalletClientCore, switchChain as switchChainCore } from "@wagmi/core";
import { trackTransaction } from "src/utils/analytics";

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
}

export const WalletContext = React.createContext<IWalletContext>({} as IWalletContext);

interface IProps {
  children: React.ReactNode;
}

const WalletProvider: React.FC<IProps> = ({ children }) => {
  const { address, status, isConnecting, isReconnecting, connector } = useAccount();
  const publicClients = useRef<Record<number, IClients["public"]>>({});
  const walletClients = useRef<Record<number, IClients["wallet"]>>({});
  const { disconnectAsync } = useDisconnect();
  const isSocial = useMemo(() => {
    return connector?.id === "web3auth";
  }, [connector]);

  const getPublicClient = (chainId: number): IClients["public"] => {
    if (publicClients.current[chainId]) return publicClients.current[chainId];
    else {
      const chain = SupportedChains.find((item) => item.id === chainId);
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

      const chain = SupportedChains.find((item) => item.id === chainId);
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
        client = await getWalletClientCore(rainbowConfig, { chainId });
        await switchChainCore(rainbowConfig, { chainId });
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
    [address]
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

  async function logout() {
    await disconnectAsync();
    if (web3AuthInstance.connected) await web3AuthInstance.logout();
    walletClients.current = {};
  }

  const getPkey = async (): Promise<Hex | undefined> => {
    try {
      const pkey = await web3AuthInstance.provider?.request({ method: "eth_private_key" });
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
        currentWallet: address,
        isSocial,
        isConnecting: isConnecting || isReconnecting,
        connector,
        logout,
        getPkey,
        estimateTxGas,
        getPublicClient,
        getWalletClient,
        getClients,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export default WalletProvider;
