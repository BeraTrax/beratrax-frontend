import { ScrollView, View } from "react-native";
import {
  PointsEarnings,
  WalletAndEarnings,
  EmptyComponent,
  ReferralLink,
} from "@beratrax/ui";
import { useDataRefresh } from "@beratrax/core/src/hooks";
import useWallet from "@beratrax/core/src/hooks/useWallet";

const Dashboard = () => {
  const { currentWallet } = useWallet();
  useDataRefresh();

  return (
    <ScrollView>
      <View className="overflow-auto font-arame-mono bg-bgDark" id="dashboard">
        <WalletAndEarnings connectWallet={() => {}} />
        <View className="flex flex-col mx-4 gap-y-4 mt-4 mb-32">
          {currentWallet ? (
            <>
              <PointsEarnings />
              <ReferralLink />
              {/* <Vaults />
            <TokenBalances />
            <Transactions /> */}
            </>
          ) : (
            <EmptyComponent style={{ paddingTop: 50, paddingBottom: 50 }}>
              Sign in/up to view your dashboard.
            </EmptyComponent>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default Dashboard;
