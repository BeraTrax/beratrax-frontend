// @ts-nocheck

import sushi from "./sushi";
import hop from "./hop";
import { FarmFunctions } from "./types";
import peapods from "./peapods";
import steer from "./steer";
import clipper from "./clipper";
import core from "./core";
import gamma from "./gamma";
import kodiak from "./kodiak";
import arbera from "./arbera";
import infrared from "./infrared";
import beradrome from "./beradrome";
import { createFarmInterface } from "./common";
import pools_json from "src/config/constants/pools_json";

const baseFarmFunctions = pools_json.reduce(
    (acc, pool) => ({
        ...acc,
        [pool.id]: createFarmInterface(pool.id),
    }),
    {} as { [key: number]: FarmFunctions }
);

const overrideFarmFunctions = {};

const farmFunctions: { [key: number]: FarmFunctions } = {
    ...baseFarmFunctions,
    ...overrideFarmFunctions,
};

export default farmFunctions;
