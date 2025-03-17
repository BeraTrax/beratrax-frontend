import { FC, useEffect, useState, useMemo } from "react";
import { BsClipboardData } from "react-icons/bs";
import { FaSearch } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import { IoChevronDownOutline, IoChevronUpOutline } from "react-icons/io5";
import leaderboardtablepetalbrown from "src/assets/images/leaderboardtablepetalbrown.svg";
import leaderboardtablepetalgrey from "src/assets/images/leaderboardtablepetalgrey.svg";
import leaderboardtablepetalyellow from "src/assets/images/leaderboardtablepetalyellow.svg";
import { useConstants } from "@beratrax/core/src/hooks";
import { useStats } from "@beratrax/core/src/hooks";
import { CHAIN_ID, UsersTableColumns } from "src/types/enums";
import { customCommify } from "src/utils/common";

const selectRandomPetal = () => {
  const petals = [leaderboardtablepetalbrown, leaderboardtablepetalyellow, leaderboardtablepetalgrey];
  return petals[Math.floor(Math.random() * petals.length)];
};

const SkeletonRow = () => {
  return (
    <div className="rounded-2xl bg-bgDark px-4 py-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Rank skeleton */}
          <div className="w-8 h-6 bg-bgSecondary animate-pulse rounded"></div>
          {/* Petal skeleton */}
          <div className="w-6 h-6 bg-bgSecondary animate-pulse rounded-full"></div>
          {/* Address skeleton */}
          <div className="w-32 h-6 bg-bgSecondary animate-pulse rounded"></div>
        </div>
        {/* Points skeleton */}
        <div className="flex items-center gap-2">
          <div className="w-24 h-6 bg-bgSecondary animate-pulse rounded"></div>
          <div className="w-10 h-10 bg-bgSecondary animate-pulse rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};

export const ReferralLeaderboardTable: FC = () => {
  const {
    userTVLs,
    userPosition,
    page,
    limit,
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
    isLoading,
  } = useStats();

  const isCurrentUserInTable = userTVLs?.some(
    (userTVL) => userTVL.address.toLowerCase() === userPosition?.address.toLowerCase()
  );

  const allEntries = useMemo(() => {
    if (!userTVLs) return [];
    if (!userPosition || isCurrentUserInTable || search) return userTVLs;

    return [
      ...userTVLs,
      {
        ...userPosition,
      },
    ];
  }, [userTVLs, userPosition, isCurrentUserInTable]);

  const handleSorting = (column: UsersTableColumns) => {
    if (column === sortBy) {
      if (order === "") setOrder("-");
      else setOrder("");
    } else setSortBy(column);
  };

  useEffect(() => {
    // setSortBy(UsersTableColumns.TraxEarned);
    setSortBy(UsersTableColumns.ReferralCountWithNonZeroStake);
    setOrder("-");
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* User Position */}
      <UserPositionRow userPosition={userPosition} />

      {/* TABLE HEADING */}
      <div
        style={{
          backgroundImage: "linear-gradient(0deg, #72B21F33, #72B21F00)",
        }}
        className="text-xs sm:text-base py-6 px-8 rounded-2xl users_table_heading flex items-center grow"
      >
        <p className="uppercase w-20">Rank</p>
        <p className="uppercase w-32">User</p>
        <div className="flex gap-3 grow justify-end items-center">
          <p className="uppercase"># of Referrals</p>
        </div>
      </div>

      {/* TABLE ROW */}
      <div className="text-textWhite flex flex-col gap-2">
        {isLoading ? (
          // Show 5 skeleton rows while loading
          [...Array(5)].map((_, index) => <SkeletonRow key={index} />)
        ) : allEntries.length > 0 && page && limit ? (
          allEntries.map((userTVL, index) => {
            const isCurrentUser = userPosition?.address.toLowerCase() === userTVL.address.toLowerCase();
            return (
              <StatsTableRow
                key={userTVL.id}
                index={userTVL.referralRanking}
                isCurrentUser={isCurrentUser}
                {...userTVL}
              />
            );
          })
        ) : (
          <EmptyTable />
        )}
      </div>

      {/* Search Bar and Pagination */}
      <div className="flex flex-col gap-4 mt-4">
        {/* Search Bar */}
        <div className="flex items-center gap-2 bg-bgDark rounded-2xl px-4 py-4">
          <FaSearch className="text-textWhite" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="bg-transparent w-full text-textWhite text-sm focus:outline-none"
            placeholder="Search Address..."
          />
        </div>

        {/* Pagination */}
        {/* <div className="flex items-center justify-center gap-4">
                    <button
                        disabled={!hasPrevPage}
                        onClick={() => setPage((prev) => prev - 1)}
                        className={`px-4 py-2 rounded-xl ${
                            hasPrevPage
                                ? "bg-bgDark hover:bg-gradientPrimary hover:text-textBlack cursor-pointer"
                                : "bg-buttonDisabled opacity-50 cursor-not-allowed"
                        } transition-all duration-200`}
                    >
                        Previous
                    </button>

                    <span className="text-textWhite px-4">
                        {page} / {totalPages}
                    </span>

                    <button
                        disabled={!hasNextPage}
                        onClick={() => setPage((prev) => prev + 1)}
                        className={`px-4 py-2 rounded-xl ${
                            hasNextPage
                                ? "bg-bgDark hover:bg-gradientPrimary hover:text-textBlack cursor-pointer"
                                : "bg-buttonDisabled opacity-50 cursor-not-allowed"
                        } transition-all duration-200`}
                    >
                        Next
                    </button>
                </div> */}
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

const StatsTableRow = ({ isCurrentUser, ...props }: { isCurrentUser?: boolean } & Record<any, any>) => {
  const { BLOCK_EXPLORER_URL } = useConstants(CHAIN_ID.BERACHAIN);
  const [open, setOpen] = useState(false);

  const {
    address,
    earnedTrax,
    earnedTraxByReferral,
    tvl,
    accountInfo,
    index,
    referralCount,
    referralCountWithNonZeroStake,
  } = props;

  const gradientClasses = isCurrentUser
    ? "bg-gradient-to-r from-buttonPrimary to-gradientSecondary animate-pulse-slow"
    : "bg-bgDark";

  return (
    <div className={`rounded-2xl px-4 cursor-pointer ${gradientClasses}`}>
      <div
        className={`${
          open && !isCurrentUser && "border-b-2 border-bgSecondary"
        } py-6 flex justify-between items-center`}
        onClick={() => setOpen(!open)}
      >
        {/* NUMBERING AND ADDRESS */}
        <div className="flex justify-between gap-4 cursor-pointer">
          {/* address and external link icon */}
          <div className="flex items-center gap-2 group relative">
            <p className="mx-3">{index}</p>
            <img src={selectRandomPetal()} alt="petal" />
            <p>
              {accountInfo
                ? accountInfo.referralCode
                : `${address?.substring(0, 4)}...${address?.substring(address.length - 3)}`}
            </p>
            {/* hover address visible */}
            <span className="invisible group-hover:visible absolute left-0 top-full z-10 bg-bgDark p-2 rounded-md border border-borderDark text-sm text-textWhite">
              {address}
            </span>
            <FiExternalLink
              size={16}
              className="text-textWhite cursor-pointer hover:text-textPrimary"
              onClick={() => window.open(`${BLOCK_EXPLORER_URL}/address/${address}`, "_blank")}
            />
          </div>
        </div>

        {/* Chevron Icon to open and close the transaction details */}
        <div className=" flex justify-center items-center gap-x-2">
          <p>{referralCountWithNonZeroStake}</p>
          <div
            className={`flex-shrink-0 relative w-10 h-10 rounded-xl flex justify-center items-center ${
              open ? "bg-gradientSecondary" : "bg-bgSecondary"
            }`}
          >
            {open ? (
              <IoChevronUpOutline className="text-buttonPrimaryLight w-5 h-5" />
            ) : (
              <IoChevronDownOutline className="text-buttonPrimaryLight w-5 h-5" />
            )}
          </div>
        </div>
      </div>

      {/* row details dropdown */}
      <div className="overflow-hidden transition-all duration-300 ease-in-out">
        <div
          className={`transform ${
            open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          } transition-all duration-300 ease-in-out`}
        >
          <div className={`p-6 rounded-lg ${isCurrentUser ? "bg-black/30" : "bg-black"}`}>
            {/* Grid layout */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Referrer */}
              <div>
                <p className="text-xs uppercase text-gray-400">Wallet Address</p>
                {address ? (
                  <div className="text-lg flex items-center gap-x-2">
                    <img src={selectRandomPetal()} alt="petal" />
                    <div className="flex items-center gap-2 group relative">
                      <p>{`${address?.substring(0, 4)}...${address?.substring(address.length - 3)}`}</p>
                      <span
                        onClick={() => window.open(`${BLOCK_EXPLORER_URL}/address/${address}`, "_blank")}
                        className="invisible group-hover:visible absolute left-0 top-full z-10 bg-bgDark p-2 rounded-md border border-borderDark text-sm text-textWhite"
                      >
                        {address}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>-</div>
                )}
              </div>

              {/* TLV */}
              <div>
                <p className="text-xs uppercase text-gray-400">Staking Points</p>
                <p className="text-lg font-medium">
                  {customCommify(earnedTrax, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 5,
                    showDollarSign: false,
                  })}
                </p>
              </div>

              {/* Referrer Points */}
              <div>
                <p className="text-xs uppercase text-gray-400">Referral Points</p>
                <p className="text-lg"> {Number(earnedTraxByReferral).toLocaleString("en-us")}</p>
              </div>

              {/* BTX Points */}
              <div>
                <p className="text-xs uppercase text-gray-400"># of Referrals</p>
                <p className="text-lg"> {referralCountWithNonZeroStake}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserPositionRow = ({ userPosition }: { userPosition: any }) => {
  const { BLOCK_EXPLORER_URL } = useConstants(CHAIN_ID.BERACHAIN);

  if (!userPosition) return null;

  return (
    <div className="bg-gradient-to-r from-buttonPrimary to-gradientSecondary p-[1px] rounded-2xl mb-4">
      <div className="bg-bgDark rounded-2xl px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <p className="text-sm uppercase text-textSecondary">Your Position</p>
            <div className="flex items-center gap-2 group relative">
              <p className="mx-3">{userPosition.referralRanking || "-"}</p>
              <img src={selectRandomPetal()} alt="petal" />
              <p>
                {userPosition.accountInfo
                  ? userPosition.accountInfo.referralCode
                  : `${userPosition.address?.substring(0, 4)}...${userPosition.address?.substring(
                      userPosition.address.length - 3
                    )}`}
              </p>
              <span className="invisible group-hover:visible absolute left-0 top-full z-10 bg-bgDark p-2 rounded-md border border-borderDark text-sm text-textWhite">
                {userPosition.address}
              </span>
              <FiExternalLink
                size={16}
                className="text-textWhite cursor-pointer hover:text-textPrimary"
                onClick={() => window.open(`${BLOCK_EXPLORER_URL}/address/${userPosition.address}`, "_blank")}
              />
            </div>
          </div>
          <p>{userPosition.referralCountWithNonZeroStake}</p>
        </div>
      </div>
    </div>
  );
};
