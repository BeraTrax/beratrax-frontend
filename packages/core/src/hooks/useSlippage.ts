import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { Address, zeroAddress } from "viem";
import useTokens from "../state/tokens/useTokens";
import farmFunctions from "./../api/pools";
import { PoolDef, ETFVaultDef } from "./../config/constants/pools_json";
import { SlippageInBaseFn, SlippageInBaseETFFn, SlippageOutBaseFn, SlippageOutBaseETFFn } from "./../api/pools/types";
import { toEth, toWei } from "./../utils/common";
import { isETFVault, isRegularPool } from "./../utils/farmTypeGuards";
import useWallet from "./useWallet";

export const useSlippageDeposit = (maxAmounts: number[], tokens: Address[], farm: PoolDef | ETFVaultDef) => {
	const [slippageAmounts, setSlippageAmounts] = useState<{ [key: string]: number }>({});
	const [loadingDeposit, setLoadingDeposit] = useState(false);
	const { balances, prices, decimals } = useTokens();
	const { currentWallet, getClients, estimateTxGas, getPublicClient, getWalletClient, isSocial } = useWallet();

	const fetchSlippage = async () => {
		setLoadingDeposit(true);
		const newSlippageAmounts: { [key: string]: number } = {};
		for (const maxAmount of maxAmounts) {
			for (const token of tokens) {
				let amt;
				if (token === zeroAddress) {
					amt = maxAmount / prices[farm.chainId][zeroAddress];
				} else {
					amt = maxAmount;
				}
				let amountInWei = toWei(amt, decimals[farm.chainId][token]);
				const id = uuid();

				try {
					let result;

					if (isRegularPool(farm)) {
						const slippageFn = farmFunctions[farm.id]?.zapInSlippage as SlippageInBaseFn;
						result = await slippageFn?.({
							id,
							currentWallet: currentWallet!,
							amountInWei,
							balances,
							max: false,
							isSocial,
							token,
							prices,
							estimateTxGas,
							getPublicClient,
							getWalletClient,
							decimals: decimals as any,
							farm,
							getClients,
						});
					} else if (isETFVault(farm)) {
						const slippageFn = farmFunctions[farm.id]?.zapInSlippage as SlippageInBaseETFFn;
						result = await slippageFn?.({
							id,
							currentWallet: currentWallet!,
							amountInWei,
							balances,
							max: false,
							isSocial,
							token,
							prices,
							estimateTxGas,
							getPublicClient,
							getWalletClient,
							decimals: decimals as any,
							farm,
							getClients,
						});
					}

					if (result) {
						const { receviedAmt: difference } = result;
						const afterDepositAmount = Number(toEth(difference, farm.decimals)) * prices[farm.chainId][farm.vault_addr];
						const beforeDepositAmount = amt * prices[farm.chainId][token];
						let slippage = (1 - afterDepositAmount / beforeDepositAmount) * 100;
						if (slippage < 0) slippage = 0;
						newSlippageAmounts[`${maxAmount}-${token}`] = slippage;
					}
				} catch (err) {
					console.log(`%cError Slippage: ${err}`);
				}
			}
		}
		setSlippageAmounts(newSlippageAmounts);
		setLoadingDeposit(false);
	};

	useEffect(() => {
		fetchSlippage();
	}, []);

	return { slippageAmounts, loadingDeposit };
};

export const useSlippageWithdraw = (maxAmounts: number[], tokens: Address[], farm: PoolDef | ETFVaultDef) => {
	const [slippageAmounts, setSlippageAmounts] = useState<{ [key: string]: number }>({});
	const [loadingWithdraw, setLoadingWithdraw] = useState(false);
	const { balances, prices, decimals } = useTokens();
	const { currentWallet, getClients, estimateTxGas, getPublicClient, getWalletClient, isSocial } = useWallet();

	const fetchSlippage = async () => {
		setLoadingWithdraw(true);
		const newSlippageAmounts: { [key: string]: number } = {};
		for (const maxAmount of maxAmounts) {
			for (const token of tokens) {
				let amt = maxAmount / prices[farm.chainId][farm.vault_addr];

				let amountInWei = toWei(amt, farm.decimals);
				const id = uuid();

				try {
					let result;

					if (isRegularPool(farm)) {
						const slippageFn = farmFunctions[farm.id]?.zapOutSlippage as SlippageOutBaseFn;
						result = await slippageFn?.({
							id,
							currentWallet: currentWallet!,
							amountInWei,
							isSocial,
							balances,
							max: false,
							estimateTxGas,
							prices,
							getPublicClient,
							getWalletClient,
							decimals,
							token,
							farm,
							getClients,
						});
					} else if (isETFVault(farm)) {
						const slippageFn = farmFunctions[farm.id]?.zapOutSlippage as SlippageOutBaseETFFn;
						result = await slippageFn?.({
							id,
							currentWallet: currentWallet!,
							amountInWei,
							isSocial,
							balances,
							max: false,
							estimateTxGas,
							prices,
							getPublicClient,
							getWalletClient,
							decimals,
							token,
							farm,
							getClients,
						});
					}

					if (result) {
						const { receviedAmt: difference } = result;
						const afterWithdrawAmount = Number(toEth(difference, decimals[farm.chainId][token])) * prices[farm.chainId][token];
						const beforeWithdrawAmount = amt * prices[farm.chainId][farm.vault_addr];
						let slippage = (1 - afterWithdrawAmount / beforeWithdrawAmount) * 100;
						if (slippage < 0) slippage = 0;

						newSlippageAmounts[`${maxAmount}-${token}`] = slippage;
					}
				} catch (err) {
					console.log(`%cError Slippage: ${err}`);
				}
			}
		}
		setSlippageAmounts(newSlippageAmounts);
		setLoadingWithdraw(false);
	};

	useEffect(() => {
		fetchSlippage();
	}, []);

	return { slippageAmounts, loadingWithdraw };
};
