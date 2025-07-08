import { Circle, Path } from "react-native-svg";
import Colors from "@beratrax/typescript-config/Colors";

import { withIconBehavior } from "./withIconBehavior";

const CircleThreeIconContent = () => (
	<>
		<Circle stroke={Colors.gradientLight} strokeWidth={1.5} cx="12" cy="12" r="9" />
		<Path
			stroke={Colors.gradientLight}
			d="M10 8h2.5a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1 -1.5 1.5h-1.5h1.5a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1 -1.5 1.5h-2.5"
		/>
	</>
);

export const CircleThreeIcon = withIconBehavior(CircleThreeIconContent);
