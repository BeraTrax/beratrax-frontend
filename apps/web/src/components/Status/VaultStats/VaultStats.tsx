import { useMemo } from "react";
import { AutoCompoundResult } from "src/api/stats";

export const VaultStats = ({ runs }: { runs: AutoCompoundResult[] }): React.JSX.Element => {
    const vaultStats = useMemo(() => {
        const vaultMap = new Map();
        runs.forEach((run: AutoCompoundResult) => {
            const vaults = Object.entries(run.data);
            vaults.forEach(([vaultId, vaultData]: [string, any]) => {
                if (!vaultMap.has(vaultId)) {
                    vaultMap.set(vaultId, {
                        vaultId,
                        harvestSucceeded: 0,
                        harvestFailed: 0,
                        earnSucceeded: 0,
                        earnFailed: 0,
                        totalRuns: 0,
                        harvestSuccessHeight: 0,
                        harvestFailedHeight: 0,
                        earnSuccessHeight: 0,
                        earnFailedHeight: 0,
                        harvestSuccessRate: 0,
                        earnSuccessRate: 0
                    });
                }
                const vault = vaultMap.get(vaultId);
                vault.totalRuns++;
                if (vaultData.harvestSuccess) vault.harvestSucceeded++;
                else vault.harvestFailed++;
                if (vaultData.earnSuccess) vault.earnSucceeded++;
                else vault.earnFailed++;
            });
        });

        // Precompute bar heights and success rates for each vault
        vaultMap.forEach((vault) => {
            const maxHeight = Math.max(vault.totalRuns, 1);
            vault.harvestSuccessHeight = (vault.harvestSucceeded / maxHeight) * 100;
            vault.harvestFailedHeight = (vault.harvestFailed / maxHeight) * 100;
            vault.earnSuccessHeight = (vault.earnSucceeded / maxHeight) * 100;
            vault.earnFailedHeight = (vault.earnFailed / maxHeight) * 100;
            vault.harvestSuccessRate = vault.totalRuns > 0 ? (vault.harvestSucceeded / vault.totalRuns) * 100 : 0;
            vault.earnSuccessRate = vault.totalRuns > 0 ? (vault.earnSucceeded / vault.totalRuns) * 100 : 0;
        });

        return Array.from(vaultMap.values()).sort((a, b) => parseInt(a.vaultId) - parseInt(b.vaultId));
    }, [runs]);

    if (vaultStats.length === 0) {
        return <div className="w-full text-center text-[#878B82] py-8">No vault data available</div>;
    }

    return (
        <div className="bg-bgDark rounded-lg p-4 border border-[#2A342A] mt-8">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-white font-medium">Individual Vault Performance</h4>
                <div className="text-xs text-[#878B82]">{vaultStats.length} vaults total</div>
            </div>

            <div className="mb-4 flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-sm" />
                    <span className="text-[#878B82]">Harvest Success</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-800 rounded-sm" />
                    <span className="text-[#878B82]">Harvest Failed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-sm" />
                    <span className="text-[#878B82]">Earn Success</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-sm" />
                    <span className="text-[#878B82]">Earn Failed</span>
                </div>
            </div>

            {/* Scrollable container for vault bar graphs */}
            <div className="overflow-x-auto">
                <div className="flex gap-2 min-w-max pb-4">
                    {vaultStats.map((vault) => (
                        <div key={vault.vaultId} className="flex flex-col items-center relative group mr-5">
                            <div className="flex gap-1 mb-2 h-32 w-full cursor-pointer">
                                <div className="w-6 bg-[#2D2F30] rounded-sm relative overflow-hidden flex flex-col-reverse">
                                    {vault.harvestSucceeded > 0 && (
                                        <div className="bg-green-500 w-full" style={{ height: `${vault.harvestSuccessHeight}%` }} />
                                    )}
                                    {vault.harvestFailed > 0 && (
                                        <div className="bg-red-800 w-full" style={{ height: `${vault.harvestFailedHeight}%` }} />
                                    )}
                                </div>
                                <div className="w-6 bg-[#2D2F30] rounded-sm relative overflow-hidden flex flex-col-reverse">
                                    {vault.earnSucceeded > 0 && (
                                        <div className="bg-blue-500 w-full" style={{ height: `${vault.earnSuccessHeight}%` }} />
                                    )}
                                    {vault.earnFailed > 0 && (
                                        <div className="bg-orange-500 w-full" style={{ height: `${vault.earnFailedHeight}%` }} />
                                    )}
                                </div>
                            </div>
                            <div className="text-xs text-[#878B82] text-center">Vault {vault.vaultId}</div>
                            <div className="absolute top-full left-0 transform -translate-x-1/2 -translate-y-[95%] mt-2 hidden group-hover:block bg-[#151818] text-white text-xs p-3 rounded-md min-w-[220px] shadow-lg border border-[#3A3A3A] z-10">
                                <div className="font-bold mb-2">Vault {vault.vaultId}</div>
                                <div className="space-y-1">
                                    <div className="text-green-400">
                                        Harvest Success: {vault.harvestSucceeded}/{vault.totalRuns} ({vault.harvestSuccessRate.toFixed(1)}%)
                                    </div>
                                    <div className="text-red-400">
                                        Harvest Failed: {vault.harvestFailed}/{vault.totalRuns}
                                    </div>
                                    <div className="text-blue-400">
                                        Earn Success: {vault.earnSucceeded}/{vault.totalRuns} ({vault.earnSuccessRate.toFixed(1)}%)
                                    </div>
                                    <div className="text-orange-400">
                                        Earn Failed: {vault.earnFailed}/{vault.totalRuns}
                                    </div>
                                    <div className="text-[#878B82] mt-2 pt-2 border-t border-[#3A3A3A]">
                                        Total Runs: {vault.totalRuns}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};