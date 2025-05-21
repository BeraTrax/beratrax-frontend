import "../globals";
import "@ethersproject/shims";
import "@expo/metro-runtime";
import "react-native-get-random-values";
import { ScrollView, View, Text } from "react-native";
import { PointsEarnings, WalletAndEarnings, EmptyComponent, ReferralLink, Vaults, TokenBalances, Transactions } from "@beratrax/ui";
import { useDataRefresh } from "@beratrax/core/src/hooks";
import useWallet from "@beratrax/core/src/hooks/useWallet";

const Dashboard = () => {
	const { currentWallet, login } = useWallet();
	useDataRefresh();

	return (
		<ScrollView>
			<View className="overflow-auto font-arame-mono" id="dashboard">
				<WalletAndEarnings connectWallet={login} />
				<View className="flex flex-col mx-4 gap-y-4 mt-4 mb-32">
					{currentWallet ? (
						<>
							<PointsEarnings />
							<ReferralLink />
							<Vaults />
							<TokenBalances />
							<Transactions />
						</>
					) : (
						<EmptyComponent>
							<Text>Sign in/up to view your dashboard.</Text>
						</EmptyComponent>
					)}
				</View>
			</View>
		</ScrollView>
	);
};

export default Dashboard;
