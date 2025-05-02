import { Path } from "react-native-svg";
import { withIconBehavior } from "./withIconBehavior";

// Define just the SVG content
const RocketIconContent = () => (
  <>
    <Path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <Path d="M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3" />
    <Path d="M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3" />
    <Path d="M15 9m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
  </>
);

// Create the enhanced icon component
export const RocketIcon = withIconBehavior(RocketIconContent);

