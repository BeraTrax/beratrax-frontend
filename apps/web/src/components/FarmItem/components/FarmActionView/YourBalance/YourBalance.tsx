import { useMemo } from "react";
import { PoolDef, tokenNamesAndImages } from "src/config/constants/pools_json";
import useTokens from "src/state/tokens/useTokens";
import useFarmDetails from "src/state/farms/hooks/useFarmDetails";
import useWallet from "src/hooks/useWallet";
import { formatCurrency, toEth } from "src/utils/common";
import { FarmOriginPlatform } from "src/types/enums";
import { getAddress } from "viem";

// Reusable component for token earnings
const TokenEarning = ({
    earnings,
    token,
    chainId,
    prices,
}: {
    earnings: string | number | undefined;
    token: string | undefined;
    chainId: number;
    prices: Record<number, Record<string, number>>;
}) => {
    if (!earnings || !token) return null;

    const tokenAddress = token ? getAddress(token) : "";
    const tokenName = token ? tokenNamesAndImages[tokenAddress]?.name || "" : "";
    const earningsValue = Number(toEth(BigInt(earnings.toString())));
    const earningsValueUsd = earningsValue * (prices[chainId][tokenAddress] || 0);

    return (
        <div className="flex-1">
            <div className="flex items-center gap-x-3">
                <div className="flex flex-col">
                    <h1 className="text-green-500 text-lg font-medium flex items-center gap-x-2">
                        ${earningsValueUsd.toFixed(2)}
                    </h1>
                </div>
                <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center">
                    <span className="text-green-500 text-md">↑</span>
                </div>
            </div>
            <div className="flex items-center gap-x-2 mt-2">
                <p className="text-green-400/80 text-[16px] font-light">
                    {earningsValue.toFixed(5)} {tokenName}
                </p>
            </div>
        </div>
    );
};

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
                                    earnings={farmEarnings.earnings0}
                                    token={farmEarnings.token0}
                                    chainId={farm.chainId}
                                    prices={prices}
                                />
                                {farmEarnings?.earnings1 && (
                                    <TokenEarning
                                        earnings={farmEarnings.earnings1}
                                        token={farmEarnings.token1}
                                        chainId={farm.chainId}
                                        prices={prices}
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

    if (stakedTokenValueUsd === 0) return null;

    return (
        <div className="mt-10 relative">
            {(farm.originPlatform === FarmOriginPlatform.Infrared ||
                farm.originPlatform === FarmOriginPlatform.Steer) &&
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

