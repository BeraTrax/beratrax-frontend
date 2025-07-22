import { useMemo } from "react";
import pools, { ETF_VAULTS } from "./../../../config/constants/pools_json";

const useFarms = () => {
	return { farms: useMemo(() => [...pools, ...ETF_VAULTS], []) };
};

export default useFarms;
