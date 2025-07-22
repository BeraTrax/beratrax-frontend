import { createSelector } from "@reduxjs/toolkit";
import { useMemo } from "react";
import useTokens from "../tokens/useTokens";
import pools_json, { ETF_VAULTS } from "./../../config/constants/pools_json";
import { RootState, useAppSelector } from "./../../state";

const selectTransactionById = createSelector(
	(state: RootState) => state.transactions.transactions,
	(_: any, transactionId: string | undefined) => transactionId,
	(transactions, transactionId: string | undefined) => (transactionId ? transactions.find((item) => item._id === transactionId) : undefined)
);

const useTransaction = (transactionId?: string) => {
	const transaction = useAppSelector((state: RootState) => selectTransactionById(state, transactionId));

	const allFarms = [...pools_json, ...ETF_VAULTS];
	const farm = useMemo(() => allFarms.find((item) => item.id === transaction?.farmId), [transaction?.farmId]);
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
