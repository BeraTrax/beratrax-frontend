import React, { useCallback, useEffect, useRef, useState } from "react";
import { resolveDomainFromAddress } from "src/utils/common";
import { useDispatch } from "react-redux";
import { incrementErrorCount, resetErrorCount } from "src/state/error/errorReducer";
import { CHAIN_ID } from "src/types/enums";
import { rainbowConfig, SupportedChains, web3AuthInstance } from "src/config/walletConfig";
import { ENTRYPOINT_ADDRESS_V06 } from "permissionless";
import { Address, Chain, Hex, createPublicClient, createWalletClient, getAddress, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { EstimateTxGasArgs, IClients } from "src/types";
import { AlchemyWebSigner } from "@alchemy/aa-alchemy";
import { defaultChainId } from "src/config/constants";
import { requestEthForGas } from "src/api";
import { Connector, useAccount, useChainId, useDisconnect } from "wagmi";
import { getWalletClient as getWalletClientCore, switchChain as switchChainCore } from "@wagmi/core";
import { trackTransaction } from "src/utils/analytics";

export interface IWalletContext {
    /**
     * The current connect wallet address
     */
    currentWallet?: Address;

    /**
     * The current connected wallet address truncated
     */
    displayAccount?: Address;

    /**
     * Connect wallet modal open for connecting any wallet
     * @returns void
     */
    connectWallet: (isExternal?: true) => Promise<void>;

    /**
     * Disconnect wallet and logout user
     * @returns void
     */
    logout: () => void;
    // signer?: ethers.ethers.providers.JsonRpcSigner | ethers.ethers.Signer;
    // provider:
    //     | ethers.ethers.providers.Web3Provider
    //     | ethers.ethers.providers.JsonRpcProvider
    //     | ethers.ethers.providers.Provider;

    getPkey: () => Promise<string | undefined>;
    domainName: null | string;
    isSponsored: boolean;
    isSocial: boolean;
    alchemySigner?: AlchemyWebSigner;
    externalChainId: number | null;
    switchExternalChain: (chainId: number) => Promise<void>;
    isConnecting: boolean;
    getPublicClient: (chainId: number) => IClients["public"];
    getWalletClient: (chainId: number) => Promise<IClients["wallet"]>;
    getClients: (chainId: number) => Promise<IClients>;
    estimateTxGas: (args: EstimateTxGasArgs) => Promise<bigint>;
    connectWeb3Auth: () => Promise<any>;
    connector?: Connector;
    supportedChains: Chain[];
    switchToChain: (chainId: number) => Promise<void>;
    getChainName: (chainId: number) => string;
    isChainSupported: (chainId: number) => boolean;
}

export const WalletContext = React.createContext<IWalletContext>({} as IWalletContext);

interface IProps {
    children: React.ReactNode;
}

const WalletProvider: React.FC<IProps> = ({ children }) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [isSponsored] = useState(true);
    const {
        address: rainbowkitAddress,
        status,
        isConnecting: isConnectingWagmi,
        isReconnecting,
        connector,
    } = useAccount();
    // const [isSocial, setIsSocial] = useState(false);
    const [currentWallet, setCurrentWallet] = useState<Address | undefined>();
    const [externalChainId, setExternalChainId] = useState<number | null>(null);
    const wagmiChainId = useChainId();
    const _publicClients = useRef<Record<number, IClients["public"]>>({});
    const _walletClients = useRef<Record<number, IClients["wallet"]>>({});
    const dispatch = useDispatch();
    const { disconnectAsync } = useDisconnect();
    const [domainName, setDomainName] = useState<null | string>(null);
    const [isSocial, setIsSocial] = useState(false);

    const switchExternalChain = async (chainId: number) => {
        const provider = web3AuthInstance.provider!;
        try {
            await provider.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0x" + chainId.toString(16) }],
            });
        } catch (e: any) {
            // Code for chain not existing
            if (e.code === 4902) {
                const chain = SupportedChains.find((item) => item.id === chainId);
                if (!chain) throw new Error("Chain not supported!");
                await provider.request({
                    method: "wallet_addEthereumChain",
                    params: [
                        {
                            chainId: "0x" + chainId.toString(16),
                            chainName: chain.name,
                            nativeCurrency: chain.nativeCurrency,
                            rpcUrls: [chain.rpcUrls.default.http[0]],
                            blockExplorerUrls: [chain.blockExplorers?.default.url],
                        },
                    ],
                });
            }
            console.log(e);
        }
    };

    const switchToChain = async (chainId: number) => {
        try{
            console.log("Switching to chain", chainId);
            await switchChainCore(rainbowConfig, { chainId });
        }catch(error){
            console.log("Failed to switch chain", error);
            throw error;
        }
    };

    const getChainName = (chainId: number) => {
        return SupportedChains.find((chain) => chain.id === chainId)!.name;
    };

    const isChainSupported = (chainId: number) => {
        return SupportedChains.some((chain) => chain.id === chainId);
    };

    const getPublicClient = (chainId: number): IClients["public"] => {
        // @ts-ignore
        if (_publicClients.current[chainId]) return _publicClients.current[chainId];
        else {
            const chain = SupportedChains.find((item) => item.id === chainId);
            if (!chain) throw new Error("chain not found");
            const _publicClient = createPublicClient({
                chain: chain,
                transport: http(chain.rpcUrls?.default?.http[0], {
                    timeout: 60_000,
                }),
                batch: {
                    multicall: {
                        batchSize: 4096,
                        wait: 250,
                    },
                },
            }) as IClients["public"];

            _publicClients.current[chainId] = _publicClient;

            return _publicClient;
        }
    };

    // If External, check for chain and switch chain then give wallet client
    // If social return wallet client
    const getWalletClient = useCallback(
        async (chainId: number, _isSocial: boolean | null = isSocial): Promise<IClients["wallet"]> => {
            const pkey = await getPkey();
            if (!rainbowkitAddress) throw new Error("provider not found");
            const chain = SupportedChains.find((item) => item.id === chainId);
            if (!chain) throw new Error("chain not found");
            if (!pkey) {
                setIsSocial(false);
                // @ts-ignore
                const _walletClient = (await getWalletClientCore(rainbowConfig, { chainId })).extend((client) => ({
                    // @ts-ignore
                    async sendTransaction(args) {
                        const publicClient = getPublicClient(chainId);
                        const gas =
                            ((await publicClient.estimateGas({
                                to: args.to,
                                data: args.data,
                                value: args.value,
                                account: rainbowkitAddress,
                            })) *
                                120n) /
                            100n; // increase gas by 20%
                        const gasPrice = ((await publicClient.getGasPrice()) * 120n) / 100n; // increase gas price by 20%
                        const gasLimit = gasPrice * gas;
                        const sponsored = await requestEthForGas({
                            chainId: chainId,
                            from: rainbowkitAddress,
                            to: args.to!,
                            data: args.data as any,
                            value: args.value,
                            ethAmountForGas: gasLimit,
                        });
                        if (!sponsored.status && args.value) {
                            const userBalance = await publicClient.getBalance({ address: rainbowkitAddress });
                            if (userBalance >= args.value + gasLimit) {
                                // User has sufficient balance, no need to modify args.value
                            } else {
                                args.value = userBalance - gasLimit;
                                if (args.value <= 0n) {
                                    throw new Error("Not enough funds to cover gas");
                                }
                            }
                        }
                        // berachain's gas price is too low, so we need to increase it manually for now
                        if (chainId === CHAIN_ID.BERACHAIN) {
                            args.gasPrice = gasPrice;
                            args.gas = gas;
                        }
                        const tx = await client.sendTransaction(args);
                        trackTransaction(tx); // this to track the transaction for analytics
                        return tx;
                    },
                }));
                
                // Connect wallet to the chain
                const currentWalletChainId = await _walletClient.getChainId();
                console.log("currentWalletChainId", currentWalletChainId);
                await switchChainCore(rainbowConfig, { chainId: currentWalletChainId });
                // @ts-ignore
                return _walletClient;
            } else {
                setIsSocial(true);
                const _walletClient = createWalletClient({
                    account: privateKeyToAccount(pkey),
                    transport: http(chain.rpcUrls?.default?.http[0]),
                    chain,
                }).extend((client) => ({
                    async sendTransaction(args) {
                        const publicClient = getPublicClient(chainId);
                        const gas =
                            ((await publicClient.estimateGas({
                                to: args.to,
                                data: args.data,
                                value: args.value,
                                account: rainbowkitAddress,
                            })) *
                                120n) /
                            100n; // increase gas by 20%
                        const gasPrice = ((await publicClient.getGasPrice()) * 120n) / 100n; // increase gas price by 20%
                        const gasLimit = gasPrice * gas;
                        const sponsored = await requestEthForGas({
                            chainId: chainId,
                            from: rainbowkitAddress,
                            to: args.to!,
                            data: args.data as any,
                            value: args.value,
                            ethAmountForGas: gasLimit,
                        });
                        if (!sponsored.status && args.value) {
                            const userBalance = await publicClient.getBalance({ address: rainbowkitAddress });
                            if (userBalance >= args.value + gasLimit) {
                                // User has sufficient balance, no need to modify args.value
                            } else {
                                args.value = userBalance - gasLimit;
                                if (args.value <= 0n) {
                                    throw new Error("Not enough funds to cover gas");
                                }
                            }
                        }
                        // berachain's gas price is too low, so we need to increase it manually for now
                        if (chainId === CHAIN_ID.BERACHAIN) {
                            args.gasPrice = gasPrice;
                            args.gas = gas;
                        }
                        const tx = await client.sendTransaction(args);
                        trackTransaction(tx); // this to track the transaction for analytics
                        return tx;
                    },
                }));

                return _walletClient;
            }
        },
        [rainbowkitAddress]
    );

    const estimateTxGas = async (args: EstimateTxGasArgs) => {
        if (!isSocial) {
            const publicClient = getPublicClient(args.chainId);
            return await publicClient.estimateGas({
                account: currentWallet,
                data: args.data,
                to: args.to,
                value: args.value ? BigInt(args.value) : undefined,
            });
        } else {
            const walletClient = await getWalletClient(args.chainId);
            // @ts-ignore
            let userOp = await walletClient.buildUserOperation({
                uo: {
                    data: args.data,
                    target: args.to,
                    value: BigInt(args.value || "0"),
                },
            });
            // @ts-ignore
            userOp.nonce = "0x" + userOp.nonce.toString(16);
            // @ts-ignore
            userOp.maxFeePerGas = "0x" + userOp.maxFeePerGas.toString(16);
            // @ts-ignore
            userOp.maxPriorityFeePerGas = "0x" + userOp.maxPriorityFeePerGas.toString(16);
            console.log("userOp =>", userOp);
            // @ts-ignore
            const estimate = await walletClient.estimateUserOperationGas(userOp, ENTRYPOINT_ADDRESS_V06);

            const totalEstimatedGasLimit =
                BigInt(estimate.callGasLimit) +
                BigInt(estimate.preVerificationGas) +
                BigInt(estimate.verificationGasLimit);
            return totalEstimatedGasLimit;
        }
    };

    const getClients = async (chainId: number): Promise<IClients> => {
        const wallet = await getWalletClient(chainId);
        return {
            public: getPublicClient(chainId),
            wallet,
        };
    };

    const connectWallet = useCallback(async () => {
        try {
            setIsConnecting(true);
            const _walletClient = await getWalletClient(wagmiChainId, false);
            // @ts-ignore
            setCurrentWallet(getAddress(_walletClient.account.address));
        } catch (error) {
            console.error(error);
        } finally {
            setIsConnecting(false);
        }
    }, [getWalletClient]);

    async function logout() {
        await disconnectAsync();
        if (web3AuthInstance.connected) await web3AuthInstance.logout();
        setCurrentWallet(undefined);
        _walletClients.current = {};
    }
    const displayAccount = React.useMemo(
        () =>
            currentWallet
                ? `${currentWallet.substring(0, 6)}...${currentWallet.substring(currentWallet.length - 5)}`
                : "",
        [currentWallet]
    );
    const getPkey = async () => {
        try {
            const pkey = await web3AuthInstance.provider?.request({ method: "eth_private_key" });
            return ("0x" + pkey) as Hex;
            // return "0xNotImplemented";
        } catch (error) {
            // notifyError(errorMessages.privateKeyError());
            return;
        }
    };

    React.useEffect(() => {
        const int = setInterval(async () => {
            try {
                const currentChain = wagmiChainId || defaultChainId;
                const _publicClient = getPublicClient(currentChain);
                await _publicClient.getBlockNumber();
                dispatch(resetErrorCount());
            } catch (error) {
                dispatch(incrementErrorCount());
                console.log("Error in rpc");
            }
        }, 50000);
        return () => {
            clearInterval(int);
        };
    }, [wagmiChainId]);

    // useEffect(() => {
    //     if (currentWallet) {
    //         resolveDomainFromAddress(currentWallet).then((res) => {
    //             setDomainName(res);
    //         });
    //     } else {
    //         setDomainName(null);
    //     }
    // }, [currentWallet]);

    useEffect(() => {
        if (connector && connector.id !== "web3auth") {
            setExternalChainId(wagmiChainId);
        } else {
            setExternalChainId(null);
        }
    }, [wagmiChainId, connector]);

    useEffect(() => {
        if (rainbowkitAddress && status === "connected" && !currentWallet) connectWallet();
        if (status === "disconnected") logout();
    }, [connectWallet, status, currentWallet]);

    return (
        <WalletContext.Provider
            value={{
                currentWallet,
                connectWallet,
                connectWeb3Auth: connectWallet,
                isSocial,
                alchemySigner: undefined,
                logout,
                domainName,
                displayAccount: displayAccount as Address,
                getPkey,
                isSponsored,
                estimateTxGas,
                externalChainId,
                switchExternalChain,
                isConnecting: isConnecting || isConnectingWagmi || isReconnecting,
                getPublicClient,
                getWalletClient,
                getClients,
                connector,
                supportedChains: SupportedChains,
                switchToChain,
                getChainName,
                isChainSupported,
            }}
        >
            {children}
            <iframe id="turnkey-iframe-container"></iframe>
        </WalletContext.Provider>
    );
};

export default WalletProvider;
