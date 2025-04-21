import { approveErc20, getBalance } from "src/api/token";
import { awaitTransaction, getCombinedBalance, subtractGas, toEth, toWei } from "src/utils/common";
import { dismissNotify, notifyLoading, notifyError, notifySuccess } from "src/api/notify";
import { getERC20AllowanceSlot, getERC20BalanceSlot, getHoneyAllowanceSlot, getHoneyBalanceSlot } from "src/utils/slot";
import { errorMessages, loadingMessages, successMessages } from "src/config/constants/notifyMessages";
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
import { addressesByChainId } from "src/config/constants/contracts";
import { isGasSponsored } from "..";
import { traceTransactionAssetChange } from "../tenderly";
import {
    Address,
    createPublicClient,
    encodeAbiParameters,
    encodeFunctionData,
    encodePacked,
    Hex,
    http,
    keccak256,
    maxUint256,
    numberToHex,
    StateOverride,
    zeroAddress,
    getContract,
    parseEventLogs,
    getAddress,
    Hash,
} from "viem";
import zapperAbi from "src/assets/abis/zapperAbi";
import rewardVaultAbi from "src/assets/abis/rewardVaultAbi";
import vaultAbi from "src/assets/abis/vault.json";
import { CrossChainBridgeWithdrawObject, CrossChainTransactionObject, IClients } from "src/types";
import { convertQuoteToRoute, getQuote, getStatus, LiFiStep } from "@lifi/sdk";
import { SupportedChains } from "src/config/walletConfig";
import store from "src/state";
import {
    ApproveBridgeStep,
    ApproveZapStep,
    BridgeService,
    TransactionStepStatus,
    TransactionTypes,
    WaitForBridgeResultsStep,
    ZapInStep,
    ZapOutStep,
} from "src/state/transactions/types";
import { buildTransaction, getBridgeStatus, getRoute, SocketApprovalData, SocketRoute } from "../bridge";
import {
    addTransactionStepDb,
    editTransactionStepDb,
    editTransactionDb,
    markAsFailedDb,
    TransactionsDB,
} from "src/state/transactions/transactionsReducer";
import Bridge from "src/utils/Bridge";
import { addNotificationWithTimeout } from "src/state/notification/notifiactionReducer";
import { setSimulatedSlippage } from "src/state/farms/farmsReducer";
import { Balances } from "src/state/tokens/types";
import pools_json, { PoolDef, tokenNamesAndImages } from "src/config/constants/pools_json";

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
    bridgeChainId,
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
        //#region Select Max
        if (max) {
            const balance = balances[farm.chainId][token].valueWei;
            amountInWei = BigInt(balance);
        }
        //#endregion

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

            const {
                finalAmountToDeposit,
                isBridged,
                status: bridgeStatus,
            } = await bridgeIfNeededLayerZero({
                getWalletClient,
                getPublicClient,
                notificationId: id,
                balances: balances,
                currentWallet: currentWallet,
                fromChainId: bridgeChainId,
                toChainId: farm.chainId,
                toToken: zeroAddress,
                toTokenAmount: amountInWei,
                max: max,
            });
            if (bridgeStatus) {
                await TransactionsStep.zapIn(TransactionStepStatus.IN_PROGRESS, amountInWei);
                const client = await getClients(farm.chainId);
                if (isBridged) amountInWei = finalAmountToDeposit;
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
            } else {
                zapperTxn = {
                    status: false,
                    error: "Bridge Failed",
                };
            }
        }
        // token zap
        else {
            let {
                status: bridgeStatus,
                isBridged,
                finalAmountToDeposit,
            } = await bridgeIfNeededLayerZero({
                getPublicClient,
                getWalletClient,
                notificationId: id,
                fromChainId: bridgeChainId,
                balances,
                currentWallet,
                toChainId: farm.chainId,
                toToken: token,
                toTokenAmount: amountInWei,
                max,
            });
            if (bridgeStatus) {
                if (isBridged) amountInWei = finalAmountToDeposit;
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
            } else {
                zapperTxn = {
                    status: false,
                    error: "Bridge Failed",
                };
            }
        }

        if (!zapperTxn.status) {
            store.dispatch(markAsFailedDb(id));
            await TransactionsStep.zapIn(TransactionStepStatus.FAILED, amountInWei);
            throw new Error(zapperTxn.error);
        } else {
            await TransactionsStep.zapIn(TransactionStepStatus.COMPLETED, amountInWei);
            dismissNotify(id);

            const vaultBalance = await getBalance(farm.vault_addr, currentWallet, client);
            if (farm.rewardVault) {
                await TransactionsStep.stakeIntoRewardVault(TransactionStepStatus.IN_PROGRESS);
                await stakeIntoRewardVault(
                    farm,
                    vaultBalance,
                    currentWallet,
                    getClients,
                    getPublicClient,
                    getWalletClient
                );
                await TransactionsStep.stakeIntoRewardVault(TransactionStepStatus.COMPLETED);
            }

            // notifySuccess(successMessages.zapIn());
            const successMessage = successMessages.zapIn();
            store.dispatch(
                addNotificationWithTimeout({
                    type: "success",
                    title: successMessage.title,
                    message:
                        typeof successMessage.message === "function"
                            ? successMessage.message(id)
                            : successMessage.message,
                })
            );
        }

        const logs = parseEventLogs({
            abi: zapperAbi,
            logs: zapperTxn.receipt?.logs ?? [],
        }) as any[];

        const fee = logs[0].args.fee.toString();
        const vaultShares = logs[0].args.shares.toString();
        const lpTokens = logs[0].args.tokenInAmount.toString();
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

        const netAmount = toWei(
            (Number(toEth(vaultShares)) * prices[farm.chainId][farm.vault_addr]) / prices[farm.chainId][token]
        ).toString();

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

        if (vaultBalance < amountInWei) {
            await TransactionsStep.withdrawFromRewardVault(TransactionStepStatus.IN_PROGRESS);
            if (!farm.rewardVault) throw new Error("Reward vault not found");
            const amountToWithdrawFromRewardVault = amountInWei - vaultBalance;

            const rewardVaultWithdrawStatus = await awaitTransaction(
                client.wallet.sendTransaction({
                    to: farm.rewardVault,
                    data: encodeFunctionData({
                        abi: rewardVaultAbi,
                        functionName: "withdraw",
                        args: [amountToWithdrawFromRewardVault],
                    }),
                }),
                client
            );
            if (!rewardVaultWithdrawStatus.status) {
                await TransactionsStep.withdrawFromRewardVault(TransactionStepStatus.FAILED);
                throw new Error(rewardVaultWithdrawStatus.error);
            }
            await TransactionsStep.withdrawFromRewardVault(TransactionStepStatus.COMPLETED);
        }

        await TransactionsStep.approveZap(TransactionStepStatus.IN_PROGRESS);

        vaultBalance = await getBalance(farm.vault_addr, currentWallet, client);

        const zapFunctionName = withBond
            ? (store.getState().farms.farmDetailInputOptions.bestFunctionNameForArberaHoney as any)
            : token === zeroAddress
            ? "zapOut"
            : "zapOut";

        //#region Approve
        if (
            !(
                await approveErc20(
                    farm.vault_addr,
                    farm.zapper_addr,
                    vaultBalance,
                    currentWallet,
                    farm.chainId,
                    getPublicClient,
                    getWalletClient
                )
            ).status
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
            // Bridge after zap out
            if (bridgeChainId && bridgeChainId !== farm.chainId) {
                const data = await traceTransactionAssetChange({
                    chainId: farm.chainId,
                    txHash: withdrawTxn.txHash as Hex,
                    walletAddress: currentWallet,
                    tokenAddress: token,
                });
                if (data?.difference && data.difference > 0n) {
                    const nativePrice = store.getState().tokens.prices[farm.chainId][zeroAddress];
                    const bridge = new Bridge(
                        currentWallet,
                        farm.chainId,
                        token,
                        bridgeChainId,
                        token === zeroAddress ? zeroAddress : addressesByChainId[bridgeChainId].usdcAddress,
                        data.difference,
                        "",
                        getWalletClient,
                        nativePrice
                    );

                    //#region Approve
                    // notifyLoading(loadingMessages.withdrawBridgeStep(1, 3), {
                    //     id,
                    // });
                    await TransactionsStep.approveBridge(TransactionStepStatus.IN_PROGRESS);
                    await bridge.approve();
                    await TransactionsStep.approveBridge(TransactionStepStatus.COMPLETED);
                    //#endregion Approve

                    //#region Initialize
                    // notifyLoading(loadingMessages.withdrawBridgeStep(2, 3), {
                    //     id,
                    // });

                    await TransactionsStep.initiateBridge(TransactionStepStatus.IN_PROGRESS, bridge.fromTokenAmount);
                    const txHash = await bridge.initialize();
                    await TransactionsStep.initiateBridge(TransactionStepStatus.COMPLETED, bridge.fromTokenAmount);
                    //#endregion Initialize

                    //#region WaitForBridge
                    // notifyLoading(loadingMessages.withdrawBridgeStep(3, 3), {
                    //     id,
                    // });
                    await TransactionsStep.waitForBridge(TransactionStepStatus.IN_PROGRESS, {
                        bridgeService: BridgeService.LAYER_ZERO,
                        txHash: txHash,
                        fromChain: bridge.fromChainId,
                        toChain: bridge.toChainId,
                        beforeBridgeBalance: bridge.fromTokenAmount.toString(),
                    });
                    await bridge.waitAndGetDstAmt();
                    await TransactionsStep.waitForBridge(TransactionStepStatus.COMPLETED);
                    //#endregion WaitForBridge
                }
            }
            dismissNotify(id);
            // notifySuccess(successMessages.withdraw());
            const successMessage = successMessages.withdraw();
            store.dispatch(
                addNotificationWithTimeout({
                    type: "success",
                    title: successMessage.title,
                    message:
                        typeof successMessage.message === "function"
                            ? successMessage.message(id)
                            : successMessage.message,
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
            Number(toEth(amountInWei, decimals[farm.chainId][farm.vault_addr])) *
                prices[farm.chainId][farm.vault_addr] -
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
    let {
        amountInWei,
        balances,
        currentWallet,
        token,
        max,
        getPublicClient,
        decimals,
        prices,
        getWalletClient,
        farm,
        tokenIn,
    } = args;
    const wberaAddress = addressesByChainId[farm.chainId]?.beraAddress as Address;
    const publicClient = getPublicClient(farm.chainId);
    let isBridged = false;
    let receviedAmt = 0n;
    let returnedAssets: { tokens: `0x${string}`; amounts: bigint }[] = [];
    let isError = false;
    let error: null | Error = null;

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
                    {
                        // For generic ERC20 tokens (USDC.e, BTC, etc.)
                        slot: getERC20AllowanceSlot(currentWallet, farm.zapper_addr),
                        value: numberToHex(amountInWei, { size: 32 }),
                    },
                    {
                        slot: getERC20BalanceSlot(currentWallet),
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

        // #region eth zap
        if (token === zeroAddress) {
            // use weth address as tokenId, but in case of some farms (e.g: hop)
            // we need the token of liquidity pair, so use tokenIn if provided
            token = tokenIn ?? wberaAddress;

            const { afterBridgeBal, amountToBeBridged } = await bridgeIfNeededLayerZero({
                getWalletClient,
                getPublicClient,
                simulate: true,
                balances: balances,
                currentWallet: currentWallet,
                toChainId: farm.chainId,
                toToken: zeroAddress,
                toTokenAmount: amountInWei,
                max: max,
            });
            isBridged = amountToBeBridged > 0n;
            console.log("isBridged", isBridged);
            if (isBridged) amountInWei = afterBridgeBal;

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
        // #endregion eth zap

        // #region token zap
        else {
            let { afterBridgeBal, amountToBeBridged } = await bridgeIfNeededLayerZero({
                getPublicClient,
                getWalletClient,
                simulate: true,
                balances,
                currentWallet,
                toChainId: farm.chainId,
                toToken: token,
                toTokenAmount: amountInWei,
                max,
            });
            isBridged = amountToBeBridged > 0n;

            if (isBridged) amountInWei = afterBridgeBal;
            // console.log("farm.vault_addr", farm.vault_addr);
            // console.log("token", token);
            // console.log("amountInWei", amountInWei);
            // console.log("address", farm.zapper_addr);
            // console.log("currentWallet", currentWallet);
            // console.log("stateOverrides", stateOverrides);
            const { result: vaultBalance } = await publicClient.simulateContract({
                abi: zapperAbi,
                functionName: "zapIn",
                args: [farm.vault_addr as Hash, token as Hash, amountInWei, 0n],
                address: farm.zapper_addr,
                account: currentWallet,
                stateOverride: stateOverrides,
            });
            console.log("vaultBalance", vaultBalance);
            receviedAmt = vaultBalance[0];
            returnedAssets = vaultBalance[1] as { tokens: `0x${string}`; amounts: bigint }[];
        }

        // #endregion
    } catch (catchError: any) {
        console.log('Something very wrong has occured, Error in slippageIn');
        console.log(catchError);
        isError = true;
        error = catchError;
    }
    console.log('Executing the rest of the code');
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

    return { receviedAmt, isBridged, slippage, beforeTxAmount, afterTxAmount, isError, error };
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
    let isError = false;
    let error: null | Error = null;
    const vaultBalance = BigInt(balances[farm.chainId][farm.vault_addr].valueWei);
    let stateOverrides: StateOverride = [];
    try {
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
            Number(toEth(result[0], decimals[farm.chainId][zeroAddress])) *
            prices[farm.chainId][addressesByChainId[farm.chainId].beraAddress!];
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
    } catch (catchError: any) {
        console.log('Something very wrong has occured, Error in slippageOut');
        console.log(catchError);
        isError = true;
        error = catchError;
    }

    const withdrawAmt = Number(toEth(amountInWei, farm.decimals));
    const afterTxAmount = receivedAmtDollar;
    const beforeTxAmount = withdrawAmt * prices[farm.chainId][farm.vault_addr];
    store.dispatch(setSimulatedSlippage(Math.abs(beforeTxAmount - afterTxAmount)));
    let slippage = (1 - afterTxAmount / beforeTxAmount) * 100;
    if (slippage < 0) slippage = 0;

    return { receviedAmt, slippage, afterTxAmount, beforeTxAmount, isError, error };
    //#endregion
};

// export async function crossChainBridgeIfNecessary<T extends Omit<CrossChainTransactionObject, "contractCall">>(
//     obj: T
// ): Promise<
//     T["simulate"] extends true
//         ? {
//               afterBridgeBal: bigint;
//               amountToBeBridged: bigint;
//               //   amountSentForBridging:bigint;
//               //   amountToGetFromBridging:bigint;
//               //   amountTotalAfterBridging:bigint;
//               //   amountWantedAfterBridging:bigint;
//           }
//         : {
//               status: boolean;
//               error?: string;
//               isBridged: boolean;
//               finalAmountToDeposit: bigint;
//           }
// > {
//     const chain = SupportedChains.find((item) => item.id === obj.toChainId);
//     if (!chain) throw new Error("chain not found");
//     const toPublicClient = createPublicClient({
//         chain: chain,
//         transport: http(),
//         batch: {
//             multicall: {
//                 batchSize: 4096,
//                 wait: 250,
//             },
//         },
//     }) as IClients["public"];

//     const toBal = await getBalance(obj.toToken, obj.currentWallet, { public: toPublicClient });
//     if (toBal < obj.toTokenAmount) {
//         /**
//          * @description toBalDiff is the amount of token that is needed after subtracting current balance on farm chain
//          */
//         const toBalDiff = obj.toTokenAmount - toBal;
//         const { chainBalances } = getCombinedBalance(
//             obj.balances,
//             obj.toChainId,
//             obj.toToken === zeroAddress ? "native" : "usdc"
//         );
//         const fromChainId = Object.entries(chainBalances).find(([key, value]) => {
//             if (value >= toBalDiff && Number(key) !== obj.toChainId) return true;
//             return false;
//         })?.[0];
//         if (!fromChainId) {
//             if (obj.simulate) {
//                 // @ts-ignore
//                 return { afterBridgeBal: BigInt(obj.toTokenAmount), amountToBeBridged: 0n };
//             } else throw new Error("Insufficient balance");
//         }
//         console.log("getting bridge quote");
//         let quote: LiFiStep;
//         if (obj.notificationId) notifyLoading(loadingMessages.gettingBridgeQuote(), { id: obj.notificationId });

//         if (true || obj.max) {
//             store.dispatch(
//                 addTransactionStepDb({
//                     transactionId: obj.notificationId!,
//                     step: {
//                         type: TransactionTypes.GET_BRIDGE_QUOTE,
//                         status: TransactionStepStatus.IN_PROGRESS,
//                     } as GetBridgeQuoteStep,
//                 })
//             );
//             quote = await getQuote({
//                 fromAddress: obj.currentWallet,
//                 fromChain: fromChainId,
//                 toChain: obj.toChainId,
//                 // @ts-ignore
//                 fromToken: obj.toToken === zeroAddress ? zeroAddress : addressesByChainId[fromChainId].usdcAddress,
//                 toToken: obj.toToken,
//                 fromAmount: toBalDiff.toString(),
//                 order: "RECOMMENDED",
//                 // @ts-ignore
//                 denyBridges: "hop",
//             });
//         } else {
//             // quote = await getContractCallsQuote({
//             //     fromAddress: obj.currentWallet,
//             //     fromChain: fromChainId,
//             //     toChain: obj.toChainId,
//             //     // @ts-ignore
//             //     fromToken: obj.toToken === zeroAddress ? zeroAddress : addressesByChainId[fromChainId].usdcAddress,
//             //     toToken: obj.toToken,
//             //     toAmount: toBalDiff.toString(),
//             //     // toAmount: obj.toTokenAmount.toString(),
//             //     // contractOutputsToken: obj.contractCall.outputTokenAddress,
//             //     contractCalls: [
//             //         // {
//             //         //     fromAmount: obj.toTokenAmount.toString(),
//             //         //     fromTokenAddress: obj.toToken,
//             //         //     toContractAddress: obj.contractCall.to,
//             //         //     toTokenAddress: obj.contractCall.outputTokenAddress,
//             //         //     toContractCallData: obj.contractCall.data,
//             //         //     toContractGasLimit: "2000000",
//             //         // },
//             //     ],
//             // });
//         }
//         const route = convertQuoteToRoute(quote);
//         console.log("route =>", route);
//         if (obj.simulate) {
//             let afterBridgeBal = BigInt(route.toAmount) + toBal;
//             if (afterBridgeBal > BigInt(obj.toTokenAmount)) afterBridgeBal = BigInt(obj.toTokenAmount);
//             // @ts-ignore
//             return { afterBridgeBal, amountToBeBridged: BigInt(route.fromAmount) };
//         }

//         let allStatus: boolean = false;
//         let i = 1;
//         let finalAmountToDeposit: bigint = 0n;
//         for await (const step of route.steps) {
//             const publicClient = obj.getPublicClient(step.transactionRequest!.chainId!);
//             if (obj.notificationId)
//                 notifyLoading(loadingMessages.bridgeStep(i, route.steps.length), { id: obj.notificationId });
//             const { data, from, gasLimit, gasPrice, to, value } = step.transactionRequest!;
//             const tokenBalance = await getBalance(
//                 obj.toToken === zeroAddress
//                     ? zeroAddress
//                     : addressesByChainId[step.transactionRequest!.chainId!].usdcAddress,
//                 obj.currentWallet,
//                 { public: publicClient }
//             );
//             if (tokenBalance < BigInt(step.estimate.fromAmount)) {
//                 throw new Error("Insufficient Balance");
//             }
//             store.dispatch(
//                 editTransactionStepDb({
//                     transactionId: obj.notificationId!,
//                     stepType: TransactionTypes.GET_BRIDGE_QUOTE,
//                     status: TransactionStepStatus.COMPLETED,
//                 })
//             );
//             if (obj.toToken !== zeroAddress) {
//                 await store.dispatch(
//                     addTransactionStepDb({
//                         transactionId: obj.notificationId!,
//                         step: {
//                             type: TransactionTypes.APPROVE_BRIDGE,
//                             status: TransactionStepStatus.IN_PROGRESS,
//                         } as ApproveBridgeStep,
//                     })
//                 );
//                 await approveErc20(
//                     addressesByChainId[step.transactionRequest!.chainId!].usdcAddress,
//                     step.estimate.approvalAddress as Address,
//                     BigInt(step.estimate.fromAmount),
//                     obj.currentWallet,
//                     step.transactionRequest!.chainId!,
//                     obj.getPublicClient,
//                     obj.getWalletClient
//                 );
//                 await store.dispatch(
//                     editTransactionStepDb({
//                         transactionId: obj.notificationId!,
//                         stepType: TransactionTypes.APPROVE_BRIDGE,
//                         status: TransactionStepStatus.COMPLETED,
//                     })
//                 );
//             }
//             const walletClient = await obj.getWalletClient(step.transactionRequest!.chainId!);
//             const transaction = walletClient.sendTransaction({
//                 data: data as Hex,
//                 gasLimit: gasLimit!,
//                 gasPrice: BigInt(gasPrice!),
//                 to: to as Address,
//                 value: BigInt(value!),
//             });
//             store.dispatch(
//                 addTransactionStepDb({
//                     transactionId: obj.notificationId!,
//                     step: {
//                         type: TransactionTypes.INITIATE_BRIDGE,
//                         amount: toBalDiff.toString(),
//                         status: TransactionStepStatus.IN_PROGRESS,
//                     } as InitiateBridgeStep,
//                 })
//             );
//             const res = await awaitTransaction(transaction, { public: publicClient });
//             if (!res.status) {
//                 throw new Error(res.error);
//             }
//             let status = "PENDING";
//             store.dispatch(
//                 editTransactionStepDb({
//                     transactionId: obj.notificationId!,
//                     stepType: TransactionTypes.INITIATE_BRIDGE,
//                     status: TransactionStepStatus.COMPLETED,
//                 })
//             );
//             store.dispatch(
//                 addTransactionStepDb({
//                     transactionId: obj.notificationId!,
//                     step: {
//                         type: TransactionTypes.WAIT_FOR_BRIDGE_RESULTS,
//                         status: TransactionStepStatus.IN_PROGRESS,
//                         bridgeInfo: {
//                             bridgeService: BridgeService.LIFI,
//                             txHash: res.txHash!,
//                             fromChain: step.action.fromChainId,
//                             toChain: step.action.toChainId,
//                             tool: step.tool,
//                             beforeBridgeBalance: toBal.toString(),
//                         },
//                     } as WaitForBridgeResultsStep,
//                 })
//             );
//             do {
//                 if (obj.notificationId) notifyLoading(loadingMessages.bridgeDestTxWait(), { id: obj.notificationId });
//                 try {
//                     const result = await getStatus({
//                         txHash: res.txHash!,
//                         fromChain: step.action.fromChainId,
//                         toChain: step.action.toChainId,
//                         bridge: step.tool,
//                     });
//                     // @ts-ignore
//                     if (result.status === "DONE" && result?.receiving?.amount) {
//                         finalAmountToDeposit = BigInt((result.receiving as any).amount) + toBal;
//                     }
//                     status = result.status;
//                 } catch (_) {}

//                 console.log(`Transaction status for ${res.txHash}:`, status);

//                 // Wait for a short period before checking the status again
//                 await new Promise((resolve) => setTimeout(resolve, 5000));
//             } while (status !== "DONE" && status !== "FAILED");

//             if (status === "DONE") {
//                 store.dispatch(
//                     editTransactionStepDb({
//                         transactionId: obj.notificationId!,
//                         stepType: TransactionTypes.WAIT_FOR_BRIDGE_RESULTS,
//                         amount: (finalAmountToDeposit - toBal).toString(),
//                         status: TransactionStepStatus.COMPLETED,
//                     })
//                 );
//                 allStatus = true;
//             } else {
//                 store.dispatch(
//                     editTransactionStepDb({
//                         transactionId: obj.notificationId!,
//                         stepType: TransactionTypes.WAIT_FOR_BRIDGE_RESULTS,
//                         status: TransactionStepStatus.FAILED,
//                     })
//                 );
//                 console.error(`Transaction ${res.txHash} failed`);
//                 allStatus = false;
//             }
//             i++;
//         }
//         if (allStatus) {
//             // @ts-ignore
//             return {
//                 status: true,
//                 isBridged: true,
//                 finalAmountToDeposit,
//             };
//         } else {
//             // @ts-ignore
//             return {
//                 status: false,
//                 error: "Target chain error",
//                 isBridged: true,
//             };
//         }
//     } else {
//         if (obj.simulate) {
//             // @ts-ignore
//             return {
//                 afterBridgeBal: BigInt(obj.toTokenAmount),
//                 amountToBeBridged: 0n,
//             };
//         } else {
//             // @ts-ignore
//             return { status: true };
//         }
//     }
// }

export async function bridgeIfNeededLayerZero<T extends Omit<CrossChainTransactionObject, "contractCall">>(
    obj: T
): Promise<
    T["simulate"] extends true
        ? {
              afterBridgeBal: bigint;
              amountToBeBridged: bigint;
          }
        : {
              status: boolean;
              error?: string;
              isBridged: boolean;
              finalAmountToDeposit: bigint;
          }
> {
    const chain = SupportedChains.find((item) => item.id === obj.toChainId);
    if (!chain) throw new Error("chain not found");
    const toPublicClient = createPublicClient({
        chain: chain,
        transport: http(),
        batch: {
            multicall: {
                batchSize: 4096,
                wait: 250,
            },
        },
    }) as IClients["public"];

    const toBal = await getBalance(obj.toToken, obj.currentWallet, { public: toPublicClient });
    if (toBal < obj.toTokenAmount) {
        /**
         * @description toBalDiff is the amount of token that is needed after subtracting current balance on farm chain
         */
        const toBalDiff = obj.toTokenAmount - toBal;
        const { chainBalances } = getCombinedBalance(
            obj.balances,
            obj.toChainId,
            obj.toToken === zeroAddress ? "native" : "usdc"
        );
        const fromChainId: number | undefined =
            obj.fromChainId ||
            Number(
                Object.entries(chainBalances).find(([key, value]) => {
                    if (value >= toBalDiff && Number(key) !== obj.toChainId) return true;
                    return false;
                })?.[0]
            );
        if (!fromChainId) {
            if (obj.simulate) {
                // @ts-ignore
                return { afterBridgeBal: BigInt(obj.toTokenAmount), amountToBeBridged: 0n };
            } else throw new Error("Insufficient balance");
        }

        const nativePrice = store.getState().tokens.prices[fromChainId][zeroAddress];
        const bridge = new Bridge(
            obj.currentWallet,
            fromChainId,
            obj.toToken === zeroAddress ? zeroAddress : addressesByChainId[fromChainId].usdcAddress,
            obj.toChainId,
            obj.toToken,
            toBalDiff,
            "",
            obj.getWalletClient,
            nativePrice
        );

        if (obj.simulate) {
            const { amountOut } = await bridge.estimateAmountOut();
            let afterBridgeBal = amountOut + toBal;
            if (afterBridgeBal > BigInt(obj.toTokenAmount)) afterBridgeBal = BigInt(obj.toTokenAmount);
            // @ts-ignore
            return { afterBridgeBal, amountToBeBridged: bridge.fromTokenAmount };
        }
        if (!obj.notificationId) throw new Error("Provide notification id!");
        const TransactionsStep = new TransactionsDB(obj.notificationId);
        let finalAmountToDeposit: bigint = 0n;

        //#region Approve
        notifyLoading(loadingMessages.bridgeStep(1, 3), {
            id: obj.notificationId,
        });
        await TransactionsStep.approveBridge(TransactionStepStatus.IN_PROGRESS);
        await bridge.approve();
        await TransactionsStep.approveBridge(TransactionStepStatus.COMPLETED);
        //#endregion Approve

        //#region Initialize
        notifyLoading(loadingMessages.bridgeStep(2, 3), {
            id: obj.notificationId,
        });
        await TransactionsStep.initiateBridge(TransactionStepStatus.IN_PROGRESS, bridge.fromTokenAmount);
        const txHash = await bridge.initialize();
        await TransactionsStep.initiateBridge(TransactionStepStatus.COMPLETED, bridge.fromTokenAmount);
        //#endregion Initialize

        //#region WaitForBridge
        notifyLoading(loadingMessages.bridgeStep(3, 3), {
            id: obj.notificationId,
        });

        await TransactionsStep.waitForBridge(TransactionStepStatus.IN_PROGRESS, {
            bridgeService: BridgeService.LAYER_ZERO,
            txHash: txHash,
            fromChain: bridge.fromChainId,
            toChain: bridge.toChainId,
            beforeBridgeBalance: bridge.fromTokenAmount.toString(),
        });
        const bridgeResult = await bridge.waitAndGetDstAmt();
        await TransactionsStep.waitForBridge(TransactionStepStatus.COMPLETED);
        //#endregion WaitForBridge

        if (bridgeResult) {
            finalAmountToDeposit = bridgeResult.receivedToken + toBal;
            // @ts-ignore
            return {
                status: true,
                isBridged: true,
                finalAmountToDeposit,
            };
        } else {
            // @ts-ignore
            return {
                status: false,
                error: "Target chain error",
                isBridged: true,
            };
        }
    } else {
        if (obj.simulate) {
            // @ts-ignore
            return {
                afterBridgeBal: BigInt(obj.toTokenAmount),
                amountToBeBridged: 0n,
            };
        } else {
            // @ts-ignore
            return { status: true };
        }
    }
}

export const calculateDepositableAmounts = ({ balances, prices, farm, externalBalances }: PriceCalculationProps): TokenAmounts[] => {
    // const tokenAmounts: TokenAmounts[] =
    //     farm.zap_currencies?.map((item) => ({
    //         tokenAddress: item.address,
    //         tokenSymbol: tokenNamesAndImages[item.address].name,
    //         amount: balances[farm.chainId][item.address].value.toString(),
    //         amountDollar: balances[farm.chainId][item.address].valueUsd.toString(),
    //         price: prices[farm.chainId][item.address],
    //     })) || [];


    const tokenAmounts2: TokenAmounts[] = []
    for(const [tokAddr, tokenDetails] of Object.entries(balances[farm.chainId])) {
        const tokenAddress = getAddress(tokAddr)
        const tokenSymbol = tokenNamesAndImages[tokenAddress]?.name || externalBalances.find((token) => token.address === tokenAddress)?.name || ""
        const logos = tokenNamesAndImages[tokenAddress]?.logos || [externalBalances.find((token) => token.address === tokenAddress)?.logo] || []
        if(tokenDetails.value > 0 && tokenSymbol) {
            tokenAmounts2.push({
                tokenAddress,
                tokenSymbol,
                amount: tokenDetails.value.toString(),
                amountDollar: tokenDetails.valueUsd.toString(),
                price: prices[farm.chainId][tokenAddress],
                images: {
                    [tokenSymbol]: logos,
                } 
            })
        }
    }
    
    // Add lp token if not already present
    if (!tokenAmounts2.some((token) => token.tokenAddress === farm.lp_address)) {
        const tokenSymbol = tokenNamesAndImages[farm.lp_address].name;
        const images = tokenNamesAndImages[farm.lp_address].logos;
        const lpToken = {
            tokenAddress: farm.lp_address,
            tokenSymbol,
            amount: balances[farm.chainId][farm.lp_address].value.toString(),
            amountDollar: balances[farm.chainId][farm.lp_address].valueUsd.toString(),
            price: prices[farm.chainId][farm.lp_address],
            images: {
                [tokenSymbol]: tokenNamesAndImages[farm.lp_address].logos
            }
        }
        tokenAmounts2.push(lpToken);
    }
    
    return tokenAmounts2;
};

export const calculateWithdrawableAmounts = ({ balances, prices, farm, externalBalances }: PriceCalculationProps): TokenAmounts[] => {
    
    const tokenAmounts2: TokenAmounts[] = []
    for(const [tokAddr, tokenDetails] of Object.entries(balances[farm.chainId])) {
        const tokenAddress = getAddress(tokAddr)
        const tokenSymbol = tokenNamesAndImages[tokenAddress]?.name || externalBalances.find((token) => token.address === tokenAddress)?.name || ""
        const logos = tokenNamesAndImages[tokenAddress]?.logos || [externalBalances.find((token) => token.address === tokenAddress)?.logo] || []
        if(tokenDetails.value > 0 && tokenSymbol) {
            tokenAmounts2.push({
                tokenAddress,
                tokenSymbol,
                amount: (balances[farm.chainId][farm.vault_addr].valueUsd / prices[farm.chainId][tokenAddress]).toString(),
                amountDollar: balances[farm.chainId][farm.vault_addr].valueUsd.toString(),
                price: prices[farm.chainId][tokenAddress],
                isPrimaryVault: true,
                images: {
                    [tokenSymbol]: logos,
                }
            })
        }
    }
    // const tokenAmounts2: TokenAmounts[] =
    //     farm.zap_currencies?.map((item) => ({
    //         tokenAddress: item.address,
    //         tokenSymbol: tokenNamesAndImages[item.address].name,
    //         amount: (balances[farm.chainId][farm.vault_addr].valueUsd / prices[farm.chainId][item.address]).toString(),
    //         amountDollar: balances[farm.chainId][farm.vault_addr].valueUsd.toString(),
    //         price: prices[farm.chainId][item.address],
    //         isPrimaryVault: true,
    //     })) || [];


    // Add lp token if not already present
    if (!tokenAmounts2.some((token) => token.tokenAddress === farm.lp_address)) {
        tokenAmounts2.push({
            tokenAddress: farm.lp_address,
            tokenSymbol: tokenNamesAndImages[farm.lp_address].name,
            amount: (
                balances[farm.chainId][farm.vault_addr].valueUsd / prices[farm.chainId][farm.lp_address]
            ).toString(),
            amountDollar: balances[farm.chainId][farm.vault_addr].valueUsd.toString(),
            price: prices[farm.chainId][farm.lp_address],
        });
    }
    // console.log('tokenAmounts2',tokenAmounts2);
    return tokenAmounts2;
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

    const getProcessedFarmData: GetFarmDataProcessedFn = (balances, prices, decimals, vaultTotalSupply, externalBalances) => {
        const vaultTokenPrice = prices[farm.chainId][farm.vault_addr];
        const isCrossChain = isCrossChainFn(balances, farm);

        const result = {
            depositableAmounts: calculateDepositableAmounts({ balances, prices, farm, externalBalances }),
            withdrawableAmounts: calculateWithdrawableAmounts({ balances, prices, farm, externalBalances }),
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
        !(
            await approveErc20(
                farm.vault_addr,
                farm.rewardVault!,
                balance,
                currentWallet!,
                farm.chainId,
                getPublicClient,
                getWalletClient
            )
        ).status
    )
        throw new Error("Error approving vault!");

    const tx = await awaitTransaction(
        client.wallet.sendTransaction({
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
