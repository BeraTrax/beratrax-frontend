import React from "react";
import { FaRegCircle } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";

import CheckMark from "src/assets/images/checkmark.png";
import { PoolDef, tokenNamesAndImages } from "src/config/constants/pools_json";
import { Transaction, TransactionStepStatus } from "src/state/transactions/types";
import useTransaction from "src/state/transactions/useTransaction";
import { formatCurrency } from "src/utils/common";
import { formatUnits, zeroAddress } from "viem";
import styles from "./TransactionDetails.module.css";
import useTokens from "src/state/tokens/useTokens";

type IProps =
    | {
          transactionId: string;
          open: boolean;
          showLoadingBar?: boolean;
          tx: undefined;
          farm: undefined;
      }
    | {
          transactionId: undefined;
          open: boolean;
          showLoadingBar?: boolean;
          tx: Transaction;
          farm: PoolDef;
      };

const TransactionDetails: React.FC<IProps> = (args) => {
    let farm: PoolDef | undefined = args.farm;
    let tx: Transaction | undefined = args.tx;
    const obj = useTransaction(args.transactionId);
    const { decimals, userAllBalances } = useTokens();
    farm = obj?.farm;
    tx = obj?.tx;

    if (!farm || !tx) return;

    return (
        <div className={`${styles.container} ${args.open ? styles.open : styles.closed}`}>
            {args.showLoadingBar && (
                <div className={styles.loadingBarContainer}>
                    <div
                        className={
                            tx.steps.some((item) => item.status === TransactionStepStatus.IN_PROGRESS)
                                ? styles.loadingBarAnimated
                                : ""
                        }
                    />
                </div>
            )}
            <div style={{ marginTop: 20 }}>
                {tx.steps.map((step, i) => {
                    const tokenDecimals = decimals[farm.chainId][tx.token] ?? 18;
                    const amount = Number(formatUnits(BigInt(step.amount ?? 0), tokenDecimals));
                    const amountInUsd = (amount * tx.vaultPrice!) / tx.tokenPrice!;
                    // console.log('decimals[farm.chainId][tx.token]',decimals[farm.chainId][tx.token]);
                    // console.log('step.amount',step.amount);
                    // console.log('tokenDecimals',tokenDecimals);
                    // console.log('tx.vaultPrice',tx.vaultPrice);
                    // console.log('tx.tokenPrice',tx.tokenPrice);
                    // console.log('amount',amount);
                    // console.log('amountInUsd',amountInUsd);
                    // console.log('token address',tx.token);
                    // console.log(formatCurrency( tx.type === "deposit" ? amount : amountInUsd))
                    return (
                        <React.Fragment key={i}>
                            {getStep(
                                step.type,
                                step.status,
                                tx.type === "deposit" ? amount : amountInUsd,
                                tokenNamesAndImages[tx.token]?.name || userAllBalances.find((token) => token.address === tx.token)?.name || "",
                                i === tx.steps.length - 1
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default TransactionDetails;

function getStep(name: string, status: TransactionStepStatus, value: number, tokenName?: string, isLastStep?: boolean) {
    return (
        <div>
            <div className="flex gap-x-2">
                {status === TransactionStepStatus.COMPLETED ? (
                    // <FaRegCircleCheck className={`mr-1 text-textPrimary`} />
                    <img src={CheckMark} alt="Check mark" className="w-5 h-5" />
                ) : status === TransactionStepStatus.FAILED ? (
                    <MdOutlineCancel style={{ color: "red" }} />
                ) : status === TransactionStepStatus.PENDING ? (
                    <FaRegCircle color="var(--new-color_secondary)" style={{ transform: "scale(0.8)" }} />
                ) : (
                    <div
                        className={
                            "w-5 h-5 border-[3px] border-bgPrimary border-b-transparent border-r-transparent rounded-full scale-80 box-border animate-spin"
                        }
                    />
                )}
                <div>
                    <p className="font-league-spartan font-light text-base leading-5 text-textWhite">{name}</p>
                    {value && (
                        <p className={`${styles.tokenValue} text-textSecondary font-light text-base leading-5`}>
                            {formatCurrency(value)} {tokenName}
                        </p>
                    )}
                </div>
            </div>
            {!isLastStep && (
                <div className="flex flex-col pl-2 pt-1 sm:pl-2.5">
                    <div className="w-0.5 h-0.5 mb-1.5 bg-bgPrimary" />
                    <div className="w-0.5 h-0.5 mb-1.5 bg-bgPrimary" />
                    <div className="w-0.5 h-0.5 mb-1 bg-bgPrimary" />
                </div>
            )}
        </div>
    );
}
