import { Path } from "react-native-svg";
import { withIconBehavior } from "./withIconBehavior";

// Define just the SVG content
const PowerIconContent = () => (
	<>
		<Path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<Path d="M7 6a7.75 7.75 0 1 0 10 0" />
		<Path d="M12 4l0 8" />
	</>
);

// Create the enhanced icon component
export const PowerIcon = withIconBehavior(PowerIconContent);
