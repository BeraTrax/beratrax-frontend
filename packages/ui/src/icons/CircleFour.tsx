import { Circle, Path } from "react-native-svg";
import { withIconBehavior } from "./withIconBehavior";
import Colors from "@beratrax/typescript-config/Colors";

const CircleFourIconContent = () => (
	<>
		<Circle stroke={Colors.gradientLight} strokeWidth={1.5} cx="12" cy="12" r="9" />
		<Path stroke={Colors.gradientLight} d="M10 8v3a1 1 0 0 0 1 1h3" />
		<Path stroke={Colors.gradientLight} d="M14 8v8" />
	</>
);

export const CircleFourIcon = withIconBehavior(CircleFourIconContent);
