import { useEffect, useState } from "react";
import { FarmDataProcessed } from "@core/api/pools/types";
import { useAppSelector } from "@core/state";

const useTVL = () => {
  const { farmDetails } = useAppSelector((state) => state.farms);
  const [userTVL, setUserTVL] = useState(0);

  useEffect(() => {
    let totalValueLockedUser = 0;
    Object.values(farmDetails).forEach((e: FarmDataProcessed) => {
      totalValueLockedUser += Number(e?.withdrawableAmounts[0].amountDollar);
    });
    setUserTVL(totalValueLockedUser);
  }, [farmDetails]);

  return { userTVL };
};

export default useTVL;
