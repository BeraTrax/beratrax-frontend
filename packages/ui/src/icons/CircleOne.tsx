import { withIconBehavior } from "./withIconBehavior";

import { Circle, Path } from "react-native-svg";

const CircleOneIconContent = () => (
	<>
		<Path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<Circle stroke="#A0FF3B" strokeWidth={1.5} cx="12" cy="12" r="9" />
		<Path stroke="#A0FF3B" d="M10 10l2 -2v8" />
	</>
);

// Create the enhanced icon component
export const CircleOneIcon = withIconBehavior(CircleOneIconContent);
