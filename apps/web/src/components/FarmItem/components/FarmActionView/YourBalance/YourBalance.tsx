import { useMemo } from "react";
import { PoolDef, tokenNamesAndImages } from "src/config/constants/pools_json";
import useTokens from "src/state/tokens/useTokens";
import useFarmDetails from "src/state/farms/hooks/useFarmDetails";
import useWallet from "src/hooks/useWallet";
import { formatCurrency, toEth } from "src/utils/common";
import { FarmOriginPlatform } from "src/types/enums";
import { getAddress } from "viem";

const YourBalance = ({ farm }: { farm: PoolDef }) => {
    const { isConnecting } = useWallet();
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
            }
        );
    }, [vaultEarnings, farm.id]);

    // Render earnings section if farm is from Infrared platform
    const renderEarningsSection = () => {

        return (
            <div className="w-full md:w-1/2">
                <h3 className="text-textWhite font-arame-mono font-normal text-[16px] leading-[18px] tracking-widest">
                    YOUR EARNINGS
                </h3>
                <div className="bg-bgDark py-4 px-4 mt-2 rounded-2xl backdrop-blur-lg">
                    {isVaultEarningsFirstLoad ? (
                        <div className="h-7 w-32 bg-gray-700 rounded animate-pulse" />
                    ) : (
                        <>
                            {farmEarnings?.earnings0 && farmEarnings?.token0 && (
                                <div className="pb-2">
                                    <div className="flex items-center gap-x-3">
                                        <div className="flex flex-col">
                                            <h1 className="text-green-500 text-lg font-medium flex items-center gap-x-2">
                                                $
                                                {(
                                                    Number(toEth(BigInt(farmEarnings.earnings0))) *
                                                    prices[farm.chainId][getAddress(farmEarnings.token0)]
                                                ).toFixed(2)}
                                            </h1>
                                        </div>
                                        <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center">
                                            <span className="text-green-500 text-md">↑</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-x-2 mt-2">
                                        <p className="text-green-400/80 text-[16px] font-light">
                                            {Number(toEth(BigInt(farmEarnings.earnings0))).toFixed(5)}{" "}
                                            {farmEarnings.token0
                                                ? tokenNamesAndImages[getAddress(farmEarnings.token0)].name
                                                : ""}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {farmEarnings?.earnings1 && farmEarnings?.token1 && (
                                <div>
                                    <div className="flex items-center gap-x-3">
                                        <div className="flex flex-col">
                                            <h1 className="text-green-500 text-lg font-medium flex items-center gap-x-2">
                                                $
                                                {(
                                                    Number(toEth(BigInt(farmEarnings.earnings1))) *
                                                    prices[farm.chainId][getAddress(farmEarnings.token1)]
                                                ).toFixed(2)}
                                            </h1>
                                        </div>
                                        <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center">
                                            <span className="text-green-500 text-md">↑</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-x-2 mt-2">
                                        <p className="text-green-400/80 text-[16px] font-light">
                                            {Number(toEth(BigInt(farmEarnings.earnings1 || 0))).toFixed(5)}{" "}
                                            {farmEarnings.token1
                                                ? tokenNamesAndImages[getAddress(farmEarnings.token1)].name
                                                : ""}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    };

    // Render position section
    const renderPositionSection = () => {
        return (
            <div className="w-full md:w-1/2">
                <h3 className="text-textWhite font-arame-mono font-normal text-[16px] leading-[18px] tracking-widest">
                    YOUR POSITION
                </h3>
                <div className="bg-bgDark py-4 px-4 mt-2 rounded-2xl backdrop-blur-lg">
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

    if (stakedTokenValueUsd === 0) return null;

    return (
        <div className="mt-10 relative">
            {(farm.originPlatform === FarmOriginPlatform.Infrared || farm.originPlatform === FarmOriginPlatform.Steer) && !farm.isDeprecated ? (
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
