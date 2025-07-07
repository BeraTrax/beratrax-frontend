import { FC, useMemo, useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, ActivityIndicator, Image, Platform, GestureResponderEvent } from "react-native";
import { useTokens, useTrax, useWallet } from "@beratrax/core/src/hooks";
import { awaitTransaction, customCommify, formatCurrency, toEth, toFixedFloor } from "@beratrax/core/src/utils/common";
import { useFarmDetails } from "@beratrax/core/src/state/farms/hooks";
import { useFarmTransactions } from "@beratrax/core/src/state/transactions/useFarmTransactions";
import { Address, encodeFunctionData, formatEther, getAddress } from "viem";
import rewardVaultAbi from "@beratrax/core/src/assets/abis/rewardVaultAbi";
import { dismissNotify, notifyError, notifyLoading, notifySuccess } from "@beratrax/core/src/api/notify";
import { approveErc20 } from "@beratrax/core/src/api/token";
import { Vault } from "@beratrax/core/src/types";
import FarmRowChip from "./FarmItem/components/FarmRowChip/FarmRowChip";
import { useRouter } from "expo-router";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@beratrax/core/src";
import { setLastVisitedPage } from "@beratrax/core/src/state/account/accountReducer";
import Colors from "@beratrax/typescript-config/Colors";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";

interface VaultItemProps {
	vault: Vault;
}

