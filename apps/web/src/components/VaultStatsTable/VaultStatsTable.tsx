import { BsClipboardData } from "react-icons/bs";
import { FiExternalLink } from "react-icons/fi";
import { useState } from "react";
import useConstants from "src/hooks/useConstants";
import { useStats } from "src/hooks/useStats";
import { CHAIN_ID } from "src/types/enums";
import { customCommify } from "src/utils/common";

type SortColumn = "depositedTvl" | "platform" | "farmId" | "harvestStatus" | "earnStatus" | null;
type SortDirection = "asc" | "desc";

interface VaultStat {
    _id: string;
    id: number; //farm id
    address: string;
    name: string;
    depositedTvl: number;
    averageDeposit: number;
    numberOfDeposits: number;
    isDeprecated?: boolean;
    originPlatform: string;
    secondaryPlatform?: string;
    autoCompoundLastRunAt?: string;
    autoCompoundRunTime?: string | number;
    autoCompoundHarvestSuccess?: boolean;
    autoCompoundEarnSuccess?: boolean;
    autoCompoundStatus?: string;
    autoCompoundHarvestStatus?: string;
    autoCompoundEarnStatus?: string;
}

export const VaultStatsTable = () => {
    const { vaultStats, refetchVaultStats, isRefetchingVaultStats } = useStats();
    const { BLOCK_EXPLORER_URL } = useConstants(CHAIN_ID.BERACHAIN);
    const [sortColumn, setSortColumn] = useState<SortColumn>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

    const handleSort = (column: SortColumn) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("desc");
        }
    };

    const handleRefresh = async () => {
        try {
            await refetchVaultStats();
        } catch (error) {
            console.error("Error refreshing data:", error);
        }
    };

    const getSortedVaults = () => {
        if (!vaultStats || !sortColumn) return vaultStats as VaultStat[];

        return ([...vaultStats] as VaultStat[]).sort((a, b) => {
            let comparison = 0;

            if (sortColumn === "depositedTvl") {
                comparison = a.depositedTvl - b.depositedTvl;
            } else if (sortColumn === "platform") {
                const aPlatform = [a.originPlatform, a.secondaryPlatform].filter(Boolean).join(" | ");
                const bPlatform = [b.originPlatform, b.secondaryPlatform].filter(Boolean).join(" | ");
                comparison = aPlatform.localeCompare(bPlatform);
            } else if (sortColumn === "farmId") {
                comparison = a.id - b.id;
            } else if (sortColumn === "harvestStatus" || sortColumn === "earnStatus") {
                const isEarn = sortColumn === "earnStatus";
                const getStatus = (vault: VaultStat) => {
                    const success = isEarn ? vault.autoCompoundEarnSuccess : vault.autoCompoundHarvestSuccess;
                    const statusMsg = isEarn ? vault.autoCompoundEarnStatus : vault.autoCompoundHarvestStatus;

                    return success === undefined ? "-" : success ? "Success" : statusMsg || "Failed";
                };

                comparison = getStatus(a).localeCompare(getStatus(b));
            }

            return sortDirection === "asc" ? comparison : -comparison;
        });
    };

    const sortedVaults = getSortedVaults();

    return (
        <div className="bg-bgSecondary rounded-lg p-6 border border-borderDark text-textWhite">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <h1 className="text-2xl font-arame-mono uppercase">Vaults Stats</h1>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefetchingVaultStats}
                        className={`ml-2 mt-1 text-textWhite hover:text-textPrimary transition-colors ${
                            isRefetchingVaultStats ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        <svg
                            className={`w-4 h-4 ${isRefetchingVaultStats ? "animate-spin" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                    </button>
                </div>
                <div className="flex gap-4 text-sm text-textSecondary">
                    <div>
                        <span className="font-bold text-base">Last Run At: </span>
                        {sortedVaults?.[0]?.autoCompoundLastRunAt
                            ? new Date(sortedVaults[0].autoCompoundLastRunAt).toLocaleString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                              })
                            : "-"}
                    </div>
                    <div>
                        <span className="font-bold text-base">Run Time: </span>
                        {sortedVaults?.[0]?.autoCompoundRunTime || "-"}
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <div className="max-h-[600px] overflow-y-auto">
                    <table className="w-full table-auto">
                        <thead className="sticky top-0 z-10">
                            <tr className="text-textBlack text-left tracking-wide uppercase bg-bgPrimary border-b border-borderDark">
                                <th
                                    className="p-4 whitespace-nowrap min-w-max cursor-pointer hover:text-textSecondary"
                                    onClick={() => handleSort("farmId")}
                                >
                                    FARM ID {sortColumn === "farmId" && (sortDirection === "asc" ? "↑" : "↓")}
                                </th>{" "}
                                <th className="p-4 whitespace-nowrap min-w-max ">TITLE</th>
                                <th
                                    className="p-4 whitespace-nowrap min-w-max cursor-pointer hover:text-textSecondary"
                                    onClick={() => handleSort("platform")}
                                >
                                    PLATFORM {sortColumn === "platform" && (sortDirection === "asc" ? "↑" : "↓")}
                                </th>
                                <th
                                    className="p-4 whitespace-nowrap min-w-max cursor-pointer hover:text-textSecondary"
                                    onClick={() => handleSort("depositedTvl")}
                                >
                                    DEPOSITED TVL{" "}
                                    {sortColumn === "depositedTvl" && (sortDirection === "asc" ? "↑" : "↓")}
                                </th>
                                <th className="p-4 whitespace-nowrap min-w-max">AVERAGE DEPOSITS</th>
                                <th className="p-4 whitespace-nowrap min-w-max">NO OF DEPOSITS</th>
                                <th
                                    className="p-4 whitespace-nowrap min-w-max cursor-pointer hover:text-textSecondary"
                                    onClick={() => handleSort("harvestStatus")}
                                >
                                    HARVEST STATUS{" "}
                                    {sortColumn === "harvestStatus" && (sortDirection === "asc" ? "↑" : "↓")}
                                </th>{" "}
                                <th
                                    className="p-4 whitespace-nowrap min-w-max cursor-pointer hover:text-textSecondary"
                                    onClick={() => handleSort("earnStatus")}
                                >
                                    EARN STATUS {sortColumn === "earnStatus" && (sortDirection === "asc" ? "↑" : "↓")}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedVaults && sortedVaults.length > 0 ? (
                                sortedVaults
                                    .sort((a, b) => (a.isDeprecated ? 1 : b.isDeprecated ? -1 : 0))
                                    .map(
                                        ({
                                            id,
                                            _id,
                                            address,
                                            name,
                                            depositedTvl,
                                            averageDeposit,
                                            numberOfDeposits,
                                            isDeprecated,
                                            originPlatform,
                                            secondaryPlatform,
                                            autoCompoundLastRunAt,
                                            autoCompoundRunTime,
                                            autoCompoundHarvestSuccess,
                                            autoCompoundEarnSuccess,
                                            autoCompoundHarvestStatus,
                                            autoCompoundEarnStatus,
                                        }) => (
                                            <tr
                                                key={_id}
                                                className="border-b border-borderDark hover:bg-bgDark transition-colors"
                                            >
                                                <td className="p-4 whitespace-nowrap min-w-max">{id}</td>
                                                <td className="p-4 whitespace-nowrap min-w-max">
                                                    <div className="flex items-center gap-2 group relative">
                                                        <p>
                                                            {name}{" "}
                                                            {isDeprecated ? (
                                                                <span className="text-red-500">Deprecated</span>
                                                            ) : (
                                                                ""
                                                            )}
                                                        </p>
                                                        <span className="invisible group-hover:visible absolute left-0 top-full z-10 bg-bgDark p-2 rounded-md border border-borderDark text-sm ">
                                                            {address}
                                                        </span>
                                                        <FiExternalLink
                                                            size={16}
                                                            className="cursor-pointer hover:text-textPrimary"
                                                            onClick={() =>
                                                                window.open(
                                                                    `${BLOCK_EXPLORER_URL}/address/${address}`,
                                                                    "_blank"
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </td>
                                                <td className="p-4 whitespace-nowrap min-w-max ">
                                                    {[originPlatform, secondaryPlatform].filter(Boolean).join(" | ")}
                                                </td>
                                                <td className="p-4 whitespace-nowrap min-w-max ">
                                                    {customCommify(depositedTvl, {
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 2,
                                                        showDollarSign: true,
                                                    })}
                                                </td>
                                                <td className="p-4 whitespace-nowrap min-w-max ">
                                                    {customCommify(averageDeposit, {
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 2,
                                                        showDollarSign: true,
                                                    })}
                                                </td>
                                                <td className="p-4 whitespace-nowrap min-w-max ">
                                                    {customCommify(numberOfDeposits, {
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 0,
                                                        showDollarSign: false,
                                                    })}
                                                </td>
                                                <td className="p-4 whitespace-nowrap min-w-max ">
                                                    {autoCompoundHarvestSuccess === undefined
                                                        ? "-"
                                                        : autoCompoundHarvestSuccess
                                                        ? "Success"
                                                        : autoCompoundHarvestStatus || "Failed"}
                                                </td>
                                                <td className="p-4 whitespace-nowrap min-w-max ">
                                                    {autoCompoundEarnSuccess === undefined
                                                        ? "-"
                                                        : autoCompoundEarnSuccess
                                                        ? "Success"
                                                        : autoCompoundEarnStatus || "Failed"}
                                                </td>
                                            </tr>
                                        )
                                    )
                            ) : (
                                <tr>
                                    <td colSpan={8}>
                                        <EmptyTable />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="border-t border-borderDark">
                                <td colSpan={8}></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

const EmptyTable = () => {
    return (
        <div className="flex flex-col items-center justify-center py-8 gap-y-2 text-lg">
            <BsClipboardData size={36} />
            <p className="mt-4">No Data Available</p>
            <p className="text-textSecondary">Change the filter setting to see data.</p>
        </div>
    );
};

