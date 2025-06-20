import { CHAIN_ID } from "src/types/enums";

export const blockExplorersByChainId: { [key: number]: string } = {
    [CHAIN_ID.ARBITRUM]: "https://arbiscan.io",
    [CHAIN_ID.BERACHAIN]: "https://berascan.com",
};

export const paymastersByChainId: { [key: number]: string } = {
    42161: "https://paymaster-rpc-4c40f40c9737.herokuapp.com/jrpc/42161",
    // 42161: "http://localhost:8000/jrpc/42161",
    // 42161: "http://localhost:8000/jrpc/42161",
};

export const bundlersByChainId: { [key: number]: string } = {
    42161: "https://bundler-293f2fe8c150.herokuapp.com",
    // 42161: "http://localhost:8000",
    // 42161: "https://skandha-2ct5w3uvcq-uc.a.run.app/42161",
};
