import { createWeb3Name } from "@web3-name-sdk/core";
import { notifyError } from "src/api/notify";
import { defaultChainId, VAULT_NEW_DURATION } from "src/config/constants";
import { errorMessages } from "src/config/constants/notifyMessages";
import store from "src/state";
import { IClients } from "src/types";
import {
    Address,
    erc20Abi,
    formatUnits,
    getAddress,
    getContract,
    maxUint256,
    parseUnits,
    TransactionReceipt,
    zeroAddress,
} from "viem";

import { addressesByChainId } from "src/config/constants/contracts";
import { PoolDef } from "src/config/constants/pools_json";
import { SupportedChains } from "src/config/walletConfig";
import { Balances } from "src/state/tokens/types";
import { CHAIN_ID, FarmOriginPlatform } from "src/types/enums";
import { waitForTransactionReceipt } from "viem/actions";

const web3Name = createWeb3Name();

export const resolveEnsDomain = async (str: string) => {
    let addr: Address | null = null;
    try {
        addr = getAddress(str) as Address;
    } catch {
        addr = (await web3Name.getAddress(str)) as Address;
    }
    return addr;
};

export const resolveDomainFromAddress = async (addr: string) => {
    const name = await web3Name.getDomainName({
        address: addr,
        queryChainIdList: [defaultChainId],
    });
    return name;
};

export const getLpAddressForFarmsPrice = (farms: PoolDef[]) => {
    return farms.map((farm) => farm.lp_address);
};

export function validateNumberDecimals(value: number, decimals: number = 18) {
    const newVal = noExponents(value);
    const split = newVal.split(".");
    if (split.length === 2) {
        if (split[1].length > decimals) {
            split[1] = split[1].slice(0, decimals);
        }
    }
    return split.join(".");
}

export const noExponents = (n: number | string) => {
    var data = String(n).split(/[eE]/);
    if (data.length === 1) return data[0];

    var z = "",
        // @ts-ignore
        sign = n < 0 ? "-" : "",
        str = data[0].replace(".", ""),
        mag = Number(data[1]) + 1;

    if (mag < 0) {
        z = sign + "0.";
        while (mag++) z += "0";
        return z + str.replace(/^\-/, "");
    }
    mag -= str.length;
    while (mag--) z += "0";
    return str + z;
};

export function getNetworkName(id: number) {
    switch (id) {
        case 42161:
            return "arbitrum";
        case 1:
            return "ethereum";
        case 137:
            return "polygon";
        default:
            return "";
    }
}

export const toWei = (value: string | number, decimals = 18) => {
    value = Number(value)
        .toFixed(decimals + 1)
        .slice(0, -1);
    return parseUnits(value, decimals);
};

export const toEth = (value: bigint, decimals = 18) => {
    return formatUnits(value, decimals);
};

export const toFixedFloor = (value: number, decimalPlaces: number) => {
    //@ts-ignore
    const result = Number(Math.floor(value * 10 ** decimalPlaces) / 10 ** decimalPlaces);
    return result;
};

export const isValidNetwork = (network: string | number) => {
    if (typeof network === "string") {
        if (network === "arbitrum") return true;
    } else if (typeof network === "number") {
        if (network === defaultChainId) return true;
    }
    return false;
};

export const toPreciseNumber = (x: number | string, decimals = 3, precision = 2) => {
    if (typeof x === "string") {
        x = parseFloat(x);
    }
    if (x < 1) {
        return x.toPrecision(precision);
    } else {
        return x.toFixed(decimals);
    }
};

export const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const awaitTransaction = async (
    transaction: Promise<Address>,
    client: Omit<IClients, "wallet">,
    txHashCallback: ((txHash: Address) => any) | undefined = undefined
) => {
    let txHash: Address | undefined;
    let receipt: TransactionReceipt | undefined;
    let error: string | undefined;
    let status: boolean;
    try {
        txHash = await transaction;
        if (txHashCallback) txHashCallback(txHash);
        receipt = await waitForTransactionReceipt(client.public, { hash: txHash, retryCount: 40, retryDelay: 2000 });
        status = true;
        if (receipt.status === "reverted") {
            throw new Error("Transaction reverted on chain!");
        }
    } catch (e: any) {
        console.info("awaitTransaction error", e);
        status = false;
        error = e.details || e.shortMessage || e.message || e.response?.data?.message || "Something went wrong!";
    }
    return {
        txHash,
        receipt,
        error,
        status,
    };
};

export const subtractGas = async (
    amountInWei: bigint,
    client: Pick<IClients, "public">,
    estimatedTx: Promise<bigint>,
    showError: boolean = true,
    _balance: bigint | undefined = undefined
) => {
    const balance = _balance
        ? _balance
        : BigInt(store.getState().tokens.balances[client.public.chain.id][zeroAddress]?.valueWei || "0");
    const gasPrice = await client.public.getGasPrice();
    const gasLimit = await estimatedTx;
    const gasToRemove = gasLimit * gasPrice;
    if (amountInWei + gasToRemove >= balance) amountInWei = amountInWei - gasToRemove;
    if (amountInWei <= 0) {
        showError && notifyError(errorMessages.insufficientGas());
        return undefined;
    }
    return amountInWei;
};

