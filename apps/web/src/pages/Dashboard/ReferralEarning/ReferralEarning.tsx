import { useWallet } from "@beratrax/core/src/hooks";
import { useAppDispatch, useAppSelector } from "@beratrax/core/src/state";
import { getReferralEarning } from "@beratrax/core/src/state/account/accountReducer";
import { customCommify } from "@beratrax/core/src/utils/common";
import { useEffect } from "react";

const ReferralEarning = () => {
  const { currentWallet } = useWallet();
  const dispatch = useAppDispatch();
  const referralEarning = useAppSelector((state) => state.account.referralEarning);

  useEffect(() => {
    if (currentWallet) dispatch(getReferralEarning(currentWallet));
    const int = setInterval(async () => {
      if (currentWallet) dispatch(getReferralEarning(currentWallet));
    }, 10000);

    return () => {
      clearInterval(int);
    };
  }, [currentWallet]);

  return referralEarning && referralEarning >= 1 ? (
    <div className="flex flex-col justify-center border p-4 rounded">
      <p className="text-primary text-lg font-bold">Referral Earnings</p>
      <p className="text-primary text-4xl font-bold">
        {customCommify(referralEarning.toFixed(0), {
          minimumFractionDigits: 0,
          showDollarSign: true,
        })}
      </p>
    </div>
  ) : null;
};

export default ReferralEarning;
