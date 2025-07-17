import { approveErc20, getBalance } from "../../api/token";
import { awaitTransaction, subtractGas, toEth, toWei } from "../../utils/common";
import { dismissNotify } from "../../api/notify";
import { getHoneyAllowanceSlot, getHoneyBalanceSlot } from "../../utils/slot";
import { errorMessages, successMessages } from "../../config/constants/notifyMessages";
import {
	SlippageInBaseFn,
	SlippageOutBaseFn,
	TokenAmounts,
	ZapInBaseFn,
	ZapOutBaseFn,
	PriceCalculationProps,
	ZapInFn,
	ZapOutFn,
	GetFarmDataProcessedFn,
	FarmFunctions,
} from "./types";
import { addressesByChainId } from "../../config/constants/contracts";
import { isGasSponsored } from "..";
import {
	Address,
	encodeAbiParameters,
	encodeFunctionData,
	encodePacked,
	keccak256,
	maxUint256,
	numberToHex,
	StateOverride,
	zeroAddress,
	parseEventLogs,
} from "viem";
import zapperAbi from "../../assets/abis/zapperAbi";
import rewardVaultAbi from "../../assets/abis/rewardVaultAbi";
import { IClients } from "../../types";
import store from "../../state";
import { TransactionStepStatus } from "../../state/transactions/types";
import { editTransactionDb, markAsFailedDb, TransactionsDB } from "../../state/transactions/transactionsReducer";
import { addNotificationWithTimeout } from "../../state/notification/notifiactionReducer";
import { setSimulatedSlippage } from "../../state/farms/farmsReducer";
import { Balances } from "../../state/tokens/types";
import pools_json, { PoolDef, tokenNamesAndImages } from "../../config/constants/pools_json";

