import pools_json, { tokenNamesAndImages } from "@beratrax/core/src/config/constants/pools_json";
import { blockExplorersByChainId } from "@beratrax/core/src/config/constants/urls";
import { useAppDispatch, useAppSelector } from "@beratrax/core/src/state";
import { useZapIn, useZapOut } from "@beratrax/core/src/state/farms/hooks";
import useTokens from "@beratrax/core/src/state/tokens/useTokens";
import { deleteTransactionDb } from "@beratrax/core/src/state/transactions/transactionsReducer";
import { Transaction, TransactionStepStatus } from "@beratrax/core/src/state/transactions/types";
import useTransactions from "@beratrax/core/src/state/transactions/useTransactions";
import { useFarmTransactions } from "@beratrax/core/src/state/transactions/useFarmTransactions";
import { formatCurrency, toEth } from "@beratrax/core/src/utils/common";
import moment from "moment";
import { FC, useMemo, useRef, useState } from "react";
import { Address, formatUnits } from "viem";
import { useChainId } from "wagmi";
import { View, Text, Pressable, Linking, Modal, Platform, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { ModalLayout } from "../modals/ModalLayout/ModalLayout";
import TransactionDetails from "../Transactions/components/TransactionDetail/TransactionDetail";
import { InfoCircleIcon } from "../../icons/InfoCircle";
import { ChevronDownIcon } from "../../icons/ChevronDown";
import { ChevronUpIcon } from "../../icons/ChevronUp";
import { ExternalLinkIcon } from "../../icons/ExternalLInk";
import Colors from "@beratrax/typescript-config/Colors";

interface TransactionProps {
	farmId?: number;
}

export const Transactions: FC<TransactionProps> = ({ farmId }) => {
	const [open, setOpen] = useState(false);
	const { data: transactions, isLoading } = useFarmTransactions(farmId, 3);

	if (isLoading || !transactions) {
		return (
			<View className="center text-textWhite">
				<Text className="text-textWhite">Loading transactions...</Text>
			</View>
		);
	}

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
					<Row tx={item} key={i} />
				))}
			</View>
			{open && <TransactionsModal setOpenModal={setOpen} />}
		</View>
	);
};

