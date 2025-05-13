import { UserGuide as UserGuideSharedComponent } from "@beratrax/ui";
import { StyleSheet, View, SafeAreaView } from "react-native";

const UserGuide = () => {
	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.container}>
				<UserGuideSharedComponent />
			</View>
		</SafeAreaView>
	);
};

export default UserGuide;

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "black",
	},
	container: {
		flex: 1,
		width: "100%",
		overflow: "hidden", // Prevent content from going outside the container
	},
});