export const zapInBase: ZapInBaseFn = async ({
	withBond,
	farm,
	amountInWei,
	balances,
	token,
	isSocial,
	currentWallet,
	estimateTxGas,
	getClients,
	getWalletClient,
	max,
	id,
	getPublicClient,
	tokenIn,
}) => {
	const wethAddress = addressesByChainId[farm.chainId].wethAddress as Address;
	const publicClient = getPublicClient(farm.chainId);
	const client = await getClients(farm.chainId);
	const state = store.getState();
	const prices = state.tokens.prices;
	const decimals = state.tokens.decimals;
	let zapperTxn;
	const TransactionsStep = new TransactionsDB(id);
	try {
		if (max) {
			const balance = balances[farm.chainId][token].valueWei;
			amountInWei = BigInt(balance);
		}

		// #region Zapping In
		// notifyLoading(loadingMessages.zapping(), { id });

		const zapFunctionName = withBond
			? (store.getState().farms.farmDetailInputOptions.bestFunctionNameForArberaHoney as any)
			: token === zeroAddress
				? "zapIn"
				: "zapIn";
		// eth zap
		if (token === zeroAddress) {
			// use weth address as tokenId, but in case of some farms (e.g: hop)
			// we need the token of liquidity pair, so use tokenIn if provided
			token = tokenIn ?? wethAddress;

			await TransactionsStep.zapIn(TransactionStepStatus.IN_PROGRESS, amountInWei);
			const client = await getClients(farm.chainId);
			if (!isSocial && !(await isGasSponsored(currentWallet))) {
				const afterGasCut = await subtractGas(
					amountInWei,
					{ public: publicClient },
					estimateTxGas({
						to: farm.zapper_addr,
						value: amountInWei,
						chainId: farm.chainId,
						data: encodeFunctionData({
							abi: zapperAbi,
							functionName: zapFunctionName,
							args: [farm.vault_addr, zeroAddress, 0n, 0n],
						}),
					})
				);
				if (!afterGasCut) {
					dismissNotify(id);
					throw new Error("Error subtracting gas!");
				}
				amountInWei = afterGasCut;
			}

			// notifyLoading(loadingMessages.zapping(), { id });
			zapperTxn = await awaitTransaction(
				client.wallet.sendTransaction({
					account: currentWallet,
					to: farm.zapper_addr,
					value: amountInWei,
					data: encodeFunctionData({
						abi: zapperAbi,
						functionName: zapFunctionName,
						args: [farm.vault_addr, zeroAddress, 0n, 0n],
					}),
				}),
				client,
				async (hash) => {
					await TransactionsStep.zapIn(TransactionStepStatus.IN_PROGRESS, amountInWei, hash);
				}
			);
			await TransactionsStep.zapIn(TransactionStepStatus.COMPLETED, amountInWei);
		}
		// token zap
		else {
			// #region Approve
			// first approve tokens, if zap is not in eth
			if (token !== zeroAddress) {
				// notifyLoading(loadingMessages.approvingZapping(), { id });
				await TransactionsStep.approveZap(TransactionStepStatus.IN_PROGRESS);
				const response = await approveErc20(
					token,
					farm.zapper_addr as Address,
					amountInWei,
					currentWallet,
					farm.chainId,
					getPublicClient,
					getWalletClient
				);
				if (!response.status) {
					await TransactionsStep.approveZap(TransactionStepStatus.FAILED);
					throw new Error("Error approving vault!");
				}
				await TransactionsStep.approveZap(TransactionStepStatus.COMPLETED);
			}
			// #endregion
			await TransactionsStep.zapIn(TransactionStepStatus.IN_PROGRESS, amountInWei);

			// notifyLoading(loadingMessages.zapping(), { id });
			const client = await getClients(farm.chainId);

			zapperTxn = await awaitTransaction(
				client.wallet.sendTransaction({
					account: currentWallet,
					to: farm.zapper_addr,
					data: encodeFunctionData({
						abi: zapperAbi,
						functionName: zapFunctionName,
						args: [farm.vault_addr, token, amountInWei, 0n],
					}),
				}),
				client,
				async (hash) => {
					await TransactionsStep.zapIn(TransactionStepStatus.IN_PROGRESS, amountInWei, hash);
				}
			);
		}

		if (!zapperTxn.status) {
			store.dispatch(markAsFailedDb(id));
			await TransactionsStep.zapIn(TransactionStepStatus.FAILED, amountInWei);
			throw new Error(zapperTxn.error);
		} else {
			await TransactionsStep.zapIn(TransactionStepStatus.COMPLETED, amountInWei);
			dismissNotify(id);

			const vaultBalance = await getBalance(farm.vault_addr, currentWallet, client);
			// if (farm.rewardVault) {
			// 	await TransactionsStep.stakeIntoRewardVault(TransactionStepStatus.IN_PROGRESS);
			// 	await stakeIntoRewardVault(farm, vaultBalance, currentWallet, getClients, getPublicClient, getWalletClient);
			// 	await TransactionsStep.stakeIntoRewardVault(TransactionStepStatus.COMPLETED);
			// }

			// notifySuccess(successMessages.zapIn());
			const successMessage = successMessages.zapIn();
			store.dispatch(
				addNotificationWithTimeout({
					type: "success",
					title: successMessage.title,
					message: typeof successMessage.message === "function" ? successMessage.message(id) : successMessage.message,
				})
			);
		}

		const logs = parseEventLogs({
			abi: zapperAbi,
			logs: zapperTxn.receipt?.logs ?? [],
		}) as any[];

		const fee = logs[0].args.fee.toString();
		const vaultShares = logs[0].args.shares.toString();
		const lpTokens = logs[0].args.assetsIn.toString();
		const returnedAssets = logs[0].args.returnedAssets.map((asset: any) => ({
			amount: asset.amounts.toString(),
			token: asset.tokens,
		}));

		// Calculate total value of returned assets
		const totalReturnedValue =
			logs[0].args.returnedAssets?.reduce((acc: number, { tokens, amounts }: any) => {
				const tokenPrice = prices[farm.chainId][tokens];
				const tokenAmount = Number(toEth(amounts, decimals[farm.chainId][tokens]));
				return acc + tokenAmount * tokenPrice;
			}, 0) || 0;

		const slippage =
			Number(toEth(amountInWei)) * prices[farm.chainId][token] -
			totalReturnedValue -
			Number(toEth(fee, decimals[farm.chainId][token])) * prices[farm.chainId][token] -
			Number(toEth(vaultShares)) * prices[farm.chainId][farm.vault_addr];

		const netAmount = toWei((Number(toEth(vaultShares)) * prices[farm.chainId][farm.vault_addr]) / prices[farm.chainId][token]).toString();

		const dbTx = await store.dispatch(
			editTransactionDb({
				_id: id,
				from: currentWallet!,
				amountInWei: amountInWei.toString(),
				date: new Date().toString(),
				type: "deposit",
				farmId: farm.id,
				max: !!max,
				token: token === addressesByChainId[farm.chainId].wethAddress ? zeroAddress : token,
				vaultShares,
				fee,
				simulatedSlippage: store.getState().farms.farmDetailInputOptions.simulatedSlippage,
				actualSlippage: slippage,
				netAmount,
				vaultPrice: prices[farm.chainId][farm.vault_addr],
				tokenPrice: prices[farm.chainId][token],
				lpTokenPrice: prices[farm.chainId][farm.lp_address],
				lpTokens,
				returnedAssets,
			})
		);
		// #endregionbn
	} catch (error: any) {
		console.log(error);
		let err = JSON.parse(JSON.stringify(error));
		id && dismissNotify(id);
		store.dispatch(markAsFailedDb(id));
		// notifyError(errorMessages.generalError(error.message || err.reason || err.message));
		const generalError = errorMessages.generalError(error.message || err.reason || err.message);
		store.dispatch(
			addNotificationWithTimeout({
				type: "error",
				title: generalError.title,
				message:
					typeof generalError.message === "function"
						? generalError.message(error.message || err.reason || err.message)
						: generalError.message,
			})
		);
	}
};

