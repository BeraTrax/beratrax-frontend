import { useCallback, useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import useTokens from "../tokens/useTokens";
import { RoutesPaths } from "./../../config/constants";
import useWallet from "./../../hooks/useWallet";
import { useAppDispatch, useAppSelector } from "./../../state";
import { addAccount, updateAccountField } from "./../../state/account/accountReducer";
import { Platform } from "react-native";

// Web-specific implementation using react-router-dom hooks
const useAccountDataWeb = () => {
	const { referralCode, referrerCode, refCodeLoaded } = useAppSelector((state) => state.account);
	const { currentWallet } = useWallet();
	const { reloadBalances } = useTokens();
	const dispatch = useAppDispatch();
	const [urlSearchParams] = useSearchParams();
	const referralCodeFromUrl = urlSearchParams.get("refCode");

	const referralLink = useMemo(
		() =>
			referralCode
				? `${
						window.location.origin.includes("staging") ? "https://app.trax.finance" : window.location.origin
					}/${encodeURIComponent(referralCode)}`
				: undefined,
		[referralCode]
	);

	const fetchAccountData = useCallback(async () => {
		if (!refCodeLoaded) return;

		await dispatch(addAccount({ address: currentWallet, referrerCode, referralCodeFromUrl: referralCodeFromUrl! }));
		await reloadBalances();
		if (!currentWallet) return;
		// await dispatch(updatePoints(currentWallet));
	}, [currentWallet, referrerCode, refCodeLoaded, referralCodeFromUrl]);

	return {
		fetchAccountData,
		referralLink,
		referralCode,
	};
};

// Native-specific implementation without react-router-dom dependencies
const useAccountDataNative = () => {
	const { referralCode, referrerCode, refCodeLoaded } = useAppSelector((state) => state.account);
	const { currentWallet } = useWallet();
	const { reloadBalances } = useTokens();
	const dispatch = useAppDispatch();

	const referralLink = useMemo(
		() => (referralCode ? `https://beratrax.com/${encodeURIComponent(referralCode)}` : undefined),
		[referralCode]
	);

	const fetchAccountData = useCallback(async () => {
		if (!refCodeLoaded) return;

		await dispatch(addAccount({ address: currentWallet, referrerCode, referralCodeFromUrl: "" }));
		await reloadBalances();
		if (!currentWallet) return;
		// await dispatch(updatePoints(currentWallet));
	}, [currentWallet, referrerCode, refCodeLoaded]);

	return {
		fetchAccountData,
		referralLink,
		referralCode,
	};
};

// Web-specific implementation of useRefCodeLoaded
export const useRefCodeLoadedWeb = () => {
	const { refCode } = useParams();
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	useEffect(() => {
		if (refCode && !Object.values([RoutesPaths.Home, RoutesPaths.Farms, RoutesPaths.Leaderboard]).includes(refCode)) {
			dispatch(updateAccountField({ field: "referrerCode", value: refCode }));
			navigate(`/`);
		}
		dispatch(updateAccountField({ field: "refCodeLoaded", value: true }));
	}, [refCode, navigate, dispatch]);

	return refCode;
};

// Native-specific implementation of useRefCodeLoaded
export const useRefCodeLoadedNative = () => {
	const dispatch = useAppDispatch();

	useEffect(() => {
		dispatch(updateAccountField({ field: "refCodeLoaded", value: true }));
	}, [dispatch]);

	return null;
};

// Export the appropriate hook based on platform
const useAccountData = Platform.OS === "web" ? useAccountDataWeb : useAccountDataNative;
export const useRefCodeLoaded = Platform.OS === "web" ? useRefCodeLoadedWeb : useRefCodeLoadedNative;

export default useAccountData;
