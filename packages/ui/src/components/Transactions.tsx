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
import { Address, formatUnits } from "viem";
import { useChainId } from "wagmi";
import { View, Text, Pressable } from "react-native";
import { ModalLayout } from "./modals/ModalLayout";

export const Transactions = () => {
	const [open, setOpen] = useState(false);
	const allTransactions = useAppSelector((state) => state.transactions.transactions);
	const transactions = useMemo(() => {
		return allTransactions.slice(0, 3);
	}, [allTransactions]);

	return (
		<View>
			<View className="flex justify-between items-center gap-2.5 mt-4">
				<Text className="font-arame-mono font-normal text-base text-textWhite leading-4 uppercase ">Last Transactions</Text>
				{transactions.length !== 0 && (
					<Text
						className="cursor-pointer font-arame-mono font-normal text-base text-textPrimary leading-4 uppercase flex"
						onPress={() => setOpen(true)}
					>
						See all
						{/* <IoIosArrowForward className="pl-1" /> */}
					</Text>
				)}
			</View>
			<View className="mt-[1.2rem] flex flex-col gap-[0.7rem]">
				{transactions.length === 0 && <Text className="center text-textSecondary">No transactions yet</Text>}
				{transactions.map((item, i) => (
					<Row _id={item._id} key={i} />
				))}
			</View>
			{/* {open && <TransactionsModal setOpenModal={setOpen} />} */}
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
			<View className="rounded-2xl transition-all duration-100 ease-in-out bg-bgDark px-4 py-6 my-1">
				<View className="flex items-center gap-4 cursor-pointer" onPress={() => setOpen(!open)}>
					{/* Chevron Icon to open and close the transaction details */}
					<View
						className={`flex-shrink-0 relative w-12 h-12 rounded-lg flex justify-center items-center ${
							open ? "bg-gradientSecondary" : "bg-bgSecondary"
						}`}
					>
						{/* {open ? (
							<IoChevronUpOutline className="text-buttonPrimaryLight w-5 h-5" />
						) : (
							<IoChevronDownOutline className="text-buttonPrimaryLight w-5 h-5" />
						)} */}
					</View>

					{/* Vault Name and Retry Button */}
					<View className="flex-grow flex flex-col">
						<View className="flex items-center gap-1.5">
							<Text className={`font-league-spartan font-medium text-lg leading-6 text-textWhite`}>{farm.name}</Text>
							{tx.steps.some((item) => item.status === TransactionStepStatus.FAILED) && (
								<Pressable
									className="border border-red-500 rounded-md 
                                            px-1 py-0.5 bg-transparent 
                                            flex items-center gap-0.5 
                                            text-red-500 text-[0.8rem] cursor-pointer"
									onPress={retryTransaction}
								>
									{/* <CiRepeat /> Retry */}
								</Pressable>
							)}
							{/* Tooltip for transaction details */}
							{showExtraInfo && (
								<View className="group relative pb-1">
									{/* <IoInformationCircle className="text-xl text-textSecondary cursor-help" onClick={(e) => e.stopPropagation()} /> */}
									<View className="absolute bottom-full left-1/2 translate-x-0 mb-2 px-4 py-2 bg-bgSecondary rounded-lg text-sm text-textWhite w-72 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
										<View className="flex flex-col justify-end gap-2">
											<View className="flex justify-between items-start">
												<Text className="text-textSecondary">{type === "deposit" ? "Zap In Amount:" : "Vault Shares:"}</Text>
												<View className="flex flex-col items-end">
													<Text className="text-base">
														$ {""}
														{formatCurrency(
															Number(formatUnits(BigInt(amountInWei || "0"), 18)) *
																(type === "deposit"
																	? tokenPrice || prices[farm.chainId][token]
																	: vaultPrice || prices[farm.chainId][farm.vault_addr])
														)}
													</Text>
													<Text className="text-xs text-textSecondary">
														{formatCurrency(formatUnits(BigInt(amountInWei || "0"), 18))}{" "}
														{type === "deposit" ? tokenNamesAndImages[token].name : "BTX-" + farm.name}
													</Text>
												</View>
											</View>

											{fee !== undefined && (
												<View className="flex justify-between items-start">
													<Text className="text-textSecondary">BeraTrax Fee:</Text>
													<View className="flex flex-col items-end">
														<Text className="text-base">
															$
															{formatCurrency(
																Number(toEth(BigInt(fee), decimals[farm.chainId][token])) * (tokenPrice || prices[farm.chainId][token])
															)}
														</Text>
														<Text className="text-xs text-textSecondary">
															{formatCurrency(toEth(BigInt(fee), decimals[farm.chainId][token]))} {tokenNamesAndImages[token].name}
														</Text>
													</View>
												</View>
											)}

											{actualSlippage !== undefined && (
												<View className="flex justify-between items-start">
													<Text className="text-textSecondary">Slippage:</Text>
													<View className="flex flex-col items-end">
														<Text className="text-base">$ {formatCurrency(actualSlippage)}</Text>
														<Text className="text-xs text-textSecondary">
															{formatCurrency(actualSlippage / (tokenPrice || prices[farm.chainId][token]))}{" "}
															{tokenNamesAndImages[tx.token].name}
														</Text>
													</View>
												</View>
											)}

											{filteredReturnedAssets.length > 0 && (
												<View className="mt-2">
													<Text className="text-textSecondary block mb-1">Returned:</Text>
													{filteredReturnedAssets.map((asset, index) => (
														<View key={index} className="flex justify-between items-start pl-2">
															<Text>{tokenNamesAndImages[asset.token as Address]?.name || "Unknown"}</Text>
															<View className="flex flex-col items-end">
																<Text className="text-base">
																	$
																	{formatCurrency(
																		Number(toEth(BigInt(asset.amount), 18)) * (tokenPrice || prices[farm.chainId][asset.token as Address])
																	)}
																</Text>
																<Text className="text-xs text-textSecondary">
																	{Number(formatUnits(BigInt(asset.amount), 18)).toLocaleString()}{" "}
																	{tokenNamesAndImages[asset.token as Address]?.name || "Unknown"}
																</Text>
															</View>
														</View>
													))}
												</View>
											)}

											{vaultShares !== undefined && (
												<View className="flex justify-between items-start">
													<Text className="text-textSecondary">{type === "deposit" ? "Vault Shares:" : "Zap Out Amount:"}</Text>
													<View className="flex flex-col items-end">
														<Text className="text-base">
															${" "}
															{type === "deposit"
																? formatCurrency(
																		Number(toEth(BigInt(vaultShares), decimals[farm.chainId][farm.vault_addr])) *
																			(vaultPrice || prices[farm.chainId][farm.vault_addr]),
																		4
																	)
																: formatCurrency(
																		Number(toEth(BigInt(netAmount || "0"), decimals[farm.chainId][token])) *
																			(tokenPrice || prices[farm.chainId][token]),
																		4
																	)}
														</Text>
														<Text className="text-xs text-textSecondary">
															{type === "deposit"
																? formatCurrency(Number(toEth(BigInt(vaultShares), decimals[farm.chainId][farm.vault_addr])))
																: formatCurrency(Number(toEth(BigInt(netAmount || "0"), decimals[farm.chainId][token])))}{" "}
															{type === "deposit" ? "BTX-" + farm.name : tokenNamesAndImages[token].name}
														</Text>
													</View>
												</View>
											)}
										</View>
									</View>
								</View>
							)}
							{!tx.steps.some((item) => item.status === TransactionStepStatus.FAILED) && (
								<View className="group relative pl-1 pb-1">
									{/* <FaExternalLinkAlt
										className="text-textSecondary cursor-pointer"
										onClick={(e) => {
											e.stopPropagation();
											window.open(`${blockExplorersByChainId[chainId]}/tx/${tx.steps[tx.steps.length - 1].txHash}`, "_blank");
										}}
									/> */}
									<View className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2 bg-bgSecondary rounded-lg text-sm text-textWhite w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
										View transaction on explorer
									</View>
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
				</View>
				{/* <TransactionDetails transactionId={_id} open={open} farm={undefined} tx={undefined} /> */}
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
			onWheel={(e) => {
				if (fetchedAll) return;
				let ele: Element = e.currentTarget as Element;
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
						<View className="center">
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
