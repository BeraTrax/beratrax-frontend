import { useState, useCallback, useEffect } from "react";
import { Address, formatUnits } from "viem";
import { CHAIN_ID } from "@beratrax/core/src/types/enums";
import pools_json, { PoolDef, ETF_VAULTS, ETFVaultDef } from "@beratrax/core/src/config/constants/pools_json";
import useWallet from "./useWallet";

// Minimal ERC4626 ABI for reading balances
const erc4626ReadAbi = [
	{
		inputs: [{ name: "account", type: "address" }],
		name: "balanceOf",
		outputs: [{ name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [{ name: "shares", type: "uint256" }],
		name: "convertToAssets",
		outputs: [{ name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
] as const;

export interface VaultWithBalance {
	id: number;
	name: string;
	vault_addr: Address;
	lp_address: Address;
	isETFVault: boolean;
	shareBalance: bigint;
	shareBalanceFormatted: string;
	estimatedUnderlyingValue: bigint;
	estimatedUnderlyingFormatted: string;
	decimals: number;
	logo1: string;
	logo2?: string;
	originPlatform: string;
	platform_logo: string;
}

export const useWithdrawPage = () => {
	const { currentWallet, getPublicClient, isConnecting } = useWallet();
	const [vaultsWithBalances, setVaultsWithBalances] = useState<VaultWithBalance[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Combine regular pools and ETF vaults
	const allVaults = [
		...pools_json.filter((p) => !p.isDeprecated && p.chainId === CHAIN_ID.BERACHAIN),
		...ETF_VAULTS.filter((v) => !v.isDeprecated && v.chainId === CHAIN_ID.BERACHAIN),
	];

	const fetchVaultBalances = useCallback(async () => {
		if (!currentWallet) {
			setVaultsWithBalances([]);
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const publicClient = getPublicClient(CHAIN_ID.BERACHAIN);

			// Build multicall for all vault balanceOf calls
			const balanceOfCalls = allVaults.map((vault) => ({
				address: vault.vault_addr,
				abi: erc4626ReadAbi,
				functionName: "balanceOf" as const,
				args: [currentWallet] as const,
			}));

			// Execute multicall for balances
			const balanceResults = await publicClient.multicall({
				contracts: balanceOfCalls,
				allowFailure: true,
			});

			// Filter vaults with non-zero balances and build convertToAssets calls
			const vaultsWithNonZeroBalances: { vault: PoolDef | ETFVaultDef; balance: bigint; index: number }[] = [];

			balanceResults.forEach((result, index) => {
				if (result.status === "success" && result.result && (result.result as bigint) > 0n) {
					vaultsWithNonZeroBalances.push({
						vault: allVaults[index],
						balance: result.result as bigint,
						index,
					});
				}
			});

			// Build convertToAssets calls for vaults with balances
			const convertToAssetsCalls = vaultsWithNonZeroBalances.map(({ vault, balance }) => ({
				address: vault.vault_addr,
				abi: erc4626ReadAbi,
				functionName: "convertToAssets" as const,
				args: [balance] as const,
			}));

			// Execute multicall for asset values
			let assetResults: { status: "success" | "failure"; result?: bigint }[] = [];
			if (convertToAssetsCalls.length > 0) {
				assetResults = (await publicClient.multicall({
					contracts: convertToAssetsCalls,
					allowFailure: true,
				})) as { status: "success" | "failure"; result?: bigint }[];
			}

			// Build final vault list
			const processedVaults: VaultWithBalance[] = vaultsWithNonZeroBalances.map(({ vault, balance }, idx) => {
				const isETF = "isETFVault" in vault && vault.isETFVault;
				const decimals = vault.decimals || 18;

				// Get estimated underlying value
				let estimatedUnderlyingValue = balance; // Default to share balance
				if (assetResults[idx]?.status === "success" && assetResults[idx]?.result) {
					estimatedUnderlyingValue = assetResults[idx].result as bigint;
				}

				return {
					id: vault.id,
					name: vault.name,
					vault_addr: vault.vault_addr,
					lp_address: vault.lp_address,
					isETFVault: isETF === true,
					shareBalance: balance,
					shareBalanceFormatted: formatUnits(balance, decimals),
					estimatedUnderlyingValue,
					estimatedUnderlyingFormatted: formatUnits(estimatedUnderlyingValue, decimals),
					decimals,
					logo1: "logo1" in vault ? vault.logo1 : "",
					logo2: "logo2" in vault ? vault.logo2 : undefined,
					originPlatform: vault.originPlatform,
					platform_logo: vault.platform_logo,
				};
			});

			setVaultsWithBalances(processedVaults);
		} catch (err) {
			console.error("Error fetching vault balances:", err);
			setError(err instanceof Error ? err.message : "Failed to fetch vault balances");
		} finally {
			setIsLoading(false);
		}
	}, [currentWallet, getPublicClient, allVaults]);

	// Fetch balances when wallet connects
	useEffect(() => {
		if (!isConnecting) {
			fetchVaultBalances();
		}
	}, [currentWallet, isConnecting]);

	return {
		vaultsWithBalances,
		isLoading,
		error,
		refetch: fetchVaultBalances,
		totalVaults: vaultsWithBalances.length,
	};
};

export default useWithdrawPage;
