import { View, Text, ScrollView } from "react-native";
import { Tabs } from "../Tabs/Tabs";
import { PoolButton } from "../PoolButton/PoolButton";
import React from "react";
import { UserLeaderboardTable } from "./components/UserLeaderboard/UserLeaderboard";
enum Tab {
	LeaderBoard = "BTX Points",
}

export const Leaderboard = () => {
	const [tab, setTab] = React.useState<Tab>(Tab.LeaderBoard);
	const tabs = Object.values(Tab);

	return (
		<ScrollView className="flex-1">
			<View className="text-textWhite container mx-auto px-4 py-6 mb-4 space-y-6">
				<Text className="uppercase text-2xl sm:text-3xl font-bold text-white">Leaderboard</Text>
				<Tabs className="whitespace-nowrap px-2 sm:px-4 min-w-min !py-0 overflow-x-auto">
					{tabs.map((_tab, i) => (
						<PoolButton
							key={i}
							variant={2}
							onPress={() => {
								setTab(_tab);
							}}
							description={_tab}
							active={tab === _tab}
							className="whitespace-nowrap inline-block"
						/>
					))}
				</Tabs>
				{tab === Tab.LeaderBoard && <UserLeaderboardTable />}
			</View>
		</ScrollView>
	);
};
