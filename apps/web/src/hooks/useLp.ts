import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchSpecificLpPrice } from "src/api/stats";
import { VAULT_LP_PRICE_GRAPH } from "src/config/constants/query";
import { isNumber } from "src/utils";

export const useLp = (id: number) => {
    const { data, isLoading } = useQuery({
        queryKey: VAULT_LP_PRICE_GRAPH(id),
        queryFn: () => fetchSpecificLpPrice(id),
        staleTime: 1000 * 60, // 1min stale time
    });

    const averageLp = useMemo(() => {
        if (!data || data.length === 0) return 0;
        const filteredData = data.filter((e) => isNumber(e.lp) && e.lp !== 0);
        const sumlp = filteredData.reduce((a, b) => a + b.lp, 0);
        return sumlp / filteredData.length;
    }, [data]);

    return {
        lp: data?.filter((e) => isNumber(e.lp) && e.lp !== 0),
        isLpPriceLoading: isLoading,
        averageLp,
    };
};