export const customCommify = (
    amount: number | string,
    {
        minimumFractionDigits,
        maximumFractionDigits,
        showDollarSign,
    }: { minimumFractionDigits?: number; maximumFractionDigits?: number; showDollarSign?: boolean } | undefined = {}
) => {
    // Handle invalid inputs
    if (amount === null || amount === undefined || isNaN(Number(amount))) {
        return showDollarSign ? "$0.00" : "0.00";
    }

    // Convert string to number if needed
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

    // Handle edge cases
    if (!isFinite(numAmount)) {
        return showDollarSign ? "$0.00" : "0.00";
    }

    // Set default values and ensure they're within valid ranges
    // Valid range for fraction digits is 0-20
    let minFractionDigits = minimumFractionDigits !== undefined ? minimumFractionDigits : 2;
    let maxFractionDigits = maximumFractionDigits !== undefined ? maximumFractionDigits : 2;

    // Clamp values to valid ranges
    minFractionDigits = Math.max(0, Math.min(20, minFractionDigits));
    maxFractionDigits = Math.max(0, Math.min(20, maxFractionDigits));

    // Ensure min doesn't exceed max
    if (minFractionDigits > maxFractionDigits) {
        minFractionDigits = maxFractionDigits;
    }

    try {
        // Format the number
        let formattedAmount = numAmount.toLocaleString("en-US", {
            style: showDollarSign ? "currency" : "decimal",
            currency: showDollarSign ? "USD" : undefined,
            minimumFractionDigits: minFractionDigits,
            maximumFractionDigits: maxFractionDigits,
        });

        // Remove the dollar sign if it was added but not requested
        if (!showDollarSign && formattedAmount.startsWith("$")) {
            formattedAmount = formattedAmount.substring(1);
        }

        return formattedAmount;
    } catch (error) {
        console.error("Error formatting number:", error);
        // Fallback formatting in case of error
        const fallbackAmount = showDollarSign ? `$${numAmount.toFixed(2)}` : numAmount.toFixed(2);
        return fallbackAmount;
    }
};

async function* checkForPaymasterApprovalGenerator(client: IClients) {
    let txCount = 0;
    while (true) {
        if (txCount === 10) {
            txCount = 0;
            console.log(`%cChecking USDC allowance, Paymaster`, "color: green;");
            const contract = getContract({
                address: addressesByChainId[CHAIN_ID.ARBITRUM].usdcAddress as Address,
                abi: erc20Abi,
                client,
            });
            const allowance = await contract.read.allowance([
                client.wallet.account.address!,
                addressesByChainId[CHAIN_ID.ARBITRUM].universalPaymaster!,
            ]);
            if (allowance >= parseUnits("10", 6)) yield true;
            else {
                const hash = await contract.write.approve([
                    addressesByChainId[CHAIN_ID.ARBITRUM].universalPaymaster!,
                    maxUint256,
                ]);
                await waitForTransactionReceipt(client.public, { hash });
                console.log(`%cUSDC approved, Paymaster`, "color: green;");
                yield true;
            }
        } else {
            txCount++;
            yield true;
        }
    }
}
let paymasterApprovalCheckIterator: ReturnType<typeof checkForPaymasterApprovalGenerator>;
export const checkPaymasterApproval = async (client?: IClients) => {
    if (!paymasterApprovalCheckIterator && client)
        paymasterApprovalCheckIterator = checkForPaymasterApprovalGenerator(client);
    else await paymasterApprovalCheckIterator.next();
};

export const getNativeCoinInfo = (chainId: number) => {
    switch (chainId) {
        case CHAIN_ID.POLYGON:
            return { logo: "https://cryptologos.cc/logos/polygon-matic-logo.png?v=025", decimal: 18, name: "MATIC" };
        case CHAIN_ID.CORE:
            return { logo: "https://cryptologos.cc/logos/core-dao-core-logo.png", decimal: 18, name: "CORE" };
        case CHAIN_ID.BERACHAIN:
            return {
                logo: "https://raw.githubusercontent.com/BeraTrax/tokens/main/beratrax-tokens/0x7507c1dc16935B82698e4C63f2746A2fCf994dF8/logo.png",
                decimal: 18,
                name: "BERA",
            };
        default:
            return { logo: "https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=024", decimal: 18, name: "ETH" };
    }
};

/**
 * @description This function returns combined balance of native or usdc, if there are two or more chains it will add the primary chain balance and any one of the other chain balance which is highest and return it. So the sum which is returned as balance will always be the amount which can be get by combined two chain balances, which makes it so there is only need to bridge from one chain only.
 *
 * @param balances
 * @param primaryChainId The chain on which farm lives on
 * @param type Do we want native balance combined or usdc combined
 * @returns
 */
