import { Link } from "expo-router";
import { StyleSheet, View, Text } from "react-native";

const Earn = () => {
	return (
		<View style={styles.container}>
			<Text>Earn</Text>
			<Link href=".." style={styles.link}>
				<Text>Go to home screen!</Text>
			</Link>
		</View>
	);
};

export default Earn;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 20,
	},
	link: {
		marginTop: 15,
		paddingVertical: 15,
	},
});
