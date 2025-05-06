import { tokenNamesAndImages } from "@beratrax/core/src/config/constants/pools_json";
import { blockExplorersByChainId } from "@beratrax/core/src/config/constants/urls";
import { useAppDispatch, useAppSelector } from "@beratrax/core/src/state";
import { useZapIn, useZapOut } from "@beratrax/core/src/state/farms/hooks";
import useTokens from "@beratrax/core/src/state/tokens/useTokens";
import { deleteTransactionDb } from "@beratrax/core/src/state/transactions/transactionsReducer";
import { TransactionStatus, TransactionStepStatus } from "@beratrax/core/src/state/transactions/types";
import useTransaction from "@beratrax/core/src/state/transactions/useTransaction";
import useTransactions from "@beratrax/core/src/state/transactions/useTransactions";
import { formatCurrency, toEth } from "@beratrax/core/src/utils/common";
import moment from "moment";
import { FC, useMemo, useRef, useState } from "react";
import { formatUnits } from "viem";
import { useChainId } from "wagmi";
import { View, Text, Pressable, Linking } from "react-native";
import { ModalLayout } from "./modals/ModalLayout";
import TransactionDetails from "./TransactionDetail/TransactionDetail";
import { InfoCircleIcon } from "../icons/InfoCircle";
import { ChevronDownIcon } from "../icons/ChevronDown";
import { ChevronUpIcon } from "../icons/ChevronUp";
import { ExternalLinkIcon } from "../icons/ExternalLInk";
import Colors from "@beratrax/typescript-config/Colors";

export const Transactions = () => {
	const [open, setOpen] = useState(false);
	const allTransactions = useAppSelector((state) => state.transactions.transactions);
	const transactions = useMemo(() => {
		return allTransactions.slice(0, 3);
	}, [allTransactions]);

	return (
		<View>
			<View className="flex flex-row justify-between items-center gap-2.5 mt-4">
				<Text className="font-arame-mono font-normal text-base text-textWhite leading-4 uppercase">Last Transactions</Text>
				{transactions.length !== 0 && (
					<Pressable onPress={() => setOpen(true)} className="flex flex-row items-center">
						<Text className="font-arame-mono font-normal text-base text-textPrimary leading-4 uppercase">See all</Text>
						<ChevronDownIcon stroke={Colors.gradientLight} strokeWidth={3} />
					</Pressable>
				)}
			</View>
			<View className="mt-[1.2rem] flex flex-col gap-[0.7rem]">
				{transactions.length === 0 && <Text className="text-center text-textSecondary">No transactions yet</Text>}
				{transactions.map((item, i) => (
					<Row _id={item._id} key={i} />
				))}
			</View>
			{open && <TransactionsModal setOpenModal={setOpen} />}
		</View>
	);
};

