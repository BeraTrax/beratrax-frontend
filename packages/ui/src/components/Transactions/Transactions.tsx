import pools_json, { tokenNamesAndImages } from "@beratrax/core/src/config/constants/pools_json";
import { useAppDispatch, useAppSelector } from "@beratrax/core/src/state";
import { useZapIn, useZapOut } from "@beratrax/core/src/state/farms/hooks";
import useTokens from "@beratrax/core/src/state/tokens/useTokens";
import { deleteTransactionDb } from "@beratrax/core/src/state/transactions/transactionsReducer";
import { Transaction, TransactionStepStatus } from "@beratrax/core/src/state/transactions/types";
import useTransactions from "@beratrax/core/src/state/transactions/useTransactions";
import { useFarmTransactions } from "@beratrax/core/src/state/transactions/useFarmTransactions";
import { formatCurrency, toEth } from "@beratrax/core/src/utils/common";
import moment from "moment";
import { FC, useMemo, useRef, useState, useCallback, memo } from "react";
import { Address, formatUnits } from "viem";
import { useChainId } from "wagmi";
import { View, Text, Pressable, Modal, Platform, GestureResponderEvent, FlatList, TouchableOpacity } from "react-native";
import { ModalLayout } from "../modals/ModalLayout/ModalLayout";
import TransactionDetails from "../Transactions/components/TransactionDetail/TransactionDetail";
import { InfoCircleIcon } from "../../icons/InfoCircle";
import { ChevronDownIcon } from "../../icons/ChevronDown";
import { ChevronUpIcon } from "../../icons/ChevronUp";
import Colors from "@beratrax/typescript-config/Colors";
import { BlurView } from "expo-blur";

interface TransactionProps {
	farmId?: number;
}

