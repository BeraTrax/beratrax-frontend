import { PoolFees } from "@core/api/fees";

export interface StateInterface {
  poolFees: PoolFees[];
  isLoadingPoolFees: boolean;
  error?: string | null;
}
