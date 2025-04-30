import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import stakingAbi from "@beratrax/core/src/assets/abis/stakingAbi";
import { DepositToRewardsVault } from "web/src/components/DepositRewardsVault/DepositRewardsVault";
import { EmptyComponent } from "web/src/components/EmptyComponent/EmptyComponent";
import { Skeleton } from "web/src/components/Skeleton/Skeleton";
import { VaultsMigrator } from "web/src/components/VaultMigrator/VaultsMigrator";
import { RoutesPaths } from "@beratrax/core/src/config/constants";
import { addressesByChainId } from "@beratrax/core/src/config/constants/contracts";
import { PoolDef } from "@beratrax/core/src/config/constants/pools_json";
import { useVaults } from "@beratrax/core/src/hooks";
import { useWallet } from "@beratrax/core/src/hooks";
import { useAppDispatch } from "@beratrax/core/src/state";
import { updatePoints } from "@beratrax/core/src/state/account/accountReducer";
import { useFarmDetails } from "@beratrax/core/src/state/farms/hooks";
import useTokens from "@beratrax/core/src/state/tokens/useTokens";
import { CHAIN_ID } from "@beratrax/core/src/types/enums";
import { Address, getContract } from "viem";
import VaultItem from "./VaultItem";

const Vaults: React.FC = () => {
	const dispatch = useAppDispatch();
	const { reloadFarmData } = useFarmDetails();
	const { vaults: unsortedVaults, isLoading } = useVaults();
	const vaults = useMemo(() => {
		return [...unsortedVaults].sort((a, b) => {
			if (a.isCurrentWeeksRewardsVault && !b.isCurrentWeeksRewardsVault) return -1;
			if (!a.isCurrentWeeksRewardsVault && b.isCurrentWeeksRewardsVault) return 1;
			return 0;
		});
	}, [unsortedVaults]);
	const deprecatedVaults = useMemo(() => vaults.filter((vault) => vault.isDeprecated && vault.isUpgradable), [vaults]);
	const upgradableVaults = useMemo(() => vaults.filter((vault) => vault.isUpgradable), [vaults]);
	const { balances } = useTokens();
	const { isConnecting, currentWallet, getPublicClient } = useWallet();
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [rewardsVaultsData, setRewardsVaultsData] = useState<PoolDef[]>([]);
	const [rewardsUpdateTrigger, setRewardsUpdateTrigger] = useState(0);
	const [userBTXStake, setUserBTXStake] = useState(0n);

	const publicClient = getPublicClient(CHAIN_ID.BERACHAIN);

	useEffect(() => {
		// Move the function definition outside of useEffect
		if (!currentWallet || !vaults.length) return;

		async function fetchRewardsData() {
			try {
				const filteredVaults = vaults.filter((vault) => {
					if (!vault.rewardVault) return false;
					const vaultBalance =
						BigInt(balances[vault.chainId][vault.vault_addr].valueWei) -
						BigInt(balances[vault.chainId][vault.vault_addr].valueRewardVaultWei || 0);
					return vaultBalance > 0n;
				});
				setRewardsVaultsData(filteredVaults);

				const contract = getContract({
					address: addressesByChainId[CHAIN_ID.BERACHAIN].stakingAddress as Address,
					abi: stakingAbi,
					client: { public: publicClient },
				});
				const userInfo = (await contract.read.userInfo([currentWallet])) as any;
				setUserBTXStake(userInfo[1]);
			} catch (error) {
				console.error("Error fetching rewards data:", error);
			}
		}

		fetchRewardsData();
	}, [rewardsUpdateTrigger, vaults]);

	if (isLoading || isConnecting) return <Skeleton w={"100%"} h={250} bRadius={20} inverted={false} />;

	if (!currentWallet) {
		return <></>;
	}

	const refresh = async () => {
		setIsRefreshing(true);
		try {
			await dispatch(updatePoints(currentWallet!));
			await reloadFarmData();
		} finally {
			setIsRefreshing(false);
		}
	};

	return (
		<div className="flex flex-col font-arame-mono">
			<div className="flex flex-row gap-x-4 justify-between items-center mb-4">
				<div className="flex items-center gap-2">
					<p className="font-normal text-[16px] text-textWhite leading-4 uppercase mt-5 mb-4">Staked Vaults</p>
					<button onClick={refresh} className="mt-1 text-textWhite hover:text-textPrimary transition-colors" disabled={isRefreshing}>
						<svg
							className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
							/>
						</svg>
					</button>
				</div>
				<div className="flex flex-col gap-x-4 justify-end items-center lg:flex-row">
					{deprecatedVaults.length > 0 && <VaultsMigrator />}
					{upgradableVaults.length > 0 && <VaultsMigrator />}
					{rewardsVaultsData.length > 0 && (
						<DepositToRewardsVault
							rewardsVaultsData={rewardsVaultsData}
							onDepositComplete={() => setRewardsUpdateTrigger((prev) => prev + 1)}
						/>
					)}
				</div>
			</div>
			<div
				className="w-full flex flex-wrap gap-4"
				style={!isLoading && (vaults.length > 0 || userBTXStake > 0n) ? undefined : { display: "block" }}
			>
				{!isLoading ? (
					vaults.length > 0 ? (
						vaults.filter((vault) => !vault.isUpcoming).map((vault) => <VaultItem vault={vault} key={vault.id} />)
					) : (
						<EmptyComponent style={{ paddingTop: 50, paddingBottom: 50 }}>
							<div className="flex flex-col justify-center mb-4">
								<iframe
									className="min-h-[315px] hidden md:block"
									src="https://www.youtube.com/embed/RolxWw5HMoM?si=pVuzfqEFDD0aOfWM&amp;controls=0"
									title="Beratrax"
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
									referrerPolicy="strict-origin-when-cross-origin"
									allowFullScreen
								></iframe>
								<iframe
									className="min-h-[515px] block md:hidden"
									src="https://www.youtube.com/embed/DX_uhqRYQ4U?si=avEYlPlP4d-IluWi&amp;controls=0"
									title="YouTube video player"
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
									referrerPolicy="strict-origin-when-cross-origin"
									allowFullScreen
								></iframe>
							</div>
							<div className="flex flex-col items-center justify-center">
								<p>You haven't deposited in any of the Vaults. </p>
								<Link to={RoutesPaths.Farms} className="text-textPrimary">
									Go to Vaults
								</Link>
							</div>
						</EmptyComponent>
					)
				) : (
					<Skeleton w={"100%"} h={250} bRadius={20} inverted={true} />
				)}
			</div>
		</div>
	);
};

export default Vaults;
