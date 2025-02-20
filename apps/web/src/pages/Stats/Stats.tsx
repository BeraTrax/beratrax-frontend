import PlatformTVL from "../Dashboard/PlatformTVL/PlatformTVL";
import { UserStatsTable } from "src/components/UserStatsTable/UserStatsTable";
import { useStats } from "src/hooks/useStats";
import { StatsCard } from "src/components/StatsCard/StatsCard";
import { MyReferrals } from "src/components/MyReferrals/MyReferrals";
import { VaultStatsTable } from "src/components/VaultStatsTable/VaultStatsTable";
import PlatformTVLGraph from "./PlatformTVLGraph/PlatformTVLGraph";

function Stats() {
    const { meanTvl, activeUsers, totalBtxPoints, facetUserCount, accountConnectorsStats } = useStats();
    return (
        <div className="container mx-auto px-4 py-6 space-y-6">
            <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
                <div className="transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-textPrimary/20">
                    <PlatformTVL />
                </div>
                <div className="transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-textPrimary/20">
                    <StatsCard
                        heading="Total BTX Points"
                        value={totalBtxPoints}
                        icon="📈"
                        gradientClass="bg-gradient-to-br from-buttonPrimary to-buttonPrimaryLight"
                    />
                </div>
                <div className="transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-textPrimary/20">
                    <StatsCard
                        heading="Active Users"
                        value={activeUsers}
                        icon="👥"
                        gradientClass="bg-gradient-to-br from-buttonPrimary to-buttonPrimaryLight"
                    />
                </div>
                <div className="transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-textPrimary/20">
                    <StatsCard
                        heading="Users Introduced to Berachain"
                        value={facetUserCount}
                        icon="🚀"
                        gradientClass="bg-gradient-to-br from-buttonPrimary to-buttonPrimaryLight"
                    />
                </div>
                <div className="transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-textPrimary/20">
                    <StatsCard
                        heading="EOA Users"
                        value={
                            accountConnectorsStats?.reduce((acc, curr) => {
                                if (curr.connector === "metaMask" || curr.connector === "io.metamask") {
                                    return acc + curr.count;
                                }
                                return acc;
                            }, 0) || 0
                        }
                        icon="🦊"
                        gradientClass="bg-gradient-to-br from-buttonPrimary to-buttonPrimaryLight"
                    />
                </div>
                <div className="transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-textPrimary/20">
                    <StatsCard
                        heading="Social Wallet Users"
                        value={accountConnectorsStats?.find((stat) => stat.connector === "web3auth")?.count || 0}
                        icon="🔑"
                        gradientClass="bg-gradient-to-br from-buttonPrimary to-buttonPrimaryLight"
                    />
                </div>
            </div>
            <PlatformTVLGraph />
            <UserStatsTable />
            <VaultStatsTable />
            <MyReferrals />
        </div>
    );
}

export default Stats;
