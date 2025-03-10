// IMP START - Quick Start
import { Chain, http } from "viem";
import { createConfig } from "wagmi";
import { injected, walletConnect } from 'wagmi/connectors';
import { chainConfig, SupportedChains, WALLET_CONNECT_PROJECT_ID, WEB3AUTH_CLIENT_ID } from "./chain";

import * as WebBrowser from "@toruslabs/react-native-web-browser";
import { IWeb3Auth } from '@web3auth/base';
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import Web3Auth, { LoginParams, WEB3AUTH_NETWORK } from "@web3auth/react-native-sdk";
import { Web3AuthConnector } from '@web3auth/web3auth-wagmi-connector';
import EncryptedStorage from "react-native-encrypted-storage";
import { createConnector as createWagmiConnector } from 'wagmi';
// IMP END - Quick Start

const scheme = "web3authsfaauth0"; // Or your desired app redirection scheme
// IMP START - Whitelist bundle ID
const redirectUrl = `${scheme}://auth`;
// IMP END - Whitelist bundle ID

// IMP START - Dashboard Registration
const clientId = WEB3AUTH_CLIENT_ID; // get from https://dashboard.web3auth.io
// IMP END - Dashboard Registration

// IMP START - SDK Initialization
const ethereumPrivateKeyProvider = new EthereumPrivateKeyProvider({
  config: {
    chainConfig,
  },
});

const web3auth = new Web3Auth(WebBrowser, EncryptedStorage, {
  clientId,
  redirectUrl,
  network: WEB3AUTH_NETWORK.CYAN,
  privateKeyProvider: ethereumPrivateKeyProvider
});

export const web3authProvider = web3auth.provider;

// Create an adapter to make Web3Auth compatible with the connector
const web3AuthAdapter: IWeb3Auth = {
  connected: false,
  connectedAdapterName: null,
  cachedAdapter: null,
  status: "ready",
  provider: web3auth.provider as any, // Type assertion to avoid incompatible provider types
  // Add minimum required methods to satisfy the interface
  init: async () => {
    await web3auth.init();
    // Return void instead of Web3Auth to match the expected interface
  },
  // @ts-ignore
  connectTo: async (walletName: string, loginParams: LoginParams) => {
    return web3auth.login(loginParams);
  },
  logout: async (options?: { cleanup: boolean }) => {
    await web3auth.logout();
    // Return void instead of boolean to match the expected type
  },
  getUserInfo: async () => {
    const userInfo = await web3auth.userInfo();
    return userInfo || {};
  },
};

const createSocialWallet = (id: string, name: string, loginProvider: string) => {
  return {
    id,
    name,
    iconBackground: "white",
    createConnector: (walletDetails: any) => 
      createWagmiConnector((config) => {
        // Use the adapted interface instead of the raw web3auth instance
        return {
          ...Web3AuthConnector({
            web3AuthInstance: web3AuthAdapter,
            loginParams: {
              loginProvider,
            },
          })(config),
          ...walletDetails
        };
      }),
  }
}

const googleWallet = () => createSocialWallet("google", "Google", "google");
const facebookWallet = () => createSocialWallet("facebook", "Facebook", "facebook");
const discordWallet = () => createSocialWallet("discord", "Discord", "discord");
const twitterWallet = () => createSocialWallet("twitter", "Twitter", "twitter");
const githubWallet = () => createSocialWallet("github", "Github", "github");

// Create an array of social wallets for easy access
export const socialWallets = [
  googleWallet(),
  facebookWallet(),
  discordWallet(),
  twitterWallet(),
  githubWallet()
];

// Fix transports configuration and add social wallets
// Explicitly create only the connectors we need to avoid Safe dependency
export const wagmiConfig = createConfig({
  chains: SupportedChains as [Chain, ...Chain[]],
  connectors: [
    // Only include walletConnect and injected
    walletConnect({
      projectId: WALLET_CONNECT_PROJECT_ID,
      showQrModal: true,
      qrModalOptions: {
        themeMode: 'dark',
      },
    }),
    injected({
      shimDisconnect: true,
    }),
    // Add social wallet connectors
    googleWallet().createConnector({}),
    facebookWallet().createConnector({}),
    discordWallet().createConnector({}),
    twitterWallet().createConnector({}),
    githubWallet().createConnector({})
  ],
  transports: Object.fromEntries(
    SupportedChains.map(chain => [
      chain.id,
      http(chain.rpcUrls?.alchemy?.http[0] || chain.rpcUrls.default.http[0])
    ])
  )
});
