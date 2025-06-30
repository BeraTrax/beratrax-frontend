import { View, StyleSheet } from "react-native";
import { Order, EventTypes, TransakConfig, TransakWebView } from "@transak/react-native-sdk";

interface BuyProps {
	transakConfig: TransakConfig;
	onTransakEventHandler: (event: EventTypes, data: Order) => void;
}

export const Buy = ({ transakConfig, onTransakEventHandler }: BuyProps) => {
	return (
		<View style={styles.container}>
			<TransakWebView
				transakConfig={transakConfig}
				onTransakEvent={onTransakEventHandler}
				mediaPlaybackRequiresUserAction={false}
				style={{ marginBottom: 50 }}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#000" },
	title: { fontSize: 24, fontWeight: "bold", color: "#fff", margin: 16 },
});
