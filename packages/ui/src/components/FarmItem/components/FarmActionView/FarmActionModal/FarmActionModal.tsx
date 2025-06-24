import Closemodalicon from "@beratrax/core/src/assets/images/closemodalicon.svg";
import Exchange from "@beratrax/core/src/assets/images/exchange.svg";
import { FarmTransactionType } from "@beratrax/core/src/types/enums";
import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import DialPad from "ui/src/components/Dialpad/Dialpad";
import MobileModalContainer from "ui/src/components/MobileModalContainer/MobileModalContainer";
import Select from "ui/src/components/Select/Select";
import { PoolDef, tokenNamesAndImages } from "@beratrax/core/src/config/constants/pools_json";
import { useWindowSize } from "@beratrax/core/src/hooks";
import { useDetailInput } from "@beratrax/core/src/hooks/useDetailInput";
import useWallet from "@beratrax/core/src/hooks/useWallet";
import { useAppDispatch, useAppSelector } from "@beratrax/core/src/state";
import { updatePoints } from "@beratrax/core/src/state/account/accountReducer";
import { setFarmDetailInputOptions } from "@beratrax/core/src/state/farms/farmsReducer";
import { useFarmDetails } from "@beratrax/core/src/state/farms/hooks";
import { FarmDetailInputOptions } from "@beratrax/core/src/state/farms/types";
import useTokens from "@beratrax/core/src/state/tokens/useTokens";
import { addTransactionDb } from "@beratrax/core/src/state/transactions/transactionsReducer";
import {
	ApproveZapStep,
	StakeIntoRewardVaultStep,
	TransactionStep,
	TransactionStepStatus,
	TransactionTypes,
	WithdrawFromRewardVaultStep,
	ZapInStep,
} from "@beratrax/core/src/state/transactions/types";
import { noExponents, toWei } from "@beratrax/core/src/utils/common";
import CurrencyInput from "react-currency-input-field";
import { Link, useRouter } from "expo-router";
import { ConfirmWithdraw } from "ui/src/components/modals/ConfirmWithdraw/ConfirmWithdraw";
import { OneTimeZapping } from "ui/src/components/modals/OneTimeZapping/OneTimeZapping";
import { SlippageNotCalculate } from "ui/src/components/modals/SlippageNotCalculate/SlippageNotCalculate";
import { SlippageWarning } from "ui/src/components/modals/SlippageWarning/SlippageWarning";
import { Skeleton } from "ui/src/components/Skeleton/Skeleton";
import ConfirmFarmActionModal from "ui/src/components/FarmItem/components/FarmActionView/ConfirmFarmActionModal/ConfirmFarmActionModal";
import FarmDetailsStyles from "./FarmActionModal.module.css"; //deliberate need to add this, tailwind, or inline styling wasn't working
import { Text, Pressable, View } from "react-native";
import { SvgImage } from "@beratrax/ui/src/components/SvgImage/SvgImage";

interface FarmActionModalProps {
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	farm: PoolDef;
}
type QuickDepositType = "25" | "50" | "75" | "MAX" | "";

const QuickDepositButtons = memo(
	({ text, onClick, isSelected, extraText = "" }: { text: string; onClick: () => void; isSelected?: boolean; extraText?: string }) => {
		const isMax = text === "MAX";

		const buttonClasses = useMemo(
			() => `px-5 py-2 rounded-2xl items-center justify-center ${isMax ? "bg-lime-500" : isSelected ? "bg-gradientSecondary" : ""}`,
			[isMax, isSelected]
		);

		const textClasses = useMemo(() => `text-base font-light ${isMax ? "text-black" : "text-white"}`, []);

		const handlePress = useCallback(() => {
			onClick();
		}, []);

		const ButtonText = useMemo(
			() => (
				<Text className={textClasses}>
					{text}
					{isMax ? "" : extraText}
				</Text>
			),
			[]
		);

		return (
			<Pressable onPress={handlePress} className={buttonClasses}>
				{ButtonText}
			</Pressable>
		);
	}
);

const closeButtonStyle = {
	position: "absolute",
	top: 0,
	right: 0,
	padding: 10,
	zIndex: 10,
} as const;

const ExchangeButton = memo(({ onPress }: { onPress: () => void }) => {
	const ExchangeIcon = useMemo(
		() => (
			<View className="cursor-pointer">
				<SvgImage source={Exchange} height={30} width={30} />
			</View>
		),
		[]
	);

	return <Pressable onPress={onPress}>{ExchangeIcon}</Pressable>;
});

