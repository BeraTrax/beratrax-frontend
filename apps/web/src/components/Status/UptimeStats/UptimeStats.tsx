import { getColorClass } from "src/utils/common";

/**
 * Displays the Uptime statistics for Harvest, Earn, and their combined operations
 * in a visual format using progress bars and percentage indicators.
 *
 * @returns {React.JSX.Element} A visual component showing Harvest, Earn, and Combined uptime statistics.
 */
export const UptimeStats = ({
    totalHarvestSucceeded,
    totalEarnSucceeded,
    totalVaultRuns,
}: {
    totalHarvestSucceeded: number;
    totalEarnSucceeded: number;
    totalVaultRuns: number;
}): React.JSX.Element => {

    const overallHarvestUptime = totalVaultRuns > 0 ? (totalHarvestSucceeded / totalVaultRuns) * 100 : 0;
    const overallEarnUptime = totalVaultRuns > 0 ? (totalEarnSucceeded / totalVaultRuns) * 100 : 0;
    const overallCombinedUptime =
        totalVaultRuns * 2 > 0 ? ((totalHarvestSucceeded + totalEarnSucceeded) / (totalVaultRuns * 2)) * 100 : 0;   

    return (
        <div className="bg-bgDark rounded-xl p-5 border border-[#323d27] mt-6">
            <h3 className="text-white font-medium mb-4">Uptime Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cumulative Auto Compound Uptime */}
                <div className="bg-bgDark rounded-lg p-4 border border-[#2A342A]">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[#878B82]">Cumulative Auto Compound Uptime</span>
                        <span className="text-white font-bold">{overallCombinedUptime.toFixed(2)}%</span>
                    </div>
                    <div className="w-full h-3 bg-[#2D2F30] rounded-full overflow-hidden">
                        <div
                            className={`h-full ${getColorClass(overallCombinedUptime)} rounded-full`}
                            style={{ width: `${overallCombinedUptime}%` }}
                        ></div>
                    </div>
                </div>

                {/* Harvest Uptime */}
                <div className="bg-bgDark rounded-lg p-4 border border-[#2A342A]">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[#878B82]">Harvest Uptime</span>
                        <span className="text-white font-bold">{overallHarvestUptime.toFixed(2)}%</span>
                    </div>
                    <div className="w-full h-3 bg-[#2D2F30] rounded-full overflow-hidden">
                        <div
                            className={`h-full ${getColorClass(overallHarvestUptime)} rounded-full`}
                            style={{ width: `${overallHarvestUptime}%` }}
                        ></div>
                    </div>
                </div>

                {/* Earn Uptime */}
                <div className="bg-[#151818] rounded-lg p-4 border border-[#2A342A]">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[#878B82]">Earn Uptime</span>
                        <span className="text-white font-bold">{overallEarnUptime.toFixed(2)}%</span>
                    </div>
                    <div className="w-full h-3 bg-[#2D2F30] rounded-full overflow-hidden">
                        <div
                            className={`h-full ${getColorClass(overallEarnUptime)} rounded-full`}
                            style={{ width: `${overallEarnUptime}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};