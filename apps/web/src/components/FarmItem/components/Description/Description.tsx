import { PoolDef } from "@beratrax/core/src/config/constants/pools_json";
import { useAppSelector } from "@beratrax/core/src/state";
import { FarmTransactionType } from "@beratrax/core/src/types/enums";
import { useMemo } from "react";

export const Description: React.FC<{ farm: PoolDef }> = ({ farm }) => {
	const { transactionType, currencySymbol } = useAppSelector((state) => state.farms.farmDetailInputOptions);

	const isAutoCompounding = useMemo(() => {
		if (transactionType === FarmTransactionType.Deposit) return true;
		return false;
	}, [farm, transactionType]);

	return (
		<div className="w-full text-center">
			{transactionType} {transactionType === FarmTransactionType.Deposit ? "into" : "from"} the{" "}
			<a href={farm.source} className="text-textPrimary">
				{farm.url_name}
			</a>{" "}
			{isAutoCompounding ? "auto-compounding" : ""} liquidity pool.
			{currencySymbol === "ETH" ? ` BeraTrax contracts are continuously audited by CyberScope.` : ""}
		</div>
	);
};
