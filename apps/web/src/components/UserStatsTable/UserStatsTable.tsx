import { FC } from "react";
import { useStats } from "src/hooks/useStats";
import { customCommify } from "src/utils/common";
import useConstants from "src/hooks/useConstants";
import { FiExternalLink } from "react-icons/fi";
import { BsClipboardData } from "react-icons/bs";
import { CHAIN_ID, UsersTableColumns } from "src/types/enums";
import { FaArrowDown, FaArrowLeft, FaArrowRight, FaSearch } from "react-icons/fa";
import { v4 as uuid } from "uuid";

export const UserStatsTable: FC = () => {
    const {
        userTVLs,
        page,
        setPage,
        hasNextPage,
        hasPrevPage,
        totalPages,
        sortBy,
        setSortBy,
        order,
        setOrder,
        search,
        setSearch,
    } = useStats();
    const { BLOCK_EXPLORER_URL } = useConstants(CHAIN_ID.BERACHAIN);

    const handleSorting = (column: UsersTableColumns) => {
        if (column === sortBy) {
            if (order === "") setOrder("-");
            else setOrder("");
        } else setSortBy(column);
    };

    return (
        <div className="bg-bgSecondary rounded-lg p-6 border border-borderDark">
            <h1 className="text-textWhite text-2xl mb-6 font-arame-mono uppercase">Users Stats</h1>
            <div className="overflow-x-auto">
                <div className="max-h-[600px] overflow-y-auto">
                <table className="w-full min-w-[1000px]">
                    <thead className="sticky top-0 z-10">
                        <tr className="text-left tracking-wide uppercase bg-bgPrimary border-b border-borderDark">
                            <th className="p-4 w-[140px]">
                                <div
                                    className="flex items-center gap-2 cursor-pointer"
                                    onClick={() => handleSorting(UsersTableColumns.Address)}
                                >
                                    ADDRESS
                                    {sortBy === UsersTableColumns.Address && (
                                        <FaArrowDown
                                            size={14}
                                            className={`transition-transform duration-200 ${
                                                order === "" ? "" : "rotate-180"
                                            }`}
                                        />
                                    )}
                                </div>
                            </th>
                            <th className="p-4 w-[140px]">
                                <div>REFERRER</div>
                            </th>
                            <th className="p-4">
                                <div
                                    className="flex items-center gap-2 cursor-pointer"
                                    onClick={() => handleSorting(UsersTableColumns.TVL)}
                                >
                                    TVL
                                    {sortBy === UsersTableColumns.TVL && (
                                        <FaArrowDown
                                            size={14}
                                            className={`transition-transform duration-200 ${
                                                order === "" ? "" : "rotate-180"
                                            }`}
                                        />
                                    )}
                                </div>
                            </th>
                            <th className="p-4">
                                <div
                                    className="flex items-center gap-2 cursor-pointer"
                                    onClick={() => handleSorting(UsersTableColumns.TraxEarned)}
                                >
                                    BTX points
                                    {sortBy === UsersTableColumns.TraxEarned && (
                                        <FaArrowDown
                                            size={14}
                                            className={`transition-transform duration-200 ${
                                                order === "" ? "" : "rotate-180"
                                            }`}
                                        />
                                    )}
                                </div>
                            </th>
                            <th className="p-4">
                                <div
                                    className="flex items-center gap-2 cursor-pointer"
                                    onClick={() => handleSorting(UsersTableColumns.TraxEarnedRefferal)}
                                >
                                    Ref. Points
                                    {sortBy === UsersTableColumns.TraxEarnedRefferal && (
                                        <FaArrowDown
                                            size={14}
                                            className={`transition-transform duration-200 ${
                                                order === "" ? "" : "rotate-180"
                                            }`}
                                        />
                                    )}
                                </div>
                            </th>
                            <th className="p-4">
                                <div
                                    className="flex items-center gap-2 cursor-pointer"
                                    onClick={() => handleSorting(UsersTableColumns.Multiplier)}
                                >
                                    Multiplier
                                    {sortBy === UsersTableColumns.Multiplier && (
                                        <FaArrowDown
                                            size={14}
                                            className={`transition-transform duration-200 ${
                                                order === "" ? "" : "rotate-180"
                                            }`}
                                        />
                                    )}
                                </div>
                            </th>
                            <th className="p-4">
                                <div
                                    className="flex items-center gap-2 cursor-pointer"
                                    onClick={() => handleSorting(UsersTableColumns.ReferralCount)}
                                >
                                    # of Referrals
                                    {sortBy === UsersTableColumns.ReferralCount && (
                                        <FaArrowDown
                                            size={14}
                                            className={`transition-transform duration-200 ${
                                                order === "" ? "" : "rotate-180"
                                            }`}
                                        />
                                    )}
                                </div>
                            </th>
                            <th className="p-4">
                                <div>Code</div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="text-textWhite">
                        {userTVLs && userTVLs.length > 0 ? (
                            userTVLs.map(
                                ({
                                    id,
                                    address,
                                    tvl,
                                    accountInfo,
                                    earnedTrax,
                                    earnedTraxByReferral,
                                    referralCount,
                                    boosts,
                                }) => (
                                    <tr
                                        key={uuid()}
                                        className="border-b border-borderDark hover:bg-bgDark transition-colors"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 group relative">
                                                <p>
                                                    {`${address?.substring(0, 4)}...${address?.substring(
                                                        address.length - 3
                                                    )}`}
                                                </p>
                                                <span className="invisible group-hover:visible absolute left-0 top-full z-10 bg-bgDark p-2 rounded-md border border-borderDark text-sm text-textWhite">
                                                    {address}
                                                </span>
                                                <FiExternalLink
                                                    size={16}
                                                    className="text-textWhite cursor-pointer hover:text-textPrimary"
                                                    onClick={() =>
                                                        window.open(
                                                            `${BLOCK_EXPLORER_URL}/address/${address}`,
                                                            "_blank"
                                                        )
                                                    }
                                                />
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {accountInfo && accountInfo.referrer ? (
                                                <div className="flex items-center gap-2 group relative">
                                                    <p>
                                                        {`${accountInfo.referrer.address?.substring(
                                                            0,
                                                            4
                                                        )}...${accountInfo.referrer.address?.substring(
                                                            accountInfo.referrer.address.length - 3
                                                        )}`}
                                                    </p>
                                                    <span className="invisible group-hover:visible absolute left-0 top-full z-10 bg-bgDark p-2 rounded-md border border-borderDark text-sm text-textWhite">
                                                        {accountInfo.referrer.address}
                                                    </span>
                                                    <FiExternalLink
                                                        size={16}
                                                        className="text-textWhite cursor-pointer hover:text-textPrimary"
                                                        onClick={() =>
                                                            window.open(
                                                                `${BLOCK_EXPLORER_URL}/address/${accountInfo.referrer?.address}`,
                                                                "_blank"
                                                            )
                                                        }
                                                    />
                                                </div>
                                            ) : (
                                                <div>-</div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {customCommify(tvl, {
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 2,
                                                showDollarSign: true,
                                            })}
                                        </td>
                                        <td className="p-4">{Number(earnedTrax).toLocaleString("en-us")}</td>
                                        <td className="p-4">{Number(earnedTraxByReferral).toLocaleString("en-us")}</td>
                                        <td className="p-4">
                                            {boosts.length > 0
                                                ? [...new Set(boosts)].map((boost, index) => (
                                                      <span key={index} className="block">
                                                          {boost === "NFT" ? "x2" : "-"}
                                                      </span>
                                                  ))
                                                : "-"}
                                        </td>
                                        <td className="p-4">{Number(referralCount)}</td>
                                        <td className="p-4">{accountInfo?.referralCode || "-"}</td>
                                    </tr>
                                )
                            )
                        ) : (
                            <tr>
                                <td colSpan={6}>
                                    <EmptyTable />
                                </td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr className="border-t border-borderDark text-textWhite">
                            <td className="p-4">
                                <div className="flex items-center gap-2">
                                    <FaSearch />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => {
                                            setPage(1);
                                            setSearch(e.target.value);
                                        }}
                                        className="bg-transparent border border-borderDark rounded px-2 py-1"
                                        placeholder="Search..."
                                    />
                                </div>
                            </td>
                            <td colSpan={5} className="p-4">
                                <div className="flex items-center justify-end gap-4">
                                    {hasPrevPage && (
                                        <FaArrowLeft
                                            className="cursor-pointer hover:text-textPrimary"
                                            onClick={() => setPage((prev) => prev - 1)}
                                        />
                                    )}
                                    <p>
                                        Page {page} of {totalPages}
                                    </p>
                                    {hasNextPage && (
                                        <FaArrowRight
                                            className="cursor-pointer hover:text-textPrimary"
                                            onClick={() => setPage((prev) => prev + 1)}
                                        />
                                    )}
                                </div>
                            </td>
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
