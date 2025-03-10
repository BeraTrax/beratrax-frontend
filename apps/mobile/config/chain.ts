import { CHAIN_NAMESPACES } from '@web3auth/base';
import { Address, createWalletClient, CustomTransport, defineChain, HttpTransport, JsonRpcAccount, LocalAccount, PublicClient } from 'viem';
import { Chain } from "viem/chains";

export const POLLING_INTERVAL = 30000;
export const WALLET_CONNECT_PROJECT_ID = process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID || "";
export const WEB3AUTH_CLIENT_ID = process.env.REACT_APP_WEB3AUTH_CLIENT_ID || "";

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

export const blockExplorersByChainId: { [key: number]: string } = {
  80094: "https://berascan.com",
};

export const SupportedChains = [berachain] as (Chain & {
  rpcUrls: { alchemy?: { http: string[] } };
  iconUrl?: string;
})[];

// #region Chain config
export const chainConfig = {
  chainId: "0x" + berachain.id.toString(16),
  rpcTarget: berachain.rpcUrls.default.http[0],
  displayName: berachain.name,
  tickerName: berachain.nativeCurrency.name,
  ticker: berachain.nativeCurrency.symbol,
  blockExplorerUrl: blockExplorersByChainId[berachain.id],
  chainNamespace: CHAIN_NAMESPACES.EIP155,
}
// #endregion Chain config

export interface EstimateTxGasArgs {
  data: Address;
  to: Address;
  chainId: number;
  value?: string | bigint;
}

export interface IClients {
  wallet: ReturnType<
      typeof createWalletClient<CustomTransport | HttpTransport, Chain, JsonRpcAccount | LocalAccount, undefined>
  >;
  // wallet:
  //     | (
  //           | Awaited<ReturnType<typeof createModularAccountAlchemyClient<Web3AuthSigner>>>
  //           | WalletClient<CustomTransport, Chain, JsonRpcAccount>
  //       ) & {
  //           estimateTxGas: (args: EstimateTxGasArgs) => Promise<bigint>;
  //       };
  public: PublicClient<HttpTransport, Chain, undefined, undefined>;
}