export const zapOutBase: ZapOutBaseFn = async ({
	withBond,
	farm,
	amountInWei,
	getPublicClient,
	getWalletClient,
	token,
	currentWallet,
	getClients,
	max,
	bridgeChainId,
	id,
}) => {
	// notifyLoading(loadingMessages.approvingWithdraw(), { id });
	const TransactionsStep = new TransactionsDB(id);
	const state = store.getState();
	const prices = state.tokens.prices;
	const decimals = state.tokens.decimals;

	try {
		const client = await getClients(farm.chainId);
		let vaultBalance = await getBalance(farm.vault_addr, currentWallet, client);

		// if (vaultBalance < amountInWei) {
		// 	await TransactionsStep.withdrawFromRewardVault(TransactionStepStatus.IN_PROGRESS);
		// 	if (!farm.rewardVault) throw new Error("Reward vault not found");
		// 	const amountToWithdrawFromRewardVault = amountInWei - vaultBalance;

		// 	const rewardVaultWithdrawStatus = await awaitTransaction(
		// 		client.wallet.sendTransaction({
		// 			to: farm.rewardVault,
		// 			data: encodeFunctionData({
		// 				abi: rewardVaultAbi,
		// 				functionName: "withdraw",
		// 				args: [amountToWithdrawFromRewardVault],
		// 			}),
		// 		}),
		// 		client
		// 	);
		// 	if (!rewardVaultWithdrawStatus.status) {
		// 		await TransactionsStep.withdrawFromRewardVault(TransactionStepStatus.FAILED);
		// 		throw new Error(rewardVaultWithdrawStatus.error);
		// 	}
		// 	await TransactionsStep.withdrawFromRewardVault(TransactionStepStatus.COMPLETED);
		// }

		await TransactionsStep.approveZap(TransactionStepStatus.IN_PROGRESS);

		vaultBalance = await getBalance(farm.vault_addr, currentWallet, client);

		const zapFunctionName = withBond
			? (store.getState().farms.farmDetailInputOptions.bestFunctionNameForArberaHoney as any)
			: token === zeroAddress
				? "zapOut"
				: "zapOut";

		//#region Approve
		if (
			!(await approveErc20(farm.vault_addr, farm.zapper_addr, vaultBalance, currentWallet, farm.chainId, getPublicClient, getWalletClient))
				.status
		)
			throw new Error("Error approving vault!");

		await TransactionsStep.approveZap(TransactionStepStatus.COMPLETED);

		dismissNotify(id);
		//#endregion

		//#region Zapping Out
		// notifyLoading(loadingMessages.withDrawing(), { id });

		let withdrawTxn: Awaited<ReturnType<typeof awaitTransaction>>;

		await TransactionsStep.zapOut(TransactionStepStatus.IN_PROGRESS, amountInWei);
		if (token === zeroAddress) {
			withdrawTxn = await awaitTransaction(
				client.wallet.sendTransaction({
					account: currentWallet,
					to: farm.zapper_addr,
					data: encodeFunctionData({
						abi: zapperAbi,
						functionName: zapFunctionName,
						args: [farm.vault_addr, amountInWei, token, 0n],
					}),
				}),
				client,
				async (hash) => {
					await TransactionsStep.zapOut(TransactionStepStatus.IN_PROGRESS, amountInWei, hash);
				}
			);
		} else {
			withdrawTxn = await awaitTransaction(
				client.wallet.sendTransaction({
					account: currentWallet,
					to: farm.zapper_addr,
					data: encodeFunctionData({
						abi: zapperAbi,
						functionName: zapFunctionName,
						args: [farm.vault_addr, max ? vaultBalance : amountInWei, token, 0n],
					}),
				}),
				client,
				async (hash) => {
					await TransactionsStep.zapOut(TransactionStepStatus.IN_PROGRESS, amountInWei, hash);
				}
			);
		}
		if (!withdrawTxn.status) {
			store.dispatch(markAsFailedDb(id));
			await TransactionsStep.zapOut(TransactionStepStatus.FAILED, amountInWei);
			throw new Error(withdrawTxn.error);
		} else {
			await TransactionsStep.zapOut(TransactionStepStatus.COMPLETED, amountInWei);
			dismissNotify(id);
			// notifySuccess(successMessages.withdraw());
			const successMessage = successMessages.withdraw();
			store.dispatch(
				addNotificationWithTimeout({
					type: "success",
					title: successMessage.title,
					message: typeof successMessage.message === "function" ? successMessage.message(id) : successMessage.message,
				})
			);
		}

		const logs = parseEventLogs({
			abi: zapperAbi,
			logs: withdrawTxn.receipt?.logs ?? [],
		}) as any[];

		const fee = logs[0].args.fee.toString();
		const vaultShares = logs[0].args.shares.toString();
		const lpTokens = logs[0].args.assetsOut.toString();
		const assetsOut = logs[0].args.tokenOutAmount;
		const returnedAssets = logs[0].args.returnedAssets.map((asset: any) => ({
			amount: asset.amounts.toString(),
			token: asset.tokens,
		}));
		const returnedAssetsValue =
			logs[0].args.returnedAssets?.reduce((acc: number, { tokens, amounts }: any) => {
				const tokenPrice = prices[farm.chainId][tokens];
				const tokenAmount = Number(toEth(amounts, decimals[farm.chainId][tokens]));
				return acc + tokenAmount * tokenPrice;
			}, 0) || 0;

		const slippage = Math.max(
			0,
			Number(toEth(amountInWei, decimals[farm.chainId][farm.vault_addr])) * prices[farm.chainId][farm.vault_addr] -
				returnedAssetsValue -
				Number(toEth(fee, decimals[farm.chainId][token])) * prices[farm.chainId][token] -
				Number(toEth(assetsOut, decimals[farm.chainId][token])) * prices[farm.chainId][token]
		);

		const returnedAssetsValueInToken = toWei(returnedAssetsValue / prices[farm.chainId][token]);
		const netAmount = (BigInt(assetsOut) + BigInt(fee) + BigInt(returnedAssetsValueInToken)).toString();

		const dbTx = await store.dispatch(
			editTransactionDb({
				_id: id,
				amountInWei: amountInWei.toString(),
				date: new Date().toString(),
				type: "withdraw",
				farmId: farm.id,
				token: token === addressesByChainId[farm.chainId].wethAddress ? zeroAddress : token,
				vaultShares,
				fee,
				simulatedSlippage: store.getState().farms.farmDetailInputOptions.simulatedSlippage,
				actualSlippage: slippage,
				netAmount,
				vaultPrice: prices[farm.chainId][farm.vault_addr],
				tokenPrice: prices[farm.chainId][token],
				lpTokenPrice: prices[farm.chainId][farm.lp_address],
				lpTokens,
				returnedAssets,
				from: currentWallet,
				max: !!max,
			})
		);
		//#endregion
	} catch (error: any) {
		console.log(error);
		let err = JSON.parse(JSON.stringify(error));
		dismissNotify(id);
		store.dispatch(markAsFailedDb(id));
		// notifyError(errorMessages.generalError(error.message || err.reason || err.message));
		const generalError = errorMessages.generalError(error.message || err.reason || err.message);
		store.dispatch(
			addNotificationWithTimeout({
				type: "error",
				title: generalError.title,
				message:
					typeof generalError.message === "function"
						? generalError.message(error.message || err.reason || err.message)
						: generalError.message,
			})
		);
	}
};

