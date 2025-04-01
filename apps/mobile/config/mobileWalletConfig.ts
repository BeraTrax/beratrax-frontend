
import { createAppKit, defaultWagmiConfig } from '@reown/appkit-wagmi-react-native';
import { Chain, createWalletClient, CustomTransport, HttpTransport, JsonRpcAccount, LocalAccount, PublicClient } from 'viem';
import { chains } from '@beratrax/core/src/config/baseWalletConfig';

export const reownProjectId = process.env.EXPO_PUBLIC_REOWN_PROJECT_ID as string;
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
export const mobileWalletConfig = defaultWagmiConfig({ chains: chains, projectId: reownProjectId, metadata })

export const appKit = createAppKit({
  projectId: reownProjectId,
  wagmiConfig: mobileWalletConfig,
  defaultChain: chains[0],
  enableAnalytics: true,
  features: {
    socials: ['x', 'discord', 'apple'],
  }
})


export interface IClients {
  wallet: ReturnType<
    typeof createWalletClient<CustomTransport | HttpTransport, Chain, JsonRpcAccount | LocalAccount, undefined>
  >;
  public: PublicClient<HttpTransport, Chain, undefined, undefined>;
}
