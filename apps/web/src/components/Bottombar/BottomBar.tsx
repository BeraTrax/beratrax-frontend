import { useLocation, useNavigate } from "react-router-dom";
import DashboardActiveIcon from "src/assets/images/dashboardactiveicon.svg";
import DashboardNonActiveIcon from "src/assets/images/dashboardnonactiveicon.svg";
import EarnActiveIcon from "src/assets/images/earnactiveicon.svg";
import EarnNonActiveIcon from "src/assets/images/earnnonactiveicon.svg";
import LeaderboardActiveIcon from "src/assets/images/leaderboardactiveicon.svg";
import LeaderboardNonActiveIcon from "src/assets/images/leaderboardnonactiveicon.svg";
import CoinsActiveIcon from "src/assets/images/coinsactiveicon.svg";
import CoinsNonActiveIcon from "src/assets/images/coinsnonactiveicon.svg";
import UserGuideActiveIcon from "src/assets/images/userguideactiveicon.svg";
import UserGuideNonActiveIcon from "src/assets/images/userguidenonactiveicon.svg";
import { RoutesPaths } from "src/config/constants";
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
        {
            route: RoutesPaths.Leaderboard,
            activeIcon: LeaderboardActiveIcon,
            nonActiveIcon: LeaderboardNonActiveIcon,
            title: "BTX Points",
        },
        {
            route: RoutesPaths.Buy,
            activeIcon: CoinsActiveIcon,
            nonActiveIcon: CoinsNonActiveIcon,
            title: "Buy",
        },
        {
            route: RoutesPaths.UserGuide,
            activeIcon: UserGuideActiveIcon,
            nonActiveIcon: UserGuideNonActiveIcon,
            title: "User Guide",
        },
    ];

    const handleNavigation = (route: string, target?: string) => {
        if (target) window.open(route, target);
        else navigate(route);
    };

    return (
        <div
            className={`bg-bgDark lg:hidden w-full flex justify-around items-center box-border rounded-3xl absolute bottom-0`}
        >
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