export const slippageIn: SlippageInBaseFn = async (args) => {
	let { amountInWei, balances, currentWallet, token, max, getPublicClient, decimals, prices, getWalletClient, farm, tokenIn } = args;
	const wberaAddress = addressesByChainId[farm.chainId]?.beraAddress as Address;
	const publicClient = getPublicClient(farm.chainId);
	let isBridged = false;
	let receviedAmt = 0n;
	let returnedAssets: { tokens: `0x${string}`; amounts: bigint }[] = [];

	try {
		//#region Select Max
		if (max) {
			const balance = balances[farm.chainId][token].valueWei;
			amountInWei = BigInt(balance);
		}
		//#endregion
		let stateOverrides: StateOverride = [];
		if (token !== zeroAddress) {
			stateOverrides.push({
				address: token,
				stateDiff: [
					{
						slot: getHoneyAllowanceSlot(currentWallet, farm.zapper_addr),
						value: numberToHex(amountInWei, { size: 32 }),
					},
					{
						slot: getHoneyBalanceSlot(currentWallet),
						value: numberToHex(amountInWei, { size: 32 }),
					},
					{
						slot: getIbgtAllowanceSlot(currentWallet, farm.zapper_addr),
						value: numberToHex(amountInWei, { size: 32 }),
					},
					{
						slot: getIbgtBalanceSlot(currentWallet),
						value: numberToHex(amountInWei, { size: 32 }),
					},
				],
			});
		} else {
			stateOverrides.push({
				address: currentWallet,
				balance: amountInWei,
			});
		}
		// #region Zapping In

		// eth zap
		if (token === zeroAddress) {
			// use weth address as tokenId, but in case of some farms (e.g: hop)
			// we need the token of liquidity pair, so use tokenIn if provided
			
			token = tokenIn ?? wberaAddress;
			const { result: vaultBalance } = await publicClient.simulateContract({
				abi: zapperAbi,
				functionName: "zapIn",
				args: [farm.vault_addr, zeroAddress, amountInWei, 0n],
				address: farm.zapper_addr,
				account: currentWallet,
				value: amountInWei,
				stateOverride: stateOverrides,
			});
			receviedAmt = vaultBalance[0];
			returnedAssets = vaultBalance[1] as { tokens: `0x${string}`; amounts: bigint }[];
		}
		// token zap
		else {
			const { result: vaultBalance } = await publicClient.simulateContract({
				abi: zapperAbi,
				functionName: "zapIn",
				args: [farm.vault_addr, token, amountInWei, 0n],
				address: farm.zapper_addr,
				account: currentWallet,
				stateOverride: stateOverrides,
			});
			console.log("vaultBalance", vaultBalance);
			receviedAmt = vaultBalance[0];
			returnedAssets = vaultBalance[1] as { tokens: `0x${string}`; amounts: bigint }[];
		}

		// #endregionbn
	} catch (error: any) {
		console.log(error);
	}
	// Calculate total value of returned assets
	const totalReturnedValue =
		returnedAssets?.reduce((acc, { tokens, amounts }) => {
			const tokenPrice = prices[farm.chainId][tokens];
			const tokenAmount = Number(toEth(amounts, decimals[farm.chainId][tokens]));
			return acc + tokenAmount * tokenPrice;
		}, 0) || 0;
	const zapAmount = Number(toEth(amountInWei, decimals[farm.chainId][token]));
	const beforeTxAmount = zapAmount * prices[farm.chainId][token] - totalReturnedValue;
	const afterTxAmount = Number(toEth(receviedAmt, farm.decimals)) * prices[farm.chainId][farm.vault_addr];
	store.dispatch(setSimulatedSlippage(Math.abs(beforeTxAmount - afterTxAmount)));
	let slippage = (1 - afterTxAmount / beforeTxAmount) * 100;
	if (slippage < 0) slippage = 0;

	return { receviedAmt, isBridged, slippage, beforeTxAmount, afterTxAmount };
};

