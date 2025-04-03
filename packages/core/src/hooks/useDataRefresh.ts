import { useEffect } from "react";
import { useAppDispatch } from "../state";
import { setOffline } from "../state/internet/internetReducer";
import useAccountData from "../state/account/useAccountData";
import useFarmDetails from "../state/farms/hooks/useFarmDetails";
import useTransactions from "../state/transactions/useTransactions";
import { useFarmApys } from "../state/farms/hooks/useFarmApy";
import useTokens from "../state/tokens/useTokens";

export const useDataRefresh = () => {
  const { reloadApys } = useFarmApys();
  const { reloadFarmData, reloadVaultEarnings } = useFarmDetails();
  const { fetchAccountData } = useAccountData();
  const { fetchTransactions } = useTransactions();
  const {
    prices,
    reloadPrices,
    reloadDecimals,
    reloadSupplies,
    reloadBalances,
  } = useTokens();
  const dispatch = useAppDispatch();

  // Network status effect
  // useEffect(() => {
  //     window.addEventListener("online", () => {
  //         window.location.reload();
  //     });
  //     window.addEventListener("offline", () => {
  //         dispatch(setOffline());
  //     });
  // }, []);

  // Account data refresh
  useEffect(() => {
    fetchAccountData();
    const interval = setInterval(
      () => {
        // if (document.hidden) return;
        fetchAccountData();
      },
      1000 * 60 * 5
    );
    return () => clearInterval(interval);
  }, [fetchAccountData]);

  // Prices refresh
  useEffect(() => {
    reloadPrices();
    const interval = setInterval(
      () => {
        // if (document.hidden) return;
        reloadPrices();
      },
      1000 * 60 * 5
    );
    return () => clearInterval(interval);
  }, [reloadPrices]);

  // APYs refresh
  useEffect(() => {
    reloadApys();
    const interval = setInterval(
      () => {
        reloadApys();
      },
      1000 * 60 * 30
    );
    return () => clearInterval(interval);
  }, [reloadApys]);

  // Balances refresh
  useEffect(() => {
    reloadBalances();
    const interval = setInterval(
      () => {
        // if (document.hidden) return;
        reloadBalances();
      },
      1000 * 60 * 0.5
    );
    return () => clearInterval(interval);
  }, [reloadBalances, prices]);

  // Supplies refresh
  useEffect(() => {
    reloadSupplies();
    const interval = setInterval(
      () => {
        // if (document.hidden) return;
        reloadSupplies();
      },
      1000 * 60 * 2
    );
    return () => clearInterval(interval);
  }, [reloadSupplies, prices]);

  // One-time loads
  useEffect(() => {
    reloadDecimals();
  }, [reloadDecimals]);

  useEffect(() => {
    reloadFarmData();
  }, [reloadFarmData]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    reloadVaultEarnings();
  }, [reloadVaultEarnings]);
};
