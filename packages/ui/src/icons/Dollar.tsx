import { Path } from "react-native-svg";
import { withIconBehavior } from "./withIconBehavior";

// Define just the SVG content
const DollarIconContent = () => (
	<>
		<Path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<Path d="M16.7 8a3 3 0 0 0 -2.7 -2h-4a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6h-4a3 3 0 0 1 -2.7 -2" />
		<Path d="M12 3v3m0 12v3" />
	</>
);

// Create the enhanced icon component
export const DollarIcon = withIconBehavior(DollarIconContent);
