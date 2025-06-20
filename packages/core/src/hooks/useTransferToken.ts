import { FormEvent, useCallback, useEffect, useState } from "react";
import useTokens from "../state/tokens/useTokens";
import { dismissNotify, notifyError, notifyLoading, notifySuccess } from "./../api/notify";
import { errorMessages, loadingMessages, successMessages } from "./../config/constants/notifyMessages";
import { Token } from "./../types";
import { resolveEnsDomain, toWei } from "./../utils/common";
import useTransfer from "./useTransfer";

export const useTransferToken = (token: Token, handleClose: Function) => {
	const { reloadBalances } = useTokens();
	const [receiverAddress, setReceiverAddress] = useState<string>("");
	const [amount, setAmount] = useState("");
	const [showInUsd, toggleShowInUsd] = useState<boolean>(true);
	const { transfer, isLoading } = useTransfer();
	const [max, setMax] = useState(false);

	const getAmountInWei = useCallback(() => {
		const price = token.price;
		let amountInEthFormat = showInUsd ? (parseFloat(amount) / price).toString() : amount;
		console.log(amount, price, amountInEthFormat, token.decimals);
		const converted = toWei(amountInEthFormat, token.decimals);
		return converted;
	}, [amount, showInUsd, token.price, token.decimals]);

	const handleSubmit = useCallback(
		async (e: FormEvent) => {
			e.preventDefault();
			const id = notifyLoading(loadingMessages.transferingTokens());
			try {
				if (!receiverAddress || receiverAddress.trim() === "") {
					throw new Error("Receiver address is required!");
				}

				const addr = await resolveEnsDomain(receiverAddress.trim());
				if (addr === null) {
					throw new Error("Invalid domain!");
				}
				const res = await transfer({
					tokenAddress: token.address,
					to: addr,
					amount: getAmountInWei(),
					max,
					chainId: token.networkId,
				});
				if (res?.error) throw new Error(res.error);
				notifySuccess(successMessages.tokenTransfered());
			} catch (error: any) {
				console.log(error);
				let err = JSON.parse(JSON.stringify(error.message || "Error transfering tokens..."));
				notifyError(errorMessages.generalError(err));
			}

			dismissNotify(id);
			handleClose();
			reloadBalances();
		},
		[receiverAddress, amount, max, showInUsd, token, transfer, handleClose, reloadBalances]
	);

	const handleMaxClick = () => {
		setMax(true);
		setAmount(showInUsd ? token.usdBalance : token.balance);
	};

	const handleToggleShowInUsdc = useCallback(() => {
		toggleShowInUsd((prev) => !prev);
	}, [toggleShowInUsd]);

	useEffect(() => {
		if (max) handleMaxClick();
	}, [showInUsd]);

	return {
		isLoading,
		showInUsd,
		amount,
		setAmount,
		receiverAddress,
		setReceiverAddress,
		setMax,
		handleSubmit,
		handleMaxClick,
		handleToggleShowInUsdc,
	};
};
