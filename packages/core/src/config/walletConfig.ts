import { CHAIN_NAMESPACES } from "@web3auth/base";
import { getDefaultExternalAdapters } from "@web3auth/default-evm-adapter";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { useMemo } from "react";
import { Chain } from "viem/chains";
import { POLLING_INTERVAL, walletConnectProjectId, WEB3AUTH_CLIENT_ID } from "./constants";

import { getDefaultConfig, WalletDetailsParams } from "@rainbow-me/rainbowkit";
import {
  argentWallet,
  braveWallet,
  coinbaseWallet,
  injectedWallet,
  ledgerWallet,
  metaMaskWallet,
  okxWallet,
  rainbowWallet,
  safeWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { Web3AuthConnector } from "@web3auth/web3auth-wagmi-connector";
import { providers } from "ethers";
import { defineChain, http, WalletClient, type HttpTransport } from "viem";
import { createConnector as createWagmiConnector } from "wagmi";
import discordIcon from "./../assets/images/discordapp-icon.svg";
import facebookIcon from "./../assets/images/facebook-icon.svg";
import githubIcon from "./../assets/images/github-icon.svg";
import googleIcon from "./../assets/images/google-logo.svg";
import twitterIcon from "./../assets/images/twitter-icon.svg";
import { blockExplorersByChainId } from "./constants/urls";

export const berachain = /*#__PURE__*/ defineChain({
  id: 80094,
  name: "Berachain",
  nativeCurrency: {
    decimals: 18,
    name: "BERA Token",
    symbol: "BERA",
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 0,
    },
    ensRegistry: {
      address: "0x5b22280886a2f5e09a49bea7e320eab0e5320e28 ",
    },
    ensUniversalResolver: {
      address: "0xddfb18888a9466688235887dec2a10c4f5effee9",
    },
  },
  rpcUrls: {
    default: { http: ["https://rpc.berachain.com"] },
  },
  blockExplorers: {
    default: {
      name: "Berascan",
      url: "https://berascan.com",
    },
  },
  testnet: false,
});

// Object.assign(berachainMainnet.rpcUrls, {
//     alchemy: {
//         http: [BARTIO_RPC_URL],
//     },
//     default: {
//         http: [BARTIO_RPC_URL],
//     },
// });

export const SupportedChains = [berachain] as (Chain & {
  rpcUrls: { alchemy?: { http: string[] } };
  iconUrl?: string;
})[];

// #region Chain config
const chainConfig = {
  chainId: "0x" + berachain.id.toString(16),
  rpcTarget: berachain.rpcUrls.default.http[0],
  displayName: berachain.name,
  tickerName: berachain.nativeCurrency.name,
  ticker: berachain.nativeCurrency.symbol,
  blockExplorerUrl: blockExplorersByChainId[berachain.id],
  chainNamespace: CHAIN_NAMESPACES.EIP155,
};
// #endregion Chain config

// #region web3auth config
const clientId = WEB3AUTH_CLIENT_ID as string;

const PrivateKeyProvider = new EthereumPrivateKeyProvider({
  config: {
    chainConfig,
  },
});

// Create a function to get an initialized web3auth instance
export const getWeb3AuthInstance = (() => {
  let instance: Web3AuthNoModal | null = null;
  let isInitialized = false;

  return async () => {
    if (!instance) {
      instance = new Web3AuthNoModal({
        clientId,
        web3AuthNetwork: "cyan",
        chainConfig,
      });

      // Initialize adapters only once
      if (!isInitialized) {
        const openloginAdapter = new OpenloginAdapter({
          privateKeyProvider: PrivateKeyProvider,
          adapterSettings: {
            network: "cyan",
            uxMode: "redirect",
            replaceUrlOnRedirect: false,
          },
        });

        instance.configureAdapter(openloginAdapter);

        try {
          const adapters = await getDefaultExternalAdapters({
            options: {
              clientId,
              web3AuthNetwork: "cyan",
              privateKeyProvider: PrivateKeyProvider,
              chainConfig,
            },
          });

          adapters.forEach((adapter) => {
            instance?.configureAdapter(adapter);
          });
        } catch (error) {
          console.error("Error configuring Web3Auth adapters:", error);
        }

        isInitialized = true;
      }
    }

    // Check if Web3Auth needs initialization by looking at the status
    if (instance.status !== "ready") {
      await instance.init();
    }

    return instance;
  };
})();

// Instantiating Web3Auth - old instance to keep compatibility
export const web3AuthInstance = new Web3AuthNoModal({
  clientId,
  web3AuthNetwork: "cyan",
  chainConfig,
});

const openloginAdapter = new OpenloginAdapter({
  privateKeyProvider: PrivateKeyProvider,
  adapterSettings: {
    network: "cyan",
    uxMode: "redirect",
    replaceUrlOnRedirect: false,
  },
});
web3AuthInstance.configureAdapter(openloginAdapter);

// Don't call getDefaultExternalAdapters here directly
// We'll initialize adapters when needed

export const web3authProvider = web3AuthInstance.provider;

// #endregion web3auth config

// Fix for all social login wallet functions
const createSocialWallet = (id: string, name: string, icon: string, loginProvider: string) => {
  return {
    id,
    name,
    iconUrl: icon,
    iconBackground: "white",
    createConnector: (walletDetails: WalletDetailsParams) =>
      createWagmiConnector((config) => {
        // This is synchronous and returns the connector object directly
        return {
          ...Web3AuthConnector({
            web3AuthInstance,
            loginParams: {
              loginProvider,
            },
          })(config),
          ...walletDetails,
        };
      }),
  };
};

const googleWallet = () => createSocialWallet("google", "Google", googleIcon, "google");
const facebookWallet = () => createSocialWallet("facebook", "Facebook", facebookIcon, "facebook");
const discordWallet = () => createSocialWallet("discord", "Discord", discordIcon, "discord");
const twitterWallet = () => createSocialWallet("twitter", "Twitter", twitterIcon, "twitter");
const githubWallet = () => createSocialWallet("github", "Github", githubIcon, "github");

export const rainbowConfig = getDefaultConfig({
  appName: "Beratrax",
  projectId: walletConnectProjectId,
  chains: SupportedChains as [Chain, ...Chain[]],
  transports: SupportedChains.reduce(
    (acc, curr) => {
      acc[curr.id] = http(curr.rpcUrls?.alchemy?.http[0]);
      return acc;
    },
    {} as { [key: number]: HttpTransport },
  ),
  wallets: [
    {
      groupName: "Wallets",
      wallets: [
        metaMaskWallet,
        coinbaseWallet,
        googleWallet,
        twitterWallet,
        facebookWallet,
        discordWallet,
        githubWallet,
        injectedWallet,
        walletConnectWallet,
        braveWallet,
        safeWallet,
        argentWallet,
        okxWallet,
        ledgerWallet,
        rainbowWallet,
      ],
    },
  ],
});

export function walletClientToWeb3Provider(walletClient: WalletClient) {
  const { account, chain, transport } = walletClient;
  const network = {
    chainId: chain?.id ?? berachain.id,
    name: chain?.name ?? berachain.name,
    ensAddress: chain?.contracts?.ensRegistry?.address,
  };
  const provider = new providers.Web3Provider(transport, network);
  provider.pollingInterval = POLLING_INTERVAL;
  return provider;
}

/** Hook to convert a viem Wallet Client to an ethers.js Web3Provider. */
export function useEthersWeb3Provider(walletClient?: WalletClient) {
  return useMemo(() => (walletClient ? walletClientToWeb3Provider(walletClient) : undefined), [walletClient]);
}
