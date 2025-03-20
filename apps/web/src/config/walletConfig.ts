import { useMemo } from "react";
import { Chain } from "viem/chains";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { getDefaultExternalAdapters } from "@web3auth/default-evm-adapter";
import { ALCHEMY_KEY, BARTIO_RPC_URL, POLLING_INTERVAL, walletConnectProjectId, WEB3AUTH_CLIENT_ID } from "./constants";
// import { Web3Auth } from "@web3auth/modal";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { providers } from "ethers";
import { WalletClient, defineChain, http, type HttpTransport } from "viem";
import { getDefaultConfig, WalletDetailsParams } from "@rainbow-me/rainbowkit";
import { Web3AuthConnector } from "@web3auth/web3auth-wagmi-connector";
import googleIcon from "./../assets/images/google-logo.svg";
import facebookIcon from "./../assets/images/facebook-icon.svg";
import discordIcon from "./../assets/images/discordapp-icon.svg";
import githubIcon from "./../assets/images/github-icon.svg";
import twitterIcon from "./../assets/images/twitter-icon.svg";
import { blockExplorersByChainId } from "./constants/urls";
import {
    injectedWallet,
    rainbowWallet,
    walletConnectWallet,
    braveWallet,
    coinbaseWallet,
    metaMaskWallet,
    safeWallet,
    argentWallet,
    okxWallet,
    ledgerWallet,
    binanceWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, createConnector as createWagmiConnector } from "wagmi";

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

// #region web3auth config
const clientId = WEB3AUTH_CLIENT_ID as string;

const PrivateKeyProvider = new EthereumPrivateKeyProvider({
    config: {
        chainConfig: {
            chainId: "0x" + berachain.id.toString(16),
            rpcTarget: berachain.rpcUrls.default.http[0],
            displayName: berachain.name,
            tickerName: berachain.nativeCurrency.name,
            ticker: berachain.nativeCurrency.symbol,
            blockExplorerUrl: blockExplorersByChainId[berachain.id],
            chainNamespace: CHAIN_NAMESPACES.EIP155,
        },
    },
});

// Instantiating Web3Auth
export const web3AuthInstance = new Web3AuthNoModal({
    clientId,
    web3AuthNetwork: "cyan",
    chainConfig: {
        chainId: "0x" + berachain.id.toString(16),
        rpcTarget: berachain.rpcUrls.default.http[0],
        displayName: berachain.name,
        tickerName: berachain.nativeCurrency.name,
        ticker: berachain.nativeCurrency.symbol,
        chainNamespace: CHAIN_NAMESPACES.EIP155,
    },
    // privateKeyProvider: PrivateKeyProvider,
});

const openloginAdapter = new OpenloginAdapter({
    privateKeyProvider: PrivateKeyProvider,
    // sessionTime: 604800,
    adapterSettings: {
        // sessionTime: 604800,
        network: "cyan",
        uxMode: "redirect",
        replaceUrlOnRedirect: false,
    },
});
web3AuthInstance.configureAdapter(openloginAdapter);

getDefaultExternalAdapters({
    options: {
        clientId,
        web3AuthNetwork: "cyan",
        privateKeyProvider: PrivateKeyProvider,
        chainConfig: {
            chainId: "0x" + berachain.id.toString(16),
            rpcTarget: berachain.rpcUrls.default.http[0],
            displayName: berachain.name,
            tickerName: berachain.nativeCurrency.name,
            ticker: berachain.nativeCurrency.symbol,
            blockExplorerUrl: blockExplorersByChainId[berachain.id],
            chainNamespace: CHAIN_NAMESPACES.EIP155,
        },
    },
}).then((adapters) => {
    adapters.forEach((adapter) => {
        web3AuthInstance.configureAdapter(adapter);
    });
});

export const web3authProvider = web3AuthInstance.provider;

// #endregion web3auth config

const googleWallet = () => {
    return {
        id: "google",
        name: "Google",
        iconUrl: googleIcon,
        installed: true,
        downloadUrls: {},
        iconBackground: "white",
        createConnector: (walletDetails: WalletDetailsParams) =>
            createWagmiConnector((config) => ({
                ...Web3AuthConnector({
                    web3AuthInstance,
                    loginParams: {
                        loginProvider: "google",
                    },
                })(config),
                ...walletDetails,
            })),
    };
};

const facebookWallet = () => {
    return {
        id: "facebook",
        name: "Facebook",
        iconUrl: facebookIcon,
        iconBackground: "white",
        createConnector: (walletDetails: WalletDetailsParams) =>
            createWagmiConnector((config) => ({
                ...Web3AuthConnector({
                    web3AuthInstance,
                    loginParams: {
                        loginProvider: "facebook",
                    },
                })(config),
                ...walletDetails,
            })),
    };
};

const discordWallet = () => {
    return {
        id: "discord",
        name: "Discord",
        iconUrl: discordIcon,
        iconBackground: "white",
        createConnector: (walletDetails: WalletDetailsParams) =>
            createWagmiConnector((config) => ({
                ...Web3AuthConnector({
                    web3AuthInstance,
                    loginParams: {
                        loginProvider: "discord",
                    },
                })(config),
                ...walletDetails,
            })),
    };
};

const twitterWallet = () => {
    return {
        id: "twitter",
        name: "Twitter",
        iconUrl: twitterIcon,
        iconBackground: "white",
        createConnector: (walletDetails: WalletDetailsParams) =>
            createWagmiConnector((config) => ({
                ...Web3AuthConnector({
                    web3AuthInstance,
                    loginParams: {
                        loginProvider: "twitter",
                    },
                })(config),
                ...walletDetails,
            })),
    };
};

const githubWallet = () => {
    return {
        id: "github",
        name: "Github",
        iconUrl: githubIcon,
        iconBackground: "white",
        createConnector: (walletDetails: WalletDetailsParams) =>
            createWagmiConnector((config) => ({
                ...Web3AuthConnector({
                    web3AuthInstance,
                    loginParams: {
                        loginProvider: "github",
                    },
                })(config),
                ...walletDetails,
            })),
    };
};

export const rainbowConfig = getDefaultConfig({
    appName: "Beratrax",
    projectId: walletConnectProjectId,
    chains: SupportedChains as [Chain, ...Chain[]],
    transports: SupportedChains.reduce((acc, curr) => {
        acc[curr.id] = http(curr.rpcUrls?.alchemy?.http[0]);
        return acc;
    }, {} as { [key: number]: HttpTransport }),
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
                binanceWallet,
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
