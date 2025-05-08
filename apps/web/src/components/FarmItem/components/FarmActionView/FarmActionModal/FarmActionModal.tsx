import React, { memo, useCallback, useMemo, useRef, useState, useEffect } from "react";
import closemodalicon from "src/assets/images/closemodalicon.svg";
import exchange from "src/assets/images/exchange.svg";
import DialPad from "src/components/Dialpad/Dialpad";
import MobileModalContainer from "src/components/MobileModalContainer/MobileModalContainer";
import { Select } from "src/components/Select/Select";
import { FarmTransactionType } from "src/types/enums";

import CurrencyInput from "react-currency-input-field";
import { useNavigate } from "react-router-dom";
import { ConfirmWithdraw } from "src/components/modals/ConfirmWithdraw/ConfirmWithdraw";
import { SlippageNotCalculate } from "src/components/modals/SlippageNotCalculate/SlippageNotCalculate";
import { SlippageWarning } from "src/components/modals/SlippageWarning/SlippageWarning";
import { Skeleton } from "src/components/Skeleton/Skeleton";
import { PoolDef, tokenNamesAndImages } from "src/config/constants/pools_json";
import { useDetailInput } from "src/hooks/useDetailInput";
import useWallet from "src/hooks/useWallet";
import useWindowSize from "src/hooks/useWindowSize";
import { useAppDispatch, useAppSelector } from "src/state";
import { updatePoints } from "src/state/account/accountReducer";
import { setFarmDetailInputOptions } from "src/state/farms/farmsReducer";
import useFarmDetails from "src/state/farms/hooks/useFarmDetails";
import { FarmDetailInputOptions } from "src/state/farms/types";
import useTokens from "src/state/tokens/useTokens";
import { addTransactionDb } from "src/state/transactions/transactionsReducer";
import {
    ApproveZapStep,
    StakeIntoRewardVaultStep,
    TransactionStep,
    TransactionStepStatus,
    TransactionTypes,
    WithdrawFromRewardVaultStep,
    ZapInStep,
} from "src/state/transactions/types";
import { noExponents, toEth, toWei } from "src/utils/common";
import ConfirmFarmActionModal from "../ConfirmFarmActionModal/ConfirmFarmActionModal";
import FarmDetailsStyles from "./FarmActionModal.module.css"; //deliberate need to add this, tailwind, or inline styling wasn't working
import { ZappingDisclaimerModal } from "src/components/modals/ZappingDisclaimerModal/ZappingDisclaimerModal";
import { getAddress } from "viem";

interface FarmActionModalProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    farm: PoolDef;
}
type QuickDepositType = "25" | "50" | "75" | "MAX" | "EARNINGS";

const styles = `
@keyframes vibrate {
    0% { transform: translate(0); }
    20% { transform: translate(-2px, 2px); }
    40% { transform: translate(-2px, -2px); }
    60% { transform: translate(2px, 2px); }
    80% { transform: translate(2px, -2px); }
    100% { transform: translate(0); }
}

@keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

.max-button-gradient {
    background: linear-gradient(
        90deg, 
        var(--new-gradient-light) 0%,
        var(--new-button-primary) 25%,
        var(--new-button-primary-light) 50%,
        var(--new-button-primary) 75%,
        var(--new-gradient-light) 100%
    );
    background-size: 200% 100%;
    animation: gradientShift 4s ease infinite;
}

.max-button-gradient:hover {
    transform: scale(1.03);
    transition: transform 0.2s ease;
}
`;

const QuickDepositButtons = memo(
    ({
        text,
        onClick,
        isSelected,
        extraText = "",
    }: {
        text: string;
        onClick: () => void;
        isSelected?: boolean;
        extraText?: string;
    }) => {
        const isMax = text === "MAX";
        const isEarnings = text === "EARNINGS";

        const displayText = isEarnings ? "Current Earnings" : text;

        return (
            <>
                <style>{styles}</style>
                <button
                    type="button"
                    onClick={onClick}
                    className={`px-5 py-2 font-light rounded-2xl text-[16px] transition-all duration-200
                        ${isEarnings ? "min-w-[160px]" : ""}
                        ${
                            isSelected
                                ? "bg-gradientSecondary text-gradientPrimary"
                                : isMax
                                ? "max-button-gradient text-bgDark hover:scale-105 shadow-lg"
                                : isEarnings
                                ? "bg-gradientSecondary bg-opacity-20 border border-gradientSecondary"
                                : "bg-bgDark text-textWhite"
                        }
                    `}
                >
                    {displayText}
                    {!isMax && !isEarnings ? extraText : ""}
                </button>
            </>
        );
    }
);

