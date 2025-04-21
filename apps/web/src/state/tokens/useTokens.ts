import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "src/state";
import { updatePrices } from "src/state/tokens/tokensReducer";
import useFarms from "../farms/hooks/useFarms";
import useWallet from "src/hooks/useWallet";
import { fetchBalances, fetchDecimals, fetchTotalSupplies, reset } from "./tokensReducer";
import { Address, getAddress, zeroAddress } from "viem";
import { FarmType } from "src/types/enums";
import { defaultChainId } from "src/config/constants";
import { Token } from "src/types";
import { getNativeCoinInfo } from "src/utils/common";
import customTokens from "src/config/constants/tokens";

export enum UIStateEnum {
    "SHOW_TOKENS" = "SHOW_TOKENS",
    "SHOW_TOKENS_LP" = "SHOW_TOKENS_LP",
    "SHOW_TOKENS_TOKENS" = "SHOW_TOKENS_TOKENS",
    "LOADING" = "LOADING",
    "NO_TOKENS" = "NO_TOKENS",
    "CONNECT_WALLET" = "CONNECT_WALLET",
}

const useTokens = () => {
    const { farms } = useFarms();
    const [tokens, setTokens] = useState<Token[]>([]);
    const [lpTokens, setLpTokens] = useState<Token[]>([]);
    const {
        prices,
        isPricesLoading,
        isPricesFetched,
        decimals,
        isDecimalsLoading,
        isDecimalsFetched,
        totalSupplies,
        isTotalSuppliesLoading,
        isTotalSuppliesFetched,
        balances,
        isBalancesLoading,
        isBalancesFetched,
        userAllBalances,
    } = useAppSelector((state) => state.tokens);
    const showTokenDetailedBalances = useAppSelector((state) => state.settings.showTokenDetailedBalances);
    
    const dispatch = useAppDispatch();
    const { currentWallet, getPublicClient } = useWallet();

    const reloadPrices = useCallback(() => {
        if (currentWallet) {
            dispatch(updatePrices({account: currentWallet}));
        }
    }, [farms, dispatch, currentWallet]);

    const reloadBalances = useCallback(async () => {
        if (currentWallet) {
            await dispatch(fetchBalances({ farms, getPublicClient, account: currentWallet }));
        }
    }, [farms, currentWallet]);

    useEffect(() => {
        if (!currentWallet) {
            dispatch(reset());
        }
    }, [currentWallet]);

    const reloadDecimals = useCallback(() => {
        dispatch(fetchDecimals({ farms, getPublicClient }));
    }, [farms, dispatch]);

    const reloadSupplies = useCallback(() => {
        if (currentWallet) {
            dispatch(fetchTotalSupplies({ farms, getPublicClient, account: currentWallet }));
        }
    }, [farms, dispatch, currentWallet]);

    const tokenAddresses = useMemo(() => {
        const set = new Set<Address>();
        const arr: { address: Address; decimals: number }[] = [];
        for (const farm of farms) {
            set.add(farm.token1);
            if (farm.token2) set.add(farm.token2);
        }
        set.forEach((address) => {
            const farm = farms.find((farm) => farm.token1 === address || farm.token2 === address);
            if (farm) {
                const decimal = decimals[farm.chainId][address] || 18;
                arr.push({ address: address as Address, decimals: decimal });
            }
        });
        return arr;
    }, [farms]);

    const filteredTokens = useMemo(() => {
        return tokens
            .filter((item) => {
                if (Number(item.usdBalance) < 0.00000000000000001) return false;
                // if (!showTokenDetailedBalances)
                //     switch (item.name) {
                //         case "ETH":
                //             return false;
                //         default:
                //             return true;
                //     }
                // else
                if (item.name === "BERA") return false;
                return true;
            })
            .map((e) => ({ ...e, isTransferable: e.name !== "BGT" }));
    }, [tokens, showTokenDetailedBalances]);

    const lpAddresses = useMemo(() => {
        const set = new Set<string>();

        const arr: { address: Address; decimals: number }[] = [];
        for (const farm of farms) {
            set.add(farm.lp_address);
        }

        set.forEach((address) => {
            const farm = farms.find((farm) => farm.lp_address === address);
            if (farm) {
                arr.push({ address: address as Address, decimals: farm.decimals });
            }
        });
        return arr;
    }, [farms]);

    useEffect(() => {
        // Create tokens from farm token addresses
        const tokens: Token[] = tokenAddresses.map(({ address, decimals }) => {
            const farm = farms.find((farm) => farm.token1 === address || farm.token2 === address)!;
            const isToken1 = farm?.token1 === address;
            let obj: Token = {
                address: address,
                decimals: decimals,
                token_type: FarmType.normal,
                balance: balances[farm.chainId][address]?.valueFormatted ?? "0",
                usdBalance: balances[farm.chainId][address]?.valueUsdFormatted ?? "0",
                logo: isToken1 ? farm?.logo1 : farm?.logo2 || "",
                name: isToken1 ? farm?.name1 : farm?.name2 || "",
                price: prices[farm.chainId]?.[address],
                networkId: farm.chainId,
            };
            return obj;
        });

        // Add custom tokens
        customTokens.forEach((token) => {
            tokens.push({
                address: token.address,
                decimals: token.decimals,
                token_type: FarmType.normal,
                balance: balances[token.chainId]?.[token.address]?.valueFormatted ?? "0",
                usdBalance: balances[token.chainId]?.[token.address]?.valueUsdFormatted ?? "0",
                name: token.name,
                price: prices[token.chainId]?.[token.address],
                networkId: token.chainId,
                logo: token.logo,
            });
        });

        // Create LP tokens
        const lpTokens: Token[] = lpAddresses.map(({ address, decimals }) => {
            const farm = farms.find((farm) => getAddress(farm.lp_address) === address)!;
            let obj: Token = {
                address: address,
                decimals: decimals,
                token_type: FarmType.advanced,
                balance: balances[farm.chainId][address]?.valueFormatted ?? "0",
                usdBalance: balances[farm.chainId][address]?.valueUsdFormatted ?? "0",
                name: farm?.url_name!,
                logo: farm?.logo1!,
                logo2: farm?.logo2,
                price: prices[farm.chainId]?.[address],
                networkId: defaultChainId,
            };
            return obj;
        });

        // Add native coins for each chain
        Object.entries(balances).map(([chainId, value]) => {
            const networkId = Number(chainId);
            const token: Token = {
                address: zeroAddress,
                logo: getNativeCoinInfo(networkId).logo,
                decimals: 18,
                balance: balances[networkId][zeroAddress]?.valueFormatted ?? "0",
                usdBalance: balances[networkId][zeroAddress]?.valueUsdFormatted ?? "0",
                name: getNativeCoinInfo(networkId).name,
                price: prices[networkId]?.[zeroAddress],
                networkId: networkId,
                token_type: FarmType.normal,
            };
            tokens.unshift(token);
        });

        // Add tokens from Zerion balances
        if (userAllBalances) {
            userAllBalances.forEach((token) => {
                // Skip if token already exists
                if (tokens.some(t => t.address === token.address && t.networkId === token.networkId)) return;
                const balanceEntry = balances[token.networkId][token.address];
                tokens.push({
                    ...token,
                    balance: balanceEntry?.valueFormatted ?? "0",
                    usdBalance: balanceEntry?.valueUsdFormatted ?? "0",
                });
            });
        }

        setTokens(tokens);
        setLpTokens(lpTokens);
    }, [farms, prices, tokenAddresses, lpAddresses, balances, decimals, userAllBalances]);

    const UIState = useMemo(() => {
        let STATE: UIStateEnum = UIStateEnum.CONNECT_WALLET;
        const isLoading = isBalancesLoading || isPricesLoading;
        const hasTokens = tokens?.some((token) => Number(token.usdBalance) > 0.01);
        const hasLpTokens = lpTokens?.some((token) => Number(token.usdBalance) > 0.01);
        if (hasTokens || hasLpTokens) {
            STATE = UIStateEnum.SHOW_TOKENS;
            if (!hasTokens) STATE = UIStateEnum.SHOW_TOKENS_LP;
            if (!hasLpTokens) STATE = UIStateEnum.SHOW_TOKENS_TOKENS;
        } else {
            if (currentWallet) {
                if (isLoading) {
                    STATE = UIStateEnum.LOADING;
                } else {
                    STATE = UIStateEnum.NO_TOKENS;
                }
            } else {
                STATE = UIStateEnum.CONNECT_WALLET;
            }
        }
        return STATE;
    }, [tokens, lpTokens, isBalancesLoading, isPricesLoading, currentWallet]);

    return {
        prices,
        isPricesLoading: isPricesLoading && !isPricesFetched,
        isPricesFetched,
        isPricesFetching: isPricesLoading,
        reloadPrices,

        balances,
        isBalancesLoading: isBalancesLoading && !isBalancesFetched && isDecimalsFetched,
        isBalancesFetched: isBalancesFetched && isDecimalsFetched,
        isBalancesFetching: isBalancesLoading || isDecimalsLoading,
        reloadBalances,

        decimals,
        isDecimalsLoading: isDecimalsLoading && !isDecimalsFetched,
        isDecimalsFetched,
        isDecimalsFetching: isDecimalsLoading,
        reloadDecimals,

        totalSupplies,
        isLoading: (isTotalSuppliesLoading || isDecimalsLoading) && !isTotalSuppliesFetched && !isDecimalsFetched,
        isFetched: isTotalSuppliesFetched && isDecimalsFetched,
        isFetching: isTotalSuppliesLoading || isDecimalsLoading,
        reloadSupplies,

        tokens,
        lpTokens,
        isTokensLoading: isBalancesLoading || isPricesLoading,
        UIState,
        filteredTokens,
        userAllBalances
    };
};

export default useTokens;

