import { CHAIN_NAMESPACES } from "@web3auth/base";
import { getDefaultExternalAdapters } from "@web3auth/default-evm-adapter";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { berachain, Chain } from "viem/chains";

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
import { http, type HttpTransport } from "viem";
import { createConnector as createWagmiConnector } from "wagmi";

import { walletConnectProjectId, WEB3AUTH_CLIENT_ID } from "@beratrax/core/src/config/constants";
import { supportedChains, discordIcon, facebookIcon, githubIcon, googleIcon, twitterIcon, blockExplorersByChainId } from "@beratrax/core/src/config/baseWalletConfig";

const clientId = WEB3AUTH_CLIENT_ID as string;
const chainConfig = {
    chainId: "0x" + berachain.id.toString(16),
    rpcTarget: berachain.rpcUrls.default.http[0],
    displayName: berachain.name,
    tickerName: berachain.nativeCurrency.name,
    ticker: berachain.nativeCurrency.symbol,
    blockExplorerUrl: blockExplorersByChainId[berachain.id],
    chainNamespace: CHAIN_NAMESPACES.EIP155,
};
const PrivateKeyProvider = new EthereumPrivateKeyProvider({
    config: {
        chainConfig,
    },
});

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

export const webWalletConfig = getDefaultConfig({
    appName: "Beratrax",
    projectId: walletConnectProjectId,
    chains: supportedChains as [Chain, ...Chain[]],
    transports: supportedChains.reduce(
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