const DepositButton = memo(
	({
		onPress,
		disabled,
		amount,
		maxBalance,
		fetchingSlippage,
		isLoadingTransaction,
		currentWallet,
		transactionType,
	}: {
		onPress: () => void;
		disabled: boolean;
		amount: string;
		maxBalance: string;
		fetchingSlippage: boolean;
		isLoadingTransaction: boolean;
		currentWallet: `0x${string}` | undefined;
		transactionType: FarmTransactionType;
	}) => {
		const buttonText = useMemo(() => {
			if (!currentWallet) return "Please Login";
			if (parseFloat(amount) > 0) {
				if (parseFloat(amount) > parseFloat(maxBalance)) return "Insufficent Balance";
				if (fetchingSlippage) return "Simulating...";
				if (isLoadingTransaction) return "Loading...";
				return transactionType === FarmTransactionType.Deposit ? "Deposit" : "Withdraw";
			}
			return "Enter Amount";
		}, [currentWallet, amount, maxBalance, fetchingSlippage, isLoadingTransaction, transactionType]);

		const buttonClasses = useMemo(
			() =>
				`lg:max-w-64 mt-4 uppercase ${
					disabled ? "bg-buttonDisabled cursor-not-allowed" : "bg-buttonPrimaryLight"
				} text-textBlack w-full py-5 px-4 text-xl font-bold tracking-widest rounded-[40px]`,
			[disabled]
		);

		const ButtonText = useMemo(
			() => (
				<Text disabled={disabled} className={buttonClasses}>
					{buttonText}
				</Text>
			),
			[disabled, buttonClasses, buttonText]
		);

		return <Pressable onPress={onPress}>{ButtonText}</Pressable>;
	}
);

