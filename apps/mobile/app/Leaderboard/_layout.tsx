import { Leaderboard } from "@beratrax/ui";
import { View } from "react-native";

export default function LeaderboardLayout() {
	return (
		<View className="flex-1 bg-bgSecondary">
			<Leaderboard />
		</View>
	);
}
