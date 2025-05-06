import { ScrollView, View } from "react-native";
import {
  FarmView
} from "@beratrax/ui";
import { useDataRefresh } from "@beratrax/core/src/hooks";
import useWallet from "@beratrax/core/src/hooks/useWallet";

const Earn = () => {
  const { currentWallet } = useWallet();
  useDataRefresh();

  return (
    <ScrollView>
      <View className="overflow-auto font-arame-mono bg-bgDark" id="dashboard">
        <FarmView />
      </View>
    </ScrollView>
  );
};

export default Earn;
