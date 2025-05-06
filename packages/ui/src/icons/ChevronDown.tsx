import { Path } from "react-native-svg";
import { withIconBehavior } from "./withIconBehavior";

const ChevronDownIconContent = () => (
	<>
		<Path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<Path d="M6 9l6 6l6 -6" />
	</>
);

export const ChevronDownIcon = withIconBehavior(ChevronDownIconContent);
