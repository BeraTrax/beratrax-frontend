import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchSpecificLpPrice } from "@core/api/stats";
import { VAULT_LP_PRICE_GRAPH } from "@core/config/constants/query";
import { isNumber } from "@core/utils";

export const useLp = (id: number) => {
  const { data, isLoading } = useQuery({
    queryKey: VAULT_LP_PRICE_GRAPH(id),
    queryFn: () => fetchSpecificLpPrice(id),
    staleTime: 1000 * 60, // 1min stale time
  });

  const averageLp = useMemo(() => {
    if (!data || data.length === 0) return 0;

    // **Step 1: Filter out invalid values**
    const filteredData = data.filter((e) => isNumber(e.lp) && e.lp !== 0).map((e) => e.lp); // Extract LP values only

    if (filteredData.length === 0) return 0;

    // **Step 2: Calculate Quartiles**
    const sortedLp = [...filteredData].sort((a, b) => a - b);
    const q1 = sortedLp[Math.floor(sortedLp.length * 0.25)];
    const q3 = sortedLp[Math.floor(sortedLp.length * 0.75)];
    const iqr = q3 - q1;

    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    // **Step 3: Remove Outliers**
    const validLp = filteredData.filter((lp) => lp >= lowerBound && lp <= upperBound);

    if (validLp.length === 0) return 0; // Avoid division by zero

    // **Step 4: Calculate Average**
    const sumLp = validLp.reduce((a, b) => a + b, 0);
    return sumLp / validLp.length;
  }, [data]);

  return {
    lp: data?.filter((e) => isNumber(e.lp) && e.lp !== 0), // Only return valid LP values
    isLpPriceLoading: isLoading,
    averageLp,
  };
};
