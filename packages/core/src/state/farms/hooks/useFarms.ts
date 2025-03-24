import { useMemo } from "react";
import pools from "./../../../config/constants/pools_json";

const useFarms = () => {
  return { farms: useMemo(() => pools, []) };
};

export default useFarms;
