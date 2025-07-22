import React, { useCallback, useEffect, useState } from "react";
import { ETFVaultDef, PoolDef } from "./../config/constants/pools_json";
import store, { useAppDispatch, useAppSelector } from "./../state";
import { setBestFunctionNameForArberaHoney, setFarmDetailInputOptions } from "./../state/farms/farmsReducer";
import useDeposit from "./../state/farms/hooks/useDeposit";
import useFarmDetails from "./../state/farms/hooks/useFarmDetails";
import useWithdraw from "./../state/farms/hooks/useWithdraw";
import useZapIn from "./../state/farms/hooks/useZapIn";
import useZapOut from "./../state/farms/hooks/useZapOut";
import useTokens from "./../state/tokens/useTokens";
import { FarmTransactionType } from "./../types/enums";
import { limitDecimals } from "./../utils";
import useWallet from "./useWallet";

export const useDetailInput = (farm: PoolDef | ETFVaultDef) => {
	const [amount, setAmount] = useState("");
	const [toggleAmount, setToggleAmount] = useState("");
	const [slippage, setSlippage] = useState<number>();
	const [fetchingSlippage, setFetchingSlippage] = useState(false);
	const [max, setMax] = useState(false);
	const { transactionType: type, currencySymbol, showInUsd } = useAppSelector((state) => state.farms.farmDetailInputOptions);
	const dispatch = useAppDispatch();

	const setShowInUsd = useCallback((val: boolean) => {
		dispatch(setFarmDetailInputOptions({ showInUsd: val }));
	}, []);

	const { prices } = useTokens();
	const { isLoading: isZapping, zapInAsync, slippageZapIn } = useZapIn(farm);
	// const { isLoading: isDepositing, depositAsync, slippageDeposit } = useDeposit(farm);
	const { isLoading: isZappingOut, zapOutAsync, slippageZapOut } = useZapOut(farm);
	// const { isLoading: isWithdrawing, withdrawAsync, slippageWithdraw } = useWithdraw(farm);
	const { farmDetails, isLoading, reloadVaultEarnings } = useFarmDetails();
	const farmData = farmDetails[farm.id];
	const { currentWallet } = useWallet();
	const [depositable, setDepositable] = React.useState(farmData?.depositableAmounts[0]);
	const [withdrawable, setWithdrawable] = React.useState(farmData?.withdrawableAmounts[0]);

	const maxBalance = React.useMemo(() => {
		if (type === FarmTransactionType.Deposit) {
			if (showInUsd) {
				return depositable?.amountDollar || "0";
			} else {
				return depositable?.amount || "0";
			}
		} else {
			if (showInUsd) {
				return withdrawable?.amountDollar || "0";
			} else {
				return withdrawable?.amount || "0";
			}
		}
	}, [showInUsd, depositable, withdrawable, type]);

	const getTokenAmount = () => {
		let amt = Number(amount);
		if (!depositable) return amt;

		const appState = store.getState();
		const earnings = appState.farms.earnings?.[farm.id] || 0;

		// Improved earnings detection with relative threshold and detailed logging
		const displayedEarningsValue = showInUsd ? earnings : earnings / prices[farm.chainId][farm.vault_addr];
		const absoluteDifference = Math.abs(amt - displayedEarningsValue);
		// Use a percentage-based threshold for small earnings values
		const relativeThreshold = Math.max(displayedEarningsValue * 0.1, 0.0001); // 10% or 0.0001 minimum

		const isEarningsWithdrawal =
			type === FarmTransactionType.Withdraw &&
			(absoluteDifference < relativeThreshold ||
				// Special case for tiny values
				(displayedEarningsValue < 0.001 && amt < 0.002 && amt > 0));

		// If this is an earnings withdrawal, use the exact earnings value
		if (isEarningsWithdrawal) {
			console.log("getTokenAmount: Detected earnings withdrawal");
			console.log("Amount:", amt);
			console.log("Earnings:", displayedEarningsValue);
			console.log("Absolute difference:", absoluteDifference);
			console.log("Threshold:", relativeThreshold);

			return showInUsd ? earnings / prices[farm.chainId][farm.vault_addr] : amt;
		}

		if (type === FarmTransactionType.Deposit) {
			if (showInUsd) {
				return amt / depositable.price;
			} else {
				return amt;
			}
		} else {
			if (showInUsd) {
				return amt / prices[farm.chainId][farm.vault_addr];
			} else {
				return (amt * withdrawable?.price!) / prices[farm.chainId][farm.vault_addr];
			}
		}
	};

	useEffect(() => {
		let amt = Number(amount);
		if (!depositable || !withdrawable) return;
		if (type === FarmTransactionType.Deposit) {
			if (showInUsd) {
				amt = amt / depositable.price;
			} else {
				amt = amt * depositable.price;
			}
		} else {
			if (showInUsd) {
				amt = amt / withdrawable.price;
			} else {
				amt = amt * withdrawable.price;
			}
		}

		setToggleAmount(limitDecimals(amt.toString(), 5));
	}, [amount, showInUsd, depositable, withdrawable]);

	const handleToggleShowInUsdc = useCallback(() => {
		setShowInUsd(!showInUsd);
	}, [showInUsd]);

	const handleInput: React.ChangeEventHandler<HTMLInputElement> = (e) => {
		setAmount(e.target.value);
		setMax(false);
	};

	const handleSubmit = async ({ bridgeChainId, txId }: { bridgeChainId?: number; txId: string }) => {
		// check for eth balance greater than gas fee
		// if (isBalanceTooLow()) return;
		// if enough balance than proceed transaction
		if (type === FarmTransactionType.Deposit) {
			if (depositable?.tokenAddress === farm.lp_address && false) {
				// await depositAsync({ depositAmount: getTokenAmount(), max });
			} else {
				await zapInAsync({
					zapAmount: getTokenAmount(),
					max,
					token: depositable?.tokenAddress!,
					bridgeChainId,
					txId,
				});
			}
		} else {
			if (withdrawable?.tokenAddress === farm.lp_address && false) {
				// await withdrawAsync({ withdrawAmount: getTokenAmount(), max });
			} else {
				await zapOutAsync({
					withdrawAmt: getTokenAmount(),
					max,
					token: withdrawable?.tokenAddress!,
					bridgeChainId,
					txId,
				});
			}
		}

		setAmount("");
		setMax(false);
	};

	const fetchSlippage = async () => {
		try {
			const amnt = getTokenAmount();
			let _slippage = NaN;
			if (type === FarmTransactionType.Deposit) {
				if (farm.hasOwnProperty('lp_address') && depositable?.tokenAddress === (farm as PoolDef).lp_address) {
					// const res = await slippageDeposit({ depositAmount: amnt, max });
					// console.log(res);
					// _slippage = res?.slippage ?? NaN;
					_slippage = 0.0;
					dispatch(setBestFunctionNameForArberaHoney("zapIn"));
				} else {
					const res = await slippageZapIn({ zapAmount: amnt, max, token: depositable?.tokenAddress! });
					console.log(res);
					dispatch(setBestFunctionNameForArberaHoney(res?.bestFunctionName!));
					_slippage = res?.slippage ?? NaN;
				}
			} else {
				if (farm.hasOwnProperty('lp_address') && withdrawable?.tokenAddress === (farm as PoolDef).lp_address) {
					// const res = await slippageWithdraw({ withdrawAmount: amnt, max });
					// console.log(res);
					// _slippage = res?.slippage ?? NaN;
					_slippage = 0.0;
					dispatch(setBestFunctionNameForArberaHoney("zapOut"));
				} else {
					const res = await slippageZapOut({ withdrawAmt: amnt, max, token: withdrawable?.tokenAddress! });
					console.log(res);
					dispatch(setBestFunctionNameForArberaHoney(res?.bestFunctionName!));
					_slippage = res?.slippage ?? NaN;
				}
			}
			if (_slippage.toString())
				setSlippage(
					_slippage - 0.69 > 0 ? _slippage - 0.69 : 0.01 // subtracting 0.69% fee from slippage if result > 0, else 0.01%
				);
			// temporary hardcoding 0.01% slippage instead of zero
			else setSlippage(undefined);
		} catch (err) {
			console.log(`%cError Slippage: ${err}`, "color: magenta;");
			setSlippage(undefined);
		}
	};

	useEffect(() => {
		if (max) setAmount(limitDecimals(maxBalance.toString(), 5));
	}, [max, maxBalance, showInUsd]);

	useEffect(() => {
		let _depositable = farmData?.depositableAmounts.find((item) => item.tokenSymbol === currencySymbol);
		if (!_depositable) {
			_depositable = farmData?.depositableAmounts[0];
		}
		setDepositable(_depositable);

		let _withdrawable = farmData?.withdrawableAmounts.find((item) => item.tokenSymbol === currencySymbol);
		if (!_withdrawable) {
			_withdrawable = farmData?.withdrawableAmounts[0];
		}
		setWithdrawable(_withdrawable);
		if (depositable?.amountDollar !== _depositable?.amountDollar || withdrawable?.amountDollar !== _withdrawable?.amountDollar)
			setMax(false);
	}, [currencySymbol, farmData]);

	useEffect(() => {
		if (getTokenAmount() === 0) {
			setSlippage(undefined);
			return;
		}

		console.log("%cAmount changed", "color: lightgreen;");
		setFetchingSlippage(true);
		const int = setTimeout(async () => {
			console.log("%cFetching slippage", "color: lightgreen;");
			await fetchSlippage();
			setFetchingSlippage(false);
		}, 500);
		return () => {
			clearTimeout(int);
		};
	}, [max, amount, showInUsd, type, depositable?.tokenAddress, withdrawable?.tokenAddress]);

	return {
		type,
		amount,
		toggleAmount,
		slippage,
		depositable,
		showInUsd,
		currentWallet,
		maxBalance,
		setMax,
		fetchingSlippage,
		handleToggleShowInUsdc,
		max,
		getTokenAmount,
		handleInput,
		withdrawable,
		handleSubmit,
		isLoadingTransaction: isZapping || isZappingOut,
		isLoadingFarm: isLoading,
	};
};
