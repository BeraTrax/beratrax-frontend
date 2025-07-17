import DashboardActiveIcon from "@beratrax/core/src/assets/images/dashboardactiveicon.svg";
import DashboardNonActiveIcon from "@beratrax/core/src/assets/images/dashboardnonactiveicon.svg";
import EarnActiveIcon from "@beratrax/core/src/assets/images/earnactiveicon.svg";
import EarnNonActiveIcon from "@beratrax/core/src/assets/images/earnnonactiveicon.svg";
import LeaderboardActiveIcon from "@beratrax/core/src/assets/images/leaderboardactiveicon.svg";
import LeaderboardNonActiveIcon from "@beratrax/core/src/assets/images/leaderboardnonactiveicon.svg";
import CoinsActiveIcon from "@beratrax/core/src/assets/images/coinsactiveicon.svg";
import CoinsNonActiveIcon from "@beratrax/core/src/assets/images/coinsnonactiveicon.svg";
import UserGuideActiveIcon from "@beratrax/core/src/assets/images/userguideactiveicon.svg";
import UserGuideNonActiveIcon from "@beratrax/core/src/assets/images/userguidenonactiveicon.svg";
import { RoutesPaths } from "@beratrax/core/src/config/constants";
import { useLocation, useNavigate } from "react-router-dom";
import BottombarItem from "./BottombarItem";

type RouteButtonType = {
	title: string;
	route: string;
	activeIcon: any;
	nonActiveIcon: any;
	target?: string;
};

function BottomBar() {
	const location = useLocation();
	const navigate = useNavigate();

	const navItems: RouteButtonType[] = [
		{
			route: RoutesPaths.Home,
			activeIcon: DashboardActiveIcon,
			nonActiveIcon: DashboardNonActiveIcon,
			title: "Dashboard",
		},
		{
			route: RoutesPaths.Farms,
			activeIcon: EarnActiveIcon,
			nonActiveIcon: EarnNonActiveIcon,
			title: "Earn",
		},
		// {
		// 	route: RoutesPaths.Leaderboard,
		// 	activeIcon: LeaderboardActiveIcon,
		// 	nonActiveIcon: LeaderboardNonActiveIcon,
		// 	title: "Leaderboard",
		// },
		// {
		// 	route: RoutesPaths.Buy,
		// 	activeIcon: CoinsActiveIcon,
		// 	nonActiveIcon: CoinsNonActiveIcon,
		// 	title: "Buy",
		// },
		{
			route: RoutesPaths.UserGuide,
			activeIcon: UserGuideActiveIcon,
			nonActiveIcon: UserGuideNonActiveIcon,
			title: "User Guide",
		},
	];

	const handleNavigation = (route: string, target?: string) => {
		if (target === "noop") return;
		if (target) window.open(route, target);
		else navigate(route);
	};

	return (
		<div className={`bg-bgDark lg:hidden w-full flex justify-around items-center box-border rounded-3xl absolute bottom-0`}>
			{navItems.map((item, index) => {
				const isActive = location.pathname === item.route;
				const Icon = isActive ? item.activeIcon : item.nonActiveIcon;

				return (
					<BottombarItem
						key={index}
						title={item.title}
						icon={Icon}
						onClick={() => handleNavigation(item.route, item.target)}
						isActive={isActive}
						position={index === 0 ? "left" : index === navItems.length - 1 ? "right" : "middle"}
					/>
				);
			})}
		</div>
	);
}

export default BottomBar;
