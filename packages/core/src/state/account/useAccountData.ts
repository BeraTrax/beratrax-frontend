
import { useCallback, useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import useTokens from "../tokens/useTokens";
import { RoutesPaths } from "./../../config/constants";
import useWallet from "./../../hooks/useWallet";
import { useAppDispatch, useAppSelector } from "./../../state";
import { addAccount, updateAccountField, updatePoints } from "./../../state/account/accountReducer";

const useAccountData = () => {
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
            window.location.origin.includes("staging") ? "https://beta.beratrax.com" : window.location.origin
          }/${encodeURIComponent(referralCode)}`
        : undefined,
    [referralCode],
  );
  const fetchAccountData = useCallback(async () => {
    if (!refCodeLoaded) return;

    await dispatch(addAccount({ address: currentWallet, referrerCode, referralCodeFromUrl: referralCodeFromUrl! }));
    await reloadBalances();
    if (!currentWallet) return;
    await dispatch(updatePoints(currentWallet));
  }, [currentWallet, referrerCode, refCodeLoaded, referralCodeFromUrl]);

  return {
    fetchAccountData,
    referralLink,
  };
};

export default useAccountData;

export const useRefCodeLoaded = () => {
  const { refCode } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (refCode && !Object.values([RoutesPaths.Home, RoutesPaths.Farms, RoutesPaths.Leaderboard]).includes(refCode)) {
      dispatch(updateAccountField({ field: "referrerCode", value: refCode }));
      navigate(`/`);
    }
    dispatch(updateAccountField({ field: "refCodeLoaded", value: true }));
  }, [refCode]);

  return refCode;
};