export const getCombinedBalance = (balances: Balances, primaryChainId: number, type: "native" | "usdc" | "honey") => {
    let balance = 0n;
    let chainBalances: { [chainId: string]: bigint } = {};
    const primaryChain = SupportedChains.find((item) => item.id === Number(primaryChainId));
    if (!primaryChain) throw new Error("Invalid Chain");
    const decimals = {
        usdc: 6,
        native: primaryChain.nativeCurrency.decimals,
        honey: 18,
    };
    const symbol = {
        usdc: "USDC",
        native: primaryChain.nativeCurrency.symbol,
        honey: "HONEY",
    };
    if (type === "native") {
        const chainGroups = Object.groupBy(SupportedChains, ({ nativeCurrency }) => nativeCurrency.symbol);
        const relatedNativeCoinChains = chainGroups[primaryChain.nativeCurrency.symbol];
        Object.entries(balances || {}).forEach(([chainId, values]) => {
            if (relatedNativeCoinChains?.some((item) => item.id === Number(chainId))) {
                balance += BigInt(values[zeroAddress]?.valueWei || 0);
                chainBalances[chainId] = BigInt(values[zeroAddress]?.valueWei || 0);
            }
        });
    } else if (type === "usdc") {
        Object.entries(balances || {}).forEach(([chainId, values]) => {
            const usdcAddress = addressesByChainId[Number(chainId)]?.usdcAddress;
            if (usdcAddress) {
                balance += BigInt(values[usdcAddress]?.valueWei || 0);
                chainBalances[chainId] = BigInt(values[usdcAddress]?.valueWei || 0);
            }
        });
    } else if (type === "honey") {
        Object.entries(balances || {}).forEach(([chainId, values]) => {
            const honeyAddress = addressesByChainId[Number(chainId)]?.honeyAddress;
            if (honeyAddress) {
                balance += BigInt(values[honeyAddress]?.valueWei || 0);
                chainBalances[chainId] = BigInt(values[honeyAddress]?.valueWei || 0);
            }
        });
    }
    const maxBalance = Object.entries(chainBalances).reduce((acc, curr) => {
        if (curr[0] !== primaryChainId.toString()) {
            if (curr[1] > acc) return curr[1];
        }
        return acc;
    }, 0n);
    balance = (chainBalances[primaryChainId] || 0n) + maxBalance;
    const formattedBalance = Number(toEth(BigInt(balance), decimals[type]));

    return {
        formattedBalance,
        balance,
        chainBalances,
        symbol: symbol[type],
    };
};

export const formatBalance = (balance: string | number, options?: { maximumFractionDigits?: number }) => {
    const normalizedValue = noExponents(balance);

    return Number(normalizedValue).toLocaleString("en-US", {
        maximumFractionDigits: options?.maximumFractionDigits ?? 20,
        useGrouping: true,
    });
};

export const expandScientific = (str: string) => {
    if (!str.includes("e")) return str;

    const [coef, expStr] = str.split("e");
    const exponent = parseInt(expStr, 10);

    let [intPart, fracPart = ""] = coef.split(".");

    const sign = str.trim().startsWith("-") ? "-" : "";
    intPart = intPart.replace("-", "");

    if (exponent > 0) {
        const shift = exponent - fracPart.length;
        if (shift >= 0) {
            fracPart += "0".repeat(shift);
            return sign + intPart + fracPart;
        } else {
            const pos = fracPart.length + shift;
            return sign + intPart + fracPart.slice(0, pos) + "." + fracPart.slice(pos);
        }
    } else {
        const absExp = Math.abs(exponent);
        const whole = intPart + fracPart;
        return sign + "0." + "0".repeat(absExp - 1) + whole;
    }
};

export const formatCurrency = (amount?: string | number, decimals?: number, isCompact: boolean = false) => {
    if (!amount || Number(amount) === 0) return "0";

    const num = Number(amount);

    if (Math.abs(num) < 0.001) {
        const twoSig = num.toPrecision(2);
        return expandScientific(twoSig);
    }

    if (isCompact) {
        const postfixes = ["", "K", "M", "B", "T", "P", "E", "Z", "Y"];
        let tier = Math.floor(Math.log10(Math.abs(num)) / 3);

        if (tier === 0) return num.toString();

        const scale = Math.pow(10, tier * 3);
        const scaledNum = num / scale;

        if (tier === -1) return scaledNum.toFixed(2);

        return scaledNum.toFixed(2) + postfixes[tier];
    }

    if (decimals === undefined) {
        const maxDecimals = 3;
        decimals = 0;
        if (num >= 1) {
            // For numbers greater than or equal to 1, round to the nearest integer if very close
            decimals = num % 1 === 0 ? 0 : 2;
        } else {
            // For numbers less than 1, show up to 3 decimal places if significant
            const significantDecimals = num.toFixed(8).match(/^-?\d*\.?0*\d{0,2}/)?.[0] || num.toString();
            decimals = Math.min(significantDecimals.split(".")[1]?.length || 2, maxDecimals);
        }
    }

    const options = {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    };

    const formattedAmount = new Intl.NumberFormat(navigator.language, options).format(num);
    return formattedAmount;
};

export const isVaultNew = (createdAt: number) => {
    const now = Math.floor(Date.now() / 1000);
    return now - createdAt < VAULT_NEW_DURATION;
};

export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};


export const getColorClass = (percentage: number) => {
    if (percentage >= 85) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-800";
};

