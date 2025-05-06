import { Path } from "react-native-svg";
import { withIconBehavior } from "./withIconBehavior";

const ExternalLinkIconContent = () => (
	<>
		<Path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<Path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6" />
		<Path d="M11 13l9 -9" />
		<Path d="M15 4h5v5" />
	</>
);

export const ExternalLinkIcon = withIconBehavior(ExternalLinkIconContent);
