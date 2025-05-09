import { UserGuide as UserGuideSharedComponent } from "@beratrax/ui";
import { StyleSheet, View } from "react-native";

const UserGuide = () => {
	return (
		<View style={styles.container}>
			<UserGuideSharedComponent />
		</View>
	);
};

export default UserGuide;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 20,
		backgroundColor: "black",
	},
	link: {
		marginTop: 15,
		paddingVertical: 15,
	},
});
