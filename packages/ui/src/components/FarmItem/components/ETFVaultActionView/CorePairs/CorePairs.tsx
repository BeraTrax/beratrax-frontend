import React from "react";
import { View } from "react-native";
import DonutETF from "./DonutETF";

const CorePairs: React.FC = () => {
	// Dynamic data - changing this array will result in differing shapes of the donut
	const corePairs = [
		{ name: "wBera/Honey", volume: 45000000, swaps: 10000, color: "#8c4545" },
		{ name: "Honey/USDT", volume: 32000000, swaps: 4000, color: "#3a6275" },
		{ name: "Honey/styBgt", volume: 28000000, swaps: 9000, color: "#6b8b5a" },
		{ name: "wBera/styBgt", volume: 23000000, swaps: 15000, color: "#8B7B5A" },
	];

	return (
		<View>
			<DonutETF data={corePairs} />
		</View>
	);
};

export default CorePairs;
