import { PoolDef } from "src/config/constants/pools_json";
import { FarmData, IClients } from "src/types";
import { FarmTransactionType } from "src/types/enums";
import { Balances, Decimals, Prices, TotalSupplies } from "../tokens/types";

export interface StateInterface {
    farmDetails: FarmDetails;
    earnings: Earnings;
    earningsUsd: number | null;
    vaultEarnings: VaultEarnings[];
    isLoadingEarnings: boolean;
    isLoadingVaultEarnings: boolean;
    isVaultEarningsFirstLoad: boolean;
    isLoading: boolean;
    isFetched: boolean;
    account: string;
    farmDetailInputOptions: FarmDetailInputOptions;
    error?: string | null;
}
export interface FarmDetailInputOptions {
    transactionType: FarmTransactionType;
    showInUsd: boolean;
    currencySymbol: string;
    bestFunctionNameForArberaHoney: string;
    simulatedSlippage: number;
}

export interface FarmDetails {
    [farmid: number]: FarmData | undefined;
}

export interface FetchFarmDetailsAction {
    farms: PoolDef[];
    totalSupplies: TotalSupplies;
    currentWallet: string;
    getPublicClient: (chainId: number) => IClients["public"];
    balances: Balances;
    prices: Prices;
    decimals: Decimals;
}

export interface Earnings {
    [farmId: number]: number;
}
export interface VaultEarnings {
    tokenId: string;
    earnings0: string;
    token0: string;
    earnings1?: string;
    token1?: string;
    changeInAssets?: string;
    lifetimeEarnings?: string;
}

export interface FetchEarningsAction {
    farms: PoolDef[];
    currentWallet: string;
    decimals: Decimals;
    prices: Prices;
    balances: Balances;
    totalSupplies: TotalSupplies;
    getPublicClient: (chainId: number) => IClients["public"];
}

export interface VaultEarningsProp {
    currentWallet: string;
    prices: Prices;
    decimals: Decimals;
}

