// import { getBalance } from "@core/api/token";
// import zapperAbi from "@core/assets/abis/zapperAbi";
// import { addressesByChainId } from "@core/config/constants/contracts";
// import pools_json from "@core/config/constants/pools_json";
// import store from "@core/state";
// import { getCombinedBalance, toEth } from "@core/utils/common";
// import { getHoneyAllowanceSlot, getHoneyBalanceSlot } from "@core/utils/slot";
// import {
//     Address,
//     StateOverride,
//     encodeAbiParameters,
//     encodePacked,
//     keccak256,
//     maxUint256,
//     numberToHex,
//     zeroAddress,
// } from "viem";
// import {
//     bridgeIfNeededLayerZero,
//     zapInBase,
//     zapOutBase,
//     isCrossChainFn,
//     calculateDepositableAmounts,
//     calculateWithdrawableAmounts,
// } from "./common";
// import {
//     FarmFunctions,
//     GetFarmDataProcessedFn,
//     SlippageInBaseFn,
//     SlippageOutBaseFn,
//     TokenAmounts,
//     ZapInFn,
//     ZapOutFn,
// } from "./types";

// let arbera = function (farmId: number, withBond: boolean = false): Omit<FarmFunctions, "deposit" | "withdraw"> {
//     const farm = pools_json.find((farm) => farm.id === farmId)!;

//     const getProcessedFarmData: GetFarmDataProcessedFn = (balances, prices, decimals, vaultTotalSupply) => {
//         const vaultTokenPrice = prices[farm.chainId][farm.vault_addr];
//         const isCrossChain = isCrossChainFn(balances, farm);

//         const result = {
//             depositableAmounts: calculateDepositableAmounts({ balances, prices, farm }),
//             withdrawableAmounts: calculateWithdrawableAmounts({ balances, prices, farm }),
//             isCrossChain,
//             vaultBalanceFormated: (Number(toEth(BigInt(vaultTotalSupply ?? 0))) * vaultTokenPrice).toString(),
//             id: farm.id,
//         };
//         return result;
//     };

//     const slippageIn: SlippageInBaseFn = async (args) => {
//         let {
//             amountInWei,
//             balances,
//             currentWallet,
//             token,
//             max,
//             getPublicClient,
//             decimals,
//             prices,
//             getWalletClient,
//             farm,
//             tokenIn,
//         } = args;
//         const wberaAddress = addressesByChainId[farm.chainId]?.beraAddress as Address;
//         const publicClient = getPublicClient(farm.chainId);
//         let isBridged = false;
//         let receviedAmt = 0n;
//         let returnedAssets: { tokens: `0x${string}`; amounts: bigint }[] = [];
//         let bestFunctionName = "";

//         try {
//             //#region Select Max
//             if (max) {
//                 const balance = balances[farm.chainId][token].valueWei;
//                 amountInWei = BigInt(balance);
//             }
//             //#endregion
//             let stateOverrides: StateOverride = [];
//             if (token !== zeroAddress) {
//                 stateOverrides.push({
//                     address: token,
//                     stateDiff: [
//                         {
//                             slot: getHoneyAllowanceSlot(currentWallet, farm.zapper_addr),
//                             value: numberToHex(maxUint256, { size: 32 }),
//                         },
//                         {
//                             slot: getHoneyBalanceSlot(currentWallet),
//                             value: numberToHex(maxUint256, { size: 32 }),
//                         },
//                     ],
//                 });
//             } else {
//                 stateOverrides.push({
//                     address: currentWallet,
//                     balance: maxUint256,
//                 });
//             }
//             // #endregion

//             // #region Zapping In
//             if (token === zeroAddress) {
//                 // use weth address as tokenId, but in case of some farms (e.g: hop)
//                 // we need the token of liquidity pair, so use tokenIn if provided
//                 token = tokenIn ?? wberaAddress;

//                 // #region Bridging check
//                 const { afterBridgeBal, amountToBeBridged } = await bridgeIfNeededLayerZero({
//                     getWalletClient,
//                     getPublicClient,
//                     simulate: true,
//                     balances: balances,
//                     currentWallet: currentWallet,
//                     toChainId: farm.chainId,
//                     toToken: zeroAddress,
//                     toTokenAmount: amountInWei,
//                     max: max,
//                 });
//                 isBridged = amountToBeBridged > 0n;
//                 if (isBridged) amountInWei = afterBridgeBal;

