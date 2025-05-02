import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEarnPage } from "@beratrax/core/src/state/farms/hooks";
import { FarmActionView } from "@beratrax/ui";

export default function EarnDetailScreen() {
  const { vaultAddr } = useLocalSearchParams();
  const { farms } = useEarnPage();
  const farmData = farms.find((farm) => farm.vault_addr === vaultAddr);

  return (
    <View>
      <FarmActionView farm={farmData!} />
    </View>
  );
}

