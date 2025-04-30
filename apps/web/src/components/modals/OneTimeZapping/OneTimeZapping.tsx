import { FC, useState } from "react";
import { ModalLayout } from "web/src/components/modals/ModalLayout/ModalLayout";
import styles from "./OneTimeZapping.module.css";
import { useAppDispatch } from "@beratrax/core/src/state";
import { useWallet } from "@beratrax/core/src/hooks";
import { ImSpinner8 } from "react-icons/im";
import { disableZapWarning } from "@beratrax/core/src/state/account/accountReducer";

interface IProps {
	inputToken: string;
	outputToken: string;
	handleClose: Function;
	handleSubmit: Function;
}

export const OneTimeZapping: FC<IProps> = ({ inputToken, outputToken, handleClose, handleSubmit }) => {
	const dispatch = useAppDispatch();
	const { currentWallet } = useWallet();
	const [isLoading, setIsLoading] = useState(false);
	const [doNotNotifyAgain, setDoNotNotifyAgain] = useState(false);

	const handleUnderstand = async () => {
		if (!currentWallet) return;
		setIsLoading(true);
		await dispatch(disableZapWarning({ address: currentWallet, value: doNotNotifyAgain }));
		setIsLoading(false);
		handleClose();
		handleSubmit();
	};

	return (
		<ModalLayout onClose={handleClose} className={`${styles.container}`} style={{ zIndex: 20 }} wrapperClassName="lg:w-full">
			<div className="w-full mb-4">
				<div className="overflow-y-auto pr-2 pt-4 text-justify normal-case text-sm font-league-spartan">
					<p className="text-2xl font-bold text-center">Important Notice!</p>
					<p className="text-base">
						You are choosing to trade your <span className="font-bold">${inputToken}</span> for a share in the{" "}
						<span className="font-bold">${outputToken}</span>. You understand that after this transaction, you now hold{" "}
						<span className="font-bold">${outputToken}</span>, and BeraTrax is increasing your position in{" "}
						<span className="font-bold">${outputToken}</span>. You recognize the prices changes of
						<span className="font-bold"> ${outputToken}</span> apply to your position, and the price changes of
						<span className="font-bold"> ${inputToken}</span> are no longer relevant.
					</p>
				</div>
			</div>
			<div className={`${styles.checkbox}`}>
				<input
					type="checkbox"
					name="doNotNotify"
					id="doNotNotify"
					checked={doNotNotifyAgain}
					onChange={() => setDoNotNotifyAgain((prev) => !prev)}
				/>
				<label className="text-white" htmlFor="doNotNotify">
					Do not notify me again
				</label>
			</div>
			<div className={styles.buttonsContainer}>
				<button
					className="bg-bgPrimary p-4 rounded-xl w-24"
					onClick={() => {
						handleClose();
					}}
				>
					Cancel
				</button>
				<button className={`bg-bgPrimary p-4 rounded-xl w-24`} disabled={isLoading} onClick={handleUnderstand}>
					{isLoading ? <ImSpinner8 className={styles.loader} /> : "I understand"}
				</button>
			</div>
		</ModalLayout>
	);
};