//                 // First zap attempt
//                 const { result: vaultBalance1 } = await publicClient.simulateContract({
//                     abi: zapperAbi,
//                     functionName: "zapIn",
//                     args: [farm.vault_addr, zeroAddress, amountInWei, 0n],
//                     address: farm.zapper_addr,
//                     account: currentWallet,
//                     value: amountInWei,
//                     stateOverride: stateOverrides,
//                 });

//                 if (withBond) {
//                     // Second zap attempt (duplicate for now, will be different function later)
//                     const { result: vaultBalance2 } = await publicClient.simulateContract({
//                         abi: zapperAbi,
//                         functionName: "zapInWithBond",
//                         args: [farm.vault_addr, zeroAddress, amountInWei, 0n],
//                         address: farm.zapper_addr,
//                         account: currentWallet,
//                         value: amountInWei,
//                         stateOverride: stateOverrides,
//                     });

//                     // Compare results and store the better function name
//                     if (vaultBalance1[0] > vaultBalance2[0]) {
//                         receviedAmt = vaultBalance1[0];
//                         returnedAssets = vaultBalance1[1] as { tokens: `0x${string}`; amounts: bigint }[];
//                         bestFunctionName = "zapIn";
//                     } else {
//                         receviedAmt = vaultBalance2[0];
//                         returnedAssets = vaultBalance2[1] as { tokens: `0x${string}`; amounts: bigint }[];
//                         bestFunctionName = "zapInWithBond"; // This will be the other function name later
//                     }
//                 } else {
//                     receviedAmt = vaultBalance1[0];
//                     returnedAssets = vaultBalance1[1] as { tokens: `0x${string}`; amounts: bigint }[];
//                     bestFunctionName = "zapIn";
//                 }
//             } else {
//                 let { afterBridgeBal, amountToBeBridged } = await bridgeIfNeededLayerZero({
//                     getPublicClient,
//                     getWalletClient,
//                     simulate: true,
//                     balances,
//                     currentWallet,
//                     toChainId: farm.chainId,
//                     toToken: token,
//                     toTokenAmount: amountInWei,
//                     max,
//                 });
//                 isBridged = amountToBeBridged > 0n;

//                 if (isBridged) amountInWei = afterBridgeBal;

//                 // First zap attempt
//                 const { result: vaultBalance1 } = await publicClient.simulateContract({
//                     abi: zapperAbi,
//                     functionName: "zapIn",
//                     args: [farm.vault_addr, token, amountInWei, 0n],
//                     address: farm.zapper_addr,
//                     account: currentWallet,
//                     stateOverride: stateOverrides,
//                 });

//                 if (withBond) {
//                     // Second zap attempt (duplicate for now, will be different function later)
//                     const { result: vaultBalance2 } = await publicClient.simulateContract({
//                         abi: zapperAbi,
//                         functionName: "zapInWithBond",
//                         args: [farm.vault_addr, token, amountInWei, 0n],
//                         address: farm.zapper_addr,
//                         account: currentWallet,
//                         stateOverride: stateOverrides,
//                     });

//                     // Compare results and store the better function name
//                     if (vaultBalance1[0] > vaultBalance2[0]) {
//                         receviedAmt = vaultBalance1[0];
//                         returnedAssets = vaultBalance1[1] as { tokens: `0x${string}`; amounts: bigint }[];
//                         bestFunctionName = "zapIn";
//                     } else {
//                         receviedAmt = vaultBalance2[0];
//                         returnedAssets = vaultBalance2[1] as { tokens: `0x${string}`; amounts: bigint }[];
//                     }
//                 } else {
//                     receviedAmt = vaultBalance1[0];
//                     returnedAssets = vaultBalance1[1] as { tokens: `0x${string}`; amounts: bigint }[];
//                     bestFunctionName = "zapIn";
//                 }
//             }
//             // #endregion
//         } catch (error: any) {
//             console.log(error);
//             return {
//                 receviedAmt: 0n,
//                 isBridged: false,
//                 slippage: 0,
//                 beforeTxAmount: 0,
//                 afterTxAmount: 0,
//                 bestFunctionName: "zapIn", // Default to original function names
//             };
//         }