const FarmActionModal = ({ open, setOpen, farm }: FarmActionModalProps) => {
    const { disableZapWarning } = useAppSelector((state) => state.account);
    const [confirmDeposit, setConfirmDeposit] = useState<boolean>();
    const { farmDetails, vaultEarnings, isVaultEarningsFirstLoad } = useFarmDetails();
    const [txId, setTxId] = useState("");
    const [showSlippageModal, setShowSlippageModal] = useState(false);
    const [showOneTimeZappingModal, setShowOneTimeZappingModal] = useState(false);
    const [shownOneTimeZappingModal, setShownOneTimeZappingModal] = useState(disableZapWarning);
    const [showNotSlippageModal, setShowNotSlippageModal] = useState(false);
    const [showConfirmWithdrawModal, setShowConfirmWithdrawModal] = useState<boolean>(false);
    const [withdrawModalShown, setWithdrawModalShown] = useState<boolean>(false);
    const [cursorPosition, setCursorPosition] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { decimals, balances, prices } = useTokens();
    const { width } = useWindowSize();
    const farmData = farmDetails[farm.id];
    const { getClients } = useWallet();
    const { transactionType, currencySymbol } = useAppSelector((state) => state.farms.farmDetailInputOptions);

    const currentVaultEarningsUsd = useMemo(() => {
        const currentVaultEarnings = vaultEarnings?.find((earning) => Number(earning.tokenId) === Number(farm.id));
        if (!currentVaultEarnings || currentVaultEarnings.token0 === "") return 0;

        return (
            Number(
                toEth(
                    BigInt(currentVaultEarnings?.earnings0 || 0n),
                    decimals[farm.chainId][getAddress(currentVaultEarnings.token0 as `0x${string}`)]
                )
            ) *
                prices[farm.chainId][getAddress(currentVaultEarnings.token0 as `0x${string}`)] +
            (currentVaultEarnings?.token1
                ? Number(
                      toEth(
                          BigInt(currentVaultEarnings?.earnings1 || 0n),
                          decimals[farm.chainId][getAddress(currentVaultEarnings.token1 as `0x${string}`)]
                      )
                  ) * prices[farm.chainId][getAddress(currentVaultEarnings.token1 as `0x${string}`)]
                : 0) +
            (currentVaultEarnings?.changeInAssets
                ? Number(
                      toEth(
                          BigInt(currentVaultEarnings?.changeInAssets || 0n),
                          decimals[farm.chainId][getAddress(currentVaultEarnings.token0 as `0x${string}`)]
                      )
                  ) * prices[farm.chainId][getAddress(currentVaultEarnings.token0 as `0x${string}`)]
                : 0)
        );
    }, [isVaultEarningsFirstLoad]);
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
    const navigate = useNavigate();

    // Convert earnings to the appropriate format after showInUsd is available
    const currentEarnings = useMemo(() => {
        if (showInUsd) {
            return currentVaultEarningsUsd.toString();
        } else {
            // Convert from USD to token amount
            const tokenPrice = prices?.[farm.chainId]?.[farm.vault_addr] || 1;
            return tokenPrice > 0 ? (currentVaultEarningsUsd / tokenPrice).toString() : "0";
        }
    }, [currentVaultEarningsUsd, showInUsd, prices, farm.chainId, farm.vault_addr]);

    // Replace the quickDepositList definition with conditional options
    const quickDepositList: QuickDepositType[] = useMemo(
        () => (transactionType === FarmTransactionType.Deposit ? ["25", "50", "75", "MAX"] : ["EARNINGS", "50", "MAX"]),
        [transactionType]
    );

    const noOrMaxInputValue = useMemo(() => {
        if (parseFloat(amount) <= 0 || isNaN(parseFloat(amount)) || parseFloat(amount) > parseFloat(maxBalance))
            return true;
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
                    result[tokenNamesAndImages[amount.tokenAddress].name] =
                        tokenNamesAndImages[amount.tokenAddress].logos;
                }
            });
        } else {
            farmData.withdrawableAmounts.forEach((amount) => {
                if (amount.tokenAddress && tokenNamesAndImages[amount.tokenAddress]) {
                    result[tokenNamesAndImages[amount.tokenAddress].name] =
                        tokenNamesAndImages[amount.tokenAddress].logos;
                }
            });
        }

        return result;
    }, [farmData, transactionType, tokenNamesAndImages]);

    const isAutoCompounding = useMemo(() => {
        if (transactionType === FarmTransactionType.Deposit) return true;
        return false;
    }, [farm, transactionType]);

    const handleToggleModal = () => {
        if (slippage && slippage > 2) {
            setShowSlippageModal(true);
        } else if (slippage === undefined) {
            setShowNotSlippageModal(true);
        } else if (!shownOneTimeZappingModal && transactionType === FarmTransactionType.Deposit) {
            setShowOneTimeZappingModal(true);
        } else {
            handleConfirm();
        }
    };

    const dispatch = useAppDispatch();

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

    const handleConfirm = () => {
        setConfirmDeposit(true);
        (async () => {
            const amount = getTokenAmount();
            let amountInWei = toWei(
                amount,
                decimals[farm.chainId][
                    transactionType === FarmTransactionType.Deposit
                        ? depositable!.tokenAddress
                        : withdrawable!.tokenAddress
                ]
            );

            const absoluteDifference = Math.abs(amount - Number(currentEarnings));
            const relativeThreshold = Math.max(0.0001, Number(currentEarnings) * 0.1);

            // Determine if this is an earnings withdrawal
            const isEarningsWithdrawal = absoluteDifference <= relativeThreshold;

            // If this is an earnings withdrawal, use the exact earnings amount for the transaction
            if (isEarningsWithdrawal) {
                // Reset amountInWei to use the exact earnings value
                // This ensures blockchain transactions use the exact earnings amount
                // instead of the potentially rounded UI value
                const earningsInTokens = showInUsd
                    ? currentVaultEarningsUsd / prices[farm.chainId][farm.vault_addr]
                    : (currentVaultEarningsUsd / prices[farm.chainId][farm.vault_addr]) * withdrawable!.price;

                amountInWei = toWei(earningsInTokens, decimals[farm.chainId][withdrawable!.tokenAddress]);
            }

            let steps: TransactionStep[] = [];
            // if (toBalDiff >= 0) {
            //     steps.push({
            //         status: TransactionStepStatus.PENDING,
            //         type: TransactionTypes.APPROVE_BRIDGE,
            //     } as ApproveBridgeStep);
            //     steps.push({
            //         status: TransactionStepStatus.PENDING,
            //         type: TransactionTypes.INITIATE_BRIDGE,
            //     } as InitiateBridgeStep);
            //     steps.push({
            //         status: TransactionStepStatus.PENDING,
            //         type: TransactionTypes.WAIT_FOR_BRIDGE_RESULTS,
            //     } as WaitForBridgeResultsStep);
            // }

            // approve zap for non-native tokens
            const client = await getClients(farm.chainId);
            const vaultBalance =
                BigInt(balances[farm.chainId][farm.vault_addr].valueWei) -
                BigInt(balances[farm.chainId][farm.vault_addr].valueRewardVaultWei || 0);
            // if (transactionType === FarmTransactionType.Withdraw && vaultBalance < amountInWei && farm.rewardVault) {
            //     steps.push({
            //         status: TransactionStepStatus.PENDING,
            //         type: TransactionTypes.WITHDRAW_FROM_REWARD_VAULT,
            //         amount: amountInWei.toString(),
            //     } as WithdrawFromRewardVaultStep);
            // }
            if (transactionType === FarmTransactionType.Withdraw || currencySymbol !== "BERA") {
                steps.push({
                    status: TransactionStepStatus.PENDING,
                    type: TransactionTypes.APPROVE_ZAP,
                    amount: amountInWei.toString(),
                } as ApproveZapStep);
            }
            steps.push({
                status: TransactionStepStatus.PENDING,
                type:
                    transactionType === FarmTransactionType.Deposit
                        ? TransactionTypes.ZAP_IN
                        : TransactionTypes.ZAP_OUT,
                amount: amountInWei.toString(),
            } as ZapInStep);
            // if (transactionType === FarmTransactionType.Deposit && farm.rewardVault) {
            //     steps.push({
            //         status: TransactionStepStatus.PENDING,
            //         type: TransactionTypes.STAKE_INTO_REWARD_VAULT,
            //         amount: amountInWei.toString(),
            //     } as StakeIntoRewardVaultStep);
            // }
            const dbTx = await dispatch(
                addTransactionDb({
                    from: currentWallet!,
                    amountInWei: amountInWei.toString(),
                    date: new Date().toString(),
                    type: transactionType === FarmTransactionType.Deposit ? "deposit" : "withdraw",
                    farmId: farm.id,
                    max: !!max,
                    token:
                        transactionType === FarmTransactionType.Deposit
                            ? depositable!.tokenAddress
                            : withdrawable!.tokenAddress,
                    steps,
                })
            );
            const id = dbTx.payload._id;

            setTxId(id);

            await handleSubmit({ txId: id });
        })();
    };

    return (
        <MobileModalContainer open={open}>
            <div className="px-4 py-4">
                <div className=" h-12 w-full  relative ">
                    <button className="text-textWhite p-8 absolute -top-6 -right-4	 " onClick={() => setOpen(false)}>
                        <img src={closemodalicon} alt="close-modal" />
                    </button>
                </div>
                <div
                    className={`${FarmDetailsStyles.farmDetailsWrapper} flex flex-col items-center gap-4 text-textWhite   text-center`}
                >
                    <p className="text-[18px] font-bold align-middle uppercase">{farm.name}</p>
                    <div className="	">
                        <p className="text-[18px] leading-[20px]">
                            {transactionType} {transactionType === FarmTransactionType.Deposit ? "into" : "from"} the{" "}
                            <a href={farm.source} target="_blank" className="text-gradientPrimary span ">
                                {farm.url_name}
                            </a>{" "}
                            {isAutoCompounding ? "auto-compounding" : ""} liquidity pool.
                            {currencySymbol === "BERA"
                                ? ` BeraTrax contracts are continuously audited by CyberScope.`
                                : ""}
                        </p>
                    </div>
                    <div className="my-2 flex justify-center ">
                        {!isLoadingFarm && currentWallet ? (
                            <Select
                                options={selectOptions}
                                images={selectImages}
                                value={currencySymbol}
                                setValue={(val) => setFarmOptions({ currencySymbol: val as string })}
                                extraText={selectExtraOptions}
                                className="bg-bgSecondary text-textWhite font-light text-[16px]"
                            />
                        ) : (
                            <div></div>
                        )}
                    </div>
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
                        <p
                            className={`max-w-full  text-[48px] font-bold ${
                                noOrMaxInputValue ? "text-textSecondary" : "text-textWhite"
                            } my-2 break-words	`}
                        >
                            {showInUsd ? "$" : ""}
                            {amount ? noExponents(amount) : "0"}
                        </p>
                    )}
                    <img src={exchange} alt="reverse" className="cursor-pointer" onClick={handleToggleShowInUsdc} />
                    <p
                        className={`text-[18px] leading-[20px] break-words	 ${
                            noOrMaxInputValue ? "text-textSecondary" : "text-textWhite"
                        }`}
                    >
                        {!showInUsd ? "$" : ""}
                        {toggleAmount ? noExponents(toggleAmount) : "0"}
                        {!showInUsd ? "" : ` ${currencySymbol}`}
                    </p>
                    <div className="flex flex-wrap justify-around gap-2 py-2">
                        {transactionType === FarmTransactionType.Deposit
                            ? // For deposits, show standard percentage buttons
                              quickDepositList
                                  .filter((item) => item !== "EARNINGS")
                                  .map((text) => (
                                      <QuickDepositButtons
                                          key={text}
                                          text={text}
                                          extraText={text === "MAX" ? "" : "%"}
                                          onClick={() => {
                                              if (text === "MAX") {
                                                  setMax(true);
                                              } else {
                                                  const percent = parseFloat(maxBalance) * (parseInt(text) / 100);
                                                  wrapperHandleInput(percent.toString());
                                              }
                                          }}
                                          isSelected={
                                              text === "MAX"
                                                  ? Number(amount) === Number(maxBalance)
                                                  : Math.abs(
                                                        Number(amount) -
                                                            Number((Number(maxBalance) * parseInt(text)) / 100)
                                                    ) < 0.0001
                                          }
                                      />
                                  ))
                            : // For withdrawals, show EARNINGS, 50%, MAX
                              [
                                  {
                                      text: "EARNINGS",
                                      isSelected: (() => {
                                          const amt = Number(amount);
                                          const earnings = Number(currentEarnings);
                                          const diff = Math.abs(amt - earnings);
                                          // Use same threshold as in handleConfirm
                                          const threshold = Math.max(earnings * 0.1, 0.0001);
                                          return diff < threshold || (earnings < 0.001 && amt < 0.002 && amt > 0);
                                      })(),
                                  },
                                  {
                                      text: "50",
                                      isSelected: Math.abs(Number(amount) - Number(maxBalance) * 0.5) < 0.0001,
                                  },
                                  {
                                      text: "MAX",
                                      isSelected: Math.abs(Number(amount) - Number(maxBalance)) < 0.0001,
                                  },
                              ].map(({ text, isSelected }) => (
                                  <QuickDepositButtons
                                      key={text}
                                      text={text}
                                      extraText={text === "EARNINGS" || text === "MAX" ? "" : "%"}
                                      onClick={() => {
                                          if (text === "MAX") {
                                              setMax(true);
                                          } else if (text === "EARNINGS") {
                                              // For earnings, use the correct value based on display mode
                                              // This ensures we're using the exact value from the state
                                              if (showInUsd) {
                                                  wrapperHandleInput(currentVaultEarningsUsd.toString());
                                              } else {
                                                  const earningsInTokens =
                                                      currentVaultEarningsUsd / prices[farm.chainId][farm.vault_addr];
                                                  wrapperHandleInput(earningsInTokens.toString());
                                              }
                                          } else {
                                              const percent = parseFloat(maxBalance) * (parseInt(text) / 100);
                                              wrapperHandleInput(percent.toString());
                                          }
                                      }}
                                      isSelected={isSelected}
                                  />
                              ))}
                    </div>
                    <DialPad
                        inputValue={amount}
                        setInputValue={wrapperHandleInput}
                        cursorPosition={cursorPosition}
                        onCursorPositionChange={(pos) => {
                            setCursorPosition(pos);
                            setTimeout(() => restoreCursor(pos), 0);
                        }}
                    />{" "}
                    {(currencySymbol.toLowerCase() === "bera" ||
                        currencySymbol.toLowerCase() === "honey" ||
                        (currencySymbol.toLowerCase() === "ibgt" &&
                            farm.lp_address !== "0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b")) && (
                        <div className="flex justify-start items-center ">
                            <p className={"text-[13px]"}>Slippage: &nbsp;</p>
                            <div className={"text-[13px]"}>
                                {fetchingSlippage ? (
                                    <Skeleton w={50} h={20} style={{}} />
                                ) : (
                                    `~${slippage?.toString() && !isNaN(slippage) ? slippage?.toFixed(2) : "- "}%`
                                )}
                            </div>
                        </div>
                    )}
                    {slippage && slippage > 0 && (
                        <div className="flex justify-start items-center ">
                            <p>No Deposit & Withdraw fees!</p>
                        </div>
                    )}
                    <button
                        disabled={noOrMaxInputValue || isLoadingTransaction || fetchingSlippage}
                        className={`lg:max-w-64 mt-4 uppercase ${
                            noOrMaxInputValue || isLoadingTransaction || fetchingSlippage
                                ? "bg-buttonDisabled cursor-not-allowed"
                                : "bg-buttonPrimaryLight"
                        } text-textBlack w-full py-5 px-4 text-xl font-bold tracking-widest rounded-[40px]`}
                        onClick={handleToggleModal}
                    >
                        {!currentWallet
                            ? "Please Login"
                            : parseFloat(amount) > 0
                            ? parseFloat(amount) > parseFloat(maxBalance)
                                ? "Insufficent Balance"
                                : fetchingSlippage
                                ? "Simulating..."
                                : isLoadingTransaction
                                ? "Loading..."
                                : transactionType === FarmTransactionType.Deposit
                                ? "Deposit"
                                : "Withdraw"
                            : "Enter Amount"}
                    </button>
                </div>
            </div>

            {/* Confirm Deposit / Withdraw Modal */}
            {confirmDeposit ? (
                <ConfirmFarmActionModal
                    farm={farm}
                    txId={txId}
                    handleClose={(closeDepositModal?: boolean) => {
                        setConfirmDeposit(false);
                        if (closeDepositModal) {
                            setOpen(false);
                            navigate("/");
                        }
                    }}
                    depositInfo={{
                        amount:
                            transactionType === FarmTransactionType.Withdraw &&
                            Math.abs(Number(amount) - Number(currentEarnings)) < 0.0001
                                ? showInUsd
                                    ? currentVaultEarningsUsd.toString()
                                    : (currentVaultEarningsUsd / prices[farm.chainId][farm.vault_addr]).toString()
                                : amount,
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
            {showNotSlippageModal ? (
                <SlippageNotCalculate
                    handleClose={() => {
                        setShowNotSlippageModal(false);
                    }}
                    handleSubmit={handleConfirm}
                />
            ) : null}

            {showOneTimeZappingModal ? (
                <ZappingDisclaimerModal
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

