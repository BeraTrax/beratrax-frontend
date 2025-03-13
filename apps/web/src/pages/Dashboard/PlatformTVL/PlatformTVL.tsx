import { usePlatformTVL } from "@beratrax/core/hooks";
import { customCommify } from "src/utils/common";

interface Props {}

const PlatformTVL: React.FC<Props> = () => {
    const { platformTVL } = usePlatformTVL();

    if (!platformTVL) return null;

    return (
        <div className="relative overflow-hidden rounded-lg p-4 border border-borderDark bg-gradient-to-br from-buttonPrimary to-buttonPrimaryLight ">
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-textPrimary/5 to-transparent animate-shimmer" />

            <div className="relative z-10 flex flex-col justify-between gap-y-4 text-2xl">
                <div className="flex items-center gap-2 text-textBlack text-lg font-semibold uppercase ">
                    <span>💰</span>
                    <p className="font-arame-mono">Platform Total Value Staked</p>
                </div>
                <p className="text-textWhite font-bold">
                    {customCommify(platformTVL.toFixed(0), {
                        minimumFractionDigits: 0,
                        showDollarSign: true,
                    })}
                </p>
            </div>

            {/* Decorative corner accent */}
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-textPrimary/10 rounded-full blur-xl" />
        </div>
    );
};

export default PlatformTVL;
