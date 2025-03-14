import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatUnits } from "viem";
import { formatDistance } from "date-fns";
import { FiExternalLink } from "react-icons/fi";
import pools from "src/config/constants/pools_json";
import { CHAIN_ID } from "src/types/enums";
import { customCommify } from "src/utils/common";
import { Skeleton } from "src/components/Skeleton/Skeleton";
import { useConstants } from "@beratrax/core/src/hooks";
import useTokens from "src/state/tokens/useTokens";
import { EARNINGS_GRAPH_URL } from "src/config/constants";

const ITEMS_PER_PAGE = 100;

// GraphQL query
const WITHDRAWALS_QUERY = `
  query GetWithdrawals($timestamp: String!, $first: Int!, $skip: Int!) {
    withdraws(
      where: {blockTimestamp_gt: $timestamp}, 
      first: $first, 
      skip: $skip,
      orderBy: blockTimestamp,
      orderDirection: desc
    ) {
      tokenName
      blockTimestamp
      userBalance
      shares
      from
      id
      tokenId
      platformName
    }
  }
`;

interface Withdrawal {
    tokenName: string;
    blockTimestamp: string;
    userBalance: string;
    shares: string;
    from: string;
    id: string;
    tokenId: string;
    platformName: string;
}

const TableSkeleton = () => (
    <div className="animate-pulse">
        <div className="flex flex-col gap-6 tablet:flex-row tablet:justify-between tablet:items-center mb-6">
            <div className="w-48 h-[72px] bg-bgDark rounded-md"></div>
            <div className="flex gap-6 bg-bgDark p-4 rounded-lg w-[300px] h-[72px]"></div>
        </div>

        <div className="flex justify-end mb-4">
            <div className="flex gap-2">
                <div className="w-24 h-10 bg-bgDark rounded-md"></div>
                <div className="w-24 h-10 bg-bgDark rounded-md"></div>
                <div className="w-24 h-10 bg-bgDark rounded-md"></div>
            </div>
        </div>

        <div className="overflow-x-auto relative rounded-lg border border-borderDark bg-bgSecondary">
            <table className="w-full">
                <thead className="border-b border-borderDark bg-bgDark">
                    <tr>
                        {[...Array(7)].map((_, i) => (
                            <th key={i} className="px-6 py-4">
                                <div className="h-4 bg-bgSecondary rounded w-20"></div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {[...Array(5)].map((_, i) => (
                        <tr key={i} className="border-b border-borderDark">
                            {[...Array(7)].map((_, j) => (
                                <td key={j} className="px-6 py-4">
                                    <div className="h-4 bg-bgDark rounded w-full"></div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const Withdrawals = () => {
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [currentPage, setCurrentPage] = useState(1);
    const { prices } = useTokens();
    const { BLOCK_EXPLORER_URL } = useConstants(CHAIN_ID.BERACHAIN);

    const calculateShareValue = (shares: string, farmId: string) => {
        const farm = pools.find((p) => p.id === parseInt(farmId));
        if (!farm) return 0;
        if (!prices[farm.chainId]?.[farm.vault_addr]) {
            return 0;
        }
        const vaultPrice = prices[farm.chainId][farm.vault_addr];
        const shareAmount = parseFloat(formatUnits(BigInt(shares), 18));
        return shareAmount * vaultPrice;
    };

    const fetchWithdrawals = async (timestamp: string, page: number) => {
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const response = await fetch(EARNINGS_GRAPH_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: WITHDRAWALS_QUERY,
                variables: {
                    timestamp: (new Date(timestamp).getTime() / 1000).toString(),
                    first: ITEMS_PER_PAGE,
                    skip,
                },
            }),
        });
        const data = await response.json();
        return data.data.withdraws;
    };

    const calculateTotalValue = (withdrawals: Withdrawal[]) => {
        return withdrawals.reduce((total, withdrawal) => {
            return total + calculateShareValue(withdrawal.shares, withdrawal.tokenId);
        }, 0);
    };

    const {
        data: withdrawals,
        isLoading,
        error,
    } = useQuery<Withdrawal[]>({
        queryKey: ["withdrawals", selectedDate, currentPage],
        queryFn: () => fetchWithdrawals(selectedDate, currentPage),
    });

    if (isLoading) return <TableSkeleton />;
    if (error) return <div className="text-red-500 text-lg">Error loading withdrawals</div>;

    const totalValue = withdrawals ? calculateTotalValue(withdrawals) : 0;

    return (
        <div className="p-6 text-textWhite">
            <div className="mb-6 flex flex-col gap-6 tablet:flex-row tablet:justify-between tablet:items-center">
                <div className="relative">
                    <label className="block text-sm font-medium mb-2 text-textSecondary">Filter by date</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="block w-48 px-3 py-2 bg-bgSecondary border border-borderDark rounded-md 
                        text-textWhite focus:outline-none focus:ring-1 focus:ring-textPrimary focus:border-borderLight
                        font-league-spartan"
                    />
                </div>

                <div className="flex gap-6 bg-bgDark p-4 rounded-lg border border-borderDark">
                    <div className="flex flex-col">
                        <span className="text-sm text-textSecondary mb-1">Total Withdrawals</span>
                        <span className="text-xl font-medium text-textWhite">{withdrawals?.length || 0}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm text-textSecondary mb-1">Total Value</span>
                        <span className="text-xl font-medium text-textPrimary">${customCommify(totalValue)}</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-end mb-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-md border font-medium transition-colors duration-200
                            ${
                                currentPage === 1
                                    ? "border-borderDark text-textSecondary cursor-not-allowed"
                                    : "border-borderLight text-textWhite hover:bg-bgDark"
                            }`}
                    >
                        Previous
                    </button>
                    <div className="flex items-center px-4 py-2 bg-bgDark rounded-md border border-borderDark">
                        <span className="text-textSecondary">Page</span>
                        <span className="mx-2 text-textWhite">{currentPage}</span>
                    </div>
                    <button
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        disabled={!withdrawals || withdrawals.length < ITEMS_PER_PAGE}
                        className={`px-4 py-2 rounded-md border font-medium transition-colors duration-200
                            ${
                                !withdrawals || withdrawals.length < ITEMS_PER_PAGE
                                    ? "border-borderDark text-textSecondary cursor-not-allowed"
                                    : "border-borderLight text-textWhite hover:bg-bgDark"
                            }`}
                    >
                        Next
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto relative rounded-lg border border-borderDark bg-bgSecondary">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase border-b border-borderDark bg-bgDark">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-league-spartan text-textSecondary">
                                Token
                            </th>
                            <th scope="col" className="px-6 py-4 font-league-spartan text-textSecondary">
                                Platform
                            </th>
                            <th scope="col" className="px-6 py-4 font-league-spartan text-textSecondary">
                                Time
                            </th>
                            <th scope="col" className="px-6 py-4 font-league-spartan text-textSecondary">
                                Account
                            </th>
                            <th scope="col" className="px-6 py-4 text-right font-league-spartan text-textSecondary">
                                Shares
                            </th>
                            <th scope="col" className="px-6 py-4 text-right font-league-spartan text-textSecondary">
                                Value ($)
                            </th>
                            <th scope="col" className="px-6 py-4 text-right font-league-spartan text-textSecondary">
                                Balance at withdrawal
                            </th>
                        </tr>
                    </thead>
                    <tbody className="font-league-spartan">
                        {withdrawals?.map((withdrawal) => {
                            const shareValue = calculateShareValue(withdrawal.shares, withdrawal.tokenId);
                            return (
                                <tr
                                    key={withdrawal.id}
                                    className="border-b border-borderDark hover:bg-bgDark transition-colors duration-200"
                                >
                                    <td className="px-6 py-4 text-textWhite">{withdrawal.tokenName}</td>
                                    <td className="px-6 py-4 text-textWhite">{withdrawal.platformName}</td>
                                    <td className="px-6 py-4 text-textSecondary">
                                        {formatDistance(
                                            new Date(parseInt(withdrawal.blockTimestamp) * 1000),
                                            new Date(),
                                            { addSuffix: true }
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="group">
                                                <p className="font-mono text-textPrimary cursor-default">
                                                    {`${withdrawal.from.slice(0, 6)}...${withdrawal.from.slice(-4)}`}
                                                </p>
                                                <div
                                                    className="fixed invisible group-hover:visible z-50 
                                                    transform -translate-x-1/2 translate-y-2
                                                    bg-bgDark px-3 py-2 rounded-md border border-borderDark 
                                                    text-sm text-textWhite whitespace-nowrap"
                                                >
                                                    {withdrawal.from}
                                                    <div
                                                        className="absolute -top-1 left-1/2 -translate-x-1/2 
                                                        border-x-[6px] border-x-transparent 
                                                        border-b-[6px] border-b-borderDark"
                                                    />
                                                </div>
                                            </div>
                                            <FiExternalLink
                                                size={16}
                                                className="text-textWhite cursor-pointer hover:text-textPrimary shrink-0"
                                                onClick={() =>
                                                    window.open(
                                                        `${BLOCK_EXPLORER_URL}/address/${withdrawal.from}`,
                                                        "_blank"
                                                    )
                                                }
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-textWhite">
                                        {customCommify(parseFloat(formatUnits(BigInt(withdrawal.shares), 18)))}
                                    </td>
                                    <td className="px-6 py-4 text-right text-textPrimary">
                                        ${customCommify(shareValue)}
                                    </td>
                                    <td className="px-6 py-4 text-right text-textWhite">
                                        {customCommify(parseFloat(formatUnits(BigInt(withdrawal.userBalance), 18)))}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Withdrawals;
