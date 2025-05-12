import { Circle, Path } from "react-native-svg";
import { withIconBehavior } from "./withIconBehavior";

const CircleFourIconContent = () => (
	<>
		<Circle stroke="#A0FF3B" strokeWidth={1.5} cx="12" cy="12" r="9" />
		<Path stroke="#A0FF3B" d="M10 8v3a1 1 0 0 0 1 1h3" />
		<Path stroke="#A0FF3B" d="M14 8v8" />
	</>
);

export const CircleFourIcon = withIconBehavior(CircleFourIconContent);
