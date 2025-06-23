import { PoolDef } from "@beratrax/core/src/config/constants/pools_json";
import { useAppSelector } from "@beratrax/core/src/state";
import { FarmTransactionType } from "@beratrax/core/src/types/enums";
import { useMemo } from "react";
import { View } from "react-native";
import { Link } from "expo-router";

export const Description: React.FC<{ farm: PoolDef }> = ({ farm }) => {
	const { transactionType, currencySymbol } = useAppSelector((state) => state.farms.farmDetailInputOptions);

	const isAutoCompounding = useMemo(() => {
		if (transactionType === FarmTransactionType.Deposit) return true;
		return false;
	}, [farm, transactionType]);

	return (
		<View className="w-full text-center">
			{transactionType} {transactionType === FarmTransactionType.Deposit ? "into" : "from"} the{" "}
			<Link href={farm.source} className="text-textPrimary">
				{farm.url_name}
			</Link>{" "}
			{isAutoCompounding ? "auto-compounding" : ""} liquidity pool.
			{currencySymbol === "ETH" ? ` "Max" excludes a little ETH for gas.` : ""}
		</View>
	);
};
