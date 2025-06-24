import { View, Text, ScrollView } from "react-native";
// import { Tabs } from "../Tabs/Tabs";
// import { PoolButton } from "../PoolButton/PoolButton";
// import React from "react";
// import { UserLeaderboardTable } from "./components/UserLeaderboard/UserLeaderboard";
// enum Tab {
// 	LeaderBoard = "BTX Points",
// }

export const Leaderboard = () => {
	// const [tab, setTab] = React.useState<Tab>(Tab.LeaderBoard);
	// const tabs = Object.values(Tab);

	return (
		<ScrollView className="flex-1">
			<View className="text-textWhite container mx-auto px-4 py-6 h-[98vh]">
				<Text className="uppercase text-2xl sm:text-3xl font-bold text-white">Leaderboard</Text>

				{/* Coming Soon Section */}
				<View className="flex items-center justify-center h-full">
					<View className="relative overflow-hidden bg-gradient-to-r from-gradientPrimary via-bgPrimary to-gradientSecondary p-1 rounded-3xl">
						<View className="bg-bgDark rounded-2xl p-8 md:p-12 relative">
							<View className="absolute inset-0 bg-black/40 rounded-2xl"></View>
							<View className="absolute inset-0 bg-gradient-to-r from-gradientPrimary/20 via-bgPrimary/20 to-gradientSecondary/20 rounded-2xl"></View>
							<View className="flex justify-center items-center relative text-center space-y-2">
								<Text className="text-gradientPrimary font-bold text-4xl md:text-5xl mb-4 font-sans drop-shadow-[0_2px_4px_rgba(0,0,0,1)] uppercase tracking-wide">
									Coming Soon
								</Text>
								<Text className="text-textWhite font-semibold text-2xl md:text-3xl mb-6 [text-shadow:_0_1px_2px_rgba(0,0,0,1)] uppercase">
									Next Season
								</Text>
							</View>
						</View>
					</View>
				</View>
			</View>
		</ScrollView>
	);
};
