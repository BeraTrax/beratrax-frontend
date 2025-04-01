import { getBalance } from "@beratrax/core/src/api/token";
import { addressesByChainId } from "@beratrax/core/src/config/constants/contracts";
import { PoolDef } from "@beratrax/core/src/config/constants/pools_json";
import { useApp, useDetailInput, useWallet } from "@beratrax/core/src/hooks";
import { useAppDispatch, useAppSelector } from "@beratrax/core/src/state";
import { setFarmDetailInputOptions } from "@beratrax/core/src/state/farms/farmsReducer";
import { useFarmDetails, useStCoreRedeem } from "@beratrax/core/src/state/farms/hooks";
import { FarmDetailInputOptions } from "@beratrax/core/src/state/farms/types";
import useTokens from "@beratrax/core/src/state/tokens/useTokens";
import { addTransactionDb } from "@beratrax/core/src/state/transactions/transactionsReducer";
import {
  ApproveZapStep,
  TransactionStep,
  TransactionStepStatus,
  TransactionTypes,
  ZapInStep,
} from "@beratrax/core/src/state/transactions/types";
import { FarmTransactionType } from "@beratrax/core/src/types/enums";
import { noExponents, toWei } from "@beratrax/core/src/utils/common";
import moment from "moment";
import React, { useMemo, useState } from "react";
import Loader from "web/src/components/Loader/Loader";
import { SlippageNotCalculate } from "web/src/components/modals/SlippageNotCalculate/SlippageNotCalculate";
import { SlippageWarning } from "web/src/components/modals/SlippageWarning/SlippageWarning";
import { Select } from "web/src/components/Select/Select";
import { Skeleton } from "web/src/components/Skeleton/Skeleton";
import { zeroAddress } from "viem";
import { UsdToggle } from "web/src/components/UsdToggle/UsdToggle";
import styles from "./DetailInput.module.css";

interface Props {
  farm: PoolDef;
}

