import { useMemo } from "react";
import { PoolDef, tokenNamesAndImages } from "src/config/constants/pools_json";
import useTokens from "src/state/tokens/useTokens";
import useFarmDetails from "src/state/farms/hooks/useFarmDetails";
import useWallet from "src/hooks/useWallet";
import { customCommify, formatCurrency, toEth } from "src/utils/common";
import { FarmOriginPlatform } from "src/types/enums";
import { Address, getAddress } from "viem";

// Reusable component for token earnings
const TokenEarning = ({
    currentVaultEarnings,
    token,
    chainId,
    prices,
}: {
    currentVaultEarnings: any;
    token: string | undefined;
    chainId: number;
    prices: Record<number, Record<string, number>>;
}) => {
    if (!currentVaultEarnings || !token) return null;
    const { decimals } = useTokens();
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

    // Convert any zero earnings to "0" string to ensure proper display
    const earningsStr = currentVaultEarningsUsd.toString();

    const tokenAddress = token ? getAddress(token) : "";
    const tokenName = token ? tokenNamesAndImages[tokenAddress]?.name || "" : "";

    return (
        <div className="flex-1">
            <div className="flex items-center gap-x-3">
                <div className="flex flex-col">
                    <h1 className="text-green-500 text-lg font-medium flex items-center gap-x-2">
                        $
                        {customCommify(currentVaultEarningsUsd, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                    </h1>
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
        if (!vaultEarnings?.length) return { earnings0: 0, token0: "", earnings1: 0, token1: "" };
        return (
            vaultEarnings.find((earning) => earning.tokenId === farm.id.toString()) || {
                earnings0: 0,
                token0: "",
                earnings1: 0,
                token1: "",
                changeInAssets: 0,
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
                                />
                                {farm.isAutoCompounded && (
                                    <LpAssetChange
                                        changeInAssets={farmEarnings.changeInAssets}
                                        farm={farm}
                                        isLoading={isVaultEarningsFirstLoad}
                                    />
                                )}
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

