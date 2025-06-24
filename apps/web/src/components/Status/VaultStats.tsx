import { useMemo } from "react";
import { AutoCompoundResult } from "@beratrax/core/src/api/stats";

type ConsecutiveGroup = {
	type: "success" | "failure";
	count: number;
	percentage: number;
};

type VaultPattern = {
	vaultId: string;
	harvestPattern: ConsecutiveGroup[];
	earnPattern: ConsecutiveGroup[];
	totalRuns: number;
	overallHarvestSuccess: number;
	overallEarnSuccess: number;
};

export const VaultStats = ({ runs }: { runs: AutoCompoundResult[] }): React.JSX.Element => {
	const vaultStats = useMemo(() => {
		const vaultMap = new Map<string, { harvestResults: boolean[]; earnResults: boolean[] }>();

		// Collect results for each vault in chronological order
		runs.forEach((run: AutoCompoundResult) => {
			const vaults = Object.entries(run.data);
			vaults.forEach(([vaultId, vaultData]: [string, any]) => {
				if (!vaultMap.has(vaultId)) {
					vaultMap.set(vaultId, {
						harvestResults: [],
						earnResults: [],
					});
				}
				const vault = vaultMap.get(vaultId)!;
				vault.harvestResults.push(vaultData.harvestSuccess);
				vault.earnResults.push(vaultData.earnSuccess);
			});
		});

		// Process each vault to create consecutive groupings
		const processedVaults: VaultPattern[] = [];

		vaultMap.forEach((vaultData, vaultId) => {
			const processResults = (results: boolean[]): ConsecutiveGroup[] => {
				if (results.length === 0) return [];

				const groups: ConsecutiveGroup[] = [];
				let currentType: "success" | "failure" = results[0] ? "success" : "failure";
				let currentCount = 1;

				for (let i = 1; i < results.length; i++) {
					const isSuccess = results[i];
					const type: "success" | "failure" = isSuccess ? "success" : "failure";

					if (type === currentType) {
						currentCount++;
					} else {
						groups.push({
							type: currentType,
							count: currentCount,
							percentage: (currentCount / results.length) * 100,
						});
						currentType = type;
						currentCount = 1;
					}
				}

				// Add the last group
				groups.push({
					type: currentType,
					count: currentCount,
					percentage: (currentCount / results.length) * 100,
				});

				return groups;
			};

			const harvestPattern = processResults(vaultData.harvestResults);
			const earnPattern = processResults(vaultData.earnResults);

			processedVaults.push({
				vaultId,
				harvestPattern,
				earnPattern,
				totalRuns: vaultData.harvestResults.length,
				overallHarvestSuccess: vaultData.harvestResults.filter((r) => r).length,
				overallEarnSuccess: vaultData.earnResults.filter((r) => r).length,
			});
		});

		return processedVaults.sort((a, b) => parseInt(a.vaultId) - parseInt(b.vaultId));
	}, [runs]);

	if (vaultStats.length === 0) {
		return <div className="w-full text-center text-textSecondary py-8">No vault data available</div>;
	}

	const getPatternColor = (type: "success" | "failure") => {
		return type === "success" ? "bg-green-500" : "bg-red-500";
	};

	return (
		<div className="bg-bgDark rounded-lg p-4 border border-borderDark mt-8">
			<div className="flex justify-between items-center mb-4">
				<h4 className="text-white font-medium">Individual Vault Performance Patterns</h4>
				<div className="text-xs text-textSecondary">{vaultStats.length} vaults total</div>
			</div>

			<div className="mb-4 flex flex-wrap gap-4 text-xs">
				<div className="flex items-center gap-2">
					<div className="w-3 h-3 bg-green-500 rounded-sm" />
					<span className="text-textSecondary">Success Streaks</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="w-3 h-3 bg-red-500 rounded-sm" />
					<span className="text-textSecondary">Failure Streaks</span>
				</div>
			</div>

			<div className="space-y-4">
				{vaultStats.map((vault) => (
					<div key={vault.vaultId} className="relative group">
						<div className="flex items-center gap-4 mb-2">
							<div className="text-sm font-medium text-white min-w-[80px]">Vault {vault.vaultId}</div>
							<div className="text-xs text-textSecondary">{vault.totalRuns} runs total</div>
						</div>

						<div className="space-y-2">
							{/* Harvest Pattern */}
							<div className="flex items-center gap-3">
								<div className="text-xs text-textSecondary min-w-[60px]">Harvest</div>
								<div className="flex-1 h-6 bg-bgDark rounded-sm overflow-hidden flex border border-borderDark">
									{vault.harvestPattern.map((group, index) => (
										<div
											key={index}
											className={`${getPatternColor(group.type)} h-full transition-opacity hover:opacity-80`}
											style={{ width: `${group.percentage}%` }}
											title={`${group.type === "success" ? "Success" : "Failure"} streak: ${group.count} runs (${group.percentage.toFixed(
												1
											)}%)`}
										/>
									))}
								</div>
								<div className="text-xs text-textSecondary min-w-[50px]">
									{((vault.overallHarvestSuccess / vault.totalRuns) * 100).toFixed(1)}%
								</div>
							</div>

							{/* Earn Pattern */}
							<div className="flex items-center gap-3">
								<div className="text-xs text-textSecondary min-w-[60px]">Earn</div>
								<div className="flex-1 h-6 bg-bgDark rounded-sm overflow-hidden flex border border-borderDark">
									{vault.earnPattern.map((group, index) => (
										<div
											key={index}
											className={`${getPatternColor(group.type)} h-full transition-opacity hover:opacity-80`}
											style={{ width: `${group.percentage}%` }}
											title={`${group.type === "success" ? "Success" : "Failure"} streak: ${group.count} runs (${group.percentage.toFixed(
												1
											)}%)`}
										/>
									))}
								</div>
								<div className="text-xs text-textSecondary min-w-[50px]">
									{((vault.overallEarnSuccess / vault.totalRuns) * 100).toFixed(1)}%
								</div>
							</div>
						</div>

						{/* Enhanced Tooltip */}
						<div className="absolute left-0 top-full mt-2 hidden group-hover:block bg-[#151818] text-white text-xs p-4 rounded-md min-w-[300px] shadow-lg border border-[#3A3A3A] z-10">
							<div className="font-bold mb-3">Vault {vault.vaultId} Pattern Analysis</div>

							<div className="space-y-3">
								<div>
									<div className="text-green-400 font-medium mb-1">Harvest Pattern:</div>
									{vault.harvestPattern.map((group, index) => (
										<div key={index} className="text-xs ml-2">
											{group.type === "success" ? "✅" : "❌"} {group.count} consecutive{" "}
											{group.type === "success" ? "successes" : "failures"} ({group.percentage.toFixed(1)}%)
										</div>
									))}
									<div className="text-xs text-textSecondary mt-1">
										Overall: {vault.overallHarvestSuccess}/{vault.totalRuns} (
										{((vault.overallHarvestSuccess / vault.totalRuns) * 100).toFixed(1)}%)
									</div>
								</div>

								<div>
									<div className="text-blue-400 font-medium mb-1">Earn Pattern:</div>
									{vault.earnPattern.map((group, index) => (
										<div key={index} className="text-xs ml-2">
											{group.type === "success" ? "✅" : "❌"} {group.count} consecutive{" "}
											{group.type === "success" ? "successes" : "failures"} ({group.percentage.toFixed(1)}%)
										</div>
									))}
									<div className="text-xs text-textSecondary mt-1">
										Overall: {vault.overallEarnSuccess}/{vault.totalRuns} ({((vault.overallEarnSuccess / vault.totalRuns) * 100).toFixed(1)}
										%)
									</div>
								</div>

								<div className="text-textSecondary text-xs mt-3 pt-2 border-t border-borderDark">Total Runs: {vault.totalRuns}</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
