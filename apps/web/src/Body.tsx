import { Route, Routes } from "react-router-dom";
import Dashboard from "web/src/pages/Dashboard/Dashboard";
import Farms from "web/src/pages/Farms/Farms";
import { RoutesPaths } from "@beratrax/core/src/config/constants";
import { useDataRefresh } from "@beratrax/core/src/hooks";
import { usePageTracking } from "@beratrax/core/src/hooks";
import Leaderboard from "./pages/Dashboard/Leaderboard/Leaderboard";
import FarmAction from "./pages/FarmAction/FarmAction";
import FarmInfo from "./pages/FarmInfo/FarmInfo";
import Home from "./pages/Home/Home";
import Stats from "./pages/Stats/Stats";
import Withdrawals from "./pages/Stats/Withdrawals";
import Test from "./pages/Test/Test";
import UserGuide from "./pages/UserGuide/UserGuide";
import { Buy } from "./pages/Buy/Buy";
function Body() {
	usePageTracking();
	useDataRefresh();

	return (
		<Routes>
			<Route path={RoutesPaths.Home} element={<Home />}>
				<Route path={RoutesPaths.Farms} element={<Farms />} />
				<Route path="/earn/:vaultAddress" element={<FarmAction />} />
				<Route path={RoutesPaths.Test} element={<Test />} />
				<Route path={RoutesPaths.Test_pro_max} element={<FarmInfo />} />
				<Route path={RoutesPaths.Stats} element={<Stats />} />
				<Route path={RoutesPaths.Stats + "/withdrawals"} element={<Withdrawals />} />
				<Route path={RoutesPaths.Leaderboard} element={<Leaderboard />} />
				<Route path={RoutesPaths.UserGuide} element={<UserGuide />} />
				<Route path={RoutesPaths.Buy} element={<Buy />} />
				<Route path="" element={<Dashboard />} />
				<Route path="/:refCode" element={<Dashboard />} />
				<Route path="*" element={<h3 style={{ color: "white" }}>Not Found</h3>} />
			</Route>
		</Routes>
	);
}

export default Body;
