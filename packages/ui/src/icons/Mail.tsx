import React from "react";
import { Path } from "react-native-svg";
import { withIconBehavior } from "./withIconBehavior";

// Define just the SVG content for Mail icon
const MailIconContent = () => (
	<>
		<Path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<Path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" />
		<Path d="M3 7l9 6l9 -6" />
	</>
);

// Create the enhanced icon component
export const MailIcon = withIconBehavior(MailIconContent);
