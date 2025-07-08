import { Circle, Path } from "react-native-svg";
import { withIconBehavior } from "./withIconBehavior";
import Colors from "@beratrax/typescript-config/Colors";

const CircleTwoIconContent = () => (
	<>
		<Circle stroke={Colors.gradientLight} strokeWidth={1.5} cx="12" cy="12" r="9" />
		<Path stroke={Colors.gradientLight} d="M10 8h3a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 0 -1 1v2a1 1 0 0 0 1 1h3" />
	</>
);

export const CircleTwoIcon = withIconBehavior(CircleTwoIconContent);
