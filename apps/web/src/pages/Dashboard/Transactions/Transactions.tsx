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
import { CiRepeat } from "react-icons/ci";
import { FaExternalLinkAlt } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { IoChevronDownOutline, IoChevronUpOutline, IoInformationCircle } from "react-icons/io5";
import { ModalLayout } from "src/components/modals/ModalLayout/ModalLayout";
import { Address, formatUnits } from "viem";
import { useChainId } from "wagmi";
import TransactionDetails from "./components/TransactionDetails";

const Transactions = () => {
  const [open, setOpen] = useState(false);
  const transactions = useAppSelector((state) => state.transactions.transactions.slice(0, 3));

  return (
    <div>
      <div className="flex justify-between items-center gap-2.5 mt-4">
        <p className="font-arame-mono font-normal text-base text-textWhite leading-4 uppercase ">Last Transactions</p>
        {transactions.length !== 0 && (
          <p
            className="cursor-pointer font-arame-mono font-normal text-base text-textPrimary leading-4 uppercase flex"
            onClick={() => setOpen(true)}
          >
            See all
            <IoIosArrowForward className="pl-1" />
          </p>
        )}
      </div>
      <div className="mt-[1.2rem] flex flex-col gap-[0.7rem]">
        {transactions.length === 0 && <p className="center text-textSecondary">No transactions yet</p>}
        {transactions.map((item, i) => (
          <Row _id={item._id} key={i} />
        ))}
      </div>
      {open && <TransactionsModal setOpenModal={setOpen} />}
    </div>
  );
};

