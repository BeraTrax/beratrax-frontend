import "../globals";
import "@ethersproject/shims";
import "@expo/metro-runtime";
import "react-native-get-random-values";
import { ScrollView, View, Text } from "react-native";
import { lazy, Suspense } from "react";
import { WalletAndEarnings, EmptyComponent } from "@beratrax/ui";
import useWallet from "@beratrax/core/src/hooks/useWallet";
// Lazy load components
const PointsEarnings = lazy(() => import("@beratrax/ui").then((module) => ({ default: module.PointsEarnings })));
const ReferralLink = lazy(() => import("@beratrax/ui").then((module) => ({ default: module.ReferralLink })));
const Vaults = lazy(() => import("@beratrax/ui").then((module) => ({ default: module.Vaults })));
const TokenBalances = lazy(() => import("@beratrax/ui").then((module) => ({ default: module.TokenBalances })));
const Transactions = lazy(() => import("@beratrax/ui").then((module) => ({ default: module.Transactions })));

const Dashboard = () => {
	const { currentWallet, connectWallet } = useWallet();

	return (
		<ScrollView>
			<View className="overflow-auto font-arame-mono" id="dashboard">
				<WalletAndEarnings connectWallet={connectWallet} />
				<View className="flex flex-col mx-4 gap-y-4 mt-4 mb-32">
					{currentWallet ? (
						<>
							<Suspense fallback={<Text>Loading...</Text>}>
								<PointsEarnings />
							</Suspense>
							<Suspense fallback={<Text>Loading...</Text>}>
								<ReferralLink />
							</Suspense>
							<Suspense fallback={<Text>Loading...</Text>}>
								<Vaults />
							</Suspense>
							<Suspense fallback={<Text>Loading...</Text>}>
								<TokenBalances />
							</Suspense>
							<Suspense fallback={<Text>Loading...</Text>}>
								<Transactions />
							</Suspense>
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