const DetailInput: React.FC<Props> = ({ farm }) => {
  const { lightMode } = useApp();
  const { transactionType, currencySymbol } = useAppSelector((state) => state.farms.farmDetailInputOptions);
  const [showSlippageModal, setShowSlippageModal] = useState(false);
  const [showNotSlipageModal, setShowNotSlipageModal] = useState(false);
  const [showZapModal, setShowZapModal] = useState(false);
  const { getPublicClient } = useWallet();
  const {
    amount,
    showInUsd,
    currentWallet,
    maxBalance,
    setMax,
    handleInput,
    handleSubmit,
    fetchingSlippage,
    handleToggleShowInUsdc,
    isLoadingFarm,
    getTokenAmount,
    slippage,
    isLoadingTransaction,
    max,
    depositable,
    withdrawable,
  } = useDetailInput(farm);
  const { farmDetails } = useFarmDetails();
  const { isLoading: isStCoreRedeeming, redeem } = useStCoreRedeem();
  const farmData = farmDetails[farm.id];
  const { decimals } = useTokens();

  const dispatch = useAppDispatch();

  const setFarmOptions = (opt: Partial<FarmDetailInputOptions>) => {
    dispatch(setFarmDetailInputOptions(opt));
  };

  const selectOptions = useMemo(
    () =>
      transactionType === FarmTransactionType.Deposit
        ? farmData?.depositableAmounts.map((_) => _.tokenSymbol)
        : farmData?.withdrawableAmounts.map((_) => _.tokenSymbol) || [],
    [transactionType, farmData]
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

  const submitHandler = async (e: any) => {
    e?.preventDefault();
    if (slippage && slippage > 2 && !showSlippageModal) {
      setShowSlippageModal(true);
    } else if (slippage === undefined && !showNotSlipageModal) {
      setShowNotSlipageModal(true);
    } else {
      let amountInWei = toWei(
        getTokenAmount(),
        decimals[farm.chainId][
        transactionType === FarmTransactionType.Deposit ? depositable!.tokenAddress : withdrawable!.tokenAddress
        ]
      );
      const toBal = await getBalance(
        currencySymbol.toLowerCase() === "honey" ? addressesByChainId[farm.chainId].honeyAddress! : zeroAddress,
        currentWallet!,
        { public: getPublicClient(farm.chainId) }
      );
      const toBalDiff = toWei(getTokenAmount(), 18) - toBal;
      let steps: TransactionStep[] = [];


      steps.push({ status: TransactionStepStatus.PENDING, type: TransactionTypes.APPROVE_ZAP } as ApproveZapStep);
      steps.push({
        status: TransactionStepStatus.PENDING,
        type: TransactionTypes.ZAP_IN,
        amount: amountInWei.toString(),
      } as ZapInStep);

      const dbTx = await dispatch(
        addTransactionDb({
          from: currentWallet!,
          amountInWei: amountInWei.toString(),
          date: new Date().toString(),
          type: "deposit",
          farmId: farm.id,
          max: !!max,
          token:
            transactionType === FarmTransactionType.Deposit ? depositable!.tokenAddress : withdrawable!.tokenAddress,
          steps,
        })
      );
      const id = dbTx.payload._id;
      handleSubmit({ txId: id });
    }
  };
  return (
    <form className={`${styles.inputContainer} ${lightMode && styles.inputContainer_light}`} onSubmit={submitHandler}>
      {isLoadingTransaction && <Loader />}
      {isLoadingFarm && <Skeleton w={100} h={20} style={{ marginLeft: "auto" }} />}

      {farm.id === 301 && transactionType === FarmTransactionType.Withdraw ? (
        <>
          <div style={{ gridArea: "1/1/1/span 2", display: "flex", flexFlow: "column", gap: 10 }}>
            <div
              style={{
                display: "flex",
                // flexFlow: "column",
                alignItems: "center",
                gap: 10,
              }}
            >
              <p>
                Redeemable: {Number(farmDetails?.[farm.id]?.withdrawableAmounts[1].amountDollar || 0).toLocaleString()}$
              </p>
              <button
                disabled={isStCoreRedeeming}
                className={`custom-button ${lightMode && "custom-button-light"}`}
                style={{ width: 100, height: 40, minHeight: 0, padding: 0, minWidth: 0 }}
                onClick={() => redeem()}
                type="button"
              >
                Redeem
              </button>
              <Select
                options={selectOptions}
                value={currencySymbol}
                setValue={(val) => setFarmOptions({ currencySymbol: val as string })}
                size="small"
              // extraText={selectExtraOptions}
              />
            </div>
            <p>Redeem Records</p>
            <div>
              {farmDetails?.[farm.id]?.extraData?.redeemRecords.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    background: "var(--background_light)",
                    padding: "2px 10px",
                    borderRadius: 4,
                    marginBottom: 5,
                  }}
                >
                  <p>$ {item.amountDollar.toLocaleString()}</p>
                  <p>Unlocks At {moment(Number(item.unlockTime) * 1000).calendar()}</p>
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                background: "var(--background_light)",
                padding: "20px 20px",

                borderRadius: 4,
                marginBottom: 5,
              }}
            >
              <p>Total Unlock Amount</p>
              <p>$ {farmDetails?.[farm.id]?.extraData?.unlockAmountDollar.toLocaleString()}</p>
            </div>
            <div
              style={{
                display: "flex",
                // flexFlow: "column",
                alignItems: "center",
                gap: 10,
                justifyContent: "center",
              }}
            >
              <button
                className={`custom-button ${lightMode && "custom-button-light"}`}
                type="button"
                onClick={() => setMax((prev) => !prev)}
              >
                Estimate
              </button>
              <button
                disabled={
                  farmDetails?.[farm.id]?.extraData?.unlockAmountDollar === 0 ||
                  isLoadingTransaction ||
                  fetchingSlippage
                }
                className={`custom-button ${lightMode && "custom-button-light"}`}
              >
                Withdraw
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {!isLoadingFarm && currentWallet ? (
            <Select
              options={selectOptions}
              value={currencySymbol}
              setValue={(val) => setFarmOptions({ currencySymbol: val as string })}
              extraText={selectExtraOptions}
            />
          ) : (
            <div></div>
          )}
          <div></div>
          <div className={styles.inputWrapper}>
            <input
              type="number"
              placeholder="0"
              required
              value={noExponents(amount)}
              max={maxBalance}
              onChange={handleInput}
            />
            <div className={styles.maxContainer}>
              <p className={styles.maxBtn} onClick={() => setMax(true)}>
                MAX
              </p>
              <UsdToggle showInUsd={showInUsd} handleToggleShowInUsdc={handleToggleShowInUsdc} />
            </div>
          </div>
          <button
            className={`custom-button ${lightMode && "custom-button-light"}`}
            type="submit"
            disabled={parseFloat(amount) <= 0 || isNaN(parseFloat(amount)) || isLoadingTransaction || fetchingSlippage}
          >
            {!currentWallet
              ? "Please Login"
              : parseFloat(amount) > 0
                ? parseFloat(amount) > parseFloat(maxBalance)
                  ? "Insufficent Balance"
                  : fetchingSlippage
                    ? "Simulating..."
                    : transactionType === FarmTransactionType.Deposit
                      ? "Deposit"
                      : "Withdraw"
                : "Enter Amount"}
          </button>
        </>
      )}

      <div style={{ justifyContent: "flex-start" }} className="center">
        <p className={styles.slippage}>Slippage: &nbsp;</p>
        <p className={styles.slippage}>
          {fetchingSlippage ? (
            <Skeleton w={50} h={20} style={{}} />
          ) : (
            `~${slippage?.toString() && !isNaN(slippage) ? slippage?.toFixed(2) : "- "}%`
          )}
        </p>
      </div>
      {showSlippageModal && (
        <SlippageWarning
          handleClose={() => {
            setShowSlippageModal(false);
          }}
          handleSubmit={submitHandler}
          percentage={slippage || 0}
        />
      )}
      {showNotSlipageModal && (
        <SlippageNotCalculate
          handleClose={() => {
            setShowNotSlipageModal(false);
          }}
          handleSubmit={submitHandler}
        />
      )}
      {/* {showZapModal &&
                (transactionType === FarmTransactionType.Deposit ? (
                    <DepositModal
                        handleClose={() => {
                            setShowZapModal(false);
                        }}
                        handleSubmit={handleSubmit}
                        farmId={farm.id}
                        inputAmount={getTokenAmount()}
                        max={max}
                        token={depositable!.tokenAddress}
                        symbol={currencySymbol.toLowerCase() === "usdc" ? "usdc" : "native"}
                    />
                ) : (
                    <WithdrawModal
                        handleClose={() => {
                            setShowZapModal(false);
                        }}
                        handleSubmit={handleSubmit}
                        farmId={farm.id}
                        inputAmount={getTokenAmount()}
                        max={max}
                        token={withdrawable!.tokenAddress}
                        symbol={currencySymbol.toLowerCase() === "usdc" ? "usdc" : "native"}
                    />
                ))} */}
    </form>
  );
};

export default DetailInput;
