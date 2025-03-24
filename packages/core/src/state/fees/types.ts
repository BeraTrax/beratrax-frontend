import { PoolFees } from "./../../api/fees";

export interface StateInterface {
  poolFees: PoolFees[];
  isLoadingPoolFees: boolean;
  error?: string | null;
}
