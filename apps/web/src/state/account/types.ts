import { UserVVL } from "src/types";

export interface StateInterface {
    /** Code of person whose link used to come on site  */
    referrerCode?: string;
    /** Ref Code of person who refered user  */
    referrerAddress?: string;
    /** Ref Code of current user  */
    referralCode?: string;
    referralEarning?: number;
    earnedTrax?: number;
    earnedTraxByReferral?: number;
    totalEarnedTrax?: number;
    totalEarnedTraxByReferral?: number;
    traxCalculatedTimestamp?: number;
    earnTraxTermsAgreed?: boolean;
    termsOfUseAgreed?: boolean;
    earnedArb?: number;
    emmitedArb?: number;
    boosts?: Boosts[];
    estimatedTraxPerDay: { vaultAddress: string; estimatedTraxPerDay: number }[];
    referralCount?: number;
    refCodeLoaded: boolean;
    connector?: string;
    xFollower?: boolean;
    disableZapWarning?: boolean;
    error?: string | null;
}

export interface AccountResponse {
    _id: string;
    id: string;
    address: string;
    createdAt: string;
    updatedAt: string;
    earnTraxTermsAgreed?: boolean;
    termsOfUseAgreed?: boolean;
    earnedTrax?: number;
    earnedTraxByReferral?: number;
    earnedArb?: number;
    emmitedArb?: number;
    totalEarnedTrax?: number;
    totalEarnedTraxByReferral?: number;
    traxCalculatedTimestamp?: number;
    tvl: number;
    referralCode?: string;
    boosts: Boosts[];
    vaultTvls: UserVVL[];
    estimatedTraxPerDay: { vaultAddress: string; estimatedTraxPerDay: number }[];
    referralCount?: number;
    referrer?: {
        _id: string;
        address: string;
        createdAt: string;
        referralCode: string;
        id: string;
    };
    connector?: string;
    xFollower?: boolean;
    disableZapWarning?: boolean;
}

export enum Boosts {
    xSNOB = "xSNOB",
    NFT = "NFT",
    BETA = "BETA",
    BETA_TESTER = "BETA_TESTER",
    BRIDGE_JUMPER_BRONZE = "BRIDGE_JUMPER_BRONZE", // 1.5x multiplier
    BRIDGE_JUMPER_SILVER = "BRIDGE_JUMPER_SILVER", // 2.0x multiplier
    BRIDGE_JUMPER_GOLD = "BRIDGE_JUMPER_GOLD", // 2.5x multiplier
    BRIDGE_JUMPER_PLATINUM = "BRIDGE_JUMPER_PLATINUM", // 3.0x multiplier
    LBGT_VAULT_MULTIPIER = "3X LBGT Vault Multiplier",
}

