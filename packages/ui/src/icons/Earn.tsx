import { Path } from "react-native-svg";

import { withIconBehavior } from "./withIconBehavior";

const EarnIconContent = () => (
	<>
		<Path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<Path
			d="M9.5 3h5a1.5 1.5 0 0 1 1.5 1.5a3.5 3.5 0 0 1 -3.5 3.5h-1a3.5 3.5 0 0 1 -3.5 -3.5a1.5 1.5 0 0 1 1.5 -1.5"
			fill="currentColor"
			stroke="currentColor"
			strokeWidth="1"
		/>
		<Path d="M4 17v-1a8 8 0 1 1 16 0v1a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4" fill="currentColor" stroke="currentColor" strokeWidth="1" />
	</>
);

export const EarnIcon = withIconBehavior(EarnIconContent);