const Row: FC<{ _id: string }> = ({ _id }) => {
	const { tx, farm } = useTransaction(_id);
	const { prices, decimals } = useTokens();
	const [open, setOpen] = useState(false);
	const dispatch = useAppDispatch();
	if (!farm || !tx) return null;
	const { zapIn } = useZapIn(farm);
	const { zapOut } = useZapOut(farm);
	const chainId = useChainId();
	const {
		type,
		amountInWei,
		token,
		vaultPrice,
		tokenPrice,
		steps,
		date,
		netAmount,
		actualSlippage,
		fee,
		returnedAssets,
		vaultShares,
		farmId,
	} = tx;

	const filteredReturnedAssets = useMemo(() => {
		if (!returnedAssets) return [];
		return returnedAssets.filter((asset) => Number(asset.amount) > 0);
	}, [returnedAssets]);

	const showExtraInfo = useMemo(() => {
		if (vaultShares) return true;
		return false;
	}, [vaultShares]);

	let tokenAmount = 0;
	if (type === "deposit") {
		tokenAmount = Number(formatUnits(BigInt(amountInWei), decimals[farm.chainId][token]));
	} else {
		tokenAmount =
			(Number(formatUnits(BigInt(amountInWei), decimals[farm.chainId][farm.vault_addr])) *
				(vaultPrice || prices[farm.chainId][farm.vault_addr])) /
			(tokenPrice || prices[farm.chainId][token]);
	}

	const status = useMemo(() => {
		if (steps.every((step) => step.status === TransactionStepStatus.COMPLETED)) return TransactionStatus.SUCCESS;
		if (steps.some((step) => step.status === TransactionStepStatus.FAILED)) return TransactionStatus.FAILED;
		if (steps.some((step) => step.status === TransactionStepStatus.IN_PROGRESS)) return TransactionStatus.PENDING;
		return TransactionStatus.INTERRUPTED;
	}, [steps]);
	const retryTransaction = (e: any) => {
		e.stopPropagation();
		dispatch(deleteTransactionDb(_id));
		if (tx.type === "deposit") {
			zapIn({
				zapAmount: Number(toEth(BigInt(tx.amountInWei), decimals[farm.chainId][token])),
				max: tx.max,
				token: tx.token,
				txId: tx._id,
			});
		} else {
			zapOut({
				withdrawAmt: Number(toEth(BigInt(tx.amountInWei), farm.decimals)),
				max: tx.max,
				token: tx.token,
				txId: tx._id,
			});
		}
	};

	return (
		<>
			<View className="rounded-2xl transition-all duration-100 ease-in-out px-4 py-6 my-1">
				<Pressable className="flex flex-row items-center gap-4" onPress={() => setOpen(!open)}>
					{/* Chevron Icon to open and close the transaction details */}
					<View
						className={`flex-shrink-0 relative w-12 h-12 rounded-lg flex justify-center items-center ${
							open ? "bg-gradientSecondary" : "bg-bgSecondary"
						}`}
					>
						{open ? (
							<ChevronUpIcon stroke={Colors.gradientLight} strokeWidth={3} />
						) : (
							<ChevronDownIcon stroke={Colors.gradientLight} strokeWidth={3} />
						)}
					</View>

					{/* Vault Name and Retry Button */}
					<View className="flex-grow flex flex-col">
						<View className="flex flex-row items-center gap-1.5">
							<Text className="font-league-spartan font-medium text-lg leading-6 text-textWhite">{farm.name}</Text>
							{tx.steps.some((item) => item.status === TransactionStepStatus.FAILED) && (
								<Pressable
									className="border border-red-500 rounded-md 
                                            px-1 py-0.5 bg-transparent 
                                            flex flex-row items-center gap-0.5 
                                            text-red-500 text-[0.8rem]"
									onPress={retryTransaction}
								>
									<Text className="text-red-500 text-xs">Retry</Text>
								</Pressable>
							)}
							{/* Tooltip for transaction details */}
							{showExtraInfo && (
								<View className="group relative pb-1">
									<Pressable onPress={(e) => e.stopPropagation()}>
										<InfoCircleIcon />
									</Pressable>
								</View>
							)}
							{!tx.steps.some((item) => item.status === TransactionStepStatus.FAILED) && (
								<View className="group relative pl-1 pb-1">
									<Pressable
										onPress={(e) => {
											e.stopPropagation();
											if (tx.steps[tx.steps.length - 1].txHash) {
												Linking.openURL(`${blockExplorersByChainId[chainId]}/tx/${tx.steps[tx.steps.length - 1].txHash}`);
											}
										}}
									>
										<ExternalLinkIcon />
									</Pressable>
								</View>
							)}
						</View>
						<Text className="font-league-spartan font-light text-base text-textSecondary leading-5">{moment(date).fromNow()}</Text>
					</View>

					{/* Price and Balance */}
					<View className="flex-shrink-0 flex flex-col items-end">
						<Text className="font-league-spartan font-medium text-lg leading-5 text-textWhite">
							$
							{(
								Number(
									formatUnits(
										BigInt(type === "withdraw" ? netAmount || amountInWei : netAmount || amountInWei),
										decimals[farm.chainId][token]
									)
								) *
								(type === "withdraw"
									? showExtraInfo
										? tokenPrice || prices[farm.chainId][token]
										: vaultPrice || prices[farm.chainId][farm.vault_addr]
									: (tokenPrice || prices[farm.chainId][token])!)
							).toLocaleString()}
						</Text>
						<Text className="font-league-spartan font-light text-base text-textSecondary leading-5">
							{netAmount
								? Number(formatUnits(BigInt(netAmount), decimals[farm.chainId][token])).toLocaleString()
								: tokenAmount.toLocaleString()}{" "}
							{tokenNamesAndImages[token].name}
						</Text>
					</View>
				</Pressable>

				{open && <TransactionDetails transactionId={_id} open={open} farm={undefined} tx={undefined} />}
			</View>
		</>
	);
};

const TransactionsModal: FC<{ setOpenModal: (value: boolean) => void }> = ({ setOpenModal }) => {
	const transactions = useAppSelector((state) => state.transactions.transactions);
	const { fetchTransactions, isLoading, fetchedAll } = useTransactions();
	const timeout = useRef<NodeJS.Timeout>();

	return (
		<ModalLayout
			onClose={() => setOpenModal(false)}
			className="
            max-w-[500px] w-[80vw] 
            h-[80vh] 
            flex flex-col"
			wrapperClassName="lg:w-full"
			onScroll={(e) => {
				if (fetchedAll) return;
				let ele = e.currentTarget;
				let percent = (ele.scrollTop / (ele.scrollHeight - ele.clientHeight)) * 100;
				if (percent === 100 && !isLoading) {
					clearTimeout(timeout.current);
					timeout.current = setTimeout(() => {
						fetchTransactions();
					}, 1000);
				}
			}}
		>
			<Text className="text-[1.5rem] font-bold text-textWhite mb-[1.2rem]">Transactions</Text>
			<View className="flex-1 overflow-y-auto">
				<View className="flex flex-col gap-[0.7rem]">
					{transactions.map((item, i) => (
						<Row _id={item._id} key={i} />
					))}
					{isLoading && (
						<View className="flex justify-center items-center">
							<View
								className="
                                    w-[18px] h-[18px] 
                                    border-2 border-solid 
                                    border-current border-b-transparent border-r-transparent 
                                    rounded-full 
                                    box-border 
                                    animate-rotation"
							/>
						</View>
					)}
				</View>
			</View>
		</ModalLayout>
	);
};
