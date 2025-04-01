import { Address, Hex } from "viem";

export interface StateInterface {
    transactions: Transaction[];
    limit: number;
    fetchedAll: boolean;
    error?: string | null;
}

export enum TransactionStatus {
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    PENDING = "PENDING",
    INTERRUPTED = "INTERRUPTED",
}

export interface Transaction {
    _id: string;
    amountInWei: string;
    from: Address;
    type: "deposit" | "withdraw";
    farmId: number;
    tokenPrice?: number;
    vaultPrice?: number;
    token: Address;
    max: boolean;
    date: string;
    vaultShares?: string;
    lpTokenPrice?: number;
    netAmount?: string;
    fee?: string;
    simulatedSlippage?: number;
    actualSlippage?: number;
    lpTokens?: string;
    returnedAssets?: { amount: string; token: string }[];
    steps: TransactionStep[];
}

export interface EditTransaction {
    _id: string;
    amountInWei: string;
    netAmount: string;
    from: Address;
    type: "deposit" | "withdraw";
    farmId: number;
    tokenPrice?: number;
    vaultPrice?: number;
    lpTokenPrice?: number;
    token: Address;
    max: boolean;
    vaultShares: string;
    date: string;
    fee: string;
    simulatedSlippage: number;
    actualSlippage: number;
    lpTokens?: string;
    returnedAssets?: {
        amount: string;
        token: Address;
    }[];
    steps?: TransactionStep[];
}

export type TransactionStep =
    | ApproveZapStep
    | ZapInStep
    | ZapOutStep
    | WithdrawFromRewardVaultStep
    | StakeIntoRewardVaultStep;

export enum TransactionTypes {
    GET_BRIDGE_QUOTE = "Get Bridge Quote",
    APPROVE_BRIDGE = "Approve Bridge",
    INITIATE_BRIDGE = "Initiate Bridge",
    WAIT_FOR_BRIDGE_RESULTS = "Waiting for bridge results",
    APPROVE_ZAP = "Approve Zap",
    ZAP_IN = "Zap In",
    ZAP_OUT = "Zap Out",
    WITHDRAW_FROM_REWARD_VAULT = "Withdraw from reward vault",
    STAKE_INTO_REWARD_VAULT = "Stake into reward vault",
}



export interface ApproveZapStep extends BaseStep {
    type: TransactionTypes.APPROVE_ZAP;
    txHash?: Hex;
}

export interface ZapInStep extends BaseStep {
    type: TransactionTypes.ZAP_IN;
    txHash?: Hex;
}

export interface ZapOutStep extends BaseStep {
    type: TransactionTypes.ZAP_OUT;
    txHash?: Hex;
}

export interface WithdrawFromRewardVaultStep extends BaseStep {
    type: TransactionTypes.WITHDRAW_FROM_REWARD_VAULT;
    txHash?: Hex;
}

export interface StakeIntoRewardVaultStep extends BaseStep {
    type: TransactionTypes.STAKE_INTO_REWARD_VAULT;
    txHash?: Hex;
}

export enum TransactionStepStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
}
interface BaseStep {
    status: TransactionStepStatus;
    amount?: string;
    txHash?: Hex;
}
