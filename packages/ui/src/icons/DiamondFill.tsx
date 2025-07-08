import { Path } from "react-native-svg";
import { withIconBehavior } from "./withIconBehavior";
import Colors from "@beratrax/typescript-config/Colors";

// Define just the SVG content
const DiamondFillIconContent = () => (
	<>
		<Path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<Path
			stroke={Colors.gradientLight}
			strokeWidth={1.5}
			d="M10.831 20.413l-5.375 -6.91c-.608 -.783 -.608 -2.223 0 -3l5.375 -6.911a1.457 1.457 0 0 1 2.338 0l5.375 6.91c.608 .783 .608 2.223 0 3l-5.375 6.911a1.457 1.457 0 0 1 -2.338 0z"
		/>
	</>
);

// Create the enhanced icon component
export const DiamondFillIcon = withIconBehavior(DiamondFillIconContent);
