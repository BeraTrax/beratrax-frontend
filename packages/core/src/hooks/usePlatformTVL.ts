import { useQuery } from "@tanstack/react-query";
import { fetchPlatformTVL, fetchTransactionCount, fetchPlatformTVLHistory } from "@core/api/platformTVL";

export const usePlatformTVL = () => {
  const { isLoading, error, data, isFetching } = useQuery({
    queryKey: ["stats/platform-tvl"],
    queryFn: () => fetchPlatformTVL(),
  });

  return { platformTVL: data?.data.data || 51024907, isLoading: isLoading || isFetching, error };
};

export const useTransactionCount = () => {
  const { isLoading, error, data, isFetching } = useQuery({
    queryKey: ["stats/transaction-count"],
    queryFn: () => fetchTransactionCount(),
  });

  return { transactionCount: data?.transactionCount || 88196, isLoading: isLoading || isFetching, error };
};

export const usePlatformTVLHistory = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["stats/platform-tvl-graph"],
    queryFn: () => fetchPlatformTVLHistory(),
  });

  return { platformTVLHistory: data, isLoading };
};
