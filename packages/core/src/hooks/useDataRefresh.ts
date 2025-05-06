import { useEffect, useState } from "react";
import { useAppDispatch } from "../state";
import { setOnline, setOffline } from "../state/internet/internetReducer";
import useAccountData from "../state/account/useAccountData";
import useFarmDetails from "../state/farms/hooks/useFarmDetails";
import useTransactions from "../state/transactions/useTransactions";
import { useFarmApys } from "../state/farms/hooks/useFarmApy";
import useTokens from "../state/tokens/useTokens";
import { useNetInfo } from "@react-native-community/netinfo";
import { AppState, Platform } from "react-native";

export const useDataRefresh = () => {
	const { reloadApys } = useFarmApys();
	const { reloadFarmData, reloadVaultEarnings } = useFarmDetails();
	const { fetchAccountData } = useAccountData();
	const { fetchTransactions } = useTransactions();
	const { prices, reloadPrices, reloadDecimals, reloadSupplies, reloadBalances } = useTokens();
	const dispatch = useAppDispatch();
	const { isConnected } = useNetInfo();
	const [appState, setAppState] = useState(AppState.currentState);

	const isHidden = Platform.OS === "web" ? document.hidden : appState !== "active";

	useEffect(() => {
		const subscription = AppState.addEventListener("change", (nextAppState) => {
			setAppState(nextAppState);
		});

		return () => {
			subscription.remove();
		};
	}, []);

	// Network status effect
	useEffect(() => {
		// to avoid null values check. explicitly checking the boolean state
		if (isConnected === false) {
			dispatch(setOffline());
		} else {
			dispatch(setOnline());
		}
	}, [isConnected]);

	// Account data refresh
	useEffect(() => {
		fetchAccountData();
		const interval = setInterval(
			() => {
				if (isHidden) return;
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
				if (isHidden) return;
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
				if (isHidden) return;
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
				if (isHidden) return;
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
