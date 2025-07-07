import leaderboardtablepetalbrown from "@beratrax/core/src/assets/images/leaderboardtablepetalbrown.svg";
import leaderboardtablepetalgrey from "@beratrax/core/src/assets/images/leaderboardtablepetalgrey.svg";
import leaderboardtablepetalyellow from "@beratrax/core/src/assets/images/leaderboardtablepetalyellow.svg";
import { useConstants, useStats } from "@beratrax/core/src/hooks";
import { CHAIN_ID, UsersTableColumns } from "@beratrax/core/src/types/enums";
import { customCommify } from "@beratrax/core/src/utils/common";
import { FC, useEffect, useMemo, useState, memo, useCallback } from "react";
import { View, Image, Text, Pressable, TextInput, Platform, ScrollView, Linking } from "react-native";
import { ChevronDownIcon } from "../../../../icons/ChevronDown";
import { ChevronUpIcon } from "../../../../icons/ChevronUp";
import { ExternalLinkIcon } from "../../../../icons/ExternalLInk";
import Colors from "@beratrax/typescript-config/Colors";
import bbtxLogo from "@beratrax/core/src/assets/images/btxLogo.png";
import { LinearGradient } from "expo-linear-gradient";

const selectRandomPetal = () => {
	const petals = [leaderboardtablepetalbrown, leaderboardtablepetalyellow, leaderboardtablepetalgrey];
	return petals[Math.floor(Math.random() * petals.length)];
};

function getImageSource() {
	return Platform.OS === "web" ? { uri: bbtxLogo } : require("@beratrax/core/src/assets/images/btxLogo.png");
}

const SkeletonRow = () => {
	return (
		<View className="rounded-2xl bg-bgDark px-3 sm:px-4 py-4 sm:py-6">
			<View className="flex flex-row justify-between items-center">
				<View className="flex flex-row items-center gap-2 sm:gap-4">
					{/* Rank skeleton */}
					<View className="w-6 sm:w-8 h-5 sm:h-6 bg-bgSecondary animate-pulse rounded"></View>
					{/* Petal skeleton */}
					<View className="w-5 sm:w-6 h-5 sm:h-6 bg-bgSecondary animate-pulse rounded-full"></View>
					{/* Address skeleton */}
					<View className="w-24 sm:w-32 h-5 sm:h-6 bg-bgSecondary animate-pulse rounded"></View>
				</View>
				{/* Points skeleton */}
				<View className="flex flex-row items-center gap-2">
					<View className="w-16 sm:w-24 h-5 sm:h-6 bg-bgSecondary animate-pulse rounded"></View>
					<View className="w-8 h-8 sm:w-10 sm:h-10 bg-bgSecondary animate-pulse rounded-xl"></View>
				</View>
			</View>
		</View>
	);
};

const AddressDisplay = memo(({ address, explorerUrl }: { address: string; explorerUrl: string }) => {
	return (
		<View className="text-lg flex flex-row items-center gap-x-2">
			<Image source={{ uri: selectRandomPetal() }} alt="petal" className="w-5 h-5" />
			<View className="flex flex-row items-center gap-7 sm:gap-2 group relative">
				<Text className="text-white">{`${address?.substring(0, 4)}...${address?.substring(address.length - 3)}`}</Text>
				{Platform.OS === "web" ? (
					<Text className="invisible group-hover:visible absolute left-0 top-full z-10 bg-bgDark p-2 rounded-md border border-borderDark text-sm text-textWhite">
						{address}
					</Text>
				) : (
					<Pressable onPress={() => Linking.openURL(explorerUrl)}>
						<Text className="text-xs text-textSecondary">View on Explorer</Text>
					</Pressable>
				)}
			</View>
		</View>
	);
});

