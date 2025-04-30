import { BsClipboardData } from "react-icons/bs";
import { FiExternalLink } from "react-icons/fi";
import { useState } from "react";
import useConstants from "src/hooks/useConstants";
import { useStats } from "src/hooks/useStats";
import { CHAIN_ID } from "src/types/enums";
import { customCommify } from "src/utils/common";

type SortColumn = "depositedTvl" | "platform" | null;
type SortDirection = "asc" | "desc";

export const VaultStatsTable = () => {
    const { vaultStats } = useStats();
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

    const getSortedVaults = () => {
        if (!vaultStats || !sortColumn) return vaultStats;

        return [...vaultStats].sort((a, b) => {
            let comparison = 0;

            if (sortColumn === "depositedTvl") {
                comparison = a.depositedTvl - b.depositedTvl;
            } else if (sortColumn === "platform") {
                const aPlatform = [a.originPlatform, a.secondaryPlatform].filter(Boolean).join(" | ");
                const bPlatform = [b.originPlatform, b.secondaryPlatform].filter(Boolean).join(" | ");
                comparison = aPlatform.localeCompare(bPlatform);
            }

            return sortDirection === "asc" ? comparison : -comparison;
        });
    };

    const sortedVaults = getSortedVaults();

    return (
        <div className="bg-bgSecondary rounded-lg p-6 border border-borderDark text-textWhite">
            <h1 className="text-2xl mb-6 font-arame-mono uppercase">Vaults Stats</h1>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                    <thead>
                        <tr className="text-textBlack text-left tracking-wide uppercase bg-bgPrimary border-b border-borderDark">
                            <th className="p-4 w-[200px]">TITLE</th>
                            <th
                                className="p-4 cursor-pointer hover:text-textSecondary"
                                onClick={() => handleSort("platform")}
                            >
                                PLATFORM {sortColumn === "platform" && (sortDirection === "asc" ? "↑" : "↓")}
                            </th>
                            <th
                                className="p-4 cursor-pointer hover:text-textSecondary"
                                onClick={() => handleSort("depositedTvl")}
                            >
                                DEPOSITED TVL {sortColumn === "depositedTvl" && (sortDirection === "asc" ? "↑" : "↓")}
                            </th>
                            <th className="p-4">AVERAGE DEPOSITS</th>
                            <th className="p-4">NO OF DEPOSITS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedVaults && sortedVaults.length > 0 ? (
                            sortedVaults
                                .sort((a, b) => (a.isDeprecated ? 1 : b.isDeprecated ? -1 : 0))
                                .map(
                                    ({
                                        _id,
                                        address,
                                        name,
                                        depositedTvl,
                                        averageDeposit,
                                        numberOfDeposits,
                                        isDeprecated,
                                        originPlatform,
                                        secondaryPlatform,
                                    }) => (
                                        <tr
                                            key={_id}
                                            className="border-b border-borderDark hover:bg-bgDark transition-colors"
                                        >
                                            <td className="p-4">
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
                                            <td className="p-4 ">
                                                {[originPlatform, secondaryPlatform].filter(Boolean).join(" | ")}
                                            </td>
                                            <td className="p-4 ">
                                                {customCommify(depositedTvl, {
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 2,
                                                    showDollarSign: true,
                                                })}
                                            </td>
                                            <td className="p-4 ">
                                                {customCommify(averageDeposit, {
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 2,
                                                    showDollarSign: true,
                                                })}
                                            </td>
                                            <td className="p-4 ">
                                                {customCommify(numberOfDeposits, {
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 0,
                                                    showDollarSign: false,
                                                })}
                                            </td>
                                        </tr>
                                    )
                                )
                        ) : (
                            <tr>
                                <td colSpan={4}>
                                    <EmptyTable />
                                </td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr className="border-t border-borderDark">
                            <td colSpan={4}></td>
                        </tr>
                    </tfoot>
                </table>
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