const VaultItem: FC<VaultItemProps> = ({ vault }) => {
	const [isDepositing, setIsDepositing] = useState(false);
	const [vaultBalance, setVaultBalance] = useState(BigInt(0));
	const [rewards, setRewards] = useState(0n);
	const [isClaiming, setIsClaiming] = useState(false);

	// Generate unique gradient ID to avoid conflicts when multiple VaultItems are rendered
	const gradientId = useMemo(() => `vaultGrad-${vault.vault_addr}`, [vault.vault_addr]);
	// const { oldPrice, isLoading: isLoadingOldData } = useOldPrice(vault.chainId, vault.vault_addr);
	const { getClients, currentWallet, getPublicClient, getWalletClient } = useWallet();
	const { reloadFarmData, isVaultEarningsFirstLoad, vaultEarnings, earningsUsd } = useFarmDetails();
	const dispatch = useAppDispatch();
	const { data: txHistory } = useFarmTransactions(vault.id, 1);
	const lastTransaction = useMemo(() => {
		if (!txHistory) return null;
		return txHistory[0];
	}, [txHistory]);
	const { balances, prices, decimals, reloadBalances } = useTokens();

	const currentVaultEarnings = vaultEarnings?.find((earning) => Number(earning.tokenId) === Number(vault.id));
	const currentVaultEarningsUsd = useMemo(() => {
		if (!currentVaultEarnings || currentVaultEarnings.token0 === "") return 0;

		return (
			Number(
				toEth(
					BigInt(currentVaultEarnings?.earnings0 || 0n),
					decimals[vault.chainId][getAddress(currentVaultEarnings.token0 as `0x${string}`)]
				)
			) *
				prices[vault.chainId][getAddress(currentVaultEarnings.token0 as `0x${string}`)] +
			(currentVaultEarnings?.token1
				? Number(
						toEth(
							BigInt(currentVaultEarnings?.earnings1 || 0n),
							decimals[vault.chainId][getAddress(currentVaultEarnings.token1 as `0x${string}`)]
						)
					) * prices[vault.chainId][getAddress(currentVaultEarnings.token1 as `0x${string}`)]
				: 0)
		);
	}, [isVaultEarningsFirstLoad, vaultEarnings]);
	const changeInAssets = currentVaultEarnings?.changeInAssets;
	const changeInAssetsStr = changeInAssets === "0" ? "0" : changeInAssets?.toString();
	const changeInAssetsValue = Number(toEth(BigInt(changeInAssetsStr || 0), decimals[vault.chainId][vault.lp_address as Address]));
	const changeInAssetsValueUsd = changeInAssetsValue * (prices[vault.chainId][vault.lp_address] || 0);
	const totalEarningsUsd = changeInAssetsValueUsd + currentVaultEarningsUsd;

	const router = useRouter();
	let navigate = null;
	if (Platform.OS === "web") {
		navigate = useNavigate();
	}
	const { getTraxApy } = useTrax();
	const estimateTrax = useMemo(() => getTraxApy(vault.vault_addr), [getTraxApy, vault]);
	const { userVaultBalance, priceOfSingleToken, apys } = vault || {};
	const apy = apys?.apy + apys?.pointsApr;

	const logo1Source = vault.logo1 ? { uri: vault.logo1 } : undefined;
	const logo2Source = vault.logo2 ? { uri: vault.logo2 } : undefined;
	const logo3Source = vault.logo3 ? { uri: vault.logo3 } : undefined;
	const logo4Source = vault.logo4 ? { uri: vault.logo4 } : undefined;
	const platformLogoSource = vault.platform_logo ? { uri: vault.platform_logo } : undefined;
	const secondaryPlatformLogoSource = vault.secondary_platform_logo ? { uri: vault.secondary_platform_logo } : undefined;

	useEffect(() => {
		const getVaultBalance = async () => {
			try {
				const client = await getClients(vault.chainId);
				const vaultBalance =
					BigInt(balances[vault.chainId][vault.vault_addr].valueWei) -
					BigInt(balances[vault.chainId][vault.vault_addr].valueRewardVaultWei || 0);
				if (!vault.rewardVault) return;
				const rewards = (await client.public.readContract({
					address: getAddress(vault.rewardVault!),
					abi: rewardVaultAbi,
					functionName: "earned",
					args: [currentWallet!],
				})) as bigint;
				setRewards(rewards);
				setVaultBalance(vaultBalance);
			} catch (e) {
				console.log(e);
			}
		};
		getVaultBalance();
	}, [isDepositing, isClaiming]);

	const claimRewards = async (e: React.MouseEvent<HTMLButtonElement> | GestureResponderEvent) => {
		e.preventDefault();
		e.stopPropagation();
		let id: string | undefined = undefined;
		try {
			setIsClaiming(true);
			id = notifyLoading({
				title: `Claiming rewards...`,
				message: `Claiming rewards...`,
			});

			const client = await getClients(vault.chainId);
			const tx = await awaitTransaction(
				client.wallet.sendTransaction({
					to: vault.rewardVault!,
					data: encodeFunctionData({
						abi: rewardVaultAbi,
						functionName: "getReward",
						args: [currentWallet!],
					}),
				}),
				client
			);

			await reloadBalances();
			if (!tx.status) {
				throw new Error(tx.error);
			} else {
				id && dismissNotify(id);
				notifySuccess({
					title: "Claimed successfully",
					message: `Claimed rewards`,
				});
			}
		} catch (e: any) {
			console.log(e);
			id && dismissNotify(id);
			notifyError({
				title: "Error",
				message: e.message,
			});
		} finally {
			setIsClaiming(false);
		}
	};

	const deposit = async (e: React.MouseEvent<HTMLButtonElement> | GestureResponderEvent) => {
		e.preventDefault();
		e.stopPropagation();
		let id: string | undefined = undefined;
		try {
			setIsDepositing(true);
			id = notifyLoading({
				title: `Depositing to ${vault.name} reward vault...`,
				message: `Depositing tokens to reward vault...`,
			});

			const client = await getClients(vault.chainId);
			if (
				!(
					await approveErc20(
						vault.vault_addr,
						vault.rewardVault!,
						vaultBalance,
						currentWallet!,
						vault.chainId,
						getPublicClient,
						getWalletClient
					)
				).status
			)
				throw new Error("Error approving vault!");

			const tx = await awaitTransaction(
				client.wallet.sendTransaction({
					to: vault.rewardVault,
					data: encodeFunctionData({
						abi: rewardVaultAbi,
						functionName: "stake",
						args: [BigInt(vaultBalance)],
					}),
				}),
				client
			);
			await reloadFarmData();
			if (!tx.status) {
				throw new Error(tx.error);
			} else {
				id && dismissNotify(id);
				notifySuccess({
					title: "Deposited successfully",
					message: `Deposited to ${vault.name} reward vault`,
				});
			}
		} catch (e: any) {
			console.log(e);
			id && dismissNotify(id);
			notifyError({
				title: "Error",
				message: e.message,
			});
		} finally {
			setIsDepositing(false);
		}
	};

	const handleClick = (e: any) => {
		// Check if router is initialized properly
		dispatch(setLastVisitedPage("/"));
		try {
			if (Platform.OS === "web") {
				navigate?.(`/Earn/${vault.vault_addr}`, { replace: true });
			} else {
				router.replace({
					pathname: "/Earn/[vaultAddr]",
					params: { vaultAddr: vault.vault_addr },
				});
			}
		} catch (error) {
			// Fallback approach - using window.location for web context
			window.location.href = `/Earn/${vault.vault_addr}`;
		}
	};

	const handlePress = useCallback((e: GestureResponderEvent) => {
		handleClick(e);
	}, []);

	// Memoize the styles to prevent re-renders
	const pressableStyles = useMemo(() => {
		const baseStyles = {
			borderRadius: 24,
			padding: 24,
			shadowColor: "#00000059",
			borderWidth: 1,
			borderTopWidth: 0,
			borderColor: Colors.borderDark,
			flexDirection: "column" as const,
			gap: 20,
			position: "relative" as const,
			overflow: "hidden" as const,
		};

		return baseStyles;
	}, []);

	// Create a stable className with the original responsive design
	const stableClassName = useMemo(() => {
		return `cursor-pointer rounded-3xl p-6 shadow-md flex flex-col gap-5 border border-t-0 border-borderDark relative min-w-[calc(25%-12px)] max-[2000px]:min-w-[calc(33.33%-10.66px)] max-[1300px]:min-w-[calc(50%-8px)] max-[768px]:min-w-full`;
	}, []);

	const pressableChildren = useMemo(
		() => (
			<>
				{/* Gradient Background - CSS for web, SVG for mobile */}
				{!vault.isCurrentWeeksRewardsVault && Platform.OS === "web" && (
					<View
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							borderRadius: 24,
							zIndex: -1,
							pointerEvents: "none",
							// @ts-ignore
							background: "radial-gradient(circle at 45% 151%, var(--new-color_primary) -40%, var(--new-background_dark) 75%)",
						}}
					/>
				)}

				{!vault.isCurrentWeeksRewardsVault && Platform.OS !== "web" && (
					<View
						style={{
							position: "absolute",
							top: 0,
							left: -15,
							right: 0,
							bottom: 0,
							borderRadius: 24,
							zIndex: -1,
							pointerEvents: "none",
						}}
					>
						<Svg
							height="100%"
							width="100%"
							viewBox="0 0 400 300"
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								zIndex: -1,
							}}
						>
							<Defs>
								<RadialGradient id={gradientId} cx="45%" cy="100%" rx="120%" ry="120%" fx="45%" fy="151%" gradientUnits="objectBoundingBox">
									<Stop offset="0" stopColor="#3B7EE3" stopOpacity="0.6" />
									<Stop offset="0.2" stopColor="#3B7EE3" stopOpacity="0.4" />
									<Stop offset="0.4" stopColor="#3B7EE3" stopOpacity="0.2" />
									<Stop offset="0.6" stopColor="#020907" stopOpacity="0.3" />
									<Stop offset="0.75" stopColor="#020907" stopOpacity="0.8" />
									<Stop offset="1" stopColor="#020907" stopOpacity="1" />
								</RadialGradient>
							</Defs>
							<Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gradientId})`} />
						</Svg>
					</View>
				)}

				{vault.isCurrentWeeksRewardsVault && (
					<View
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							borderRadius: 24,
							opacity: 0.4,
							backgroundColor: "rgba(8, 21, 82, 0.4)",
						}}
					/>
				)}

				<View className="flex flex-row justify-between align-top gap-2">
					<View className="flex flex-col gap-2 font-league-spartan text-lg">
						<View className="flex flex-row items-center relative">
							{logo1Source && <Image source={logo1Source} style={{ width: 36, height: 36, borderRadius: 18 }} resizeMode="contain" />}

							{logo2Source && (
								<Image
									source={logo2Source}
									style={{
										width: 36,
										height: 36,
										borderRadius: 18,
										marginLeft: -12,
									}}
									resizeMode="contain"
								/>
							)}

							{logo3Source && (
								<Image
									source={logo3Source}
									style={{
										width: 36,
										height: 36,
										borderRadius: 18,
										marginLeft: -12,
									}}
									resizeMode="contain"
								/>
							)}

							{logo4Source && (
								<Image source={logo4Source} style={{ width: 36, height: 36, borderRadius: 18, marginLeft: -12 }} resizeMode="contain" />
							)}
						</View>

						<View className="flex flex-row items-center gap-2">
							<Text className="text-lg text-textWhite">{vault.name}</Text>
							{vault.isCurrentWeeksRewardsVault && (
								<View className="bg-bgPrimary px-2 py-1 rounded-md">
									<Text className="text-xs text-bgDark">Current Week</Text>
								</View>
							)}
						</View>
					</View>

					{/* Platform */}
					<View className="flex-col gap-1">
						<View className="flex flex-row items-center gap-2 mb-2 justify-end">
							<FarmRowChip text={[vault?.originPlatform, vault?.secondary_platform].filter(Boolean).join(" | ")} color="invert" />

							{/* Platform Logos */}
							<View className="flex flex-row items-center">
								{platformLogoSource && (
									<Image
										source={platformLogoSource}
										style={{
											width: 16,
											height: 16,
											borderRadius: 8,
											borderWidth: 1,
											borderColor: "#181818",
											backgroundColor: "#ffffff",
										}}
										resizeMode="contain"
									/>
								)}

								{secondaryPlatformLogoSource && (
									<Image
										source={secondaryPlatformLogoSource}
										style={{
											width: 16,
											height: 16,
											borderRadius: 8,
											borderWidth: 1,
											borderColor: "#181818",
											marginLeft: 4,
											backgroundColor: "#ffffff",
										}}
										resizeMode="contain"
									/>
								)}
							</View>
						</View>

						{/* {userVaultBalance > 0 && (
						<Pressable
							className={`px-4 py-2 rounded-md transition-all transform duration-200 flex items-center justify-center gap-2 min-w-[160px] ${
								isDepositing
									? "bg-buttonDisabled cursor-not-allowed"
									: "bg-buttonPrimary hover:bg-buttonPrimaryLight hover:scale-105 active:scale-95"
							} text-white`}
							onPress={deposit}
							disabled={isDepositing}
						>
							{isDepositing && <ActivityIndicator size="small" color="#000000" style={{ marginRight: 4 }} />}
							<Text className="text-white font-arame-mono text-base">{isDepositing ? "Depositing..." : "Deposit to rewards vault"}</Text>
						</Pressable>
					)} */}
					</View>
				</View>

				<View className="flex flex-row justify-between gap-4">
					{/* Earnings*/}
					<View className="border-r border-bgPrimary pr-4 flex-1 basis-0">
						<Text className="font-arame-mono mb-2 text-textPrimary text-lg normal-case">
							<Text className="flex items-center gap-2">Earnings</Text>
						</Text>
						{!(isVaultEarningsFirstLoad || earningsUsd == null) ? (
							<View className="w-full">
								<Text className="text-textPrimary text-lg font-league-spartan leading-5">
									{`$${customCommify(totalEarningsUsd, {
										minimumFractionDigits: 2,
										maximumFractionDigits: 5,
									})}`}
								</Text>
								{lastTransaction?.date && typeof lastTransaction.date === "string" && (
									<Text className="text-textSecondary text-sm">
										In {Math.floor((Date.now() - new Date(lastTransaction.date).getTime()) / (1000 * 60 * 60 * 24))}{" "}
										{Math.floor((Date.now() - new Date(lastTransaction.date).getTime()) / (1000 * 60 * 60 * 24)) === 1 ? "day" : "days"}
									</Text>
								)}
							</View>
						) : (
							<View className="w-full">
								<View className="h-5 w-20 bg-white/30 rounded animate-pulse mb-2" />
							</View>
						)}
					</View>

					{/* APY */}
					<View className={`flex-1 basis-0 ml-4 ${estimateTrax ? "border-r border-r-bgPrimary" : ""}`}>
						<Text className="uppercase font-arame-mono mb-2 text-textPrimary text-lg">APY</Text>
						<Text className="text-textWhite text-lg font-league-spartan leading-5">
							{vault.isCurrentWeeksRewardsVault
								? "??? %"
								: toFixedFloor(apy || 0, 2) == 0
									? "--"
									: `${customCommify(apy || 0, { minimumFractionDigits: 0 })}%`}{" "}
						</Text>
					</View>

					{/* BTX Points section */}
					{estimateTrax && (
						<View className="flex-1 basis-0 ml-4">
							<Text className="uppercase font-arame-mono mb-2 text-textPrimary text-lg">BTX Points</Text>
							<Text className="text-textWhite text-lg font-league-spartan">{(Number(estimateTrax) / 365.25).toFixed(2)}/day</Text>
						</View>
					)}
				</View>

				{/* Your Stake */}
				<View className="flex justify-end items-end gap-3">
					<View className="flex flex-row inline-flex items-end gap-2 bg-white/5 backdrop-blur-sm rounded-lg p-2">
						<Text className="uppercase font-arame-mono text-textPrimary text-base">Your Stake</Text>
						<Text className="text-textWhite text-base font-league-spartan">${formatCurrency(userVaultBalance * priceOfSingleToken)}</Text>
					</View>
				</View>

				{rewards > 0n ? (
					<View className={`flex flex-row justify-between items-end`}>
						{/* Your Rewards */}
						<View>
							<Text className="uppercase font-arame-mono mb-2 text-textPrimary text-lg">
								<Text>Your Rewards</Text>
							</Text>
							<View className="group relative">
								<Text className="text-white text-lg font-league-spartan leading-5">{formatCurrency(formatEther(rewards))} BGT</Text>
								<Text className="invisible group-hover:visible absolute left-0 top-full z-10 bg-bgDark p-2 rounded-md border border-borderDark text-sm text-white">
									{formatCurrency(formatEther(rewards), 18)} BGT
								</Text>
							</View>
						</View>

						{/* Claim Rewards */}
						<View className="text-textSecondary text-xs ml-4 flex items-center justify-end">
							{/* <Pressable
							className={`px-2 py-1 rounded-md transition-all transform duration-200 flex items-center justify-center gap-2    ${
								isClaiming ? "bg-buttonDisabled cursor-not-allowed" : "bg-buttonPrimary hover:bg-buttonPrimaryLight active:scale-95"
							} text-black`}
							onPress={claimRewards}
							disabled={isClaiming}
						>
							{isClaiming && <ActivityIndicator size="small" color="#000000" style={{ marginRight: 4 }} />}
							<Text className="text-bgDark text-sm font-medium">{isClaiming ? "Claiming..." : "Claim Rewards"}</Text>
						</Pressable> */}
						</View>
					</View>
				) : (
					<></>
				)}
			</>
		),
		[earningsUsd]
	);

	return (
		<Pressable
			onPress={handlePress}
			className={stableClassName}
			style={pressableStyles}
			// Need to add these classes to the pressable, currently not added as they are causing re-renders:
			// transition-all duration-300 ease-in-out hover:translate-y-[-4px]
		>
			{pressableChildren}
		</Pressable>
	);
};

export default VaultItem;
