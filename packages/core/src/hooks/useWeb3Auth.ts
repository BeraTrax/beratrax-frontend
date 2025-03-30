import { IProvider } from "@web3auth/base";
import { providerToSmartAccountSigner } from "permissionless";
import { useState } from "react";

import { Account, Client, createWalletClient, custom, CustomTransport } from "viem";
import { arbitrum } from "viem/chains";
import { getWeb3AuthInstance } from "core/src/config/walletConfig";

const useWeb3Auth = () => {
  const [connected, setConnected] = useState(false);
  const [client, setClient] = useState<Client<CustomTransport, typeof arbitrum, Account>>();
  const [isSocial, setIsSocial] = useState(false);
  const [web3AuthProvider, setWeb3AuthProvider] = useState<IProvider | null>(null);

  const connect = async () => {
    try {
      // Use the instance from the getter function
      const instance = await getWeb3AuthInstance();

      // Check if already connected
      if (instance.connected) {
        // Get the provider directly if already connected
        const _isSocial = instance.connectedAdapterName === "openlogin";
        setIsSocial(_isSocial);

        if (instance.provider) {
          const smartAccountSigner = await providerToSmartAccountSigner(instance.provider as any);
          const client = createWalletClient({
            account: smartAccountSigner.address,
            transport: custom(instance.provider),
            chain: arbitrum,
          });

          setConnected(true);
          setClient(client);
          setWeb3AuthProvider(instance.provider);

          return {
            client,
            isSocial: _isSocial,
            provider: instance.provider,
            address: smartAccountSigner.address,
          };
        }
      }

      // AA- Account set to false
      const _isSocial = false;
      setIsSocial(_isSocial);

      // Only proceed if we have a provider
      if (instance.provider) {
        const smartAccountSigner = await providerToSmartAccountSigner(instance.provider as any);
        const client = createWalletClient({
          account: smartAccountSigner.address,
          transport: custom(instance.provider),
          chain: arbitrum,
        });

        setConnected(true);
        setClient(client);
        setWeb3AuthProvider(instance.provider);

        return {
          client,
          isSocial: _isSocial,
          provider: instance.provider,
          address: smartAccountSigner.address,
        };
      }

      throw new Error("Web3Auth provider not available");
    } catch (error) {
      console.error("Error connecting with Web3Auth:", error);
      throw error;
    }
  };

  const disconnect = async () => {
    try {
      const instance = await getWeb3AuthInstance();
      if (instance.connected) {
        await instance.logout();
      }

      setConnected(false);
      setClient(undefined);
      setWeb3AuthProvider(null);
    } catch (error) {
      console.error("Error disconnecting from Web3Auth:", error);
    }
  };

  return { connect, disconnect, connected, isSocial, client };
};

export default useWeb3Auth;
