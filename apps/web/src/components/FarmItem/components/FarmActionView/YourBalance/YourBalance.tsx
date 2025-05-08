import { useMemo } from "react";
import { PoolDef, tokenNamesAndImages } from "src/config/constants/pools_json";
import useTokens from "src/state/tokens/useTokens";
import useFarmDetails from "src/state/farms/hooks/useFarmDetails";
import useWallet from "src/hooks/useWallet";
import { customCommify, formatCurrency, toEth } from "src/utils/common";
import { FarmOriginPlatform } from "src/types/enums";
import { Address, getAddress } from "viem";
import { useFarmTransactions } from "src/state/transactions/useFarmTransactions";

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
                toEth(
                    BigInt(currentVaultEarnings?.earnings0 || 0n),
                    decimals[chainId][getAddress(currentVaultEarnings.token0 as `0x${string}`)]
                )
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
        return (
            Number(toEth(BigInt(lifetimeEarnings || 0), decimals[farm.chainId][farm.lp_address as Address])) *
            (prices[farm.chainId][farm.lp_address] || 0)
        );
    }, [lifetimeEarnings]);

    const changeInAssetsStr = changeInAssets === 0 || changeInAssets === "0" ? "0" : changeInAssets?.toString();
    const changeInAssetsValue = Number(
        toEth(BigInt(changeInAssetsStr || 0), decimals[farm.chainId][farm.lp_address as Address])
    );
    const changeInAssetsValueUsd = changeInAssetsValue * (prices[farm.chainId][farm.lp_address] || 0);
    const totalEarningsUsd = changeInAssetsValueUsd + currentVaultEarningsUsd;

    // Convert any zero earnings to "0" string to ensure proper display
    const earningsStr = currentVaultEarningsUsd.toString();

    const tokenAddress = token ? getAddress(token) : "";
    const tokenName = token ? tokenNamesAndImages[tokenAddress]?.name || "" : "";

    return (
        <div className="flex flex-row justify-between flex-1 mx-2">
            <div className="flex items-center gap-x-3">
                <div className="flex flex-col">
                    <h1 className="text-green-500 text-lg font-medium flex items-center gap-x-2">
                        ${customCommify(totalEarningsUsd, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                    </h1>
                    {lastTransaction?.date && typeof lastTransaction.date === "string" && (
                        <p className="text-textSecondary text-sm">
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
                            })()}{" "}
                            (
                            {changeInAssetsValue > 0
                                ? "+" +
                                  customCommify(Number(changeInAssetsValue), {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 5,
                                  })
                                : customCommify(Number(changeInAssetsValue), {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 5,
                                  })}{" "}
                            {farm.name})
                        </p>
                    )}
                </div>
                <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center">
                    <span className="text-green-500 text-md">↑</span>
                </div>
            </div>
            <div className="flex items-center gap-x-3">
                <div className="flex flex-col text-textSecondary">
                    <div className="flex flex-row items-center gap-x-2">
                        <h3 className="text-green-500 text-lg font-medium flex items-center gap-x-2">
                            $
                            {customCommify(lifetimeEarningsUsd, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                        </h3>
                        <div className="group relative">
                            <div className="h-4 w-4 rounded-full bg-textSecondary/20 flex items-center justify-center cursor-help">
                                <span className="text-textSecondary text-sm">?</span>
                            </div>
                            <div className="absolute z-100 bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-3 bg-bgDark text-textSecondary/80 text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none min-w-[240px] text-center backdrop-blur-sm">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-green-400">
                                            {customCommify(
                                                Number(
                                                    toEth(
                                                        BigInt(lifetimeEarnings || 0),
                                                        decimals[farm.chainId][farm.lp_address as Address]
                                                    )
                                                ),
                                                { minimumFractionDigits: 2, maximumFractionDigits: 5 }
                                            )}
                                        </span>
                                        <span className="text-textPrimary font-medium">{farm.name}</span>
                                    </div>
                                    <span className="text-xs text-textSecondary/60 mt-1">
                                        Your total accumulated LP tokens
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-textSecondary text-sm flex items-center gap-1">
                        Lifetime Earnings
                        <div className="group relative">
                            <div className="h-4 w-4 rounded-full bg-textSecondary/20 flex items-center justify-center cursor-help">
                                <span className="text-textSecondary/60 text-sm">?</span>
                            </div>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-bgDark text-textSecondary/80 text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none min-w-[200px] text-center">
                                Based on current token prices, swap fee is not included.
                            </div>
                        </div>
                    </div>
                </div>
                <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center">
                    <span className="text-green-500 text-md">↑</span>
                </div>
            </div>
            {/* <div className="flex items-center gap-x-2 mt-2">
                <p className="text-green-400/80 text-[16px] font-light">
                    {customCommify(earningsValue, { minimumFractionDigits: 2, maximumFractionDigits: 5 })} {tokenName}
                </p>
            </div> */}
        </div>
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
        return <div className="h-7 w-32 bg-gray-700 rounded animate-pulse" />;
    }

    if (!changeInAssets) return null;

    const { decimals, prices } = useTokens();
    const changeInAssetsStr = changeInAssets === 0 || changeInAssets === "0" ? "0" : changeInAssets.toString();
    const changeInAssetsValue = Number(
        toEth(BigInt(changeInAssetsStr), decimals[farm.chainId][farm.lp_address as Address])
    );
    const changeInAssetsValueUsd = changeInAssetsValue * (prices[farm.chainId][farm.lp_address] || 0);

    return (
        <div className="flex-1">
            <div className="flex items-center gap-x-3">
                <div className="flex flex-col">
                    <h1 className="text-green-500 text-lg font-medium flex items-center gap-x-2">
                        ${customCommify(changeInAssetsValueUsd, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                    </h1>
                </div>
                <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <span className="text-green-500 text-md">↗</span>
                </div>
            </div>
            <div className="flex items-center gap-x-2 mt-2">
                <p className="text-green-500/80 text-[16px] font-light">
                    {customCommify(changeInAssetsValue, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}{" "}
                    {farm.name}
                </p>
            </div>
        </div>
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
            <div className="w-full md:w-1/2 flex flex-col">
                <h3 className="text-textWhite font-arame-mono font-normal text-[16px] leading-[18px] tracking-widest">
                    YOUR EARNINGS
                </h3>
                <div className="bg-bgDark py-4 px-4 mt-2 rounded-2xl backdrop-blur-lg flex-1 flex flex-col justify-center">
                    {isVaultEarningsFirstLoad ? (
                        <div className="h-7 w-32 bg-gray-700 rounded animate-pulse" />
                    ) : (
                        <>
                            <div className="flex flex-row gap-4">
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
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };

    const renderPositionSection = () => {
        return (
            <div className="w-full md:w-1/2 flex flex-col">
                <h3 className="text-textWhite font-arame-mono font-normal text-[16px] leading-[18px] tracking-widest">
                    YOUR POSITION
                </h3>
                <div className="bg-bgDark py-4 px-4 mt-2 rounded-2xl backdrop-blur-lg flex-1 flex flex-col justify-center">
                    {isLoading || isConnecting ? (
                        <>
                            <div className="h-7 w-32 bg-gray-700 rounded animate-pulse" />
                            <div className="h-6 w-24 bg-gray-700 rounded animate-pulse mt-1" />
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-x-3">
                                <h1 className="text-textWhite text-lg font-medium">
                                    ${stakedTokenValueUsd ? formatCurrency(stakedTokenValueUsd) : 0}
                                </h1>
                            </div>
                            <div className="flex items-center gap-x-2 mt-2">
                                <p className="text-textSecondary text-[16px] font-light">
                                    {stakedTokenValueFormatted ? stakedTokenValueFormatted?.toFixed(3) : 0} {farm.name}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };

    if (stakedTokenValueUsd === 0 || !currentWallet) return null;

    return (
        <div className="mt-10 relative">
            {(farm.originPlatform === FarmOriginPlatform.Infrared ||
                farm.originPlatform === FarmOriginPlatform.Steer ||
                farm.originPlatform === FarmOriginPlatform.Kodiak ||
                farm.originPlatform === FarmOriginPlatform.Burrbear ||
                farm.originPlatform === FarmOriginPlatform.BeraPaw) &&
            !farm.isDeprecated ? (
                <div className="flex flex-col md:flex-row gap-4 md:items-stretch">
                    {renderEarningsSection()}
                    {renderPositionSection()}
                </div>
            ) : (
                <div>{renderPositionSection()}</div>
            )}
        </div>
    );
};

export default YourBalance;

