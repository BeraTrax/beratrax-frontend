import React from "react";
import { Platform, View } from "react-native";
import { SvgXml } from "react-native-svg";

interface SvgImageProps {
	source: string | React.FC<any>; // raw XML or Component
	width?: number;
	height?: number;
	style?: any;
}

export const SvgImage: React.FC<SvgImageProps> = ({ source, width, height, style }) => {
	if (Platform.OS === "web") {
		return (
			<View style={style}>
				<img src={typeof source === "string" ? source : ""} width={width} height={height} alt="" />
			</View>
		);
	}

	if (typeof source === "string") {
		// Raw SVG XML string
		return (
			<View style={style}>
				<SvgXml xml={source} width={width} height={height} />
			</View>
		);
	}

	if (typeof source === "function") {
		// React component (e.g., when using `svgr`)
		const SvgComponent = source;
		return (
			<View style={style}>
				<SvgComponent width={width} height={height} />
			</View>
		);
	}

	return null;
};
