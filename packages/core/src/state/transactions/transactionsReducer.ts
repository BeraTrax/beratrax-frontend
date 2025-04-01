import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Address, createPublicClient, Hex, http, TransactionReceipt } from "viem";
import store, { RootState } from "..";
import { backendApi } from "core/src/api";
import pools_json from "core/src/config/constants/pools_json";
import { supportedChains } from "core/src/config/baseWalletConfig";
import { IClients } from "core/src/types";
import {
  ApproveZapStep,
  EditTransaction,
  StateInterface,
  Transaction,
  TransactionStep,
  TransactionStepStatus,
  TransactionTypes,
  ZapInStep,
  ZapOutStep,
} from "./types";

const initialState: StateInterface = {
  transactions: [],
  limit: 20,
  fetchedAll: false,
  error: null,
};

export const addTransactionDb = createAsyncThunk(
  "transactions/addTransactionDb",
  async (transaction: Omit<Transaction, "_id">, _thunkApi) => {
    try {
      const res = await backendApi.post("transaction/save-history-tx", transaction);
      return { ...res.data.data };
    } catch (error) {
      console.error("Error in addTransactionDb", error);
      return _thunkApi.rejectWithValue(error instanceof Error ? error.message : "Failed to add transaction");
    }
  },
);

export const editTransactionDb = createAsyncThunk(
  "transactions/editTransactionDb",
  async (transaction: EditTransaction, _thunkApi) => {
    try {
      const res = await backendApi.post(`transaction/save-history-tx/${transaction._id}`, transaction);
      return res.data.data;
    } catch (error) {
      console.error("Error in editTransactionDb", error);
      return _thunkApi.rejectWithValue(error instanceof Error ? error.message : "Failed to edit transaction");
    }
  },
);

export const addTransactionStepDb = createAsyncThunk(
  "transactions/addTransactionStepDb",
  async (params: { step: TransactionStep; transactionId: string }, _thunkApi) => {
    try {
      // TODO: add step to db
      const res = await backendApi.post(`transaction/add-transaction-step/${params.transactionId}`, params.step);
      return params;
    } catch (error) {
      console.error("Error in addTransactionStepDb", error);
      return _thunkApi.rejectWithValue(error instanceof Error ? error.message : "Failed to add transaction step");
    }
  },
);

export const editTransactionStepDb = createAsyncThunk(
  "transactions/editTransactionStepDb",
  async (
    params: {
      transactionId: string;
      txHash?: Hex;
      stepType: string;
      status: TransactionStepStatus;
      amount?: string;
    },
    _thunkApi,
  ) => {
    try {
      const tx = (_thunkApi.getState() as RootState).transactions.transactions.find(
        (item) => item._id === params.transactionId,
      )!;

      const ind = tx.steps.findIndex((ele) => ele.type === params.stepType);
      // TODO: edit step in db
      const res = await backendApi.post(`transaction/edit-transaction-step/${params.transactionId}/${ind}`, {
        ...tx.steps[ind],
        amount: params.amount || tx.steps[ind].amount,
        status: params.status,
        // @ts-ignore
        txHash: params.txHash || tx.steps[ind].txHash,
      });
      return params;
    } catch (error) {
      console.error("Error in editTransactionStepDb", error);
      return _thunkApi.rejectWithValue(error instanceof Error ? error.message : "Failed to edit transaction step");
    }
  },
);

export const deleteTransactionDb = createAsyncThunk(
  "transactions/deleteTransactionDb",
  async (transactionId: string, _thunkApi) => {
    try {
      const res = await backendApi.delete(`transaction/tx-history/${transactionId}`);
      return transactionId;
    } catch (error) {
      console.error("Error in deleteTransactionDb", error);
      return _thunkApi.rejectWithValue(error instanceof Error ? error.message : "Failed to delete transaction");
    }
  },
);

export const markAsFailedDb = createAsyncThunk(
  "transactions/markAsFailedDb",
  async (transactionId: string, _thunkApi) => {
    try {
      if (!transactionId) throw new Error("transaction not found");
      const tx = (_thunkApi.getState() as RootState).transactions.transactions.find(
        (item) => item._id === transactionId,
      )!;
      const ind = tx.steps.length - 1;
      if (ind < 0) {
        const res = await backendApi.post(`transaction/save-history-tx/${transactionId}`, {
          $push: { steps: { status: TransactionStepStatus.FAILED, type: TransactionTypes.APPROVE_ZAP } },
        });
      } else {
        const res = await backendApi.post(`transaction/save-history-tx/${transactionId}`, {
          $set: { [`steps.${ind}`]: { status: TransactionStepStatus.FAILED } },
        });
      }
      return transactionId;
    } catch (error) {
      console.error("Error in markAsFailedDb", error);
      return _thunkApi.rejectWithValue(error instanceof Error ? error.message : "Failed to mark as failed");
    }
  },
);