export const UserLeaderboardTable: FC = () => {
	const {
		userTvlsForLeaderBoard: userTVLs,
		userPosition,
		// userRankings,
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

	const isCurrentUserInTable = userTVLs?.some((userTVL) => userTVL.address.toLowerCase() === userPosition?.address.toLowerCase());

	const allEntries = useMemo(() => {
		if (!userTVLs) return [];
		if (!userPosition || isCurrentUserInTable || search) return userTVLs;

		return [
			...userTVLs,
			{
				...userPosition,
			},
		];
	}, [userTVLs, userPosition, isCurrentUserInTable, search]);

	useEffect(() => {
		setSortBy(UsersTableColumns.LeaderboardRanking);
		setOrder("");
	}, []);

	return (
		<View className="grid grid-cols-1 gap-3 sm:gap-4">
			{/* User Position */}
			{isLoading ? <SkeletonRow /> : <UserPositionRow userPosition={userPosition} />}

			{/* TABLE HEADING */}
			<View className="text-xs sm:text-base py-6 px-8 rounded-2xl flex flex-row items-center grow relative">
				<LinearGradient
					colors={["#72B21F33", "#72B21F00"]}
					style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, borderRadius: 16 }}
					start={{ x: 0, y: 1 }}
					end={{ x: 0, y: 0 }}
				/>
				<Text className="uppercase w-20 text-white">Rank</Text>
				<Text className="uppercase w-32 text-white">User</Text>
				<View className="flex flex-row gap-3 grow justify-end items-center">
					<Image source={getImageSource()} alt="btx logo" className="h-5 w-5" />
					<Text className="uppercase text-white">BTX points</Text>
				</View>
			</View>

			{/* TABLE ROWS CONTAINER WITH FIXED HEIGHT AND SCROLLVIEW */}
			<View className="overflow-y-auto">
				<ScrollView
					className="h-[45vh] xsMobile:h-[40vh] mobile:h-[40vh] sm:h-[45vh] lg:h-[50vh]"
					showsVerticalScrollIndicator={true}
					contentContainerStyle={{ gap: 2 }}
				>
					{isLoading ? (
						// Show 6 skeleton rows while loading
						[...Array(6)].map((_, index) => (
							<View key={index} className="mb-2">
								<SkeletonRow />
							</View>
						))
					) : allEntries.length > 0 && page && limit ? (
						allEntries.map((userTVL) => {
							const isCurrentUser = userPosition?.address.toLowerCase() === userTVL.address.toLowerCase();
							return (
								<View key={userTVL.id} className="mb-2">
									<StatsTableRow isCurrentUser={isCurrentUser} {...userTVL} />
								</View>
							);
						})
					) : (
						<EmptyTable />
					)}
				</ScrollView>
			</View>

			{/* Search Bar and Pagination */}
			<View className="flex flex-col gap-4">
				{/* Search Bar */}
				<View className="flex flex-row items-center gap-2 bg-bgDark rounded-2xl px-4 py-3 sm:py-4">
					<TextInput
						value={search}
						onChangeText={(text) => {
							setPage(1);
							setSearch(text);
						}}
						className="bg-transparent w-full text-textWhite text-xs sm:text-sm focus:outline-none"
						placeholder="Search Address..."
						placeholderTextColor="#9ca3af"
					/>
				</View>

				{/* Pagination - can be uncommented and styled when needed */}
				{/* <View className="flex flex-row items-center justify-center gap-4">
					<Pressable
						disabled={!hasPrevPage}
						onPress={() => setPage((prev) => prev - 1)}
						className={`px-3 sm:px-4 py-2 rounded-xl ${
							hasPrevPage
								? "bg-bgDark active:bg-gradientPrimary active:text-textBlack"
								: "bg-buttonDisabled opacity-50"
						}`}
					>
						<Text className="text-white text-xs sm:text-sm">Previous</Text>
					</Pressable>

					<Text className="text-textWhite px-4 text-xs sm:text-sm">
						{page} / {totalPages}
					</Text>

					<Pressable
						disabled={!hasNextPage}
						onPress={() => setPage((prev) => prev + 1)}
						className={`px-3 sm:px-4 py-2 rounded-xl ${
							hasNextPage
								? "bg-bgDark active:bg-gradientPrimary active:text-textBlack"
								: "bg-buttonDisabled opacity-50"
						}`}
					>
						<Text className="text-white text-xs sm:text-sm">Next</Text>
					</Pressable>
				</View> */}
			</View>
		</View>
	);
};

const EmptyTable = () => {
	return (
		<View className="flex flex-col items-center justify-center py-8 gap-y-2 text-lg">
			<Text className="mt-4 text-white text-base sm:text-lg">No Data Available</Text>
			<Text className="text-textSecondary text-sm sm:text-base">Change the filter setting to see data.</Text>
		</View>
	);
};

