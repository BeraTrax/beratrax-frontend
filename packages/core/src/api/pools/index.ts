// @ts-nocheck

import { FarmFunctions } from "./types";
// import arbera from "./arbera";
import pools_json, { ETF_VAULTS } from "./../../config/constants/pools_json";
import { createFarmInterface, createETFVaultInterface } from "./common";

const baseFarmFunctions = pools_json.reduce(
	(acc, pool) => ({
		...acc,
		[pool.id]: createFarmInterface(pool.id),
	}),
	{} as { [key: number]: FarmFunctions }
);

const etfFarmFunctions = ETF_VAULTS.reduce(
	(acc, etfVault) => ({
		...acc,
		[etfVault.id]: createETFVaultInterface(etfVault.id),
	}),
	{} as { [key: number]: Omit<FarmFunctions, "deposit" | "withdraw"> }
);

const overrideFarmFunctions = {};

const farmFunctions: { [key: number]: FarmFunctions } = {
	...baseFarmFunctions,
	...etfFarmFunctions,
	...overrideFarmFunctions,
};

export default farmFunctions;
