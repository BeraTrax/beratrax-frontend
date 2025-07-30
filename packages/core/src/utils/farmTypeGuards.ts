import { PoolDef, ETFVaultDef } from "../config/constants/pools_json";

/**
 * Type guard to check if a farm is an ETF vault
 */
export const isETFVault = (farm: PoolDef | ETFVaultDef): farm is ETFVaultDef => {
	return !!farm.isETFVault;
};

/**
 * Type guard to check if a farm is a regular pool
 */
export const isRegularPool = (farm: PoolDef | ETFVaultDef): farm is PoolDef => {
	return !farm.isETFVault;
};
