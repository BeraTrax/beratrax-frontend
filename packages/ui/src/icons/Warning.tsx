import React from "react";
import Svg, { Path, Circle } from "react-native-svg";

interface WarningIconProps {
	color?: string;
	size?: number;
}

export const WarningIcon: React.FC<WarningIconProps> = ({ color = "#ffffff", size = 24 }) => {
	return (
		<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
			<Path
				d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
				stroke={color}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path d="M12 9v4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			<Circle cx="12" cy="17" r="1" fill={color} />
		</Svg>
	);
};
