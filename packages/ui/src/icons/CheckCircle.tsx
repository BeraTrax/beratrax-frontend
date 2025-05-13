import { Path } from "react-native-svg";
import { withIconBehavior } from "./withIconBehavior";

const CheckCircleIconContent = () => (
	<>
		<Path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<Path stroke="#A0FF3B" strokeWidth={1.5} d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
		<Path stroke="#A0FF3B" strokeWidth={1.5} d="M9 12l2 2l4 -4" />
	</>
);

export const CheckCircleIcon = withIconBehavior(CheckCircleIconContent);
