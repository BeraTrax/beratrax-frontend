import { Path } from "react-native-svg";
import { withIconBehavior } from "./withIconBehavior";

const LoaderIconContent = () => (
	<>
		<Path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<Path d="M12 3a9 9 0 1 0 9 9" />
	</>
);

export const LoaderIcon = withIconBehavior(LoaderIconContent);