export default Transactions;

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
      <div className="rounded-2xl transition-all duration-100 ease-in-out bg-bgDark px-4 py-6 my-1">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setOpen(!open)}>
          {/* Chevron Icon to open and close the transaction details */}
          <div
            className={`flex-shrink-0 relative w-12 h-12 rounded-lg flex justify-center items-center ${
              open ? "bg-gradientSecondary" : "bg-bgSecondary"
            }`}
          >
            {open ? (
              <IoChevronUpOutline className="text-buttonPrimaryLight w-5 h-5" />
            ) : (
              <IoChevronDownOutline className="text-buttonPrimaryLight w-5 h-5" />
            )}
          </div>

          {/* Vault Name and Retry Button */}
          <div className="flex-grow flex flex-col">
            <div className="flex items-center gap-1.5">
              <p className={`font-league-spartan font-medium text-lg leading-6 text-textWhite`}>{farm.name}</p>
              {tx.steps.some((item) => item.status === TransactionStepStatus.FAILED) && (
                <button
                  className="border border-red-500 rounded-md 
                                            px-1 py-0.5 bg-transparent 
                                            flex items-center gap-0.5 
                                            text-red-500 text-[0.8rem] cursor-pointer"
                  onClick={retryTransaction}
                >
                  <CiRepeat /> Retry
                </button>
              )}
              {/* Tooltip for transaction details */}
              {showExtraInfo && (
                <div className="group relative pb-1">
                  <IoInformationCircle
                    className="text-xl text-textSecondary cursor-help"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="absolute bottom-full left-1/2 translate-x-0 mb-2 px-4 py-2 bg-bgSecondary rounded-lg text-sm text-textWhite w-72 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="flex flex-col justify-end gap-2">
                      <div className="flex justify-between items-start">
                        <span className="text-textSecondary">
                          {type === "deposit" ? "Zap In Amount:" : "Vault Shares:"}
                        </span>
                        <div className="flex flex-col items-end">
                          <span className="text-base">
                            $ {""}
                            {formatCurrency(
                              Number(formatUnits(BigInt(amountInWei || "0"), 18)) *
                                (type === "deposit"
                                  ? tokenPrice || prices[farm.chainId][token]
                                  : vaultPrice || prices[farm.chainId][farm.vault_addr])
                            )}
                          </span>
                          <span className="text-xs text-textSecondary">
                            {formatCurrency(formatUnits(BigInt(amountInWei || "0"), 18))}{" "}
                            {type === "deposit" ? tokenNamesAndImages[token].name : "BTX-" + farm.name}
                          </span>
                        </div>
                      </div>

                      {fee !== undefined && (
                        <div className="flex justify-between items-start">
                          <span className="text-textSecondary">BeraTrax Fee:</span>
                          <div className="flex flex-col items-end">
                            <span className="text-base">
                              $
                              {formatCurrency(
                                Number(toEth(BigInt(fee), decimals[farm.chainId][token])) *
                                  (tokenPrice || prices[farm.chainId][token])
                              )}
                            </span>
                            <span className="text-xs text-textSecondary">
                              {formatCurrency(toEth(BigInt(fee), decimals[farm.chainId][token]))}{" "}
                              {tokenNamesAndImages[token].name}
                            </span>
                          </div>
                        </div>
                      )}

                      {actualSlippage !== undefined && (
                        <div className="flex justify-between items-start">
                          <span className="text-textSecondary">Slippage:</span>
                          <div className="flex flex-col items-end">
                            <span className="text-base">$ {formatCurrency(actualSlippage)}</span>
                            <span className="text-xs text-textSecondary">
                              {formatCurrency(actualSlippage / (tokenPrice || prices[farm.chainId][token]))}{" "}
                              {tokenNamesAndImages[tx.token].name}
                            </span>
                          </div>
                        </div>
                      )}

                      {filteredReturnedAssets.length > 0 && (
                        <div className="mt-2">
                          <span className="text-textSecondary block mb-1">Returned:</span>
                          {filteredReturnedAssets.map((asset, index) => (
                            <div key={index} className="flex justify-between items-start pl-2">
                              <span>{tokenNamesAndImages[asset.token as Address]?.name || "Unknown"}</span>
                              <div className="flex flex-col items-end">
                                <span className="text-base">
                                  $
                                  {formatCurrency(
                                    Number(toEth(BigInt(asset.amount), 18)) *
                                      (tokenPrice || prices[farm.chainId][asset.token as Address])
                                  )}
                                </span>
                                <span className="text-xs text-textSecondary">
                                  {Number(formatUnits(BigInt(asset.amount), 18)).toLocaleString()}{" "}
                                  {tokenNamesAndImages[asset.token as Address]?.name || "Unknown"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {vaultShares !== undefined && (
                        <div className="flex justify-between items-start">
                          <span className="text-textSecondary">
                            {type === "deposit" ? "Vault Shares:" : "Zap Out Amount:"}
                          </span>
                          <div className="flex flex-col items-end">
                            <span className="text-base">
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
                            </span>
                            <span className="text-xs text-textSecondary">
                              {type === "deposit"
                                ? formatCurrency(
                                    Number(toEth(BigInt(vaultShares), decimals[farm.chainId][farm.vault_addr]))
                                  )
                                : formatCurrency(
                                    Number(toEth(BigInt(netAmount || "0"), decimals[farm.chainId][token]))
                                  )}{" "}
                              {type === "deposit" ? "BTX-" + farm.name : tokenNamesAndImages[token].name}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {!tx.steps.some((item) => item.status === TransactionStepStatus.FAILED) && (
                <div className="group relative pl-1 pb-1">
                  <FaExternalLinkAlt
                    className="text-textSecondary cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(
                        `${blockExplorersByChainId[chainId]}/tx/${tx.steps[tx.steps.length - 1].txHash}`,
                        "_blank"
                      );
                    }}
                  />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2 bg-bgSecondary rounded-lg text-sm text-textWhite w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    View transaction on explorer
                  </div>
                </div>
              )}
            </div>
            <p className="font-league-spartan font-light text-base text-textSecondary leading-5">
              {moment(date).fromNow()}
            </p>
          </div>

          {/* Price and Balance */}
          <div className="flex-shrink-0 flex flex-col items-end">
            <p className="font-league-spartan font-medium text-lg leading-5 text-textWhite">
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
            </p>
            <p className="font-league-spartan font-light text-base text-textSecondary leading-5">
              {netAmount
                ? Number(formatUnits(BigInt(netAmount), decimals[farm.chainId][token])).toLocaleString()
                : tokenAmount.toLocaleString()}{" "}
              {tokenNamesAndImages[token].name}
            </p>
          </div>
        </div>
        <TransactionDetails transactionId={_id} open={open} farm={undefined} tx={undefined} />
      </div>
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
      <p className="text-[1.5rem] font-bold text-textWhite mb-[1.2rem]">Transactions</p>
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-[0.7rem]">
          {transactions.map((item, i) => (
            <Row _id={item._id} key={i} />
          ))}
          {isLoading && (
            <div className="center">
              <div
                className="
                                    w-[18px] h-[18px] 
                                    border-2 border-solid 
                                    border-current border-b-transparent border-r-transparent 
                                    rounded-full 
                                    box-border 
                                    animate-rotation"
              />
            </div>
          )}
        </div>
      </div>
    </ModalLayout>
  );
};
