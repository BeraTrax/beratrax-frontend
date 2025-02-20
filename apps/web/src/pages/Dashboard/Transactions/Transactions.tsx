import { FC, useMemo, useRef, useState } from "react";
import moment from "moment";
import { ModalLayout } from "src/components/modals/ModalLayout/ModalLayout";
import { useAppDispatch, useAppSelector } from "src/state";
import { TransactionStatus, TransactionStepStatus } from "src/state/transactions/types";
import { formatUnits } from "viem";
import { IoIosArrowForward } from "react-icons/io";
import useTransactions from "src/state/transactions/useTransactions";
import TransactionDetails from "./components/TransactionDetails";
import { IoChevronUpOutline } from "react-icons/io5";
import { IoChevronDownOutline } from "react-icons/io5";
import useTransaction from "src/state/transactions/useTransaction";
import { CiRepeat } from "react-icons/ci";
import useZapIn from "src/state/farms/hooks/useZapIn";
import useZapOut from "src/state/farms/hooks/useZapOut";
import { toEth } from "src/utils/common";
import { deleteTransactionDb } from "src/state/transactions/transactionsReducer";
import useTokens from "src/state/tokens/useTokens";
import { tokenNamesAndImages } from "src/config/constants/pools_json";

const Transactions = () => {
    const [open, setOpen] = useState(false);
    const transactions = useAppSelector((state) => state.transactions.transactions.slice(0, 3));

    return (
        <div>
            <div className="flex justify-between items-center gap-2.5 mt-4">
                <p className="font-arame-mono font-normal text-base text-textWhite leading-4 uppercase ">
                    Last Transactions
                </p>
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
    const { type, amountInWei, token, vaultPrice, tokenPrice, steps, date } = tx;
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
                            <p className={`font-league-spartan font-medium text-lg leading-6 text-textWhite`}>
                                {farm.name}
                            </p>
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
                                        BigInt(amountInWei),
                                        decimals[farm.chainId][type === "withdraw" ? farm.vault_addr : token]
                                    )
                                ) *
                                (type === "withdraw"
                                    ? vaultPrice || prices[farm.chainId][farm.vault_addr]
                                    : (tokenPrice || prices[farm.chainId][token])!)
                            ).toLocaleString()}
                        </p>
                        <p className="font-league-spartan font-light text-base text-textSecondary leading-5">
                            {tokenAmount.toLocaleString()} {tokenNamesAndImages[token].name}
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
