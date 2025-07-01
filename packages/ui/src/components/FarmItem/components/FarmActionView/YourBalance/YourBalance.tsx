import { PoolDef, tokenNamesAndImages } from "@beratrax/core/src/config/constants/pools_json";
import { useWallet } from "@beratrax/core/src/hooks";
import { useFarmDetails } from "@beratrax/core/src/state/farms/hooks";
import useTokens from "@beratrax/core/src/state/tokens/useTokens";
import { useFarmTransactions } from "@beratrax/core/src/state/transactions/useFarmTransactions";
import { FarmOriginPlatform } from "@beratrax/core/src/types/enums";
import { customCommify, formatCurrency, toEth } from "@beratrax/core/src/utils/common";
import { Skeleton } from "@beratrax/ui/src/components/Skeleton/Skeleton";
import { useMemo } from "react";
import { View, Text } from "react-native";
import { Address, getAddress } from "viem";

// Reusable component for token earnings
const TokenEarning = ({
	currentVaultEarnings,
	token,
	chainId,
	prices,
	farm,
	changeInAssets,
	lifetimeEarnings,
}: {
	currentVaultEarnings: any;
	token: string | undefined;
	chainId: number;
	prices: Record<number, Record<string, number>>;
	farm: PoolDef;
	changeInAssets: string | number | undefined;
	lifetimeEarnings: string | number | undefined;
}) => {
	if (!currentVaultEarnings || !token) return null;
	const { decimals } = useTokens();
	const { data: txHistory } = useFarmTransactions(farm.id, 1);
	const lastTransaction = useMemo(() => {
		if (!txHistory) return null;
		return txHistory[0];
	}, [txHistory]);

	const currentVaultEarningsUsd = useMemo(() => {
		return (
			Number(
				toEth(BigInt(currentVaultEarnings?.earnings0 || 0n), decimals[chainId][getAddress(currentVaultEarnings.token0 as `0x${string}`)])
			) *
				prices[chainId][getAddress(currentVaultEarnings.token0 as `0x${string}`)] +
			(currentVaultEarnings?.token1
				? Number(
						toEth(
							BigInt(currentVaultEarnings?.earnings1 || 0n),
							decimals[chainId][getAddress(currentVaultEarnings.token1 as `0x${string}`)]
						)
					) * prices[chainId][getAddress(currentVaultEarnings.token1 as `0x${string}`)]
				: 0)
		);
	}, [currentVaultEarnings]);

	const lifetimeEarningsUsd = useMemo(() => {
		if (typeof lifetimeEarnings === "string") {
			return 0;
		}
		return (
			Number(toEth(BigInt(lifetimeEarnings || 0), decimals[farm.chainId][farm.lp_address as Address])) *
			(prices[farm.chainId][farm.lp_address] || 0)
		);
	}, [lifetimeEarnings]);

	const changeInAssetsStr = changeInAssets === 0 || changeInAssets === "0" ? "0" : changeInAssets?.toString();
	const changeInAssetsValue = Number(toEth(BigInt(changeInAssetsStr || 0), decimals[farm.chainId][farm.lp_address as Address]));
	const changeInAssetsValueUsd = changeInAssetsValue * (prices[farm.chainId][farm.lp_address] || 0);
	const totalEarningsUsd = changeInAssetsValueUsd + currentVaultEarningsUsd;

	const tokenAddress = token ? getAddress(token) : "";
	const tokenName = token ? tokenNamesAndImages[tokenAddress]?.name || "" : "";

	return (
		<View className="flex flex-row justify-between flex-1 mx-2">
			<View className="flex flex-row items-center gap-x-3">
				<View className="flex flex-col">
					<Text className="text-green-500 text-lg font-medium flex items-center gap-x-2">
						${customCommify(totalEarningsUsd, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
					</Text>
					{lastTransaction?.date && typeof lastTransaction.date === "string" && (
						<Text className="text-textSecondary text-sm">
							In{" "}
							{(() => {
								const timeDiffMs = Date.now() - new Date(lastTransaction.date).getTime();
								const days = Math.floor(timeDiffMs / (1000 * 60 * 60 * 24));
								const hours = Math.floor((timeDiffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
								const minutes = Math.floor((timeDiffMs % (1000 * 60 * 60)) / (1000 * 60));

								if (days > 0) {
									return `${days} ${days === 1 ? "day" : "days"}`;
								} else if (hours > 0) {
									return `${hours} ${hours === 1 ? "hour" : "hours"}`;
								} else {
									return `${Math.max(minutes, 1)} ${minutes === 1 ? "minute" : "minutes"}`;
								}
							})()}
						</Text>
					)}
					{changeInAssetsValue > 0 && (
						<Text className="text-textSecondary text-sm mt-1">
							{customCommify(Number(changeInAssetsValue), {
								minimumFractionDigits: 2,
								maximumFractionDigits: 5,
							})}{" "}
							{farm.name}
						</Text>
					)}
				</View>
				<View className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center">
					<Text className="text-green-500 text-md">↑</Text>
				</View>
			</View>

			<View className="flex flex-row items-center gap-x-3">
				<View className="flex flex-col text-textSecondary">
					<View className="flex flex-row items-center gap-x-2">
						<Text className="text-green-500 text-lg font-medium flex items-center gap-x-2">
							${customCommify(lifetimeEarningsUsd, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
						</Text>
						{farm.apyBasedEarnings || typeof lifetimeEarnings === "string" ? null : (
							<View className="group relative">
								<Text className="h-4 w-4 cursor-pointer text-textSecondary text-sm">?</Text>
								<View className="absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-3 bg-bgDark text-textSecondary/80 text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none min-w-[240px] text-center backdrop-blur-sm">
									<View className="flex flex-col gap-1">
										<View className="flex flex-row items-center justify-center gap-2">
											<Text className="text-green-400">
												<Text>+</Text>
												{customCommify(Number(toEth(BigInt(lifetimeEarnings || 0), decimals[farm.chainId][farm.lp_address as Address])), {
													minimumFractionDigits: 2,
													maximumFractionDigits: 5,
												})}
											</Text>
											<Text className="text-textPrimary font-medium">{farm.name}</Text>
										</View>
										<Text className="text-xs text-textSecondary mt-1">Your total accumulated LP tokens</Text>
									</View>
								</View>
							</View>
						)}
					</View>
					<View className="text-textSecondary text-sm flex flex-row items-center gap-1">
						<Text className="text-textSecondary text-sm">Lifetime Earnings</Text>
						<View className="group relative">
							<Text className="cursor-pointer h-4 w-4 text-textSecondary text-sm">?</Text>

							<View className="absolute z-[200] bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-3 bg-bgDark text-textSecondary/80 text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none min-w-[240px] text-center backdrop-blur-sm">
								<Text className="text-xs text-textSecondary mt-1">Based on current token prices, swap fee is not included.</Text>
							</View>
						</View>
					</View>
				</View>
				<View className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center">
					<Text className="text-green-500 text-md">↑</Text>
				</View>
			</View>
		</View>
	);
};

const LpAssetChange = ({
	changeInAssets,
	farm,
	isLoading,
}: {
	changeInAssets: string | number | undefined;
	farm: PoolDef;
	isLoading?: boolean;
}) => {
	if (isLoading) {
		return <Skeleton h={28} w={120} />;
	}

	if (!changeInAssets) return null;

	const { decimals, prices } = useTokens();
	const changeInAssetsStr = changeInAssets === 0 || changeInAssets === "0" ? "0" : changeInAssets.toString();
	const changeInAssetsValue = Number(toEth(BigInt(changeInAssetsStr), decimals[farm.chainId][farm.lp_address as Address]));
	const changeInAssetsValueUsd = changeInAssetsValue * (prices[farm.chainId][farm.lp_address] || 0);

	return (
		<View className="flex-1">
			<View className="flex items-center gap-x-3">
				<View className="flex flex-col">
					<Text className="text-green-500 text-lg font-medium flex items-center gap-x-2">
						${customCommify(changeInAssetsValueUsd, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
					</Text>
				</View>
				<View className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center">
					<Text className="text-green-500 text-md">↗</Text>
				</View>
			</View>
			<View className="flex items-center gap-x-2 mt-2">
				<Text className="text-green-500/80 text-[16px] font-light">
					{customCommify(changeInAssetsValue, { minimumFractionDigits: 2, maximumFractionDigits: 5 })} {farm.name}
				</Text>
			</View>
		</View>
	);
};

const YourBalance = ({ farm }: { farm: PoolDef }) => {
	const { currentWallet, isConnecting } = useWallet();
	const { balances, isBalancesLoading: isLoading, prices } = useTokens();
	const { vaultEarnings, isLoadingVaultEarnings, isVaultEarningsFirstLoad } = useFarmDetails();
	const stakedTokenValueUsd = useMemo(() => Number(balances[farm.chainId][farm.vault_addr]?.valueUsd), [balances]);
	const stakedTokenValueFormatted = useMemo(
		() => Number(balances[farm.chainId][farm.vault_addr]?.valueUsd / prices[farm.chainId][farm.lp_address]),
		[balances, prices]
	);

	const farmEarnings = useMemo(() => {
		if (!vaultEarnings?.length) return { earnings0: 0, token0: "", earnings1: 0, token1: "", lifetimeEarnings: 0 };
		return (
			vaultEarnings.find((earning) => earning.tokenId === farm.id.toString()) || {
				earnings0: 0,
				token0: "",
				earnings1: 0,
				token1: "",
				changeInAssets: 0,
				lifetimeEarnings: 0,
			}
		);
	}, [vaultEarnings, farm.id]);

	const renderEarningsSection = () => {
		return (
			<View className="w-full md:w-1/2 flex flex-col">
				<Text className="text-textWhite font-arame-mono font-normal text-[16px] leading-[18px] tracking-widest">YOUR EARNINGS</Text>
				<View className="bg-bgDark py-4 px-4 mt-2 rounded-2xl backdrop-blur-lg min-h-[120px] flex flex-col justify-center">
					{isVaultEarningsFirstLoad ? (
						<Skeleton h={28} w={120} />
					) : (
						<>
							<View className="flex flex-col md:flex-row gap-4">
								<TokenEarning
									currentVaultEarnings={farmEarnings}
									token={farmEarnings.token0}
									chainId={farm.chainId}
									prices={prices}
									farm={farm}
									changeInAssets={farmEarnings.changeInAssets}
									lifetimeEarnings={farmEarnings.lifetimeEarnings}
								/>
								{/* {farm.isAutoCompounded && (
                  <LpAssetChange
                      changeInAssets={farmEarnings.changeInAssets}
                      farm={farm}
                      isLoading={isVaultEarningsFirstLoad}
                  />
                )} */}
							</View>
						</>
					)}
				</View>
			</View>
		);
	};

	const renderPositionSection = () => {
		return (
			<View className="w-full md:w-1/2 flex flex-col">
				<Text className="text-textWhite font-arame-mono font-normal text-[16px] leading-[18px] tracking-widest">YOUR POSITION</Text>
				<View className="bg-bgDark py-4 px-4 mt-2 rounded-2xl backdrop-blur-lg min-h-[120px] flex flex-col justify-center">
					{isLoading || isConnecting ? (
						<>
							<Skeleton h={28} w={120} />
							<Skeleton h={24} w={96} className="mt-1" />
						</>
					) : (
						<>
							<View className="flex flex-row items-center gap-x-3">
								<Text className="text-textWhite text-lg font-medium">${stakedTokenValueUsd ? formatCurrency(stakedTokenValueUsd) : 0}</Text>
							</View>
							<View className="flex flex-row items-center gap-x-2 mt-2">
								<Text className="text-textSecondary text-[16px] font-light">
									{stakedTokenValueFormatted ? stakedTokenValueFormatted?.toFixed(3) : 0} {farm.name}
								</Text>
							</View>
						</>
					)}
				</View>
			</View>
		);
	};

	if (stakedTokenValueUsd === 0 || !currentWallet) return null;

	return (
		<View className="mt-10 relative">
			{(farm.originPlatform === FarmOriginPlatform.Infrared.name ||
				farm.originPlatform === FarmOriginPlatform.Steer.name ||
				farm.originPlatform === FarmOriginPlatform.Kodiak.name ||
				farm.originPlatform === FarmOriginPlatform.Burrbear.name ||
				farm.originPlatform === FarmOriginPlatform.BeraPaw.name ||
				farm.originPlatform === FarmOriginPlatform.Bearn.name ||
				farm.originPlatform === FarmOriginPlatform.BeraTrax.name) &&
			!farm.isDeprecated ? (
				<View className="flex flex-col md:flex-row gap-4 pr-4">
					{renderEarningsSection()}
					{renderPositionSection()}
				</View>
			) : (
				<View>{renderPositionSection()}</View>
			)}
		</View>
	);
};

export default YourBalance;
