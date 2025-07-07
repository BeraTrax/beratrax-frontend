import userguideimagefive from "@beratrax/core/src/assets/images/userguideimagefive.png";
import userguideimagefour from "@beratrax/core/src/assets/images/userguideimagefour.jpg";
import userguideimageone from "@beratrax/core/src/assets/images/userguideimageone.png";
import userguideimagesix from "@beratrax/core/src/assets/images/userguideimagesix.png";
import userguideimagethree from "@beratrax/core/src/assets/images/userguideimagethree.png";
import userguideimagetwo from "@beratrax/core/src/assets/images/userguideimagetwo.png";
import React, { ReactNode } from "react";
import { AiOutlineExport } from "react-icons/ai";
import { BsChat, BsDiamondFill, BsQuestion } from "react-icons/bs";
import { CiCircleCheck } from "react-icons/ci";
import { GiWorld } from "react-icons/gi";
import { IconBaseProps, IconType } from "react-icons/lib";
import { PiNumberCircleFourLight, PiNumberCircleOneLight, PiNumberCircleThreeLight, PiNumberCircleTwoLight } from "react-icons/pi";
import { Link } from "react-router-dom";
import { UserGuide as UserGuideShared } from "@beratrax/ui";

const IconWithHeading: React.FC<{ Icon: IconType; children?: ReactNode } & IconBaseProps> = ({ Icon, children, ...iconProps }) => (
	<div className="flex items-stretch gap-x-2">
		<Icon className="shrink-[0]" {...iconProps} /> <div>{children}</div>
	</div>
);

const ICONS = {
	check: CiCircleCheck,
	number: {
		1: PiNumberCircleOneLight,
		2: PiNumberCircleTwoLight,
		3: PiNumberCircleThreeLight,
		4: PiNumberCircleFourLight,
	},
	diamond: BsDiamondFill,
	question: BsQuestion,
};

const UserGuide = () => {
	return (
		<div className="overflow-auto">
			{/* Shared Version */}
			<div className="bg-black">
				<UserGuideShared />
			</div>
		</div>
	);
};

export default UserGuide;
