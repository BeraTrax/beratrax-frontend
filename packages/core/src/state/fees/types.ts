import { PoolFees } from "core/src/api/fees";

export interface StateInterface {
  poolFees: PoolFees[];
  isLoadingPoolFees: boolean;
  error?: string | null;
}
