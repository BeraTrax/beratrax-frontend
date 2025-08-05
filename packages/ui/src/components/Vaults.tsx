import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, ScrollView } from "react-native";
import stakingAbi from "@beratrax/core/src/assets/abis/stakingAbi";
import { addressesByChainId } from "@beratrax/core/src/config/constants/contracts";
import { PoolDef } from "@beratrax/core/src/config/constants/pools_json";
import { useVaults } from "@beratrax/core/src/hooks";
// import { useAppDispatch } from "@beratrax/core/src/state";
// import { updatePoints } from "@beratrax/core/src/state/account/accountReducer";
import { useFarmDetails } from "@beratrax/core/src/state/farms/hooks";
import useTokens from "@beratrax/core/src/state/tokens/useTokens";
import { CHAIN_ID } from "@beratrax/core/src/types/enums";
import { Address } from "viem";
import { EmptyComponent } from "./EmptyComponent";
import { GradientText } from "./GradientText";
import { useWallet as importedUseWallet } from "@beratrax/core/src/hooks";
import VaultItem from "./VaultItem";
import ETFVaultItem from "./ETFVaultItem";
import { ReloadIcon } from "../icons/Reload";
import { TraxAirdropVault } from "@beratrax/ui/src/components/TraxAirdrop/TraxAirdropVault";
import { TraxSeason3AirdropVault } from "@beratrax/ui/src/components/TraxAirdrop/TraxSeason3AirdropVault";
import { useAppSelector } from "@beratrax/core/src/state";

