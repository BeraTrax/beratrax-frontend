import { Skeleton } from "src/components/Skeleton/Skeleton";
import { PoolDef } from "src/config/constants/pools_json";
import { useLp } from "src/hooks/useLp";
import FarmLpGraph from "src/pages/FarmInfo/FarmLpGraph/FarmLpGraph";
import { customCommify } from "src/utils/common";
import FarmRowChip from "../../FarmRowChip/FarmRowChip";
import FarmTvlGraph from "src/pages/FarmInfo/FarmTvlGraph/FarmTvlGraph";
import FarmApyGraph from "src/pages/FarmInfo/FarmApyGraph/FarmApyGraph";
import { useState } from "react";
import FarmEarningsGraph from "src/pages/FarmInfo/FarmEarningsGraph/FarmEarningsGraph";

interface TokenPriceProps {
    farm: PoolDef;
}

const PriceLoadingSkeleton = () => {
    return (
        <div className="mt-2">
            <Skeleton w={80} h={32} />
            <Skeleton w={100} h={16} className="mt-1" />
        </div>
    );
};

type TabType = "price" | "tvl" | "apy" | "earnings";

export const TokenPriceAndGraph: React.FC<{ farm: PoolDef }> = ({ farm }) => {
    const { lp, isLpPriceLoading } = useLp(farm.id);
    const [activeTab, setActiveTab] = useState<TabType>("earnings");

    const tabs = [
        { id: "earnings" as TabType, label: "Earnings" },
        { id: "price" as TabType, label: "Price" },
        { id: "tvl" as TabType, label: "TVL" },
        { id: "apy" as TabType, label: farm.isAutoCompounded ? "BeraTrax APY" : "Underlying APR" },
    ];

    return (
        <div className="relative">
            <div className="z-10">
                <div className="flex justify-between">
                    <div>
                        <h3 className="text-textWhite mt-3 text-xl font-bold">
                            {farm.name} {farm.token2 && `LP`} Price
                        </h3>
                        {isLpPriceLoading ? (
                            <PriceLoadingSkeleton />
                        ) : (
                            <div className="mt-2">
                                <h1 className="text-textWhite text-5xl font-bold ">
                                    ${customCommify(lp?.[0]?.lp || 0)}
                                </h1>
                                <div className="flex gap-2 items-center justify-center text-[16px]">
                                    {/* <PriceTrendIcon trend="increase" className="mb-[3px]" />
                                    <p className="text-gradientPrimary ">$50 (2,52%)</p>
                                    <span className="w-1 h-1 rounded-full bg-textSecondary" />
                                    <p className="text-textSecondary">Today</p> */}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col mt-2 mr-3">
                        <div className="flex items-center gap-2 mb-2 justify-end">
                            <FarmRowChip
                                text={[farm.originPlatform, farm.secondary_platform].filter(Boolean).join(" | ")}
                                color="invert"
                            />
                            <div className="flex">
                                <img
                                    alt={farm?.platform_alt}
                                    className="w-4 rounded-full border border-bgDark"
                                    src={farm?.platform_logo}
                                />
                                {farm.secondary_platform && (
                                    <img
                                        className="w-4 rounded-full border border-bgDark"
                                        src={farm?.secondary_platform_logo}
                                    />
                                )}
                            </div>
                        </div>
                        <div className="flex">
                            {farm?.logo1 ? (
                                <img
                                    alt={farm?.alt1}
                                    className={`mr-[-5px] h-20 md:mr-0 lg:h-20 max-w-fit rounded-full`}
                                    src={farm?.logo1}
                                />
                            ) : null}

                            {farm?.logo2 ? (
                                <img
                                    alt={farm?.alt2}
                                    className={`w-20 h-20 lg:h-20 lg:w-20 ml-[-10px] max-w-fit rounded-full`}
                                    src={farm?.logo2}
                                />
                            ) : null}

                            {farm?.logo3 ? (
                                <img
                                    alt={farm?.alt3}
                                    className={`w-20 h-20 lg:h-20 lg:w-20 ml-[-10px] max-w-fit rounded-full`}
                                    src={farm?.logo3}
                                />
                            ) : null}

                            {farm?.logo4 ? (
                                <img
                                    alt={farm?.alt4}
                                    className={`w-20 h-20 lg:h-20 lg:w-20 ml-[-10px] max-w-fit rounded-full`}
                                    src={farm?.logo4}
                                />
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 mt-6 mb-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                activeTab === tab.id
                                    ? "bg-gradientSecondary text-textWhite"
                                    : "text-textSecondary hover:text-textWhite"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div>
                    {activeTab === "earnings" && <FarmEarningsGraph farm={farm} />}
                    {activeTab === "price" && <FarmLpGraph farm={farm} />}
                    {activeTab === "tvl" && <FarmTvlGraph farm={farm} />}
                    {activeTab === "apy" && <FarmApyGraph farm={farm} />}
                </div>
            </div>
        </div>
    );
};

export default TokenPriceAndGraph;