export const slippageOut: SlippageOutBaseFn = async ({
	getPublicClient,
	farm,
	token,
	prices,
	currentWallet,
	balances,
	amountInWei,
	max,
}) => {
	if (!prices) throw new Error("Prices not found");

	const state = store.getState();
	const decimals = state.tokens.decimals;
	const publicClient = getPublicClient(farm.chainId);
	//#region Zapping Out
	let receivedAmtDollar = 0;
	let receviedAmt = 0n;
	const vaultBalance = BigInt(balances[farm.chainId][farm.vault_addr].valueWei);
	let stateOverrides: StateOverride = [];
	if (token === zeroAddress) {
		stateOverrides.push({
			address: currentWallet,
			balance: maxUint256 / 2n,
		});
		stateOverrides.push({
			address: farm.vault_addr,
			stateDiff: [
				{
					slot: getVaultAllowanceSlot(currentWallet, farm.zapper_addr),
					value: numberToHex(maxUint256, { size: 32 }),
				},
				{
					slot: getVaultBalanceSlot(currentWallet),
					value: numberToHex(maxUint256, { size: 32 }),
				},
			],
		});
		const { result } = await publicClient.simulateContract({
			account: currentWallet,
			address: farm.zapper_addr,
			abi: zapperAbi,
			functionName: "zapOut",
			args: [farm.vault_addr, max ? vaultBalance : amountInWei, token, 0n],
			stateOverride: stateOverrides,
		});

		receivedAmtDollar =
			Number(toEth(result[0], decimals[farm.chainId][zeroAddress])) * prices[farm.chainId][addressesByChainId[farm.chainId].beraAddress!];
		receviedAmt = result[0];
	} else {
		stateOverrides.push({
			address: farm.vault_addr,
			stateDiff: [
				{
					slot: getVaultAllowanceSlot(currentWallet, farm.zapper_addr),
					value: numberToHex(maxUint256, { size: 32 }),
				},
				{
					slot: getVaultBalanceSlot(currentWallet),
					value: numberToHex(maxUint256, { size: 32 }),
				},
				{
					slot: getBalanceSlot(currentWallet),
					value: numberToHex(amountInWei, { size: 32 }),
				},
			],
		});
		const { result } = await publicClient.simulateContract({
			account: currentWallet,
			address: farm.zapper_addr,
			abi: zapperAbi,
			functionName: "zapOut",
			args: [farm.vault_addr, max ? vaultBalance : amountInWei, token, 0n],
			stateOverride: stateOverrides,
		});
		receviedAmt = result[0];
		receivedAmtDollar = Number(toEth(result[0], decimals[farm.chainId][token])) * prices[farm.chainId][token];
	}

	const withdrawAmt = Number(toEth(amountInWei, farm.decimals));
	const afterTxAmount = receivedAmtDollar;
	const beforeTxAmount = withdrawAmt * prices[farm.chainId][farm.vault_addr];
	store.dispatch(setSimulatedSlippage(Math.abs(beforeTxAmount - afterTxAmount)));
	let slippage = (1 - afterTxAmount / beforeTxAmount) * 100;
	if (slippage < 0) slippage = 0;

	return { receviedAmt, slippage, afterTxAmount, beforeTxAmount };
	//#endregion
};

