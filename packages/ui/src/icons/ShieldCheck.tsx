import React from "react";
import Svg, { Path } from "react-native-svg";

interface ShieldCheckIconProps {
	color?: string;
	size?: number;
}

export const ShieldCheckIcon: React.FC<ShieldCheckIconProps> = ({ color = "#ffffff", size = 24 }) => {
	return (
		<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
			<Path
				d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
				stroke={color}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path d="M9 12L11 14L15 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		</Svg>
	);
};