const FarmActionModal = ({ open, setOpen, farm }: FarmActionModalProps) => {
	const { disableZapWarning } = useAppSelector((state) => state.account);
	const [confirmDeposit, setConfirmDeposit] = useState<boolean>();
	const { farmDetails } = useFarmDetails();
	const [txId, setTxId] = useState("");
	const [showSlippageModal, setShowSlippageModal] = useState(false);
	const [showOneTimeZappingModal, setShowOneTimeZappingModal] = useState(false);
	const [shownOneTimeZappingModal, setShownOneTimeZappingModal] = useState(disableZapWarning);
	const [showNotSlipageModal, setShowNotSlipageModal] = useState(false);
	const [showConfirmWithdrawModal, setShowConfirmWithdrawModal] = useState<boolean>(false);
	const [withdrawModalShown, setWithdrawModalShown] = useState<boolean>(false);
	const [cursorPosition, setCursorPosition] = useState<number | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const { decimals, balances } = useTokens();
	const { width } = useWindowSize();
	const farmData = farmDetails[farm.id];
	const { getClients } = useWallet();
	const { transactionType, currencySymbol } = useAppSelector((state) => state.farms.farmDetailInputOptions);
	const dispatch = useAppDispatch();
	const router = useRouter();

	const {
		amount,
		toggleAmount,
		showInUsd,
		currentWallet,
		maxBalance,
		setMax,
		handleInput,
		withdrawable,
		depositable,
		getTokenAmount,
		handleSubmit,
		fetchingSlippage,
		handleToggleShowInUsdc,
		isLoadingFarm,
		max,
		slippage,
		isLoadingTransaction,
	} = useDetailInput(farm);

	const noOrMaxInputValue = useMemo(() => {
		if (parseFloat(amount) <= 0 || isNaN(parseFloat(amount)) || parseFloat(amount) > parseFloat(maxBalance)) return true;
		return false;
	}, [amount]);

	const selectOptions = useMemo(
		() =>
			transactionType === FarmTransactionType.Deposit
				? farmData?.depositableAmounts.map((_) => _.tokenSymbol)
				: farmData?.withdrawableAmounts.map((_) => _.tokenSymbol) || [],
		[transactionType, farmData]
	);

	const selectImages = useMemo(() => {
		if (!farmData) return {};
		const result: Record<string, string[]> = {};

		if (transactionType === FarmTransactionType.Deposit) {
			farmData.depositableAmounts.forEach((amount) => {
				if (amount.tokenAddress && tokenNamesAndImages[amount.tokenAddress]) {
					result[tokenNamesAndImages[amount.tokenAddress].name] = tokenNamesAndImages[amount.tokenAddress].logos;
				}
			});
		} else {
			farmData.withdrawableAmounts.forEach((amount) => {
				if (amount.tokenAddress && tokenNamesAndImages[amount.tokenAddress]) {
					result[tokenNamesAndImages[amount.tokenAddress].name] = tokenNamesAndImages[amount.tokenAddress].logos;
				}
			});
		}

		return result;
	}, [farmData, transactionType, tokenNamesAndImages]);

	const isAutoCompounding = useMemo(() => {
		if (transactionType === FarmTransactionType.Deposit) return true;
		return false;
	}, [farm, transactionType]);

	const handleConfirm = useCallback(() => {
		setConfirmDeposit(true);
		(async () => {
			const amount = getTokenAmount();
			let amountInWei = toWei(
				amount,
				decimals[farm.chainId][transactionType === FarmTransactionType.Deposit ? depositable!.tokenAddress : withdrawable!.tokenAddress]
			);

			let steps: TransactionStep[] = [];

			// approve zap for non-native tokens
			const vaultBalance =
				BigInt(balances[farm.chainId][farm.vault_addr].valueWei) - BigInt(balances[farm.chainId][farm.vault_addr].valueRewardVaultWei || 0);
			if (transactionType === FarmTransactionType.Withdraw || currencySymbol !== "BERA") {
				steps.push({
					status: TransactionStepStatus.PENDING,
					type: TransactionTypes.APPROVE_ZAP,
					amount: amountInWei.toString(),
				} as ApproveZapStep);
			}
			steps.push({
				status: TransactionStepStatus.PENDING,
				type: transactionType === FarmTransactionType.Deposit ? TransactionTypes.ZAP_IN : TransactionTypes.ZAP_OUT,
				amount: amountInWei.toString(),
			} as ZapInStep);
			const dbTx = await dispatch(
				addTransactionDb({
					from: currentWallet!,
					amountInWei: amountInWei.toString(),
					date: new Date().toString(),
					type: transactionType === FarmTransactionType.Deposit ? "deposit" : "withdraw",
					farmId: farm.id,
					max: !!max,
					token: transactionType === FarmTransactionType.Deposit ? depositable!.tokenAddress : withdrawable!.tokenAddress,
					steps,
				})
			);
			const id = dbTx.payload._id;
			setTxId(id);
			await handleSubmit({ txId: id });
			await dispatch(updatePoints(currentWallet!));
		})();
	}, [
		getTokenAmount,
		decimals,
		farm.chainId,
		transactionType,
		depositable,
		withdrawable,
		balances,
		farm.vault_addr,
		currencySymbol,
		dispatch,
		currentWallet,
		max,
		farm.id,
		handleSubmit,
	]);

	const handleToggleModal = useCallback(() => {
		if (slippage && slippage > 2) {
			setShowSlippageModal(true);
		} else if (slippage === undefined) {
			setShowNotSlipageModal(true);
		} else if (!shownOneTimeZappingModal && transactionType === FarmTransactionType.Deposit) {
			setShowOneTimeZappingModal(true);
		} else {
			handleConfirm();
		}
	}, [slippage, shownOneTimeZappingModal, transactionType]);

	const quickDepositList: QuickDepositType[] = ["25", "50", "75", "MAX"];

	const setFarmOptions = (opt: Partial<FarmDetailInputOptions>) => {
		dispatch(setFarmDetailInputOptions(opt));
	};

	const handleSelect = (e: React.SyntheticEvent<HTMLInputElement>) => {
		const input = e.target as HTMLInputElement;
		if (showInUsd) {
			setCursorPosition(input.selectionStart ? input.selectionStart - 1 : 0);
		} else {
			setCursorPosition(input.selectionStart ?? 0);
		}
	};

	const restoreCursor = useCallback(
		(pos: number) => {
			if (inputRef.current) {
				if (amount !== "" && amount !== "0") {
					inputRef.current.focus();
					if (cursorPosition !== null) {
						if (showInUsd) {
							inputRef.current.setSelectionRange(pos + 1, pos + 1);
						} else {
							inputRef.current.setSelectionRange(pos, pos);
						}
					}
				} else {
					inputRef.current.blur(); // Remove focus when empty
					setCursorPosition(null); // Reset cursor position
				}
			}
		},
		[cursorPosition, amount]
	);

	const selectExtraOptions = useMemo(
		() =>
			transactionType === FarmTransactionType.Deposit
				? farmData?.depositableAmounts.map(
						(_) =>
							(showInUsd ? ": $" : ": ") +
							Number(showInUsd ? _.amountDollar : _.amount).toLocaleString("en-us", {
								maximumFractionDigits: 4,
							})
					)
				: farmData?.withdrawableAmounts.map(
						(_) =>
							(showInUsd ? ": $" : ": ") +
							Number(showInUsd ? _.amountDollar : _.amount).toLocaleString("en-us", {
								maximumFractionDigits: 4,
							})
					) || [],
		[transactionType, farmData, showInUsd]
	);

	// Wrapper function to call handleInput
	const wrapperHandleInput = (value: string) => {
		// Remove any "$" prefix if present
		value = value.replace(/^\$/, "");

		// Ensure only valid numbers are allowed (with at most one decimal point)
		if (!/^\d*\.?\d*$/.test(value) || (value.match(/\./g)?.length ?? 0) > 1) {
			return; // If not a valid number or contains multiple decimal points, ignore input
		}

		// Create a mock event and call handleInput
		const mockEvent = { target: { value } } as React.ChangeEvent<HTMLInputElement>;
		handleInput(mockEvent);
	};

	const handleClose = useCallback(() => {
		setOpen(false);
	}, []);

	const CloseIcon = useMemo(() => <SvgImage source={Closemodalicon} height={32} width={32} />, []);

	return (
		<MobileModalContainer open={open}>
			<View className="px-4 py-3 pb-24 bg-bgDark">
				<View className="h-10 w-full relative">
					<Pressable onPress={handleClose} style={closeButtonStyle}>
						{CloseIcon}
					</Pressable>
				</View>
				<View className="flex flex-col items-center gap-3 mx-2 text-textWhite text-center">
					<Text className="text-textWhite text-[18px] font-bold align-middle uppercase">{farm.name}</Text>
					<View>
						<Text className="text-textWhite text-center text-[16px] leading-[20px]">
							{transactionType} {transactionType === FarmTransactionType.Deposit ? "into" : "from"} the{" "}
							<Link href={farm.source} target="_blank" className="text-gradientPrimary span ">
								{farm.url_name}
							</Link>{" "}
							{isAutoCompounding ? "auto-compounding" : ""} liquidity pool.
							{currencySymbol === "BERA" ? ` "Max" excludes a little BERA for gas.` : ""}
						</Text>
					</View>
					<View className="my-1 flex justify-center">
						{!isLoadingFarm && currentWallet ? (
							<Select
								options={selectOptions!}
								images={selectImages}
								value={currencySymbol}
								setValue={(val) => setFarmOptions({ currencySymbol: val as string })}
								extraText={selectExtraOptions}
								className="text-textWhite font-light text-[16px]"
								bgSecondary={true}
								customWidth={180}
							/>
						) : (
							<View></View>
						)}
					</View>
					<View className="flex flex-col items-center gap-y-1 mx-6">
						{width >= 768 ? (
							<CurrencyInput
								placeholder={showInUsd ? "$0" : "0"}
								value={amount}
								decimalsLimit={4}
								prefix={showInUsd ? "$" : ""}
								onChange={(e) => wrapperHandleInput(e.target.value)}
								disableGroupSeparators={true}
								onValueChange={(value, name, values) => wrapperHandleInput(value || "0")}
								onSelect={handleSelect}
								onKeyUp={handleSelect}
								onClick={handleSelect}
								ref={inputRef}
								className={`max-w-full text-[48px] font-bold ${
									noOrMaxInputValue ? "text-textSecondary" : "text-textWhite"
								} break-words text-center bg-transparent border-none focus:outline-none`}
							/>
						) : (
							<Text
								className={`max-w-full text-[48px] font-bold text-center ${
									noOrMaxInputValue ? "text-textSecondary" : "text-textWhite"
								} my-2 break-words	`}
							>
								{showInUsd ? "$" : ""}
								{amount ? noExponents(amount) : "0"}
							</Text>
						)}
						<ExchangeButton onPress={handleToggleShowInUsdc} />
						<Text className={`text-[18px] leading-[20px] break-words ${noOrMaxInputValue ? "text-textSecondary" : "text-textWhite"}`}>
							{!showInUsd ? "$" : ""}
							{toggleAmount ? noExponents(toggleAmount) : "0"}
							{!showInUsd ? "" : ` ${currencySymbol}`}
						</Text>
						<View className="flex flex-row justify-around sm:justify-center gap-4 ">
							{quickDepositList.map((filter, index) => (
								<QuickDepositButtons
									key={index}
									text={filter}
									extraText={"%"}
									isSelected={
										filter === "MAX"
											? Number(amount) === Number(maxBalance)
											: Math.abs(Number(Number(amount)) - Number((Number(maxBalance) * parseInt(filter)) / 100)) < 0.0001
									}
									onClick={() => {
										if (filter === "MAX") {
											setMax(true);
										} else {
											const percent = parseFloat(maxBalance) * (parseInt(filter) / 100);
											wrapperHandleInput(percent.toString());
										}
									}}
								/>
							))}
						</View>
						<DialPad
							inputValue={amount}
							setInputValue={wrapperHandleInput}
							cursorPosition={cursorPosition}
							onCursorPositionChange={(pos) => {
								setCursorPosition(pos);
								setTimeout(() => restoreCursor(pos), 0);
							}}
						/>
						{(currencySymbol.toLowerCase() === "bera" ||
							currencySymbol.toLowerCase() === "honey" ||
							(currencySymbol.toLowerCase() === "ibgt" && farm.lp_address !== "0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b")) && (
							<View className="flex flex-row justify-start items-center ">
								<Text className={"text-textWhite text-[13px]"}>Slippage: &nbsp;</Text>
								<View className={"text-textWhite text-[13px]"}>
									{fetchingSlippage ? (
										<Skeleton w={50} h={20} style={{}} />
									) : (
										<Text className="text-textWhite">{`~${slippage?.toString() && !isNaN(slippage) ? slippage?.toFixed(2) : "- "}%`}</Text>
									)}
								</View>
							</View>
						)}
						{slippage && slippage > 0 && (
							<View className="flex flex-row justify-start items-center ">
								<Text className="text-textWhite">No Deposit & Withdraw fees!</Text>
							</View>
						)}
						<DepositButton
							onPress={handleToggleModal}
							disabled={noOrMaxInputValue || isLoadingTransaction || fetchingSlippage}
							amount={amount}
							maxBalance={maxBalance}
							fetchingSlippage={fetchingSlippage}
							isLoadingTransaction={isLoadingTransaction}
							currentWallet={currentWallet}
							transactionType={transactionType}
						/>
					</View>
				</View>
			</View>

			{/* Confirm Deposit / Withdraw Modal */}
			{confirmDeposit ? (
				<ConfirmFarmActionModal
					farm={farm}
					txId={txId}
					handleClose={(closeDepositModal?: boolean) => {
						setConfirmDeposit(false);
						if (closeDepositModal) {
							setOpen(false);
							try {
								router.replace("/");
							} catch (error) {
								console.warn("Router not ready", error);
							}
						}
					}}
					depositInfo={{
						amount,
						showInUsd,
						token: currencySymbol,
						transactionType,
					}}
				/>
			) : null}

			{/* Slippage Modal */}
			{showSlippageModal ? (
				<SlippageWarning
					handleClose={() => {
						setShowSlippageModal(false);
					}}
					handleSubmit={handleConfirm}
					percentage={slippage || 0}
				/>
			) : null}

			{/* No Slippage Modal */}
			{showNotSlipageModal ? (
				<SlippageNotCalculate
					handleClose={() => {
						setShowNotSlipageModal(false);
					}}
					handleSubmit={handleConfirm}
				/>
			) : null}

			{showOneTimeZappingModal ? (
				<OneTimeZapping
					inputToken={currencySymbol}
					outputToken={farm.name}
					handleClose={() => {
						setShowOneTimeZappingModal(false);
					}}
					handleSubmit={() => {
						setShownOneTimeZappingModal(true);
						setShowOneTimeZappingModal(false);
						handleConfirm();
					}}
				/>
			) : null}

			{showConfirmWithdrawModal ? (
				<ConfirmWithdraw
					handleClose={() => {
						setShowConfirmWithdrawModal(false);
						setWithdrawModalShown(false);
					}}
					handleSubmit={() => {
						handleToggleModal();
					}}
				/>
			) : null}
		</MobileModalContainer>
	);
};

export default memo(FarmActionModal);
