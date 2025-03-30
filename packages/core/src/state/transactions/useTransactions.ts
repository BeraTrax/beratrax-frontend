import { useCallback, useEffect, useState } from "react";
import useWallet from "core/src/hooks/useWallet";
import { useAppDispatch, useAppSelector } from "core/src/state";
import { checkPendingTransactionsStatus, getTransactionsDb, reset } from "core/src/state/transactions/transactionsReducer";

const useTransactions = () => {
  const dispatch = useAppDispatch();
  const { currentWallet } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const fetchedAll = useAppSelector((state) => state.transactions.fetchedAll);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    if (currentWallet) {
      await dispatch(getTransactionsDb({ walletAddress: currentWallet }));
      await dispatch(checkPendingTransactionsStatus());
    }
    setIsLoading(false);
  }, [currentWallet]);

  const resetFn = () => {
    dispatch(reset());
  };

  useEffect(() => {
    if (!currentWallet) {
      resetFn();
    }
  }, [currentWallet]);

  return { fetchTransactions, isLoading, fetchedAll, reset: resetFn };
};

export default useTransactions;
