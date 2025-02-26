import { useMemo } from "react";
import { PoolDef } from "src/config/constants/pools_json";
import useTokens from "src/state/tokens/useTokens";
import useFarmDetails from "src/state/farms/hooks/useFarmDetails";
import useWallet from "src/hooks/useWallet";
import { formatCurrency, toEth } from "src/utils/common";
import { FarmOriginPlatform } from "src/types/enums";

const YourBalance = ({ farm }: { farm: PoolDef }) => {
    const { isConnecting } = useWallet();
    const { balances, isBalancesLoading: isLoading, prices } = useTokens();
    const { vaultEarnings, isLoadingVaultEarnings } = useFarmDetails();
    const stakedTokenValueUsd = useMemo(() => Number(balances[farm.chainId][farm.vault_addr]?.valueUsd), [balances]);
    const stakedTokenValueFormatted = useMemo(
        () => Number(balances[farm.chainId][farm.vault_addr]?.valueUsd / prices[farm.chainId][farm.lp_address]),
        [balances, prices]
    );

    const farmEarnings = useMemo(() => {
        if (!vaultEarnings?.length) return { earnings: 0 };
        return (
            vaultEarnings.find((earning) => earning.tokenId === farm.id.toString()) || {
                earnings: 0,
            }
        );
    }, [vaultEarnings, farm.id]);

    return (
        <div className="mt-10 relative flex flex-col gap-y-4">
            {farm.originPlatform === FarmOriginPlatform.Infrared && (
                <div>
                    <h3 className="text-textWhite font-arame-mono font-normal text-[16px] leading-[18px] tracking-widest">
                        YOUR EARNINGS
                    </h3>
                    <div className="bg-bgDark py-4 px-4 mt-2 rounded-2xl backdrop-blur-lg">
                        {isLoadingVaultEarnings ? (
                            <>
                                <div className="h-7 w-32 bg-gray-700 rounded animate-pulse" />
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-x-3">
                                    <div className="flex flex-col">
                                        <h1 className="text-green-500 text-lg font-medium flex items-center gap-x-2">
                                            {Number(toEth(BigInt(farmEarnings?.earnings))).toFixed(5)} {farm.name}
                                        </h1>
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <span className="text-green-500 text-xl">↑</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-x-2 mt-1">
                                    <p className="text-green-400/80 text-[16px] font-light">
                                        ${(Number(toEth(BigInt(farmEarnings?.earnings))) * prices[farm.chainId][farm.lp_address]).toFixed(2)}
                                    </p>
                                   
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
            <div>
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
                            <h1 className="text-textWhite text-lg font-medium">
                                ${stakedTokenValueUsd ? formatCurrency(stakedTokenValueUsd) : 0}
                            </h1>
                            <p className="text-textSecondary text-[16px] font-light">
                                {stakedTokenValueFormatted ? stakedTokenValueFormatted?.toFixed(3) : 0} {farm.name}
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default YourBalance;