//         // Calculate total value of returned assets
//         const totalReturnedValue =
//             returnedAssets?.reduce((acc, { tokens, amounts }) => {
//                 const tokenPrice = prices[farm.chainId][tokens] ?? 0;
//                 const tokenAmount = Number(toEth(amounts, decimals[farm.chainId][tokens]));
//                 return acc + tokenAmount * tokenPrice;
//             }, 0) || 0;
//         const zapAmount = Number(toEth(amountInWei, decimals[farm.chainId][token]));
//         const afterTxAmount =
//             Number(toEth(receviedAmt, farm.decimals)) * prices[farm.chainId][farm.vault_addr] + totalReturnedValue;
//         const beforeTxAmount = zapAmount * prices[farm.chainId][token];
//         let slippage = (1 - afterTxAmount / beforeTxAmount) * 100;
//         if (slippage < 0) slippage = 0;

//         return {
//             receviedAmt: 0n,
//             isBridged,
//             slippage,
//             beforeTxAmount,
//             afterTxAmount,
//             bestFunctionName, // Add this to the return object
//         };
//     };

//     const slippageOut: SlippageOutBaseFn = async ({
//         getPublicClient,
//         farm,
//         token,
//         prices,
//         currentWallet,
//         balances,
//         amountInWei,
//         max,
//     }) => {
//         if (!prices) throw new Error("Prices not found");
//         const state = store.getState();
//         const decimals = state.tokens.decimals;
//         const publicClient = getPublicClient(farm.chainId);
//         //#region Zapping Out
//         let receivedAmtDollar = 0;
//         let receviedAmt = 0n;
//         let bestFunctionName = "";
//         const vaultBalance =
//             (await getBalance(farm.vault_addr, currentWallet, { public: publicClient })) ||
//             BigInt(balances[farm.chainId][farm.vault_addr].valueWei);
//         let stateOverrides: StateOverride = [];

//         if (token === zeroAddress) {
//             stateOverrides.push({
//                 address: currentWallet,
//                 balance: maxUint256 / 2n,
//             });
//             stateOverrides.push({
//                 address: farm.vault_addr,
//                 stateDiff: [
//                     {
//                         slot: getVaultAllowanceSlot(currentWallet, farm.zapper_addr),
//                         value: numberToHex(maxUint256, { size: 32 }),
//                     },
//                     {
//                         slot: getVaultBalanceSlot(currentWallet),
//                         value: numberToHex(maxUint256, { size: 32 }),
//                     },
//                 ],
//             });
//             // First withdraw attempt
//             const { result: result1 } = await publicClient.simulateContract({
//                 account: currentWallet,
//                 address: farm.zapper_addr,
//                 abi: zapperAbi,
//                 functionName: "zapOut",
//                 args: [farm.vault_addr, max ? vaultBalance : amountInWei, token, 0n],
//                 stateOverride: stateOverrides,
//             });

//             let receviedAmt = result1[0];
//             bestFunctionName = "zapOut";

//             if (withBond) {
//                 // Second withdraw attempt with bond
//                 const { result: result2 } = await publicClient.simulateContract({
//                     account: currentWallet,
//                     address: farm.zapper_addr,
//                     abi: zapperAbi,
//                     functionName: "zapOutWithBond",
//                     args: [farm.vault_addr, max ? vaultBalance : amountInWei, token, 0n],
//                     stateOverride: stateOverrides,
//                 });

//                 // Compare results and use the better one
//                 if (result2[0] > result1[0]) {
//                     receviedAmt = result2[0];
//                     bestFunctionName = "zapOutWithBond";
//                 }
//             }

//             receivedAmtDollar =
//                 Number(toEth(receviedAmt, decimals[farm.chainId][zeroAddress])) *
//                 prices[farm.chainId][addressesByChainId[farm.chainId].beraAddress!];
//         } else {
//             stateOverrides.push({
//                 address: farm.vault_addr,
//                 stateDiff: [
//                     {
//                         slot: getVaultAllowanceSlot(currentWallet, farm.zapper_addr),
//                         value: numberToHex(maxUint256, { size: 32 }),
//                     },
//                     {
//                         slot: getVaultBalanceSlot(currentWallet),
//                         value: numberToHex(maxUint256, { size: 32 }),
//                     },
//                     {
//                         slot: getBalanceSlot(currentWallet),
//                         value: numberToHex(maxUint256, { size: 32 }),
//                     },
//                 ],
//             });
//             // First withdraw attempt
//             const { result: result1 } = await publicClient.simulateContract({
//                 account: currentWallet,
//                 address: farm.zapper_addr,
//                 abi: zapperAbi,
//                 functionName: "zapOut",
//                 args: [farm.vault_addr, max ? vaultBalance : amountInWei, token, 0n],
//                 stateOverride: stateOverrides,
//             });

