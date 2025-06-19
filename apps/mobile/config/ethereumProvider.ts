import { ChainNamespace } from "@web3auth/react-native-sdk";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";

const chainConfig = {
	chainNamespace: ChainNamespace.EIP155,
	chainId: "0x" + (80094).toString(16),
	rpcTarget: "https://rpc.berachain.com",
	displayName: "Berachain",
	tickerName: "Berachain",
	ticker: "BERA",
	blockExplorerUrl: "https://berascan.com",
};

export const ethereumPrivateKeyProvider = new EthereumPrivateKeyProvider({
	config: {
		chainConfig,
	},
});
