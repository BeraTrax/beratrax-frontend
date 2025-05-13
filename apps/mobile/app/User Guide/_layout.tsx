import { UserGuide as UserGuideSharedComponent } from "@beratrax/ui";
import { View, SafeAreaView } from "react-native";

const UserGuide = () => {
	return (
		<SafeAreaView className="flex-1 bg-black">
			<View className="flex-1 w-full overflow-hidden">
				<UserGuideSharedComponent />
			</View>
		</SafeAreaView>
	);
};

export default UserGuide;
