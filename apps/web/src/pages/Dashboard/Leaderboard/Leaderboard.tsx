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
            <Tabs className="whitespace-nowrap px-4 min-w-min !py-0">
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
            {tab === Tab.LeaderBoard && <UserLeaderboardTable />}
        </div>
    );
};

export default Leaderboard;
