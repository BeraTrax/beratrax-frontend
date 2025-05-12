import { ScrollView, View } from "react-native";
import { FarmView } from "@beratrax/ui";

const Earn = () => {
	return (
		<ScrollView>
			<View className="overflow-auto font-arame-mono bg-bgDark" id="dashboard">
				<FarmView />
			</View>
		</ScrollView>
	);
};

export default Earn;
