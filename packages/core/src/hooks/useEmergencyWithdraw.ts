import { useState, useCallback } from "react";
import { Address } from "viem";
import { CHAIN_ID } from "@beratrax/core/src/types/enums";
import useWallet from "./useWallet";
import { VaultWithBalance } from "./useWithdrawPage";

// ERC4626 redeem ABI - supports both 3 and 4 parameter versions
const erc4626RedeemAbi = [
	{
		inputs: [
			{ name: "shares", type: "uint256" },
			{ name: "receiver", type: "address" },
			{ name: "owner", type: "address" },
		],
		name: "redeem",
		outputs: [{ name: "assets", type: "uint256" }],
		stateMutability: "nonpayable",
		type: "function",
	},
] as const;

// ETF Vault emergency withdraw ABI
const etfEmergencyWithdrawAbi = [
	{
		inputs: [{ name: "shares", type: "uint256" }],
		name: "emergencyWithdraw",
		outputs: [{ name: "amounts", type: "uint256[]" }],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "emergencyWithdrawEnabled",
		outputs: [{ name: "", type: "bool" }],
		stateMutability: "view",
		type: "function",
	},
] as const;

export interface WithdrawResult {
	success: boolean;
	hash?: string;
	error?: string;
}

export const useEmergencyWithdraw = () => {
	const { currentWallet, getWalletClient, getPublicClient } = useWallet();
	const [isRedeeming, setIsRedeeming] = useState(false);
	const [redeemingVaultId, setRedeemingVaultId] = useState<number | null>(null);

	// Redeem from regular ERC4626 vault
	const redeemFromVault = useCallback(
		async (vaultAddress: Address, shares: bigint): Promise<WithdrawResult> => {
			if (!currentWallet) {
				return { success: false, error: "Wallet not connected" };
			}

			try {
				const walletClient = await getWalletClient(CHAIN_ID.BERACHAIN);
				const publicClient = getPublicClient(CHAIN_ID.BERACHAIN);

				const hash = await walletClient.writeContract({
					address: vaultAddress,
					abi: erc4626RedeemAbi,
					functionName: "redeem",
					args: [shares, currentWallet, currentWallet],
				});

				// Wait for transaction confirmation
				await publicClient.waitForTransactionReceipt({ hash });

				return { success: true, hash };
			} catch (err) {
				console.error("Error redeeming from vault:", err);
				return {
					success: false,
					error: err instanceof Error ? err.message : "Failed to redeem",
				};
			}
		},
		[currentWallet, getWalletClient, getPublicClient]
	);

	// Emergency withdraw from ETF vault
	const emergencyWithdrawFromETF = useCallback(
		async (vaultAddress: Address, shares: bigint): Promise<WithdrawResult> => {
			if (!currentWallet) {
				return { success: false, error: "Wallet not connected" };
			}

			try {
				const walletClient = await getWalletClient(CHAIN_ID.BERACHAIN);
				const publicClient = getPublicClient(CHAIN_ID.BERACHAIN);

				// Check if emergency withdraw is enabled
				const isEnabled = await publicClient.readContract({
					address: vaultAddress,
					abi: etfEmergencyWithdrawAbi,
					functionName: "emergencyWithdrawEnabled",
				});

				if (!isEnabled) {
					return { success: false, error: "Emergency withdraw is not enabled for this vault" };
				}

				const hash = await walletClient.writeContract({
					address: vaultAddress,
					abi: etfEmergencyWithdrawAbi,
					functionName: "emergencyWithdraw",
					args: [shares],
				});

				// Wait for transaction confirmation
				await publicClient.waitForTransactionReceipt({ hash });

				return { success: true, hash };
			} catch (err) {
				console.error("Error emergency withdrawing from ETF vault:", err);
				return {
					success: false,
					error: err instanceof Error ? err.message : "Failed to emergency withdraw",
				};
			}
		},
		[currentWallet, getWalletClient, getPublicClient]
	);

	// Redeem from a single vault (handles both regular and ETF)
	const redeemFromSingleVault = useCallback(
		async (vault: VaultWithBalance): Promise<WithdrawResult> => {
			setIsRedeeming(true);
			setRedeemingVaultId(vault.id);

			try {
				let result: WithdrawResult;
				if (vault.isETFVault) {
					result = await emergencyWithdrawFromETF(vault.vault_addr, vault.shareBalance);
				} else {
					result = await redeemFromVault(vault.vault_addr, vault.shareBalance);
				}
				return result;
			} finally {
				setIsRedeeming(false);
				setRedeemingVaultId(null);
			}
		},
		[redeemFromVault, emergencyWithdrawFromETF]
	);

	// Redeem all vaults sequentially
	const redeemAll = useCallback(
		async (
			vaults: VaultWithBalance[],
			onProgress?: (completed: number, total: number, currentVault: VaultWithBalance) => void
		): Promise<{ success: number; failed: number; results: WithdrawResult[] }> => {
			setIsRedeeming(true);
			const results: WithdrawResult[] = [];
			let successCount = 0;
			let failedCount = 0;

			const vaultsWithBalance = vaults.filter((v) => v.shareBalance > 0n);

			for (let i = 0; i < vaultsWithBalance.length; i++) {
				const vault = vaultsWithBalance[i];
				setRedeemingVaultId(vault.id);

				if (onProgress) {
					onProgress(i, vaultsWithBalance.length, vault);
				}

				try {
					let result: WithdrawResult;
					if (vault.isETFVault) {
						result = await emergencyWithdrawFromETF(vault.vault_addr, vault.shareBalance);
					} else {
						result = await redeemFromVault(vault.vault_addr, vault.shareBalance);
					}

					results.push(result);
					if (result.success) {
						successCount++;
					} else {
						failedCount++;
					}
				} catch (err) {
					failedCount++;
					results.push({
						success: false,
						error: err instanceof Error ? err.message : "Unknown error",
					});
				}
			}

			setIsRedeeming(false);
			setRedeemingVaultId(null);

			return { success: successCount, failed: failedCount, results };
		},
		[redeemFromVault, emergencyWithdrawFromETF]
	);

	return {
		redeemFromVault,
		emergencyWithdrawFromETF,
		redeemFromSingleVault,
		redeemAll,
		isRedeeming,
		redeemingVaultId,
	};
};

export default useEmergencyWithdraw;
