import { View } from "react-native";

export const HorizontalLine = ({ color = "#ccc", thickness = 1, spacing = 10 }) => (
	<View
		style={{
			borderBottomColor: color,
			borderBottomWidth: thickness,
			marginVertical: spacing,
		}}
	/>
);