export const Transactions: FC<TransactionProps> = ({ farmId }) => {
	const [open, setOpen] = useState(false);
	const { data: transactions, isLoading } = useFarmTransactions(farmId, 3);

	const SeeAllButton = memo(({ onPress }: { onPress: () => void }) => {
		const buttonContent = useMemo(
			() => (
				<TouchableOpacity onPress={onPress} className="flex flex-row items-center">
					<Text className="font-arame-mono font-normal text-base text-textPrimary leading-4 uppercase">See all</Text>
					<ChevronDownIcon stroke={Colors.gradientLight} strokeWidth={3} />
				</TouchableOpacity>
			),
			[onPress]
		);

		return buttonContent;
	});

	const handleSeeAllPress = useCallback(() => {
		setOpen(true);
	}, []);

	const renderItem = useCallback(({ item }: { item: Transaction }) => <Row tx={item} />, []);

	const ListEmptyComponent = useCallback(() => <Text className="text-center text-textSecondary">No transactions yet</Text>, []);

	const keyExtractor = useCallback((item: Transaction) => item._id, []);

	const ItemSeparatorComponent = useCallback(() => <View style={{ height: 0.7 }} />, []);

	const contentContainerStyle = useMemo(() => ({ gap: 0.7 }), []);

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
				{transactions.length !== 0 && <SeeAllButton onPress={handleSeeAllPress} />}
			</View>
			<View className="mt-[1.2rem]">
				<FlatList
					data={transactions}
					renderItem={renderItem}
					keyExtractor={keyExtractor}
					ListEmptyComponent={ListEmptyComponent}
					showsVerticalScrollIndicator={false}
					scrollEnabled={false}
					contentContainerStyle={contentContainerStyle}
					ItemSeparatorComponent={ItemSeparatorComponent}
					removeClippedSubviews={true}
					maxToRenderPerBatch={3}
					windowSize={3}
					initialNumToRender={3}
				/>
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

interface TransactionRowProps {
	open: boolean;
	setOpen: (value: boolean) => void;
	farm: any;
	tx: Transaction;
	type: string;
	date: string;
	netAmount: string | undefined;
	amountInWei: string;
	token: Address;
	decimals: any;
	prices: any;
	tokenAmount: number;
	showExtraInfo: boolean;
	tokenPrice: number | undefined;
	vaultPrice: number | undefined;
	vault_addr: string;
	chainId: number;
	retryTransaction: (e: any) => void;
	isMobile: boolean;
}

const TransactionRow = memo(
	({
		open,
		setOpen,
		farm,
		tx,
		type,
		date,
		netAmount,
		amountInWei,
		token,
		decimals,
		prices,
		tokenAmount,
		showExtraInfo,
		tokenPrice,
		vaultPrice,
		vault_addr,
		chainId,
		retryTransaction,
		isMobile,
	}: TransactionRowProps) => {
		const [showTooltipModal, setShowTooltipModal] = useState(false);

		// Memoize event handlers
		const handleModalClose = useCallback(() => {
			setShowTooltipModal(false);
		}, []);

		const handleModalPress = useCallback((e: GestureResponderEvent) => {
			e.stopPropagation();
		}, []);

		const handleInfoPress = useCallback(
			(e: GestureResponderEvent) => {
				e.stopPropagation();
				if (isMobile) {
					setShowTooltipModal(true);
				}
			},
			[isMobile]
		);

		const infoIcon = useMemo(() => <InfoCircleIcon />, []);

		const tooltipContent = useMemo(() => {
			if (!isMobile) {
				return (
					<View className="absolute bottom-full left-1/2 translate-x-0 mb-2 px-4 py-2 bg-[#1A1A1A] rounded-lg text-sm text-textWhite w-72 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
						<View className="flex flex-col justify-end gap-2">
							<TransactionDetailsContent tx={tx} farm={farm} prices={prices} decimals={decimals} isMobile={false} />
						</View>
					</View>
				);
			}
			return null;
		}, [isMobile, tx, farm, prices, decimals]);

		// Memoize the close button component
		const closeButton = useMemo(
			() => (
				<Pressable className="mt-6 py-4 bg-buttonPrimary rounded-lg" onPress={handleModalClose}>
					<Text className="text-center text-white font-medium">Close</Text>
				</Pressable>
			),
			[handleModalClose]
		);

		// Memoize the transaction details content
		const transactionDetails = useMemo(
			() => <TransactionDetailsContent tx={tx} farm={farm} prices={prices} decimals={decimals} isMobile={true} />,
			[tx, farm, prices, decimals]
		);

		// Memoize the modal inner content
		const modalInnerContent = useMemo(
			() => (
				<Pressable className="bg-[#1A1A1A] rounded-t-xl p-6" onPress={handleModalPress}>
					<View className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-6" />
					{transactionDetails}
					{closeButton}
				</Pressable>
			),
			[handleModalPress, transactionDetails, closeButton]
		);

		// Memoize the modal content
		const modalContent = useMemo(
			() => (
				<Modal visible={showTooltipModal} transparent={true} animationType="slide" onRequestClose={handleModalClose}>
					<BlurView intensity={50} tint="dark" className="flex-1 justify-end" experimentalBlurMethod="dimezisBlurView">
						<Pressable className="flex-1 justify-end" onPress={handleModalClose}>
							{modalInnerContent}
						</Pressable>
					</BlurView>
				</Modal>
			),
			[showTooltipModal, handleModalClose, modalInnerContent]
		);

		// Memoize the info button content
		const infoButtonContent = useMemo(
			() => (
				<Pressable onPress={handleInfoPress}>
					{infoIcon}
					{tooltipContent}
				</Pressable>
			),
			[handleInfoPress, infoIcon, tooltipContent]
		);

		// Memoize the extra info section
		const extraInfoSection = useMemo(
			() =>
				showExtraInfo && (
					<View className="group relative pb-1">
						{infoButtonContent}
						{modalContent}
					</View>
				),
			[showExtraInfo, infoButtonContent, modalContent]
		);

		// Memoize the retry button
		const retryButton = useMemo(
			() =>
				tx.steps.some((item) => item.status === TransactionStepStatus.FAILED) && (
					<Pressable
						testID="retry-transaction"
						className="border border-red-500 rounded-md 
							px-1 py-0.5 bg-transparent 
							flex flex-row items-center gap-0.5 
							text-red-500 text-[0.8rem]"
						onPress={retryTransaction}
					>
						<Text className="text-red-500 text-xs">Retry</Text>
					</Pressable>
				),
			[tx.steps, retryTransaction]
		);

		// Memoize the price and balance section
		const priceAndBalance = useMemo(
			() => (
				<View className="flex-shrink-0 flex flex-col items-end">
					<Text className="font-league-spartan font-medium text-lg leading-5 text-textWhite">
						$
						{(
							Number(
								formatUnits(BigInt(type === "withdraw" ? netAmount || amountInWei : netAmount || amountInWei), decimals[chainId][token])
							) *
							(type === "withdraw"
								? showExtraInfo
									? tokenPrice || prices[chainId][token]
									: vaultPrice || prices[chainId][vault_addr]
								: (tokenPrice || prices[chainId][token])!)
						).toLocaleString()}
					</Text>
					<Text className="font-league-spartan font-light text-base text-textSecondary leading-5">
						{netAmount ? Number(formatUnits(BigInt(netAmount), decimals[chainId][token])).toLocaleString() : tokenAmount.toLocaleString()}{" "}
						{tokenNamesAndImages[token].name}
					</Text>
				</View>
			),
			[
				type,
				netAmount,
				amountInWei,
				decimals,
				chainId,
				token,
				showExtraInfo,
				tokenPrice,
				prices,
				vaultPrice,
				vault_addr,
				tokenAmount,
				tokenNamesAndImages,
			]
		);

		// Memoize the chevron icon
		const chevronIcon = useMemo(
			() => (
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
			),
			[open]
		);

		// Memoize the vault name and type section
		const vaultNameAndType = useMemo(
			() => (
				<View className="flex-grow flex flex-col">
					<View className="flex flex-row items-center gap-1.5">
						<Text className={`font-league-spartan font-medium text-lg leading-6 ${type === "deposit" ? "text-green-400" : "text-red-400"}`}>
							{farm.name}
						</Text>
						<Text
							className={`text-xs px-1.5 py-0.5 rounded ${
								type === "deposit" ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"
							}`}
						>
							{type === "deposit" ? "ZAP IN" : "ZAP OUT"}
						</Text>
						{retryButton}
						{extraInfoSection}
					</View>
					<Text className="font-league-spartan font-light text-base text-textSecondary leading-5">{moment(date).fromNow()}</Text>
				</View>
			),
			[type, farm.name, retryButton, extraInfoSection, date]
		);

		// Memoize the entire row content
		const rowContent = useMemo(
			() => (
				<Pressable testID="transaction-row" className="flex flex-row items-center gap-4" onPress={() => setOpen(!open)}>
					{chevronIcon}
					{vaultNameAndType}
					{priceAndBalance}
				</Pressable>
			),
			[open, setOpen, chevronIcon, vaultNameAndType, priceAndBalance]
		);

		return rowContent;
	}
);

const Row: FC<{ tx: Transaction }> = memo(({ tx }) => {
	const farm = useMemo(() => pools_json.find((item) => item.id === tx.farmId), [tx.farmId]);
	const { prices, decimals } = useTokens();
	const [open, setOpen] = useState(false);
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

	const { type, amountInWei, token, vaultPrice, tokenPrice, steps, date, netAmount } = tx;

	let tokenAmount = 0;
	if (type === "deposit") {
		tokenAmount = Number(formatUnits(BigInt(amountInWei), decimals[farm.chainId][token]));
	} else {
		tokenAmount =
			(Number(formatUnits(BigInt(amountInWei), decimals[farm.chainId][farm.vault_addr])) *
				(vaultPrice || prices[farm.chainId][farm.vault_addr])) /
			(tokenPrice || prices[farm.chainId][token]);
	}

	const retryTransaction = useCallback((e: any) => {
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
	}, []);

	const isMobile = useMemo(() => Platform.OS === "android" || Platform.OS === "ios", []);

	return (
		<>
			<View className="rounded-2xl transition-all duration-100 ease-in-out bg-bgDark px-4 py-6 my-1">
				<TransactionRow
					open={open}
					setOpen={setOpen}
					farm={farm}
					tx={tx}
					type={type}
					date={date}
					netAmount={netAmount}
					amountInWei={amountInWei}
					token={token}
					decimals={decimals}
					prices={prices}
					tokenAmount={tokenAmount}
					showExtraInfo={showExtraInfo}
					tokenPrice={tokenPrice}
					vaultPrice={vaultPrice}
					vault_addr={farm.vault_addr}
					chainId={chainId}
					retryTransaction={retryTransaction}
					isMobile={isMobile}
				/>
				{open && <TransactionDetails transactionId={tx._id} open={open} farm={undefined} tx={undefined} />}
			</View>
		</>
	);
});

const TransactionsModal: FC<{ setOpenModal: (value: boolean) => void }> = ({ setOpenModal }) => {
	const transactions = useAppSelector((state) => state.transactions.transactions);
	const { fetchTransactions, isLoading, fetchedAll } = useTransactions();
	const timeout = useRef<NodeJS.Timeout>();

	const handleEndReached = useCallback(() => {
		if (fetchedAll || isLoading) return;

		clearTimeout(timeout.current);
		timeout.current = setTimeout(() => {
			fetchTransactions();
		}, 1000);
	}, [fetchedAll, isLoading, fetchTransactions]);

	const renderItem = useCallback(({ item }: { item: Transaction }) => <Row tx={item} />, []);

	const renderFooter = useCallback(() => {
		if (!isLoading) return null;

		return (
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
		);
	}, [isLoading]);

	const keyExtractor = useCallback((item: Transaction) => item._id, []);

	const ItemSeparatorComponent = useCallback(() => <View style={{ height: 0.7 }} />, []);

	const contentContainerStyle = useMemo(() => ({ gap: 0.7 }), []);

	return (
		<ModalLayout onClose={() => setOpenModal(false)} wrapperClassName="w-[90vw] max-w-[500px] h-[60vh] mx-4 my-8">
			<Text className="text-[1.5rem] font-bold text-textWhite mb-[1.2rem] font-arame-mono">Transactions</Text>
			<FlatList
				data={transactions}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				onEndReached={handleEndReached}
				onEndReachedThreshold={0.5}
				ListFooterComponent={renderFooter}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={contentContainerStyle}
				ItemSeparatorComponent={ItemSeparatorComponent}
				removeClippedSubviews={true}
				maxToRenderPerBatch={10}
				windowSize={5}
				initialNumToRender={10}
			/>
		</ModalLayout>
	);
};
