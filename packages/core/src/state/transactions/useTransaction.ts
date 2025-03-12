import { useMemo } from "react";
import pools_json from "src/config/constants/pools_json";
import { RootState, useAppSelector } from "src/state";
import { createSelector } from "@reduxjs/toolkit";
import useTokens from "../tokens/useTokens";

const selectTransactionById = createSelector(
    (state: RootState) => state.transactions.transactions,
    (_: any, transactionId: string | undefined) => transactionId,
    (transactions, transactionId: string | undefined) =>
        transactionId ? transactions.find((item) => item._id === transactionId) : undefined
);

const useTransaction = (transactionId?: string) => {
    const transaction = useAppSelector((state: RootState) => selectTransactionById(state, transactionId));

    const farm = useMemo(() => pools_json.find((item) => item.id === transaction?.farmId), [transaction?.farmId]);
    const { prices } = useTokens();
    const tx = useMemo(() => {
        if (!transaction || !farm) return;
        let tx = { ...transaction };
        if (!tx?.vaultPrice) {
            tx.vaultPrice = prices[farm?.chainId][farm?.vault_addr];
        }
        if (!tx?.tokenPrice) {
            tx.tokenPrice = prices[farm?.chainId][tx.token];
        }
        return tx;
    }, [transaction, farm, prices]);

    return { tx, farm };
};

export default useTransaction;
