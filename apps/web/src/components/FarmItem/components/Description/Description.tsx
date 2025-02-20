import { useMemo } from "react";
import { PoolDef } from "src/config/constants/pools_json";
import { useAppSelector } from "src/state";
import { FarmOriginPlatform, FarmTransactionType } from "src/types/enums";

export const Description: React.FC<{ farm: PoolDef }> = ({ farm }) => {
    const { transactionType, currencySymbol } = useAppSelector((state) => state.farms.farmDetailInputOptions);

    const isAutoCompounding = useMemo(() => {
        if (transactionType === FarmTransactionType.Deposit && farm.originPlatform !== FarmOriginPlatform.Peapods)
            return true;
        return false;
    }, [farm, transactionType]);

    return (
        <div className="w-full text-center">
            {transactionType} {transactionType === FarmTransactionType.Deposit ? "into" : "from"} the{" "}
            <a href={farm.source} className="text-textPrimary">
                {farm.url_name}
            </a>{" "}
            {isAutoCompounding ? "auto-compounding" : ""} liquidity pool.
            {currencySymbol === "ETH" ? ` "Max" excludes a little ETH for gas.` : ""}
        </div>
    );
};