const StatsTableRow = memo(
	({ isCurrentUser, ...props }: { isCurrentUser?: boolean } & Record<any, any>) => {
		const { BLOCK_EXPLORER_URL } = useConstants(CHAIN_ID.BERACHAIN);
		const [open, setOpen] = useState(false);

		const {
			address,
			earnedTrax,
			earnedTraxByReferral,
			earnedTraxTestnet,
			earnedTraxByReferralTestnet,
			tvl,
			accountInfo,
			index,
			referralCount,
		} = props;

		const explorerUrl = useMemo(() => `${BLOCK_EXPLORER_URL}/address/${address}`, [BLOCK_EXPLORER_URL, address]);

		const handlePress = useCallback(() => {
			setOpen((prev) => !prev);
		}, []);

		const rowContent = useMemo(
			() => (
				<View className={`relative rounded-2xl ${isCurrentUser ? "animate-pulse-slow" : ""}`}>
					{isCurrentUser && (
						<LinearGradient
							colors={["#72b21f", "#283817"]}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 0 }}
							style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, borderRadius: 16 }}
						/>
					)}
					<View className={`rounded-2xl px-4 ${isCurrentUser ? "bg-transparent" : "bg-bgDark"}`}>
						<Pressable
							className={`${open && !isCurrentUser && "border-b border-bgSecondary"} py-6 flex flex-row justify-between items-center`}
							onPress={handlePress}
						>
							<View className="flex flex-row justify-between gap-4 cursor-pointer">
								<View className="flex flex-row items-center gap-2 group relative">
									<Text className="mx-2 sm:mx-3 text-white text-xs sm:text-sm">{index}</Text>
									<Image source={{ uri: selectRandomPetal() }} alt="petal" className="w-5 h-5" />
									<Text className="text-white text-sm ml-1" style={{ maxWidth: 150, flexShrink: 1, overflow: "hidden" }}>
										{accountInfo?.referralCode
											? accountInfo.referralCode.startsWith("0x")
												? `${accountInfo.referralCode.substring(0, 4)}...${accountInfo.referralCode.substring(
														accountInfo.referralCode.length - 3
													)}`
												: accountInfo.referralCode
											: `${address?.substring(0, 4)}...${address?.substring(address.length - 3)}`}
									</Text>
									{Platform.OS === "web" ? (
										<Text className="invisible group-hover:visible absolute left-0 top-full z-10 bg-bgDark p-2 rounded-md border border-borderDark text-xs sm:text-sm text-textWhite">
											{address}
										</Text>
									) : null}

									<Pressable onPress={() => Linking.openURL(explorerUrl)}>
										<ExternalLinkIcon />
									</Pressable>
								</View>
							</View>

							<View className="flex flex-row justify-center items-center gap-x-2">
								<Text className="text-white text-xs sm:text-sm" style={{ maxWidth: 120, flexShrink: 1, overflow: "hidden" }}>
									{Number(earnedTrax + earnedTraxByReferral).toLocaleString("en-us")}
								</Text>
								<View
									className={`flex-shrink-0 relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex justify-center items-center ${
										open ? "bg-gradientSecondary" : "bg-bgSecondary"
									}`}
								>
									{open ? (
										<ChevronUpIcon stroke={Colors.gradientLight} strokeWidth={3} />
									) : (
										<ChevronDownIcon stroke={Colors.gradientLight} strokeWidth={3} />
									)}
								</View>
							</View>
						</Pressable>

						{/* row details dropdown */}
						<View className="overflow-hidden transition-all duration-300 ease-in-out">
							<View
								className={`transform ${open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"} transition-all duration-300 ease-in-out`}
							>
								<View className={`p-6 rounded-lg ${isCurrentUser ? "bg-black/30" : "bg-black"}`}>
									{/* Grid layout */}
									<View className="grid grid-cols-2 md:grid-cols-5 gap-4">
										{/* Wallet Address */}
										<View className="mb-2 sm:mb-0">
											<Text className="text-xs uppercase text-gray-400">Wallet Address</Text>
											{address ? (
												<AddressDisplay address={address} explorerUrl={explorerUrl} />
											) : (
												<Text className="text-white mt-1">-</Text>
											)}
										</View>

										{/* Staking Points */}
										<View className="mb-2 sm:mb-0">
											<Text className="text-xs uppercase text-gray-400">Staking Points</Text>
											<Text className="text-sm sm:text-lg font-medium text-white mt-1">
												{customCommify(earnedTrax, {
													minimumFractionDigits: 0,
													maximumFractionDigits: 2,
													showDollarSign: false,
												})}
											</Text>
										</View>

										{/* Referral Points */}
										<View className="mb-2 sm:mb-0">
											<Text className="text-xs uppercase text-gray-400">Referral Points</Text>
											<Text className="text-sm sm:text-lg text-white mt-1">{Number(earnedTraxByReferral).toLocaleString("en-us")}</Text>
										</View>

										{/* Testnet Points */}
										<View className="mb-2 sm:mb-0">
											<Text className="text-xs uppercase text-gray-400">Testnet Points</Text>
											<Text className="text-sm sm:text-lg text-white mt-1">
												{Number(earnedTraxByReferralTestnet + earnedTraxTestnet).toLocaleString("en-us")}
											</Text>
										</View>

										{/* # of Referrals */}
										<View>
											<Text className="text-xs uppercase text-gray-400"># of Referrals</Text>
											<Text className="text-sm sm:text-lg text-white mt-1">{referralCount}</Text>
										</View>
									</View>
								</View>
							</View>
						</View>
					</View>
				</View>
			),
			[
				isCurrentUser,
				open,
				handlePress,
				index,
				accountInfo,
				address,
				explorerUrl,
				earnedTrax,
				earnedTraxByReferral,
				earnedTraxTestnet,
				earnedTraxByReferralTestnet,
				referralCount,
			]
		);

		return rowContent;
	},
	(prevProps, nextProps) => {
		// Custom comparison function for memo
		return (
			prevProps.isCurrentUser === nextProps.isCurrentUser &&
			prevProps.address === nextProps.address &&
			prevProps.earnedTrax === nextProps.earnedTrax &&
			prevProps.earnedTraxByReferral === nextProps.earnedTraxByReferral &&
			prevProps.earnedTraxTestnet === nextProps.earnedTraxTestnet &&
			prevProps.earnedTraxByReferralTestnet === nextProps.earnedTraxByReferralTestnet &&
			prevProps.index === nextProps.index &&
			prevProps.referralCount === nextProps.referralCount &&
			JSON.stringify(prevProps.accountInfo) === JSON.stringify(nextProps.accountInfo)
		);
	}
);