export const Vaults: FC<React.PropsWithChildren> = ({}) => {
	// const dispatch = useAppDispatch();
	const { reloadFarmData } = useFarmDetails();
	const { vaults: unsortedVaults, isLoading, etfVaults } = useVaults();

	const vaults = useMemo(() => {
		return [...(unsortedVaults || [])].sort((a, b) => {
			if (a.isCurrentWeeksRewardsVault && !b.isCurrentWeeksRewardsVault) return -1;
			if (!a.isCurrentWeeksRewardsVault && b.isCurrentWeeksRewardsVault) return 1;
			return 0;
		});
	}, [unsortedVaults]);

	// const deprecatedVaults = useMemo(() => vaults.filter((vault) => vault.isDeprecated && vault.isUpgradable), [vaults]);
	// const upgradableVaults = useMemo(() => vaults.filter((vault) => vault.isUpgradable), [vaults]);
	const { balances } = useTokens();
	const { isConnecting, currentWallet, getPublicClient } = useWallet();

	const [isRefreshing, setIsRefreshing] = useState(false);
	const [rewardsVaultsData, setRewardsVaultsData] = useState<PoolDef[]>([]);
	const [rewardsUpdateTrigger, setRewardsUpdateTrigger] = useState(0);
	const [userBTXStake, setUserBTXStake] = useState<bigint>(0n);

	// Get airdrop state to check if user has staked TRAX
	const airdropState = useAppSelector((state) => state.account.airdrop);
	const additionalAirdropState = useAppSelector((state) => state.account.additionalAirdrop);
	const hasStakedTrax = Boolean(airdropState?.stakeInfo && BigInt(airdropState.stakeInfo) > 0n);
	const hasStakedAdditionalTrax = Boolean(additionalAirdropState?.stakeInfo && BigInt(additionalAirdropState.stakeInfo) > 0n);

	const publicClient = getPublicClient?.(CHAIN_ID.BERACHAIN);

	useEffect(() => {
		if (!currentWallet || !vaults.length || !publicClient) {
			return;
		}

		async function fetchRewardsData() {
			try {
				// Filter vaults for rewards
				const filteredVaults = vaults.filter((vault) => {
					if (!vault.rewardVault) {
						return false;
					}

					// Check if the balances exist before accessing them
					if (!balances[vault.chainId] || !balances[vault.chainId][vault.vault_addr]) {
						return false;
					}

					const vaultBalance =
						BigInt(balances[vault.chainId][vault.vault_addr].valueWei) -
						BigInt(balances[vault.chainId][vault.vault_addr].valueRewardVaultWei || 0);

					return vaultBalance > 0n;
				});
				setRewardsVaultsData(filteredVaults);

				try {
					const userInfo = (await publicClient?.readContract({
						address: addressesByChainId[CHAIN_ID.BERACHAIN].stakingAddress as Address,
						abi: stakingAbi,
						functionName: "userInfo",
						args: [currentWallet],
					})) as any;

					// Make sure userInfo is valid before accessing its properties
					if (userInfo && Array.isArray(userInfo) && userInfo.length > 1) {
						setUserBTXStake(userInfo[1]);
					} else {
						setUserBTXStake(0n);
					}
				} catch (contractError) {
					console.error("Contract read error:", contractError);
					setUserBTXStake(0n);
				}
			} catch (error) {
				console.error("Error fetching rewards data:", error);
				setRewardsVaultsData([]);
			}
		}

		fetchRewardsData();
	}, [rewardsUpdateTrigger, vaults, currentWallet, publicClient, balances]);

	const refresh = useCallback(async () => {
		setIsRefreshing(true);
		try {
			if (currentWallet) {
				// await dispatch(updatePoints(currentWallet));
				await reloadFarmData();
				// Trigger a refresh of the rewards data
				setRewardsUpdateTrigger((prev) => prev + 1);
			}
		} catch (error) {
			console.error("Refresh error:", error);
		} finally {
			setIsRefreshing(false);
		}
	}, []);

	const refreshButtonContent = useMemo(
		() => (isRefreshing ? <ActivityIndicator size="small" color="#FFFFFF" /> : <ReloadIcon />),
		[isRefreshing]
	);

	if (isLoading || isConnecting) {
		return (
			<View className="w-full h-[250px] rounded-[20px] bg-bgDark flex items-center justify-center">
				<ActivityIndicator size="large" color="#FFFFFF" />
			</View>
		);
	}

	if (!currentWallet) {
		return <View className="w-full"></View>;
	}

	return (
		<View className="flex flex-col w-full">
			<View className="flex flex-row justify-between items-center mb-4">
				<View className="flex flex-row items-center gap-2">
					<Text className="font-arame-mono text-base text-textWhite uppercase mt-5 mb-4">Staked Vaults</Text>
					<Pressable onPress={refresh} disabled={isRefreshing} className="mt-1">
						{refreshButtonContent}
					</Pressable>
				</View>
			</View>

			<ScrollView horizontal={false} className="w-full" contentContainerStyle={{ flexGrow: 1 }}>
				{!isLoading ? (
					vaults.length > 0 || etfVaults.length > 0 || hasStakedTrax || hasStakedAdditionalTrax ? (
						<View className="flex flex-wrap flex-row gap-4">
							{hasStakedTrax && <TraxAirdropVault />}
							{hasStakedAdditionalTrax && <TraxSeason3AirdropVault />}
							{etfVaults
								.filter((vault) => vault.userVaultBalance > 0)
								.map((vault) => (
									<ETFVaultItem key={vault.id} vault={vault} />
								))}
							{vaults
								.filter((vault) => !vault.isUpcoming)
								.map((vault) => (
									<VaultItem key={vault.id} vault={vault} />
								))}
						</View>
					) : (
						<EmptyComponent style={{ paddingTop: 50, paddingBottom: 50 }}>
							<View className="flex flex-col items-center justify-center">
								<Text className="text-textWhite text-center mb-4">You haven't deposited in any of the Vaults.</Text>
								<Pressable>
									<GradientText>Go to Vaults</GradientText>
								</Pressable>
							</View>
						</EmptyComponent>
					)
				) : (
					<View className="w-full h-[250px] rounded-[20px] bg-bgDark flex items-center justify-center">
						<ActivityIndicator size="large" color="#FFFFFF" />
					</View>
				)}
			</ScrollView>
		</View>
	);
};

const useWallet = () => {
	try {
		return importedUseWallet();
	} catch (e) {
		console.error("Failed to import useWallet", e);
		return { currentWallet: null, isConnecting: false, getPublicClient: null };
	}
};
