import { PoolDef } from "@beratrax/core/src/config/constants/pools_json";
import { useNotification } from "@beratrax/core/src/state/notification/useNotification";
import useTransactions from "@beratrax/core/src/state/transactions/useTransactions";
import { FarmTransactionType } from "@beratrax/core/src/types/enums";
import { formatBalance } from "@beratrax/core/src/utils/common";
import { FC, useEffect, useMemo } from "react";
import { ModalLayout } from "web/src/components/modals/ModalLayout/ModalLayout";
import TransactionDetails from "web/src/pages/Dashboard/Transactions/components/TransactionDetails";

interface DepositInfo {
	amount: string;
	showInUsd: boolean;
	token: string;
	transactionType: FarmTransactionType;
}

interface IProps {
	farm: PoolDef;
	handleClose: (closeDepositModal?: boolean) => void;
	txId: string;
	depositInfo?: DepositInfo;
}

const ConfirmFarmActionModal: FC<IProps> = ({ handleClose, txId, farm, depositInfo }) => {
	const { isLoading, reset } = useTransactions();
	const { errors, success, clearAllNotifications } = useNotification();

	// Update useMemo to depend on depositInfo and use more decimal places for precision
	const amount = useMemo(() => {
		// For earnings withdrawals, we need to maintain higher precision
		const isEarningsWithdrawal =
			depositInfo?.transactionType === FarmTransactionType.Withdraw &&
			depositInfo?.token &&
			depositInfo.amount &&
			parseFloat(depositInfo.amount) > 0 &&
			parseFloat(depositInfo.amount) < 0.1;

		// Use higher precision for small amounts (likely earnings)
		const fractionDigits = isEarningsWithdrawal ? 8 : 4;

		return formatBalance(depositInfo?.amount ?? "0", {
			maximumFractionDigits: fractionDigits,
		});
	}, [depositInfo]); // Add dependency on depositInfo to refresh when it changes

	const getTransactionTitle = () => {
		if (!depositInfo) return "";
		const action = depositInfo.transactionType === FarmTransactionType.Deposit ? "Depositing" : "Withdrawing";
		const currency = depositInfo.showInUsd ? "$" : "";
		return `${action} ${currency}${amount} ${depositInfo.token}`;
	};

	const getTransactionDescription = () => {
		if (!depositInfo) return "";
		const action = depositInfo.transactionType === FarmTransactionType.Deposit ? "deposit" : "withdraw";
		const currency = depositInfo.showInUsd ? "$" : "";
		return `We are taking care of all the steps to ${action} ${currency}${amount} ${depositInfo.token} ${
			depositInfo.transactionType === FarmTransactionType.Deposit ? "into" : "from"
		} ${farm.name} Vault for you!`;
	};

	useEffect(() => {
		clearAllNotifications();
	}, []);

	return (
		<ModalLayout
			onClose={() => {
				clearAllNotifications();
				handleClose();
			}}
			wrapperClassName="w-full lg:w-[92%]"
			style={{ borderColor: "var(--new-border_dark)" }}
		>
			<div className="text-textWhite flex flex-col gap-4">
				<p className="text-xl font-bold align-middle uppercase">{getTransactionTitle()}</p>
				<p className="text-textWhite mt-2 text-[16px] font-light leading-relaxed">{getTransactionDescription()}</p>

				<div className="mt-[1.2rem] flex flex-col gap-[0.7rem]">
					<TransactionDetails transactionId={txId} open={true} farm={undefined} tx={undefined} />
					{isLoading && (
						<div className="center">
							<div className="w-[18px] h-[18px] border-2 border-solid border-current border-b-transparent border-r-transparent rounded-full box-border animate-rotation" />
						</div>
					)}
				</div>

				{success.length > 0 && (
					<>
						<div className="bg-green-800/30 border border-green-600 rounded-md p-4 mt-2">
							{success.map((notification, index) => (
								<div key={index} className="mb-2 last:mb-0">
									{notification.title && <p className="text-green-400 font-semibold mb-1">{notification.title}</p>}
									<p className="text-green-400">{notification.message}</p>
								</div>
							))}
						</div>{" "}
						<button
							className={`mt-4 uppercase bg-buttonPrimaryLight text-textBlack w-full py-5 px-4 text-xl font-bold tracking-widest rounded-[40px]`}
							onClick={() => handleClose(true)}
						>
							Go Back
						</button>
					</>
				)}

				{errors.length > 0 && (
					<>
						<div className="bg-red-800/30 border border-red-600 rounded-md p-4 mt-2">
							{errors.map((error, index) => (
								<div key={index} className="mb-2 last:mb-0">
									{error.title && <p className="text-red-400 font-semibold mb-1">{error.title}</p>}
									<p className="text-red-400">{error.message}</p>
								</div>
							))}
						</div>
						<button
							className={`mt-4 uppercase bg-buttonPrimaryLight text-textBlack w-full py-5 px-4 text-xl font-bold tracking-widest rounded-[40px]`}
							onClick={() => handleClose()}
						>
							Close
						</button>
					</>
				)}
			</div>
		</ModalLayout>
	);
};

export default ConfirmFarmActionModal;