const TransactionDetailsContent: FC<{
	tx: any;
	farm: any;
	prices: any;
	decimals: any;
	isMobile?: boolean;
}> = ({ tx, farm, prices, decimals, isMobile = false }) => {
	const { type, amountInWei, token, vaultPrice, tokenPrice, netAmount, actualSlippage, fee, returnedAssets, vaultShares } = tx;

	const filteredReturnedAssets = useMemo(() => {
		if (!returnedAssets) return [];
		return returnedAssets.filter((asset: any) => Number(asset.amount) > 0);
	}, [returnedAssets]);

	const showExtraInfo = useMemo(() => {
		return !!vaultShares;
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

	// Text size classes for mobile vs web
	const labelClass = isMobile ? "text-sm" : "text-xs";
	const valueClass = isMobile ? "text-base" : "text-sm";
	const sectionClass = isMobile ? "p-4 bg-[#2A2A2A] rounded-lg mb-4" : "bg-[#2A2A2A] p-2 rounded-lg";
	const detailItemClass = isMobile ? "mb-3" : "";
	const assetItemClass = isMobile ? "pl-4 mb-2" : "pl-2";

	return (
		<>
			{isMobile && (
				<Text className="text-textWhite text-xl font-bold mb-4 text-center">
					{farm.name} - {type === "deposit" ? "Deposit" : "Withdraw"}
				</Text>
			)}

			{/* Main Amount - Zap In/Out */}
			<View className={sectionClass}>
				<Text className={`text-textSecondary ${labelClass}`}>{type === "deposit" ? "Zap In Amount:" : "Zap Out Amount:"}</Text>
				<View className="flex flex-col items-end">
					<Text className={`${isMobile ? "text-base" : "text-sm"} font-bold text-buttonPrimaryLight`}>
						$ {""}
						{formatCurrency(
							Number(formatUnits(BigInt(amountInWei || "0"), 18)) *
								(type === "deposit" ? tokenPrice || prices[farm.chainId][token] : vaultPrice || prices[farm.chainId][farm.vault_addr])
						)}
					</Text>
					<Text className={`${isMobile ? "text-sm" : "text-xs"} text-textSecondary`}>
						{formatCurrency(tokenAmount)} {tokenNamesAndImages[token].name}
					</Text>
				</View>
			</View>

			{/* Zap Out Amount Received */}
			{type === "withdraw" && (
				<View className={`flex flex-row justify-between items-start ${isMobile ? "p-4 bg-[#2A2A2A] rounded-lg mb-4" : ""}`}>
					<Text className={`text-textSecondary ${labelClass}`}>Net Received:</Text>
					<View className="flex flex-col items-end">
						<Text className={`${valueClass} text-textWhite`}>
							${" "}
							{formatCurrency(
								Number(formatUnits(BigInt(netAmount || amountInWei), decimals[farm.chainId][token])) *
									(showExtraInfo ? tokenPrice || prices[farm.chainId][token] : vaultPrice || prices[farm.chainId][farm.vault_addr])
							)}
						</Text>
						<Text className={`${isMobile ? "text-sm" : "text-xs"} text-textSecondary`}>
							{formatCurrency(Number(formatUnits(BigInt(netAmount || amountInWei), decimals[farm.chainId][token])))}{" "}
							{tokenNamesAndImages[token].name}
						</Text>
					</View>
				</View>
			)}

			{/* LP Received */}
			{tx.vaultShares !== undefined && (
				<View className={`flex flex-row justify-between items-start ${isMobile ? "p-4 bg-[#2A2A2A] rounded-lg mb-4" : ""}`}>
					<Text className={`text-textSecondary ${labelClass}`}>LP Received:</Text>
					<View className="flex flex-col items-end">
						<Text className={`${valueClass} text-textWhite`}>
							$ {formatCurrency(Number(toEth(BigInt(tx.vaultShares), decimals[farm.chainId][farm.lp_address])) * (vaultPrice || 0))}
						</Text>
						<Text className={`${isMobile ? "text-sm" : "text-xs"} text-textSecondary`}>
							{formatCurrency(Number(toEth(BigInt(tx.vaultShares), decimals[farm.chainId][farm.lp_address])))} {farm.name}
						</Text>
					</View>
				</View>
			)}

			{/* LP Price */}
			<View className={`flex flex-row justify-between items-start ${isMobile ? "p-4 bg-[#2A2A2A] rounded-lg mb-4" : ""}`}>
				<Text className={`text-textSecondary ${labelClass}`}>LP Price:</Text>
				<View className="flex flex-col items-end">
					<Text className={`${valueClass} text-textWhite`}>$ {formatCurrency(vaultPrice || 0)}</Text>
				</View>
			</View>

			{/* Additional Details Section */}
			<View className={`mt-${isMobile ? "4" : "2"} pt-${isMobile ? "4" : "2"} border-t border-gray-700`}>
				{isMobile && <Text className="text-lg font-medium text-textWhite mb-3">Additional Details</Text>}

				{fee !== undefined && (
					<View className={`flex flex-row justify-between items-start ${detailItemClass}`}>
						<Text className={`text-textSecondary ${labelClass}`}>BeraTrax Fee:</Text>
						<View className="flex flex-col items-end">
							<Text className={`${isMobile ? "text-sm" : "text-xs"} text-textSecondary`}>
								${formatCurrency(Number(toEth(BigInt(fee), decimals[farm.chainId][token])) * (tokenPrice || prices[farm.chainId][token]))}
							</Text>
							<Text className={`${isMobile ? "text-sm" : "text-xs"} text-textSecondary`}>
								{formatCurrency(toEth(BigInt(fee), decimals[farm.chainId][token]))} {tokenNamesAndImages[token].name}
							</Text>
						</View>
					</View>
				)}

				{/* Slippage */}
				{actualSlippage !== undefined && (
					<View className={`flex flex-row justify-between items-start ${detailItemClass}`}>
						<Text className={`text-textSecondary ${labelClass}`}>Swap Slippage:</Text>
						<View className="flex flex-col items-end">
							<Text className={`${isMobile ? "text-sm" : "text-xs"} text-textSecondary`}>$ {formatCurrency(actualSlippage)}</Text>
							<Text className={`${isMobile ? "text-sm" : "text-xs"} text-textSecondary`}>
								{formatCurrency(actualSlippage / (tokenPrice || prices[farm.chainId][token]))} {tokenNamesAndImages[tx.token].name}
							</Text>
						</View>
					</View>
				)}

				{/* Returned Assets */}
				{filteredReturnedAssets.length > 0 && (
					<View className={`mt-${isMobile ? "3" : "2"}`}>
						<Text className={`text-textSecondary ${isMobile ? "text-base mb-2" : "text-xs block mb-1"}`}>Returned:</Text>
						{filteredReturnedAssets.map((asset: any, index: number) => (
							<View key={index} className={`flex ${isMobile ? "flex-row" : ""} justify-between items-start ${assetItemClass}`}>
								<Text className={`text-textSecondary ${labelClass}`}>
									- {tokenNamesAndImages[asset.token as Address]?.name || "Unknown"}
								</Text>
								<View className="flex flex-col items-end">
									<Text className={`${isMobile ? "text-sm" : "text-xs"} text-textSecondary`}>
										$
										{formatCurrency(Number(toEth(BigInt(asset.amount), 18)) * (tokenPrice || prices[farm.chainId][asset.token as Address]))}
									</Text>
									<Text className={`${isMobile ? "text-sm" : "text-xs"} text-textSecondary`}>
										{Number(formatUnits(BigInt(asset.amount), 18)).toLocaleString()}{" "}
										{tokenNamesAndImages[asset.token as Address]?.name || "Unknown"}
									</Text>
								</View>
							</View>
						))}
					</View>
				)}
			</View>
		</>
	);
};

const Row: FC<{ tx: Transaction }> = ({ tx }) => {
	const farm = useMemo(() => pools_json.find((item) => item.id === tx.farmId), [tx.farmId]);
	const { prices, decimals } = useTokens();
	const [open, setOpen] = useState(false);
	const [showTooltipModal, setShowTooltipModal] = useState(false);
	const dispatch = useAppDispatch();
	const { zapIn } = useZapIn(farm || ({} as any));
	const { zapOut } = useZapOut(farm || ({} as any));
	const chainId = useChainId();

	// Initialize showExtraInfo with a default value
	const showExtraInfo = useMemo(() => {
		if (!tx || !tx.vaultShares) return false;
		return true;
	}, [tx]);

	if (!farm || !tx) return null;

	const { type, amountInWei, token, vaultPrice, tokenPrice, steps, date, netAmount, vaultShares } = tx;

	let tokenAmount = 0;
	if (type === "deposit") {
		tokenAmount = Number(formatUnits(BigInt(amountInWei), decimals[farm.chainId][token]));
	} else {
		tokenAmount =
			(Number(formatUnits(BigInt(amountInWei), decimals[farm.chainId][farm.vault_addr])) *
				(vaultPrice || prices[farm.chainId][farm.vault_addr])) /
			(tokenPrice || prices[farm.chainId][token]);
	}

	// const status = useMemo(() => {
	// 	if (steps.every((step) => step.status === TransactionStepStatus.COMPLETED)) return TransactionStatus.SUCCESS;
	// 	if (steps.some((step) => step.status === TransactionStepStatus.FAILED)) return TransactionStatus.FAILED;
	// 	if (steps.some((step) => step.status === TransactionStepStatus.IN_PROGRESS)) return TransactionStatus.PENDING;
	// 	return TransactionStatus.INTERRUPTED;
	// }, [steps]);

	const retryTransaction = (e: any) => {
		e.stopPropagation();
		dispatch(deleteTransactionDb(tx._id));
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

	const isMobile = Platform.OS === "android" || Platform.OS === "ios";

	return (
		<>
			<View className="rounded-2xl transition-all duration-100 ease-in-out bg-bgDark px-4 py-6 my-1">
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
							<Text
								className={`font-league-spartan font-medium text-lg leading-6 ${type === "deposit" ? "text-green-400" : "text-red-400"}`}
							>
								{farm.name}
							</Text>
							<Text
								className={`text-xs px-1.5 py-0.5 rounded ${
									type === "deposit" ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"
								}`}
							>
								{type === "deposit" ? "ZAP IN" : "ZAP OUT"}
							</Text>
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
									<Pressable
										onPress={(e) => {
											e.stopPropagation();
											if (isMobile) {
												setShowTooltipModal(true);
											}
										}}
									>
										<InfoCircleIcon />
										{!isMobile && (
											<View className="absolute bottom-full left-1/2 translate-x-0 mb-2 px-4 py-2 bg-[#1A1A1A] rounded-lg text-sm text-textWhite w-72 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
												<View className="flex flex-col justify-end gap-2">
													<TransactionDetailsContent tx={tx} farm={farm} prices={prices} decimals={decimals} isMobile={false} />
												</View>
											</View>
										)}
									</Pressable>

									{/* Mobile modal tooltip */}
									<Modal
										visible={showTooltipModal}
										transparent={true}
										animationType="slide"
										onRequestClose={() => setShowTooltipModal(false)}
									>
										<Pressable className="flex-1 bg-black/50 justify-end" onPress={() => setShowTooltipModal(false)}>
											<Pressable className="bg-[#1A1A1A] rounded-t-xl p-6" onPress={(e) => e.stopPropagation()}>
												<View className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-6" />

												<TransactionDetailsContent tx={tx} farm={farm} prices={prices} decimals={decimals} isMobile={true} />

												<Pressable className="mt-6 py-4 bg-buttonPrimary rounded-lg" onPress={() => setShowTooltipModal(false)}>
													<Text className="text-center text-white font-medium">Close</Text>
												</Pressable>
											</Pressable>
										</Pressable>
									</Modal>
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

				{open && <TransactionDetails transactionId={tx._id} open={open} farm={undefined} tx={undefined} />}
			</View>
		</>
	);
};

const TransactionsModal: FC<{ setOpenModal: (value: boolean) => void }> = ({ setOpenModal }) => {
	const transactions = useAppSelector((state) => state.transactions.transactions);
	const { fetchTransactions, isLoading, fetchedAll } = useTransactions();
	const timeout = useRef<NodeJS.Timeout>();

	const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		if (fetchedAll) return;
		const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
		const paddingToBottom = 60;
		const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

		if (isCloseToBottom && !isLoading) {
			clearTimeout(timeout.current);
			timeout.current = setTimeout(() => {
				fetchTransactions();
			}, 1000);
		}
	};

	return (
		<ModalLayout onClose={() => setOpenModal(false)} wrapperClassName="w-[90vw] max-w-[500px] h-[60vh] mx-4 my-8">
			<Text className="text-[1.5rem] font-bold text-textWhite mb-[1.2rem] font-arame-mono">Transactions</Text>
			<ScrollView className="flex-1" showsVerticalScrollIndicator={false} onScroll={handleScroll} scrollEventThrottle={400}>
				<View className="flex flex-col gap-[0.7rem] pb-4">
					{transactions.map((item, i) => (
						<Row key={i} tx={item} />
					))}
					{isLoading && (
						<View className="flex justify-center items-center py-4">
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
			</ScrollView>
		</ModalLayout>
	);
};
