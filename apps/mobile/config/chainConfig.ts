
// import { CHAIN_NAMESPACES } from '@web3auth/base';
import { defaultWagmiConfig } from '@reown/appkit-wagmi-react-native';
import { Address, Chain, createWalletClient, CustomTransport, defineChain, HttpTransport, JsonRpcAccount, LocalAccount, PublicClient } from 'viem';


export const blockExplorersByChainId: { [key: number]: string } = {
  80094: "https://berascan.com",
};

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

export const SupportedChains = [berachain] as (Chain & {
  rpcUrls: { alchemy?: { http: string[] } };
  iconUrl?: string;
})[];

// #region Chain config
// export const chainConfig = {
//   chainId: "0x" + berachain.id.toString(16),
//   rpcTarget: berachain.rpcUrls.default.http[0],
//   displayName: berachain.name,
//   tickerName: berachain.nativeCurrency.name,
//   ticker: berachain.nativeCurrency.symbol,
//   blockExplorerUrl: blockExplorersByChainId[berachain.id],
//   chainNamespace: CHAIN_NAMESPACES.EIP155,
// }
// #endregion Chain config



// #region web3auth config
export const reownProjectId = process.env.EXPO_PUBLIC_REOWN_PROJECT_ID as string;
// const PrivateKeyProvider = new EthereumPrivateKeyProvider({
//   config: {
//     chainConfig,
//   },
// });

// 2. Create config
const metadata = {
  name: 'Beratrax',
  description: 'Beratrax',
  url: 'https://beratrax.com',
  icons: ['https://raw.githubusercontent.com/BeraTrax/tokens/main/logos/beratrax-logo/logo.png'],
  redirect: {
    native: 'beratrax://',
    universal: 'beratrax.com'
  }
}

const chains = [berachain] as const

export const wagmiConfig = defaultWagmiConfig({ chains, projectId: reownProjectId, metadata })

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

export interface EstimateTxGasArgs {
  data: Address;
  to: Address;
  chainId: number;
  value?: string | bigint;
}