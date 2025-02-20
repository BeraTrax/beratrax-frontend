import React from "react";
import PoolButton from "src/components/PoolButton/PoolButton";
import { Tabs } from "src/components/Tabs/Tabs";
import { UserLeaderboardTable } from "src/components/UserLeaderboradTable/UserLeaderboradTable";
import { usePlatformTVL, useTransactionCount } from "src/hooks/usePlatformTVL";
import { formatCurrency } from "src/utils/common";

enum Tab {
    // StakedReferral = "Referral Leaderboard",
    // GalxeLeaderBoard = "Galxe Leaderboard",
    LeaderBoard = "BTX Points",
}

const Leaderboard = () => {
    const { platformTVL } = usePlatformTVL();
    const { transactionCount, isLoading: isCountLoading } = useTransactionCount();
    const [tab, setTab] = React.useState<Tab>(Tab.LeaderBoard);
    const hardcodedTvl = 51236641.7505317;
    const hardcodedTransactionCount = 321552;

    return (
        <div className="text-textWhite relative overflow-y-auto container mx-auto my-8 px-4 py-6 space-y-6">
            <h1 className="uppercase text-3xl font-bold">Leaderboard</h1>
            <div className="flex  font-league-spartan text-white text-lg font-semibold max-w-[240px] md:max-w-max gap-4">
                {/* Active Users */}
                <div className="flex flex-col bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-[#A0FF3B]/20 min-w-[120px] md:min-w-[180px]">
                    <span className="text-sm text-gray-300 mb-1">Testnet Transactions Count</span>
                    {/* create a number skeleton till the transactionCount is loading */}
                    {isCountLoading ? (
                        <div className="h-8 w-24 animate-pulse bg-gray-800 rounded"></div>
                    ) : (
                        <div
                            className={`bg-gradient-to-r from-[#A0FF3B] to-[#32CD32] bg-clip-text text-transparent text-2xl [text-shadow:0_0_15px_rgba(160,255,59,0.5)]`}
                        >
                            {hardcodedTransactionCount ? formatCurrency(hardcodedTransactionCount, 0) : ""}
                        </div>
                    )}
                </div>
                {/* Platform TVL */}
                <div className="flex flex-col bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-[#A0FF3B]/20 min-w-[180px]">
                    <span className="text-sm text-gray-300 mb-1">Testnet Platform TVL</span>
                    <div
                        className={`bg-gradient-to-r from-[#A0FF3B] to-[#32CD32] bg-clip-text text-transparent text-2xl [text-shadow:0_0_15px_rgba(160,255,59,0.5)]`}
                    >
                        $ {formatCurrency(hardcodedTvl, 0)}
                    </div>
                </div>
            </div>
            <div className="-mx-4 relative">
                <div className="overflow-x-auto">
                    <Tabs className="max-h-24 whitespace-nowrap px-4 min-w-min">
                        {Object.values(Tab).map((_tab, i) => (
                            <PoolButton
                                key={i}
                                variant={2}
                                onClick={() => {
                                    setTab(_tab);
                                }}
                                description={_tab}
                                active={tab === _tab}
                                className="whitespace-nowrap inline-block"
                            />
                        ))}
                    </Tabs>
                </div>
            </div>
            {/* TABLE ROW */}
            {/* {tab === Tab.GalxeLeaderBoard && <GalxeLeaderboardTable />} */}
            {tab === Tab.LeaderBoard && <UserLeaderboardTable />}
            {/* {tab === Tab.StakedReferral && <ReferralLeaderboardTable />} */}
        </div>
    );
};

export default Leaderboard;
