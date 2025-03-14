import { useMemo } from "react";
import pools from "@core/config/constants/pools_json";

const useFarms = () => {
  return { farms: useMemo(() => pools, []) };
};

export default useFarms;
