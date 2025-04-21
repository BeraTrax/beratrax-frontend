import { PoolDef } from "src/config/constants/pools_json";
import { IClients, Token } from "src/types";
import { Address, PublicClient } from "viem";
export interface StateInterface {
    // Data
    prices: Prices;
    balances: Balances;
    totalSupplies: TotalSupplies;
    decimals: Decimals;
    oldPrices: OldPrices;
    userAllBalances: Token[];
    account?: Address;

    // Prices loading states
    isPricesLoading: boolean;
    isPricesFetched: boolean;
    isFetchingOldPrices: boolean;
    isLoadedOldPrices: boolean;
    pricesError?: string | null;
    oldPricesError?: string | null;

    // Balances loading states
    isBalancesLoading: boolean;
    isBalancesFetched: boolean;
    balancesError?: string | null;

    // Total supplies loading states
    isTotalSuppliesLoading: boolean;
    isTotalSuppliesFetched: boolean;
    totalSuppliesError?: string | null;

    // Decimals loading states
    isDecimalsLoading: boolean;
    isDecimalsFetched: boolean;
    decimalsError?: string | null;
}

export interface OldPrices {
    [chainId: string]: {
        [address: string]: {
            timestamp: number;
            price: number;
        }[];
    };
}

export interface AddPrice {
    [key: string]: number;
}
export interface GetOldPricesActionPayload {
    lpData: {
        tokenId: string;
        blockTimestamp: string;
    }[];
    farms: PoolDef[];
}

export interface Prices {
    [chainId: number]: Record<Address, number>;
}

export interface UpdateBalancesActionPayload {
    account: Address;
    farms: PoolDef[];
    getPublicClient: (chainId: number) => IClients["public"];
}

export interface UpdatePriceActionPayload {
    account: Address;
}

export interface UpdateTotalSuppliesActionPayload {
    account: Address;
    farms: PoolDef[];
    getPublicClient: (chainId: number) => IClients["public"];
}

export interface UpdatePolygonBalancesActionPayload {
    account: Address;
    addresses: Address[];
    publicClient: PublicClient;
}

export type Balances = {
    [chainId: number]: {
        [tokenAddress: string]: TokenValue;
    };
};

export interface TokenValue {
    valueWei: string;
    value: number;
    valueFormatted: string;
    valueUsd: number;
    valueUsdFormatted: string;
    valueRewardVaultWei?: string;
}

export type TotalSupplies = {
    [chainId: number]: {
        [tokenAddress: string]: SupplyValue;
    };
};

export interface SupplyValue {
    supplyWei: string;
    supply: number;
    supplyFormatted: string;
    supplyUsd: number;
    supplyUsdFormatted: string;
}

export interface UpdateDecimalsActionPayload {
    farms: PoolDef[];
    getPublicClient: (chainId: number) => IClients["public"];
}

export interface Decimals {
    [chainId: number]: Record<Address, number>;
}

//only used for once when first received from zerion
export interface ZerionPositionWithChainIdString {
    type: string;
    id: string;
    attributes: {
        quantity: {
            numeric: string;  //no of tokens a user has
        };
        value: number;  //dollar value of the tokens, a user has
        price: number;  //dollar price of the token
        fungible_info: {
            symbol: string;  //symbol of the token 
            implementations: Array<{
                address: string;  //address of the token
                decimals: number;  //decimals of the token
                chain_id: string;  //chain id of the token e.g. berachain
            }>;
            icon: {
                url: string;    //image url of the token    
            };
        };
    };
}