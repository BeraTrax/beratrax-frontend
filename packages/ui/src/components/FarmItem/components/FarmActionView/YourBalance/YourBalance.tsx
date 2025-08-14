import { PoolDef, tokenNamesAndImages, ETFVaultDef } from "@beratrax/core/src/config/constants/pools_json";
import { useWallet } from "@beratrax/core/src/hooks";
import { useFarmDetails } from "@beratrax/core/src/state/farms/hooks";
import useTokens from "@beratrax/core/src/state/tokens/useTokens";
import { useFarmTransactions } from "@beratrax/core/src/state/transactions/useFarmTransactions";
import { FarmOriginPlatform } from "@beratrax/core/src/types/enums";
import { customCommify, formatCurrency, toEth } from "@beratrax/core/src/utils/common";
import { Skeleton } from "@beratrax/ui/src/components/Skeleton/Skeleton";
import { VaultEarnings } from "packages/core/src/state/farms/types";
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
	currentVaultEarnings: VaultEarnings;
	token: string | undefined;
	chainId: number;
	prices: Record<number, Record<string, number>>;
	farm: PoolDef | ETFVaultDef;
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
		return currentVaultEarnings.tokenEarnings.reduce((acc, curr) => {
			return (
				acc +
				Number(toEth(BigInt(curr.earnings || 0n), decimals[chainId][getAddress(curr.token as `0x${string}`)])) *
					prices[chainId][getAddress(curr.token as `0x${string}`)]
			);
		}, 0);
	}, [currentVaultEarnings]);

	const lifetimeEarningsUsd = useMemo(() => {
		if (farm.isETFVault) {
			return (
				currentVaultEarnings.lifetimeEtfEarnings?.reduce((acc, curr) => {
					return (
						acc +
						Number(toEth(BigInt(curr.earnings || 0n), decimals[chainId][getAddress(curr.token as `0x${string}`)])) *
							prices[chainId][getAddress(curr.token as `0x${string}`)]
					);
				}, 0) || 0
			);
		}

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
					<Text className="text-blue-500 text-lg font-medium flex items-center gap-x-2 font-league-spartan">
						${customCommify(totalEarningsUsd, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
					</Text>
					{lastTransaction?.date && typeof lastTransaction.date === "string" && (
						<Text className="text-textSecondary text-sm font-league-spartan">
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
							{changeInAssetsValue > 0 && (
								<Text className="text-textSecondary text-sm mt-1 font-league-spartan">
									{` (+${customCommify(Number(changeInAssetsValue), {
										minimumFractionDigits: 2,
										maximumFractionDigits: 5,
									})} ${farm.name})`}
								</Text>
							)}
						</Text>
					)}
				</View>
				<View className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center">
					<Text className="text-blue-500 text-md">↑</Text>
				</View>
			</View>

			<View className="flex flex-row items-center gap-x-3">
				<View className="flex flex-col text-textSecondary">
					<View className="flex flex-row items-center gap-x-2">
						<Text className="text-blue-500 text-lg font-medium flex items-center gap-x-2">
							${customCommify(lifetimeEarningsUsd, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
						</Text>
						{("apyBasedEarnings" in farm && farm.apyBasedEarnings) || typeof lifetimeEarnings === "string" ? null : (
							<View className="group relative">
								<Text className="h-4 w-4 cursor-pointer text-textSecondary text-sm">?</Text>
								<View className="absolute z-[99999] bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-3 bg-gray-800/95 border border-gray-500/30 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none min-w-[240px] text-center backdrop-blur-sm shadow-xl">
									<View className="flex flex-col gap-1">
										{farm.isETFVault && currentVaultEarnings.tokenEarnings?.length > 0 ? (
											// Show all token earnings for ETF vaults
											<>
												{currentVaultEarnings.tokenEarnings.map((tokenEarning, index) => {
													const tokenAddress = getAddress(tokenEarning.token as `0x${string}`);
													const tokenName = tokenNamesAndImages[tokenAddress]?.name || "Unknown Token";
													const earningsAmount = Number(toEth(BigInt(tokenEarning.earnings || 0), decimals[chainId][tokenAddress]));

													return (
														<View key={index} className="flex flex-row items-center justify-center gap-2">
															<Text className="text-blue-400">
																<Text>+</Text>
																{customCommify(earningsAmount, {
																	minimumFractionDigits: 2,
																	maximumFractionDigits: 5,
																})}
															</Text>
															<Text className="text-textPrimary font-medium">{tokenName}</Text>
														</View>
													);
												})}
												<Text className="text-xs text-gray-300 mt-1">Your total accumulated tokens</Text>
											</>
										) : (
											// Show single LP token for regular vaults
											<>
												<View className="flex flex-row items-center justify-center gap-2">
													<Text className="text-blue-400">
														<Text>+</Text>
														{customCommify(
															Number(toEth(BigInt(lifetimeEarnings || 0), decimals[farm.chainId][farm.lp_address as Address])),
															{
																minimumFractionDigits: 2,
																maximumFractionDigits: 5,
															}
														)}
													</Text>
													<Text className="text-textPrimary font-medium">{farm.name}</Text>
												</View>
												<Text className="text-xs text-gray-300 mt-1">Your total accumulated LP tokens</Text>
											</>
										)}
									</View>
								</View>
							</View>
						)}
					</View>
					<View className="text-textSecondary text-sm flex flex-row items-center gap-1">
						<Text className="text-textSecondary text-sm">Lifetime Earnings</Text>
						<View className="group relative">
							<Text className="cursor-pointer h-4 w-4 text-textSecondary text-sm">?</Text>

							<View className="absolute z-[99999] bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-3 bg-gray-800/95 border border-gray-500/30 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none min-w-[240px] text-center backdrop-blur-sm shadow-xl">
								<Text className="text-xs text-gray-300 mt-1">Based on current token prices, swap fee is not included.</Text>
							</View>
						</View>
					</View>
				</View>
				<View className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center">
					<Text className="text-blue-500 text-md">↑</Text>
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

const YourBalance = ({ farm }: { farm: PoolDef | ETFVaultDef }) => {
	const { currentWallet, isConnecting } = useWallet();
	const { balances, isBalancesLoading: isLoading, prices } = useTokens();
	const { vaultEarnings, isLoadingVaultEarnings, isVaultEarningsFirstLoad } = useFarmDetails();
	const stakedTokenValueUsd = useMemo(() => Number(balances[farm.chainId][farm.vault_addr]?.valueUsd), [balances]);
	const stakedTokenValueFormatted = useMemo(
		() => Number(balances[farm.chainId][farm.vault_addr]?.valueUsd / prices[farm.chainId][farm.lp_address]),
		[balances, prices]
	);

	const farmEarnings = useMemo(() => {
		if (!vaultEarnings?.length)
			return { tokenId: "", tokenEarnings: [], changeInAssets: "", lifetimeEarnings: "", lifetimeEtfEarnings: [] };
		return (
			vaultEarnings.find((earning) => earning.tokenId === farm.id.toString()) || {
				tokenId: "",
				tokenEarnings: [],
				changeInAssets: "",
				lifetimeEarnings: "",
				lifetimeEtfEarnings: [],
			}
		);
	}, [vaultEarnings, farm.id]);

	const renderEarningsSection = () => {
		return (
			<View className="w-full md:w-1/2 flex flex-col relative z-10">
				<Text className="text-textWhite font-arame-mono font-normal text-[16px] leading-[18px] tracking-widest">YOUR EARNINGS</Text>
				<View className="bg-bgDark py-4 px-4 mt-2 rounded-2xl backdrop-blur-lg min-h-[120px] flex flex-col justify-center relative overflow-visible">
					{isVaultEarningsFirstLoad ? (
						<Skeleton h={28} w={120} />
					) : (
						<>
							<View className="flex flex-col md:flex-row gap-4">
								<TokenEarning
									currentVaultEarnings={farmEarnings}
									token={farmEarnings.tokenEarnings?.[0]?.token}
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
								<Text className="text-textWhite text-lg font-medium font-league-spartan">
									${stakedTokenValueUsd ? formatCurrency(stakedTokenValueUsd) : 0}
								</Text>
							</View>
							<View className="flex flex-row items-center gap-x-2 mt-2">
								<Text className="text-textSecondary text-[16px] font-light font-league-spartan">
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
		<View className="mt-10 relative overflow-visible">
			{(farm.originPlatform === FarmOriginPlatform.Infrared.name ||
				farm.originPlatform === FarmOriginPlatform.Steer.name ||
				farm.originPlatform === FarmOriginPlatform.Kodiak.name ||
				farm.originPlatform === FarmOriginPlatform.Burrbear.name ||
				farm.originPlatform === FarmOriginPlatform.BeraPaw.name ||
				farm.originPlatform === FarmOriginPlatform.Bearn.name ||
				farm.originPlatform === FarmOriginPlatform.Trax.name ||
				farm.isETFVault) &&
			!farm.isDeprecated ? (
				<View className="flex flex-col md:flex-row gap-4 pr-4 relative overflow-visible">
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
