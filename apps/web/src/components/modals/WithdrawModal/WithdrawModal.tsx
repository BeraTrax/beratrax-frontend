import { createSelector } from "@reduxjs/toolkit";
import { FC, useEffect, useMemo, useState } from "react";
import { getWithdrawChainForFarm } from "src/api/transaction";
import { pools_chain_ids } from "src/config/constants/pools_json";
import { useWallet } from "@beratrax/core/src/hooks";
import TransactionDetails from "src/pages/Dashboard/Transactions/components/TransactionDetails";
import { RootState, useAppDispatch, useAppSelector } from "src/state";
import useFarms from "src/state/farms/hooks/useFarms";
import useTokens from "src/state/tokens/useTokens";
import { addTransactionDb } from "src/state/transactions/transactionsReducer";
import {
  ApproveBridgeStep,
  ApproveZapStep,
  InitiateBridgeStep,
  Transaction,
  TransactionStep,
  TransactionStepStatus,
  TransactionTypes,
  WaitForBridgeResultsStep,
  ZapOutStep,
} from "src/state/transactions/types";
import { CHAIN_ID } from "src/types/enums";
import { toWei } from "src/utils/common";
import { Address } from "viem";
import { ModalLayout } from "../ModalLayout/ModalLayout";
import styles from "./WithdrawModal.module.css";

interface IProps {
  handleClose: Function;
  handleSubmit: (x: { bridgeChainId?: number; txId: string }) => Promise<void>;
  farmId: number;
  inputAmount: number;
  symbol: "usdc" | "native";
  token: Address;
  max: boolean;
}

const selectTransactionById = createSelector(
  (state: RootState) => state.transactions.transactions,
  (_: any, transactionId: string) => transactionId,
  (transactions, transactionId: string) => transactions.find((item) => item._id === transactionId)
);

const WithdrawModal: FC<IProps> = ({ handleClose, handleSubmit, farmId, inputAmount, symbol, max, token }) => {
  // const { farmDetails } = useFarmDetails();
  const { getPublicClient, currentWallet } = useWallet();
  const { farms } = useFarms();
  const farm = farms.find((item) => item.id === farmId)!;
  const { balances, prices, decimals } = useTokens();
  const dispatch = useAppDispatch();
  const [withdrawChain, setWithdrawChain] = useState<string>(farm.chainId.toString());
  const [txId, setTxId] = useState("");
  const [tx, setTx] = useState<Transaction>();
  const transaction = useAppSelector((state: RootState) => selectTransactionById(state, txId));
  const isTransacting = useMemo(
    () => transaction?.steps.some((item) => item.status !== TransactionStepStatus.PENDING),
    [transaction]
  );

  const handleConfirm = async () => {
    const dbTx = await dispatch(
      // @ts-ignore
      addTransactionDb(tx)
    );
    const id = dbTx.payload._id;
    setTxId(id);
    handleSubmit({ txId: id, bridgeChainId: Number(withdrawChain) });
  };

  const handleCheckboxClick = (chainId: string) => {
    if (!isTransacting) setWithdrawChain(chainId);
  };

  const generateTx = async (chainToWithdrawOn: number) => {
    if (!currentWallet || !!txId || isTransacting) return;
    let steps: TransactionStep[] = [];

    steps.push({ status: TransactionStepStatus.PENDING, type: TransactionTypes.APPROVE_ZAP } as ApproveZapStep);
    steps.push({
      status: TransactionStepStatus.PENDING,
      type: TransactionTypes.ZAP_OUT,
      amount: toWei(inputAmount).toString(),
    } as ZapOutStep);

    let tx: Transaction = {
      // @ts-expect-error
      _id: undefined,
      farmId: farm.id,
      amountInWei: toWei(inputAmount).toString(),
      date: new Date().toString(),
      from: currentWallet!,
      max: !!max,
      steps,
      token,
      type: "withdraw",
      tokenPrice: prices[farm.chainId][token],
      vaultPrice: prices[farm.chainId][farm.vault_addr],
    };

    if (chainToWithdrawOn !== farm.chainId) {
      steps.push({
        status: TransactionStepStatus.PENDING,
        type: TransactionTypes.APPROVE_BRIDGE,
      } as ApproveBridgeStep);
      steps.push({
        status: TransactionStepStatus.PENDING,
        type: TransactionTypes.INITIATE_BRIDGE,
      } as InitiateBridgeStep);
      steps.push({
        status: TransactionStepStatus.PENDING,
        type: TransactionTypes.WAIT_FOR_BRIDGE_RESULTS,
      } as WaitForBridgeResultsStep);
    }
    setTx(tx);
  };

  useEffect(() => {
    generateTx(Number(withdrawChain));
  }, [withdrawChain]);
  useEffect(() => {
    (async function () {
      if (!currentWallet || !!txId) return;
      const chainToWithdrawOn = await getWithdrawChainForFarm(currentWallet, farm.id);
      setWithdrawChain(chainToWithdrawOn.toString());
    })();
  }, [currentWallet, farm]);

  return (
    <ModalLayout onClose={handleClose} className={styles.modal} wrapperClassName="lg:w-full">
      <div className={styles.container}>
        <h2 style={{ fontWeight: 600 }}>
          Confirm Zap ({(inputAmount * prices[farm.chainId][farm.vault_addr]).toLocaleString()}$ )
        </h2>
        {/* <p style={{ color: `var(--color_grey)` }}>{`Please review the deposit process and confirm.`}</p> */}
        <p style={{ color: `var(--color_grey)` }}>You can change the network to deposit usdc from</p>

        <div style={{ marginTop: 10 }}>
          {pools_chain_ids.map((item) => {
            return (
              <div key={item} style={{ display: "flex", gap: 20 }}>
                <input
                  type="checkbox"
                  checked={withdrawChain === item.toString()}
                  onClick={() => handleCheckboxClick(item.toString())}
                />
                <p>{Object.entries(CHAIN_ID).find((ele) => ele[1].toString() === item.toString())?.[0]}</p>
              </div>
            );
          })}
        </div>
        <h5 style={{ marginTop: 20 }}>Steps</h5>
        {tx && (
          // @ts-ignore
          <TransactionDetails
            showLoadingBar={false}
            open={true}
            farm={txId ? undefined : farm}
            tx={txId ? undefined : tx}
            transactionId={txId}
          />
        )}
        <div className={styles.buttonContainer}>
          <button
            className={`custom-button ${styles.cancelButton}`}
            onClick={() => {
              handleClose();
            }}
          >
            Close
          </button>
          <button
            className={`custom-button ${styles.continueButton}`}
            disabled={isTransacting}
            onClick={() => {
              handleConfirm();
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </ModalLayout>
  );
};

export default WithdrawModal;
