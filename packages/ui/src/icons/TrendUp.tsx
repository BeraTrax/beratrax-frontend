import { Path } from "react-native-svg";
import { withIconBehavior } from "./withIconBehavior";

// Define just the SVG content
const TrendUpIconContent = () => (
  <>
    <Path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <Path d="M3 17l6 -6l4 4l8 -8" />
    <Path d="M14 7l7 0l0 7" />
  </>
);

// Create the enhanced icon component
export const TrendUpIcon = withIconBehavior(TrendUpIconContent);

