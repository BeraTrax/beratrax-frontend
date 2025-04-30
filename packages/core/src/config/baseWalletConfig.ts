import { Chain } from "viem/chains";
import { POLLING_INTERVAL } from "./constants";
import { providers } from "ethers";
import { WalletClient } from "viem";
import { useMemo } from "react";
import { berachain } from "viem/chains";
export { default as discordIcon } from "./../assets/images/discordapp-icon.svg";
export { default as facebookIcon } from "./../assets/images/facebook-icon.svg";
export { default as githubIcon } from "./../assets/images/github-icon.svg";
export { default as googleIcon } from "./../assets/images/google-logo.svg";
export { default as twitterIcon } from "./../assets/images/twitter-icon.svg";

export const chains = [berachain] as const;
export const supportedChains = chains as unknown as (Chain & {
	rpcUrls: { alchemy?: { http: string[] } };
	iconUrl?: string;
})[];

export const blockExplorersByChainId: { [key: number]: string } = {
	80094: "https://berascan.com",
};

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
