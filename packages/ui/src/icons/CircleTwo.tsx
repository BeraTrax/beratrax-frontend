import { Circle, Path } from "react-native-svg";
import { withIconBehavior } from "./withIconBehavior";

const CircleTwoIconContent = () => (
	<>
		<Circle stroke="#A0FF3B" strokeWidth={1.5} cx="12" cy="12" r="9" />
		<Path stroke="#A0FF3B" d="M10 8h3a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 0 -1 1v2a1 1 0 0 0 1 1h3" />
	</>
);

export const CircleTwoIcon = withIconBehavior(CircleTwoIconContent);
