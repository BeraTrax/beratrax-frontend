import { useStatus } from "src/hooks/useStatus";
import { AutoCompoundResult } from "src/api/stats";
import { VaultStats } from "src/components/Status/VaultStats/VaultStats";
import { UptimeStats } from "src/components/Status/UptimeStats/UptimeStats";
import { formatDate, getColorClass } from "src/utils/common";
import { ContributionGraph } from "src/components/Status/StatsGraph/StatsGraph";

/**
 * Fetches auto-compounding run statistics via the `useStatus` hook and presents:
 * 1. A summary grid of GitHub-style contribution graphs for:
 *    - Cumulative auto-compound success/failure
 *    - Harvest success/failure
 *    - Earn success/failure
 * 2. Overall uptime statistics (`UptimeStats`) including combined, harvest, and earn uptimes.
 * 3. Per-vault performance breakdown (`VaultStats`) with colored bar charts and tooltips.
 *
 * @returns {React.JSX.Element} The full system status dashboard, including graphs and stats.
 */
export const Status = (): React.JSX.Element => {
    const { autoCompoundStats, isLoadingAutoCompoundStats: isLoading } = useStatus();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-bgDark p-6 flex items-center justify-center">
                <div className="text-white">Loading cron status...</div>
            </div>
        );
    }

    let totalHarvestSucceeded = 0,
        totalEarnSucceeded = 0,
        totalVaultRuns = 0;

    // Sort the auto compound runs by lastFinishedAt
    const runs = autoCompoundStats.sort(
        (a: AutoCompoundResult, b: AutoCompoundResult) =>
            new Date(a.lastFinishedAt).getTime() - new Date(b.lastFinishedAt).getTime()
    );

    // Map the auto compound runs to the data needed for the contribution graph
    const runData = runs.map((run: AutoCompoundResult) => {
        const vaults = Object.values(run.data);
        const totalVaults = vaults.length;
        totalVaultRuns += totalVaults;

        // Count how many vaults succeeded in harvest and in earn.
        const harvestSucceeded = vaults.filter((v: any) => v.harvestSuccess).length;
        const earnSucceeded = vaults.filter((v: any) => v.earnSuccess).length;
        totalHarvestSucceeded += harvestSucceeded;
        totalEarnSucceeded += earnSucceeded;

        const harvestSuccessPercentage = totalVaults > 0 ? (harvestSucceeded / totalVaults) * 100 : 0;
        const earnSuccessPercentage = totalVaults > 0 ? (earnSucceeded / totalVaults) * 100 : 0;

        // Calculate combined failures
        const harvestFailed = totalVaults - harvestSucceeded;
        const earnFailed = totalVaults - earnSucceeded;
        const totalFailed = harvestFailed + earnFailed;
        const totalPossible = totalVaults * 2; // Each vault has 2 operations (harvest + earn)
        const combinedSuccessPercentage =
            totalPossible > 0 ? ((harvestSucceeded + earnSucceeded) / totalPossible) * 100 : 0;

        return {
            CumulativeAutoCompound: {
                percentage: combinedSuccessPercentage,
                succeeded: harvestSucceeded + earnSucceeded,
                failed: totalFailed,
                colorClass: getColorClass(combinedSuccessPercentage),
                tooltip: `Harvest Succeeded: ${harvestSucceeded}, Earn Succeeded: ${earnSucceeded}, Harvest Failed: ${harvestFailed}, Earn Failed: ${earnFailed}`,
            },
            harvest: {
                percentage: harvestSuccessPercentage,
                succeeded: harvestSucceeded,
                failed: totalVaults - harvestSucceeded,
                colorClass: getColorClass(harvestSuccessPercentage),
                tooltip: `Harvest Succeeded: ${harvestSucceeded}, Harvest Failed: ${totalVaults - harvestSucceeded}`,
            },
            earn: {
                percentage: earnSuccessPercentage,
                succeeded: earnSucceeded,
                failed: totalVaults - earnSucceeded,
                colorClass: getColorClass(earnSuccessPercentage),
                tooltip: `Earn Succeeded: ${earnSucceeded}, Earn Failed: ${totalVaults - earnSucceeded}`,
            },
            lastFinishedAt: run.lastFinishedAt,
            status: run.status,
        };
    });

    return (
        <div className="min-h-screen bg-bgDark p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-white font-sans">System Status</h1>
                </div>

                {/* Auto Compound Runs */}
                <div className="bg-bgDark rounded-xl p-5 border border-[#323d27] mt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                        <h3 className="text-white font-medium mb-3 md:mb-0">Auto Compound Runs</h3>
                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-sm" />
                                <span className="text-[#878B82]">85-100% uptime</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-sm" />
                                <span className="text-[#878B82]">60-84% uptime</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-800 rounded-sm" />
                                <span className="text-red-800">Below 60% uptime</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-[#878B82] mb-6">
                        Hover over squares to see detailed success/failure counts for each auto-compound run
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <ContributionGraph
                            type="CumulativeAutoCompound"
                            title="Cumulative Auto Compound"
                            runData={runData}
                        />
                        <ContributionGraph type="harvest" title="Harvest" runData={runData} />
                        <ContributionGraph type="earn" title="Earn" runData={runData} />
                    </div>
                </div>

                <UptimeStats
                    totalHarvestSucceeded={totalHarvestSucceeded}
                    totalEarnSucceeded={totalEarnSucceeded}
                    totalVaultRuns={totalVaultRuns}
                />

                <VaultStats runs={runs} />
            </div>
        </div>
    );
};