//             let receviedAmt = result1[0];
//             bestFunctionName = "zapOut";

//             if (withBond) {
//                 // Second withdraw attempt with bond
//                 const { result: result2 } = await publicClient.simulateContract({
//                     account: currentWallet,
//                     address: farm.zapper_addr,
//                     abi: zapperAbi,
//                     functionName: "zapOutWithBond",
//                     args: [farm.vault_addr, max ? vaultBalance : amountInWei, token, 0n],
//                     stateOverride: stateOverrides,
//                 });

//                 // Compare results and use the better one
//                 if (result2[0] > result1[0]) {
//                     receviedAmt = result2[0];
//                     bestFunctionName = "zapOutWithBond";
//                 }
//             }
//             receivedAmtDollar = Number(toEth(receviedAmt, decimals[farm.chainId][token])) * prices[farm.chainId][token];
//         }

//         const withdrawAmt = Number(toEth(amountInWei, farm.decimals));
//         const afterTxAmount = receivedAmtDollar;
//         const beforeTxAmount = withdrawAmt * prices[farm.chainId][farm.vault_addr];
//         let slippage = (1 - afterTxAmount / beforeTxAmount) * 100;
//         if (slippage < 0) slippage = 0;

//         return {
//             receviedAmt,
//             slippage,
//             afterTxAmount,
//             beforeTxAmount,
//             bestFunctionName,
//         };
//         //#endregion
//     };

//     function getVaultAllowanceSlot(owner: Address, spender: Address) {
//         const mappingSlot = 1n; // _allowances is at storage slot 1

//         // Step 1: Encode the owner address and the mapping's slot
//         const innerEncoded = encodeAbiParameters([{ type: "address" }, { type: "uint256" }], [owner, mappingSlot]);

//         // Compute keccak256 hash of the encoded data to get innerHash
//         const innerHash = keccak256(innerEncoded);

//         // Step 2: Encode the spender address and the inner hash
//         const finalEncoded = encodeAbiParameters([{ type: "address" }, { type: "bytes32" }], [spender, innerHash]);

//         // Compute keccak256 hash of the final encoded data to get the storage slot
//         const allowanceSlot = keccak256(finalEncoded);

//         return allowanceSlot;
//     }

//     function getBalanceSlot(owner: Address) {
//         // Define the _BALANCE_SLOT_SEED
//         const balanceSlotSeed = "0x87a211a2";

//         // Define 8 bytes of zeros
//         const zeroBytes8 = "0x0000000000000000";

//         const encoded = encodePacked(["address", "bytes8", "bytes4"], [owner, zeroBytes8, balanceSlotSeed]);

//         // Compute the keccak256 hash to get the storage slot
//         const balanceSlot = keccak256(encoded);
//         return balanceSlot;
//     }

//     function getVaultBalanceSlot(owner: Address) {
//         const mappingSlot = 0n; // _balances is at storage slot 0

//         // Step 1: Encode the owner address and the mapping's slot
//         const encoded = encodeAbiParameters([{ type: "address" }, { type: "uint256" }], [owner, mappingSlot]);

//         // Compute keccak256 hash of the encoded data to get balanceSlot
//         const balanceSlot = keccak256(encoded);

//         return balanceSlot;
//     }

//     const zapIn: ZapInFn = (props) => zapInBase({ ...props, farm, withBond });
//     const zapInSlippage: SlippageInBaseFn = (props) => slippageIn({ ...props, farm });

//     const zapOut: ZapOutFn = (props) => zapOutBase({ ...props, farm, withBond });
//     const zapOutSlippage: SlippageOutBaseFn = (props) => slippageOut({ ...props, farm });

//     return {
//         getProcessedFarmData,
//         zapIn,
//         zapOut,
//         zapInSlippage,
//         zapOutSlippage,
//     };
// };

// export default arbera;