const UserPositionRow = ({ userPosition }: { userPosition: any }) => {
	const { BLOCK_EXPLORER_URL } = useConstants(CHAIN_ID.BERACHAIN);

	if (!userPosition) return null;

	const explorerUrl = `${BLOCK_EXPLORER_URL}/address/${userPosition.address}`;

	return (
		<View className="relative rounded-2xl mb-4 overflow-hidden">
			<LinearGradient
				colors={["#A0FF3B", "#283817"]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 0 }}
				style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, padding: 1, borderRadius: 16 }}
			/>
			<View className="bg-bgDark rounded-2xl m-[1px] px-4 py-6">
				<View className="flex flex-row justify-between items-center">
					<View className="flex flex-row items-center gap-4">
						<Text className="text-xs uppercase text-textSecondary">Your Position</Text>
						<View className="flex flex-row items-center gap-2 group relative">
							<Text className="mx-3 text-white text-sm font-bold">{userPosition.leaderboardRanking || "-"}</Text>
							<Image source={{ uri: selectRandomPetal() }} alt="petal" className="w-4 h-4 sm:w-5 sm:h-5" />
							<Text className="text-white text-xs sm:text-sm" style={{ maxWidth: 150, flexShrink: 1, overflow: "hidden" }}>
								{userPosition.accountInfo
									? userPosition.accountInfo.referralCode
									: `${userPosition.address?.substring(0, 4)}...${userPosition.address?.substring(userPosition.address.length - 3)}`}
							</Text>
							{Platform.OS === "web" ? (
								<Text className="invisible group-hover:visible absolute left-0 top-full z-10 bg-bgDark p-2 rounded-md border border-borderDark text-xs sm:text-sm text-textWhite">
									{userPosition.address}
								</Text>
							) : null}
							<Pressable onPress={() => Linking.openURL(explorerUrl)}>
								<ExternalLinkIcon width={16} height={16} />
							</Pressable>
						</View>
					</View>
					<Text className="text-white text-xs sm:text-sm" style={{ maxWidth: 120, flexShrink: 1, overflow: "hidden" }}>
						{Number(userPosition.earnedTrax + userPosition.earnedTraxByReferral).toLocaleString("en-us")}
					</Text>
				</View>
			</View>
		</View>
	);
};