export const getTransactionsDb = createAsyncThunk(
  "transactions/getTransactionsDb",
  async ({ walletAddress }: { walletAddress: Address }, _thunkApi) => {
    try {
      const tx = (_thunkApi.getState() as RootState).transactions.transactions.at(-1);
      const limit = (_thunkApi.getState() as RootState).transactions.limit;
      const res = await backendApi.get(
        `transaction/tx-history?from=${walletAddress}&limit=${limit}&sort=-date${tx ? `&_id[lt]=${tx._id}` : ""}`,
      );
      return { transactions: res.data.data };
      // return { transactions: [] };
    } catch (error) {
      console.error("Error in getTransactionsDb", error);
      return _thunkApi.rejectWithValue(error instanceof Error ? error.message : "Failed to get transactions");
    }
  },
);

export const checkPendingTransactionsStatus = createAsyncThunk(
  "transactions/checkPendingTransactionsStatus",
  async (_, thunkApi) => {
    try {
      let txs = (thunkApi.getState() as RootState).transactions.transactions;

      // #region Check for confirmation tx receipt
      const promises = txs.reduce((acc, curr) => {
        const lastStep = curr.steps.at(-1);
        if (
          lastStep &&
          (lastStep.type === TransactionTypes.ZAP_IN || lastStep.type === TransactionTypes.ZAP_OUT) &&
          lastStep.status === TransactionStepStatus.IN_PROGRESS &&
          lastStep.txHash
        ) {
          const chainId = pools_json.find((item) => item.id === curr.farmId)?.chainId;
          if (chainId) {
            const chain = supportedChains.find((item) => item.id === chainId);
            if (!chain) throw new Error("chain not found");
            const publicClient = createPublicClient({
              chain: chain,
              transport: http(),
              batch: {
                multicall: {
                  batchSize: 4096,
                  wait: 250,
                },
              },
            }) as IClients["public"];
            acc.push(publicClient.getTransactionReceipt({ hash: lastStep.txHash }));
          }
        }
        return acc;
      }, [] as Promise<TransactionReceipt>[]);
      const receipts = await Promise.all(promises);
      receipts.forEach((receipt, index) => {
        if (receipt) {
          const tx = txs.find((item) => item.steps.at(-1)?.txHash === receipt.transactionHash);
          if (!tx) return;
          if (receipt.status === "success") {
            thunkApi.dispatch(
              editTransactionStepDb({
                transactionId: tx._id,
                stepType: tx.type === "deposit" ? TransactionTypes.ZAP_IN : TransactionTypes.ZAP_OUT,
                status: TransactionStepStatus.COMPLETED,
              }),
            );
          } else {
            thunkApi.dispatch(
              editTransactionStepDb({
                transactionId: tx._id,
                stepType: tx.type === "deposit" ? TransactionTypes.ZAP_IN : TransactionTypes.ZAP_OUT,
                status: TransactionStepStatus.FAILED,
              }),
            );
            thunkApi.dispatch(
              editTransactionStepDb({
                transactionId: tx._id,
                stepType: tx.type === "deposit" ? TransactionTypes.ZAP_IN : TransactionTypes.ZAP_OUT,
                status: TransactionStepStatus.FAILED,
              }),
            );
          }
        }
      });

      // #region fail all the pending steps
      txs = (thunkApi.getState() as RootState).transactions.transactions;
      Promise.all(
        txs
          .filter((item) => item.steps.some((step) => step.status === TransactionStepStatus.IN_PROGRESS))
          .map((tx) => {
            return tx.steps
              .filter((item) => item.status === TransactionStepStatus.IN_PROGRESS)
              .map(async (item) => {
                await thunkApi.dispatch(
                  editTransactionStepDb({
                    transactionId: tx._id,
                    stepType: item.type,
                    status: TransactionStepStatus.FAILED,
                  }),
                );
              });
          }),
      );
      // #endregion fail all the pending steps
    } catch (error) {
      console.error("Error in checkPendingTransactionsStatus", error);
      return thunkApi.rejectWithValue(
        error instanceof Error ? error.message : "Failed to check pending transactions status",
      );
    }
  },
);