export const calculateDepositableAmounts = ({ balances, prices, farm }: PriceCalculationProps): TokenAmounts[] => {
	const tokenAmounts: TokenAmounts[] =
		farm.zap_currencies?.map((item) => ({
			tokenAddress: item.address,
			tokenSymbol: tokenNamesAndImages[item.address].name,
			amount: balances[farm.chainId][item.address].value.toString(),
			amountDollar: balances[farm.chainId][item.address].valueUsd.toString(),
			price: prices[farm.chainId][item.address],
		})) || [];

	// Add lp token if not already present
	if (!tokenAmounts.some((token) => token.tokenAddress === farm.lp_address)) {
		tokenAmounts.push({
			tokenAddress: farm.lp_address,
			tokenSymbol: tokenNamesAndImages[farm.lp_address].name,
			amount: balances[farm.chainId][farm.lp_address].value.toString(),
			amountDollar: balances[farm.chainId][farm.lp_address].valueUsd.toString(),
			price: prices[farm.chainId][farm.lp_address],
		});
	}

	return tokenAmounts;
};

export const calculateWithdrawableAmounts = ({ balances, prices, farm }: PriceCalculationProps): TokenAmounts[] => {
	const tokenAmounts: TokenAmounts[] =
		farm.zap_currencies?.map((item) => ({
			tokenAddress: item.address,
			tokenSymbol: tokenNamesAndImages[item.address].name,
			amount: (balances[farm.chainId][farm.vault_addr].valueUsd / prices[farm.chainId][item.address]).toString(),
			amountDollar: balances[farm.chainId][farm.vault_addr].valueUsd.toString(),
			price: prices[farm.chainId][item.address],
			isPrimaryVault: true,
		})) || [];

	// Add lp token if not already present
	if (!tokenAmounts.some((token) => token.tokenAddress === farm.lp_address)) {
		tokenAmounts.push({
			tokenAddress: farm.lp_address,
			tokenSymbol: tokenNamesAndImages[farm.lp_address].name,
			amount: (balances[farm.chainId][farm.vault_addr].valueUsd / prices[farm.chainId][farm.lp_address]).toString(),
			amountDollar: balances[farm.chainId][farm.vault_addr].valueUsd.toString(),
			price: prices[farm.chainId][farm.lp_address],
		});
	}
	return tokenAmounts;
};

