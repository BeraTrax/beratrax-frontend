import { Path } from "react-native-svg";
import { withIconBehavior } from "./withIconBehavior";

// Define just the SVG content
const CoinIconContent = () => (
	<>
		<Path d="M9 8h4.09c1.055 0 1.91 .895 1.91 2s-.855 2 -1.91 2c1.055 0 1.91 .895 1.91 2s-.855 2 -1.91 2h-4.09" />
		<Path d="M10 12h4" />
		<Path d="M10 7v10v-9" />
		<Path d="M13 7v1" />
		<Path d="M13 16v1" />
	</>
);

// Create the enhanced icon component
export const CoinIcon = withIconBehavior(CoinIconContent);
