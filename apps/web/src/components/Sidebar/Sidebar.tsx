import { ReactComponent as EarnIcon } from "@beratrax/core/src/assets/images/earn.svg";
import logo from "@beratrax/core/src/assets/images/logo.png";
import { RoutesPaths, isDev } from "@beratrax/core/src/config/constants";
import { AiOutlineExport } from "react-icons/ai";
import { HiDocumentText } from "react-icons/hi";
import { ImStatsDots } from "react-icons/im";
import { FaCoins } from "react-icons/fa6";
import { IoIosFlask } from "react-icons/io";
import { MdSpaceDashboard } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import SidebarItem from "./SidebarItem";

function Sidebar() {
	const navigate = useNavigate();
	const { pathname } = useLocation();

	const handleNavigation = (route: string, target?: string) => {
		if (target === "noop") return;
		if (target) window.open(route, target);
		else navigate(route);
	};

	const routes = [
		{
			title: "Dashboard",
			icon: <MdSpaceDashboard size={18} />,
			path: RoutesPaths.Home,
		},
		{
			title: "Earn",
			icon: <EarnIcon height={18} width={18} />,
			path: RoutesPaths.Farms,
			target: undefined,
		},
		// {
		// 	title: "Leaderboard",
		// 	icon: <ImStatsDots size={15} />,
		// 	path: RoutesPaths.Leaderboard,
		// 	target: undefined,
		// },
		{
			title: "Buy (thoon!)",
			icon: <FaCoins size={18} />,
			path: RoutesPaths.Buy,
			target: undefined,
		},
		{
			title: "User Guide",
			icon: <HiDocumentText size={18} />,
			iconRight: <AiOutlineExport size={12} />,
			path: RoutesPaths.UserGuide,
			target: undefined,
		},
		{
			title: "Stats",
			icon: <ImStatsDots size={15} />,
			path: RoutesPaths.Stats,
			isDev: true,
			target: undefined,
		},

		{
			title: "Test",
			icon: <IoIosFlask size={18} />,
			path: RoutesPaths.Test_pro_max,
			isDev: true,
			target: undefined,
		},
	];

	return (
		<div className="flex h-screen flex-col border-r border-borderDark p-4 pt-5 uppercase text-sm font-medium tracking-wide	">
			<img src={logo} alt="beratrax-logo" className="w-[90%] mb-6 mx-auto" />

			<div className="mt-6 flex flex-col flex-1">
				{routes
					.filter((e) => Boolean(e.isDev) === isDev)
					.map((route) => (
						<SidebarItem
							key={route.title}
							title={route.title}
							icon={route.icon}
							iconRight={route.iconRight}
							onClick={() => handleNavigation(route.path, route.target)}
							active={pathname === route.path}
						/>
					))}
			</div>
		</div>
	);
}

export default Sidebar;
