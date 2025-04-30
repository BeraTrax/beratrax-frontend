/* global __DEV__ */
import { Platform } from "react-native";
// import Clipboard from "@react-native-clipboard/clipboard";

export const copyToClipboard = (text: string, cb: Function | null = null) => {
	if (Platform.OS === "web") {
		navigator.clipboard.writeText(text);
	} else {
		// Clipboard.setString(text);
		console.log("copyToClipboard", text);
	}
	setTimeout(() => {
		console.log("copyToClipboard cb");
		if (cb) cb();
	}, 1000);
};

export const getPositionSuffix = (index: number) => {
	const j = index % 10,
		k = index % 100;
	if (j == 1 && k != 11) {
		return index + "st";
	}
	if (j == 2 && k != 12) {
		return index + "nd";
	}
	if (j == 3 && k != 13) {
		return index + "rd";
	}
	return index + "th";
};

export const isNumber = (value: any) => {
	return typeof value === "number" && !isNaN(parseFloat(value.toString()));
};

export const limitDecimals = (value: string, decimals: number) => {
	const [integer, decimal] = value.split(".");
	if (decimal) {
		return `${integer}.${decimal.slice(0, decimals)}`;
	}
	return value;
};
