// @ts-nocheck

import { FarmFunctions } from "./types";
// import arbera from "./arbera";
import pools_json from "./../../config/constants/pools_json";
import { createFarmInterface } from "./common";

const baseFarmFunctions = pools_json.reduce(
  (acc, pool) => ({
    ...acc,
    [pool.id]: createFarmInterface(pool.id),
  }),
  {} as { [key: number]: FarmFunctions },
);

const overrideFarmFunctions = {};

const farmFunctions: { [key: number]: FarmFunctions } = {
  ...baseFarmFunctions,
  ...overrideFarmFunctions,
};

export default farmFunctions;
