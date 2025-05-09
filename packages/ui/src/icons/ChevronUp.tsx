import { Path } from "react-native-svg";
import { withIconBehavior } from "./withIconBehavior";

const ChevronUpIconContent = () => (
	<>
		<Path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<Path d="M6 15l6 -6l6 6" />
	</>
);

export const ChevronUpIcon = withIconBehavior(ChevronUpIconContent);
