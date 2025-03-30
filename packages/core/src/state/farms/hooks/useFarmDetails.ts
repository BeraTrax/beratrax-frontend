import { useCallback, useEffect } from "react";
import useWallet from "core/src/hooks/useWallet";
import useTokens from "core/src/state/tokens/useTokens";
import { useAppDispatch, useAppSelector } from "core/src/state";
import { getVaultEarnings, reset, updateEarnings, updateFarmDetails } from "core/src/state/farms/farmsReducer";
import useFarms from "core/src/state/farms/hooks/useFarms";

const useFarmDetails = () => {
  const { farms } = useFarms();
  const { balances, isBalancesFetched, isBalancesLoading, decimals, totalSupplies } = useTokens();
  const { prices, isPricesFetched, isPricesLoading } = useTokens();
  const {
    isLoading,
    farmDetails,
    isFetched,
    account,
    earnings,
    isLoadingEarnings,
    vaultEarnings,
    isLoadingVaultEarnings,
    isVaultEarningsFirstLoad,
  } = useAppSelector((state) => state.farms);
  const { currentWallet, getPublicClient } = useWallet();
  const dispatch = useAppDispatch();

  const reloadFarmData = useCallback(async () => {
    if (isBalancesFetched && isPricesFetched && currentWallet) {
      await dispatch(
        updateFarmDetails({ farms, totalSupplies, currentWallet, balances, prices, decimals, getPublicClient }),
      );
      await dispatch(
        updateEarnings({
          farms,
          currentWallet,
          getPublicClient,
          decimals,
          prices,
          balances,
          totalSupplies,
        }),
      );
    }
  }, [farms, dispatch, currentWallet, balances, prices, decimals, isBalancesFetched, isPricesFetched, totalSupplies]);

  const reloadVaultEarnings = useCallback(async () => {
    if (currentWallet) {
      await dispatch(getVaultEarnings(currentWallet));
    }
  }, [currentWallet, balances]);

  useEffect(() => {
    if (currentWallet !== account) dispatch(reset());
  }, [account, currentWallet]);

  return {
    isFetched,
    isLoading: (isLoading && !isFetched) || isBalancesLoading || isPricesLoading,
    isFetching: isLoading,
    reloadFarmData,
    reloadVaultEarnings,
    farmDetails,
    earnings,
    vaultEarnings,
    isLoadingEarnings,
    isLoadingVaultEarnings,
    isVaultEarningsFirstLoad,
  };
};

export default useFarmDetails;