export const isCrossChainFn = (balances: Balances, farm: PoolDef) => {
	const honeyCurrentChainBalance = Number(
		balances[farm.chainId][farm.zap_currencies?.find((item) => item.symbol === "HONEY")?.address!].value.toString()
	);
	if (honeyCurrentChainBalance >= 100) return false;
	return true;
};

export const createFarmInterface = (farmId: number): Omit<FarmFunctions, "deposit" | "withdraw"> => {
	const farm = pools_json.find((farm) => farm.id === farmId)!;

	const getProcessedFarmData: GetFarmDataProcessedFn = (balances, prices, decimals, vaultTotalSupply) => {
		const vaultTokenPrice = prices[farm.chainId][farm.vault_addr];
		const isCrossChain = isCrossChainFn(balances, farm);

		const result = {
			depositableAmounts: calculateDepositableAmounts({ balances, prices, farm }),
			withdrawableAmounts: calculateWithdrawableAmounts({ balances, prices, farm }),
			isCrossChain,
			vaultBalanceFormated: (Number(toEth(BigInt(vaultTotalSupply ?? 0))) * vaultTokenPrice).toString(),
			id: farm.id,
		};
		return result;
	};

	const zapIn: ZapInFn = (props) => zapInBase({ ...props, farm });
	const zapInSlippage: SlippageInBaseFn = (props) => slippageIn({ ...props, farm });

	const zapOut: ZapOutFn = (props) => zapOutBase({ ...props, farm });
	const zapOutSlippage: SlippageOutBaseFn = (props) => slippageOut({ ...props, farm });

	return {
		getProcessedFarmData,
		zapIn,
		zapOut,
		zapInSlippage,
		zapOutSlippage,
	};
};