const transactionsSlice = createSlice({
  name: "transactions",
  initialState: initialState,
  reducers: {
    reset: (state) => {
      state.transactions = [];
    },
  },

  extraReducers: (builder) => {
    builder.addCase(addTransactionDb.fulfilled, (state, action) => {
      state.transactions.unshift(action.payload);
    });
    builder.addCase(addTransactionDb.rejected, (state, action) => {
      state.error = action.payload as string;
    });
    builder.addCase(getTransactionsDb.fulfilled, (state, action) => {
      state.transactions = action.payload.transactions;
    });
    builder.addCase(getTransactionsDb.rejected, (state, action) => {
      state.fetchedAll = true;
      state.error = action.payload as string;
    });
    builder.addCase(addTransactionStepDb.fulfilled, (state, action) => {
      const ind = state.transactions.findIndex((tx) => tx._id === action.payload.transactionId);
      state.transactions[ind].steps.push(action.payload.step);
    });
    builder.addCase(addTransactionStepDb.rejected, (state, action) => {
      state.error = action.payload as string;
    });
    builder.addCase(markAsFailedDb.fulfilled, (state, action) => {
      const ind = state.transactions.findIndex((tx) => tx._id === action.payload);
      state.transactions[ind].steps.at(-1)!.status = TransactionStepStatus.FAILED;
    });
    builder.addCase(markAsFailedDb.rejected, (state, action) => {
      state.error = action.payload as string;
    });
    builder.addCase(editTransactionStepDb.fulfilled, (state, action) => {
      const ind = state.transactions.findIndex((tx) => tx._id === action.payload.transactionId);
      const stepInd = state.transactions[ind].steps.findIndex((step) => step.type === action.payload.stepType);
      state.transactions[ind].steps[stepInd].status = action.payload.status;
      // @ts-ignore
      if (action.payload.txHash) state.transactions[ind].steps[stepInd].txHash = action.payload.txHash;
      if (action.payload.amount) state.transactions[ind].steps[stepInd].amount = action.payload.amount;
    });
    builder.addCase(editTransactionStepDb.rejected, (state, action) => {
      state.error = action.payload as string;
    });
    builder.addCase(editTransactionDb.fulfilled, (state, action) => {
      const ind = state.transactions.findIndex((tx) => tx._id === action.payload._id);
      state.transactions[ind] = action.payload;
    });
    builder.addCase(editTransactionDb.rejected, (state, action) => {
      state.error = action.payload as string;
    });
    builder.addCase(deleteTransactionDb.fulfilled, (state, action) => {
      state.transactions = state.transactions.filter((tx) => tx._id !== action.payload);
    });
    builder.addCase(deleteTransactionDb.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  },
});

export const { reset } = transactionsSlice.actions;

export default transactionsSlice.reducer;

export class TransactionsDB {
  private id: string;
  constructor(id: string) {
    this.id = id;
  }
  async addApproveZap() {
    await store.dispatch(
      addTransactionStepDb({
        transactionId: this.id,
        step: {
          type: TransactionTypes.APPROVE_ZAP,
          status: TransactionStepStatus.IN_PROGRESS,
        } as ApproveZapStep,
      }),
    );
  }

  async approveZap(status: TransactionStepStatus) {
    await store.dispatch(
      editTransactionStepDb({
        transactionId: this.id,
        stepType: TransactionTypes.APPROVE_ZAP,
        status,
      }),
    );
  }

  async zapIn(status: TransactionStepStatus, amount: bigint, txHash?: Hex) {
    await store.dispatch(
      editTransactionStepDb({
        transactionId: this.id,
        stepType: TransactionTypes.ZAP_IN,
        status,
        txHash,
        amount: amount.toString(),
      }),
    );
  }
  async addZapIn(amountInWei: bigint) {
    await store.dispatch(
      addTransactionStepDb({
        transactionId: this.id,
        step: {
          type: TransactionTypes.ZAP_IN,
          amount: amountInWei.toString(),
          status: TransactionStepStatus.IN_PROGRESS,
        } as ZapInStep,
      }),
    );
  }
  async addZapOut(amountInWei: bigint) {
    await store.dispatch(
      addTransactionStepDb({
        transactionId: this.id,
        step: {
          type: TransactionTypes.ZAP_OUT,
          amount: amountInWei.toString(),
          status: TransactionStepStatus.IN_PROGRESS,
        } as ZapOutStep,
      }),
    );
  }

  async zapOut(status: TransactionStepStatus, amountInWei: bigint, txHash?: Hex) {
    await store.dispatch(
      editTransactionStepDb({
        transactionId: this.id,
        stepType: TransactionTypes.ZAP_OUT,
        status,
        amount: amountInWei.toString(),
        txHash,
      }),
    );
  }

  async withdrawFromRewardVault(status: TransactionStepStatus) {
    await store.dispatch(
      editTransactionStepDb({
        transactionId: this.id,
        stepType: TransactionTypes.WITHDRAW_FROM_REWARD_VAULT,
        status,
      }),
    );
  }

  async stakeIntoRewardVault(status: TransactionStepStatus) {
    await store.dispatch(
      editTransactionStepDb({
        transactionId: this.id,
        stepType: TransactionTypes.STAKE_INTO_REWARD_VAULT,
        status,
      }),
    );
  }
}

