import React from 'react';
import { formatDate } from "src/utils/common";

// Structure of each runData item
interface RunDataItem {
    CumulativeAutoCompound: {
        percentage: number;
        succeeded: number;
        failed: number;
        colorClass: string;
        tooltip: string;
    };
    harvest: {
        percentage: number;
        succeeded: number;
        failed: number;
        colorClass: string;
        tooltip: string;
    };
    earn: {
        percentage: number;
        succeeded: number;
        failed: number;
        colorClass: string;
        tooltip: string;
    };
    lastFinishedAt: string;
    status: string;
}

// Props for the StatsGraph component
interface StatsGraphProps {
    type: "harvest" | "earn" | "CumulativeAutoCompound";
    title: string;
    runData: RunDataItem[];
}

/**
 * Renders a GitHub-style contribution graph for auto-compound run data.
 */
export const StatsGraph: React.FC<StatsGraphProps> = ({ type, title, runData }): React.JSX.Element => {
    return (
        <div className="bg-bgDark rounded-lg p-4 border border-borderDark">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-white font-medium">{title}</h4>
                <div className="text-xs text-textSecondary">{runData.length} runs total</div>
            </div>

            {/* Stats grid */}
            <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                    {runData.length === 0 ? (
                        <div className="w-full text-center text-textSecondary py-8">No data available</div>
                    ) : (
                        runData.map((data, index) => {
                            const boxData = data[type];
                            const isBlockchainError = boxData.tooltip.toLowerCase().includes("reverted") ||
                                                     boxData.tooltip.toLowerCase().includes("blockchain error");
                            
                            return (
                                <div
                                    key={index}
                                    className={`w-3 h-3 rounded-sm ${boxData.colorClass} group relative cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-white hover:ring-opacity-50`}
                                >
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-bgDark text-white text-xs p-2 rounded-md z-10 min-w-[200px] shadow-lg border border-borderDark">
                                        <div className="font-bold mb-1">{formatDate(data.lastFinishedAt)}</div>
                                        {isBlockchainError && (
                                            <div className="text-orange-400 mb-1 font-semibold">
                                                ⚠️ Blockchain Error Detected
                                            </div>
                                        )}
                                        {boxData.tooltip.split(", ").map((line: string, i: number) => {
                                            const lowerLine = line.toLowerCase();
                                            let color = "text-white";
                                            if (lowerLine.includes("succeeded")) {
                                                color = "text-green-400";
                                            } else if (lowerLine.includes("failed")) {
                                                color = isBlockchainError ? "text-orange-400" : "text-red-400";
                                            }
                                            return (
                                                <div key={i} className={color}>
                                                    {line}
                                                </div>
                                            );
                                        })}
                                        <div
                                            className={`mt-1 ${
                                                data.status === "success"
                                                    ? "text-green-400"
                                                    : data.status === "error"
                                                    ? "text-red-600"
                                                    : "text-textSecondary"
                                            }`}
                                        >
                                            Status: {data.status}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};