export const stakeIntoRewardVault = async (
	farm: PoolDef,
	balance: bigint,
	currentWallet: Address,
	getClients: (chainId: number) => Promise<IClients>,
	getPublicClient: (chainId: number) => IClients["public"],
	getWalletClient: (chainId: number) => Promise<IClients["wallet"]>
) => {
	const client = await getClients(farm.chainId);
	if (
		!(await approveErc20(farm.vault_addr, farm.rewardVault!, balance, currentWallet!, farm.chainId, getPublicClient, getWalletClient))
			.status
	)
		throw new Error("Error approving vault!");

	const tx = await awaitTransaction(
		client.wallet.sendTransaction({
			account: currentWallet,
			to: farm.rewardVault,
			data: encodeFunctionData({
				abi: rewardVaultAbi,
				functionName: "stake",
				args: [balance],
			}),
		}),
		client
	);

	if (!tx.status) {
		throw new Error(tx.error);
	}
};

function getVaultAllowanceSlot(owner: Address, spender: Address) {
	const mappingSlot = 2n; // _allowances is at storage slot 1

	// Step 1: Encode the owner address and the mapping's slot
	const innerEncoded = encodeAbiParameters([{ type: "address" }, { type: "uint256" }], [owner, mappingSlot]);

	// Compute keccak256 hash of the encoded data to get innerHash
	const innerHash = keccak256(innerEncoded);

	// Step 2: Encode the spender address and the inner hash
	const finalEncoded = encodeAbiParameters([{ type: "address" }, { type: "bytes32" }], [spender, innerHash]);

	// Compute keccak256 hash of the final encoded data to get the storage slot
	const allowanceSlot = keccak256(finalEncoded);

	return allowanceSlot;
}

function getVaultBalanceSlot(owner: Address) {
	const mappingSlot = 1n; // _balances is at storage slot 0

	// Step 1: Encode the owner address and the mapping's slot
	const encoded = encodeAbiParameters([{ type: "address" }, { type: "uint256" }], [owner, mappingSlot]);

	// Compute keccak256 hash of the encoded data to get balanceSlot
	const balanceSlot = keccak256(encoded);

	return balanceSlot;
}

function getIbgtAllowanceSlot(owner: Address, spender: Address) {
	const mappingSlot = 3n; // _allowances is at storage slot 3

	// Step 1: Encode the owner address and the mapping's slot
	const innerEncoded = encodeAbiParameters([{ type: "address" }, { type: "uint256" }], [owner, mappingSlot]);

	// Compute keccak256 hash of the encoded data to get innerHash
	const innerHash = keccak256(innerEncoded);

	// Step 2: Encode the spender address and the inner hash
	const finalEncoded = encodeAbiParameters([{ type: "address" }, { type: "bytes32" }], [spender, innerHash]);

	// Compute keccak256 hash of the final encoded data to get the storage slot
	const allowanceSlot = keccak256(finalEncoded);

	return allowanceSlot;
}

function getIbgtBalanceSlot(owner: Address) {
	const mappingSlot = 2n; // _balances is at storage slot 2

	// Step 1: Encode the owner address and the mapping's slot
	const encoded = encodeAbiParameters([{ type: "address" }, { type: "uint256" }], [owner, mappingSlot]);

	// Compute keccak256 hash of the encoded data to get balanceSlot
	const balanceSlot = keccak256(encoded);

	return balanceSlot;
}

function getBalanceSlot(owner: Address) {
	// Define the _BALANCE_SLOT_SEED
	const balanceSlotSeed = "0x87a211a2";

	// Define 8 bytes of zeros
	const zeroBytes8 = "0x0000000000000000";

	const encoded = encodePacked(["address", "bytes8", "bytes4"], [owner, zeroBytes8, balanceSlotSeed]);

	// Compute the keccak256 hash to get the storage slot
	const balanceSlot = keccak256(encoded);
	return balanceSlot;
}
