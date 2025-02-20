import { useMemo } from "react";
import { PoolDef } from "src/config/constants/pools_json";
import useTokens from "src/state/tokens/useTokens";
import useWallet from "src/hooks/useWallet";
import { formatCurrency } from "src/utils/common";

const YourBalance = ({ farm }: { farm: PoolDef }) => {
    const { isConnecting } = useWallet();
    const { balances, isBalancesLoading: isLoading, prices } = useTokens();
    const stakedTokenValueUsd = useMemo(() => Number(balances[farm.chainId][farm.vault_addr]?.valueUsd), [balances]);
    const stakedTokenValueFormatted = useMemo(
        () => Number(balances[farm.chainId][farm.vault_addr]?.valueUsd / prices[farm.chainId][farm.lp_address]),
        [balances, prices]
    );

    return (
        <div className="mt-10 relative">
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
    );
};

export default YourBalance;
