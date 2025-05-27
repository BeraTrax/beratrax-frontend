import { Path } from "react-native-svg";
import { withIconBehavior } from "./withIconBehavior";
const QrcodeComponent = () => {
	return (
		<>
			<Path stroke="none" d="M0 0h24v24H0z" fill="none" />
			<Path
				d="M4 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
			/>
			<Path d="M7 17l0 .01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
			<Path
				d="M14 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
			/>
			<Path d="M7 7l0 .01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
			<Path
				d="M4 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
			/>
			<Path d="M17 7l0 .01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
			<Path d="M14 14l3 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
			<Path d="M20 14l0 .01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
			<Path d="M14 14l0 3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
			<Path d="M14 20l3 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
			<Path d="M17 17l3 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
			<Path d="M20 17l0 3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
		</>
	);
};

export const QrcodeIcon = withIconBehavior(QrcodeComponent);
