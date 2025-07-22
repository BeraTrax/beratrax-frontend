import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEarnPage } from "@beratrax/core/src/state/farms/hooks";
import { FarmActionView, ETFVaultActionView } from "@beratrax/ui";
import { zeroAddress } from "viem";

export default function EarnDetailScreen() {
	const { vaultAddr } = useLocalSearchParams();
	const { farms } = useEarnPage();
	const farmData = farms.find((farm) => farm.vault_addr === vaultAddr);

	// Checks if this is an ETF vault (zero address)
	if (vaultAddr === zeroAddress) {
		return (
			<View>
				<ETFVaultActionView />
			</View>
		);
	}

	return (
		<View>
			<FarmActionView farm={farmData!} />
		</View>
	);
}
