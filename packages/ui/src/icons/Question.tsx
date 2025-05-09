import { Path } from "react-native-svg";
import { withIconBehavior } from "./withIconBehavior";

// Define just the SVG content
const QuestionIconContent = () => (
	<>
		<Path stroke="none" d="M0 0h24v24H0z" fill="none" strokeWidth={1} />
		<Path d="M8 8a3.5 3 0 0 1 3.5 -3h1a3.5 3 0 0 1 3.5 3a3 3 0 0 1 -2 3a3 4 0 0 0 -2 4" />
		<Path d="M12 19l0 .01" />
	</>
);

// Create the enhanced icon component
export const QuestionIcon = withIconBehavior(QuestionIconContent);
