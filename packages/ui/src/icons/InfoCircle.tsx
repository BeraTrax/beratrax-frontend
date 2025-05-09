import { Path } from "react-native-svg";
import { withIconBehavior } from "./withIconBehavior";

const InfoCircleIconContent = () => (
	<>
		<Path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<Path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
		<Path d="M12 9h.01" />
		<Path d="M11 12h1v4h1" />
	</>
);

// Create the enhanced icon component
export const InfoCircleIcon = withIconBehavior(InfoCircleIconContent);