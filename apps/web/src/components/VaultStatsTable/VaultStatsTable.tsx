import { BsClipboardData } from "react-icons/bs";
import { FiExternalLink } from "react-icons/fi";
import useConstants from "src/hooks/useConstants";
import { useStats } from "src/hooks/useStats";
import { CHAIN_ID } from "src/types/enums";
import { customCommify } from "src/utils/common";

export const VaultStatsTable = () => {
    const { vaultStats } = useStats();
    const { BLOCK_EXPLORER_URL } = useConstants(CHAIN_ID.BERACHAIN);

    return (
        <div className="bg-bgSecondary rounded-lg p-6 border border-borderDark text-textWhite">
            <h1 className="text-2xl mb-6 font-arame-mono uppercase">Vaults Stats</h1>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                    <thead>
                        <tr className="text-textBlack text-left tracking-wide uppercase bg-bgPrimary border-b border-borderDark">
                            <th className="p-4 w-[200px]">TITLE</th>
                            <th className="p-4">PLATFORM</th>
                            <th className="p-4">DEPOSITED TVL</th>
                            <th className="p-4">AVERAGE DEPOSITS</th>
                            <th className="p-4">NO OF DEPOSITS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vaultStats && vaultStats.length > 0 ? (
                            vaultStats
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
