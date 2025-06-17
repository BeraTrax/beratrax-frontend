import React from "react";
import { CircleOneIcon } from "@beratrax/ui/src/icons/CircleOne";
import { CancelOutlineIcon } from "@beratrax/ui/src/icons/CancelOutline";
import CheckMark from "@beratrax/core/src/assets/images/checkmark.png";
import { PoolDef, tokenNamesAndImages } from "@beratrax/core/src/config/constants/pools_json";
import { Transaction, TransactionStepStatus } from "@beratrax/core/src/state/transactions/types";
import useTransaction from "@beratrax/core/src/state/transactions/useTransaction";
import { formatCurrency } from "@beratrax/core/src/utils/common";
import { formatUnits, zeroAddress } from "viem";
import styles from "./TransactionDetails.module.css";
import { View, Text, Image, Platform, ActivityIndicator } from "react-native";

type IProps =
	| {
			transactionId: string;
			open: boolean;
			showLoadingBar?: boolean;
			tx: undefined;
			farm: undefined;
	  }
	| {
			transactionId: undefined;
			open: boolean;
			showLoadingBar?: boolean;
			tx: Transaction;
			farm: PoolDef;
	  };

const TransactionDetails: React.FC<IProps> = (args) => {
	let farm: PoolDef | undefined = args.farm;
	let tx: Transaction | undefined = args.tx;
	const obj = useTransaction(args.transactionId);
	farm = obj?.farm;
	tx = obj?.tx;

	if (!farm || !tx) return;

	return (
		<View className={`${styles.container} ${args.open ? styles.open : styles.closed}`}>
			{args.showLoadingBar && (
				<View className={styles.loadingBarContainer}>
					<View className={tx.steps.some((item) => item.status === TransactionStepStatus.IN_PROGRESS) ? styles.loadingBarAnimated : ""} />
				</View>
			)}
			<View style={{ marginTop: 20 }}>
				{tx.steps.map((step, i) => {
					const decimals = 18;
					const amount = Number(formatUnits(BigInt(step.amount ?? 0), decimals));
					const amountInUsd = (amount * tx.vaultPrice!) / tx.tokenPrice!;
					return (
						<React.Fragment key={i}>
							{getStep(
								step.type,
								step.status,
								tx.type === "deposit" ? amount : amountInUsd,
								tokenNamesAndImages[tx.token].name,
								i === tx.steps.length - 1
							)}
						</React.Fragment>
					);
				})}
			</View>
		</View>
	);
};

export default TransactionDetails;

function getImageSource() {
	return Platform.OS === "web" ? { uri: CheckMark } : require("@beratrax/core/src/assets/images/checkmark.png");
}

function getStep(name: string, status: TransactionStepStatus, value: number, tokenName?: string, isLastStep?: boolean) {
	return (
		<View>
			<View className="flex flex-row gap-x-2">
				{status === TransactionStepStatus.COMPLETED ? (
					<Image source={getImageSource()} alt="Check mark" className="w-6 h-5" />
				) : status === TransactionStepStatus.FAILED ? (
					<CancelOutlineIcon color="red" />
				) : status === TransactionStepStatus.PENDING ? (
					<CircleOneIcon color="var(--new-color_secondary)" style={{ transform: "scale(0.8)" }} />
				) : (
					<ActivityIndicator size="small" color="#72B21F" />
				)}
				<View>
					<Text className="font-league-spartan font-light text-base leading-5 text-textWhite">{name}</Text>
					{value && (
						<Text className={`${styles.tokenValue} text-textSecondary font-light text-base leading-5`}>
							{formatCurrency(value)} {tokenName}
						</Text>
					)}
				</View>
			</View>
			{!isLastStep && (
				<View className="flex flex-col pl-2 pt-1 sm:pl-2.5">
					<View className="w-0.5 h-0.5 mb-1.5 bg-bgPrimary" />
					<View className="w-0.5 h-0.5 mb-1.5 bg-bgPrimary" />
					<View className="w-0.5 h-0.5 mb-1 bg-bgPrimary" />
				</View>
			)}
		</View>
	);
}
