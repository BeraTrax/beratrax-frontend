// IMP START - Quick Start
import { Chain, http } from "viem";
import { createConfig } from "wagmi";
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors';
import { SupportedChains, WALLET_CONNECT_PROJECT_ID, WEB3AUTH_CLIENT_ID, chainConfig } from "./chain";

import * as WebBrowser from "@toruslabs/react-native-web-browser";
import { WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { Web3AuthNoModal } from '@web3auth/no-modal';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import Web3Auth from "@web3auth/react-native-sdk";
import { Web3AuthConnector } from '@web3auth/web3auth-wagmi-connector';
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Linking from "expo-linking";
import EncryptedStorage from "react-native-encrypted-storage";
import { createConnector } from 'wagmi';

// Define redirect URL for Web3Auth
// const redirectUrl =
//   Constants.executionEnvironment == ExecutionEnvironment.Standalone
//     ? Linking.createURL("web3auth", {})
//     : Linking.createURL("web3auth", { scheme: "web3authexpoexample" });

// // Initialize the private key provider for Ethereum
// const ethereumPrivateKeyProvider = new EthereumPrivateKeyProvider({
//   config: {
//     chainConfig
//   },
// });

// // Initialize the Web3Auth instance
// const web3auth = new Web3Auth(WebBrowser, EncryptedStorage, {
//   clientId: WEB3AUTH_CLIENT_ID,
//   redirectUrl,
//   network: WEB3AUTH_NETWORK.CYAN,
//   privateKeyProvider: ethereumPrivateKeyProvider
// });

// // Initialize and export the Web3Auth provider
// export const web3authProvider = web3auth.provider;

// // Instantiating Web3Auth - old instance to keep compatibility
// export const web3AuthInstance = new Web3AuthNoModal({
//   clientId: WEB3AUTH_CLIENT_ID,
//   web3AuthNetwork: "cyan",
//   chainConfig,
// });

// const openloginAdapter = new OpenloginAdapter({
//   privateKeyProvider: ethereumPrivateKeyProvider,
//   adapterSettings: {
//     network: "cyan",
//     uxMode: "redirect",
//     replaceUrlOnRedirect: false,
//   },
// });
// web3AuthInstance.configureAdapter(openloginAdapter);


// // Create the social wallet connectors using the compatibility adapter
// const createSocialWallet = (id: string, name: string, loginProvider: string) => {
//   return {
//     id,
//     name,
//     iconBackground: "white",
//     createConnector: (walletDetails: any) => 
//       createConnector((config) => {
//         return {
//           ...Web3AuthConnector({
//             //@ts-ignore
//             web3AuthInstance,
//             loginParams: {
//               loginProvider,
//             },
//           })(config),
//           ...walletDetails
//         };
//       }),
//   }
// }

// // Define social wallet options
// const googleWallet = () => createSocialWallet("google", "Google", "google");
// const facebookWallet = () => createSocialWallet("facebook", "Facebook", "facebook");
// const discordWallet = () => createSocialWallet("discord", "Discord", "discord");
// const twitterWallet = () => createSocialWallet("twitter", "Twitter", "twitter");
// const githubWallet = () => createSocialWallet("github", "Github", "github");

// // Create an array of social wallets for easy access
// export const socialWallets = [
//   googleWallet(),
//   facebookWallet(),
//   discordWallet(),
//   twitterWallet(),
//   githubWallet()
// ];

// Create the Wagmi configuration with social wallets and WalletConnect
export const wagmiConfig = createConfig({
  chains: SupportedChains as [Chain, ...Chain[]],
  connectors: [
    // WalletConnect connector
    walletConnect({
      projectId: WALLET_CONNECT_PROJECT_ID,
      showQrModal: true,
      qrModalOptions: {
        themeMode: 'dark',
      },
    }),
    injected(),
    metaMask(),
    safe(),
    // Social wallet connectors
    // googleWallet().createConnector({}),
    // facebookWallet().createConnector({}),
    // discordWallet().createConnector({}),
    // twitterWallet().createConnector({}),
    // githubWallet().createConnector({})
  ],
  transports: Object.fromEntries(
    SupportedChains.map(chain => [
      chain.id,
      http(chain.rpcUrls?.alchemy?.http[0] || chain.rpcUrls.default.http[0])
    ])
  )
});
