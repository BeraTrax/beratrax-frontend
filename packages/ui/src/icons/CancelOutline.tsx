import { Path } from "react-native-svg";
import { withIconBehavior } from "./withIconBehavior";

// Define just the SVG content
const CancelOutlineIconContent = () => (
	<>
		<Path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<Path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
		<Path d="M10 10l4 4m0 -4l-4 4" />
	</>
);

// Create the enhanced icon component
export const CancelOutlineIcon = withIconBehavior(CancelOutlineIconContent);
