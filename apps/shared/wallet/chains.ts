import { CHAIN_NAMESPACES } from "@web3auth/base";
import { defineChain } from "viem";
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

export const SupportedChains = [berachain] as (typeof berachain)[];

// Chain config for Web3Auth
export const chainConfig = {
  chainId: "0x" + berachain.id.toString(16),
  rpcTarget: berachain.rpcUrls.default.http[0],
  displayName: berachain.name,
  tickerName: berachain.nativeCurrency.name,
  ticker: berachain.nativeCurrency.symbol,
  blockExplorerUrl: blockExplorersByChainId[berachain.id],
  chainNamespace: CHAIN_NAMESPACES.EIP155,
}; 