import React from "react";
import PoolButton from "src/components/PoolButton/PoolButton";
import { Tabs } from "src/components/Tabs/Tabs";
import { UserLeaderboardTable } from "src/components/UserLeaderboradTable/UserLeaderboradTable";

enum Tab {
    LeaderBoard = "BTX Points",
}

const Leaderboard = () => {
    const [tab, setTab] = React.useState<Tab>(Tab.LeaderBoard);

    return (
        <div className="overflow-y-auto text-textWhite container mx-auto px-4 py-6 mb-4 space-y-6">
            <h1 className="uppercase text-3xl font-bold">Leaderboard</h1>
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="relative overflow-hidden bg-gradient-to-r from-gradientPrimary via-bgPrimary to-gradientSecondary p-1 rounded-3xl">
                    <div className="bg-bgDark rounded-2xl p-8 md:p-12 relative">
                        <div className="absolute inset-0 bg-black/40 rounded-2xl"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-gradientPrimary/20 via-bgPrimary/20 to-gradientSecondary/20 rounded-2xl"></div>
                        <div className="relative z-10 text-center space-y-6">
                            <div className="flex justify-center mb-6">
                            </div>
                            <h2 className="text-gradientPrimary font-bold text-4xl md:text-5xl mb-4 font-sans drop-shadow-[0_2px_4px_rgba(0,0,0,1)] uppercase tracking-wide">
                                Coming Soon
                            </h2>
                            <h3 className="text-textWhite font-semibold text-2xl md:text-3xl mb-6 [text-shadow:_0_1px_2px_rgba(0,0,0,1)] uppercase">
                                Next Season
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* <Tabs className="whitespace-nowrap px-4 min-w-min !py-0">
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
            {tab === Tab.LeaderBoard && <UserLeaderboardTable />} */}
        </div>
    );
};

export default Leaderboard;
