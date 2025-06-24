import { Route, Routes } from "react-router-dom";
import Dashboard from "web/src/pages/Dashboard/Dashboard";
import Farms from "web/src/pages/Farms/Farms";
import { RoutesPaths } from "@beratrax/core/src/config/constants";
import { useDataRefresh } from "@beratrax/core/src/hooks";
import { usePageTracking } from "@beratrax/core/src/hooks";
import Leaderboard from "web/src/pages/Dashboard/Leaderboard/Leaderboard";
import FarmAction from "web/src/pages/FarmAction/FarmAction";
import FarmInfo from "web/src/pages/FarmInfo/FarmInfo";
import Home from "web/src/pages/Home/Home";
import Stats from "web/src/pages/Stats/Stats";
import Withdrawals from "web/src/pages/Stats/Withdrawals";
import Test from "web/src/pages/Test/Test";
import UserGuide from "web/src/pages/UserGuide/UserGuide";
import { Buy } from "web/src/pages/Buy/Buy";
import BurrBearAdmin from "web/src/pages/BurrBearAdmin/BurrBearAdmin";
import { Status } from "./pages/Status/Status";

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
				<Route path={RoutesPaths.BurrBearAdmin} element={<BurrBearAdmin />} />
				<Route path={RoutesPaths.Status} element={<Status />} />
				<Route path="" element={<Dashboard />} />
				<Route path="/:refCode" element={<Dashboard />} />
				<Route path="*" element={<h3 style={{ color: "white" }}>Not Found</h3>} />
			</Route>
		</Routes>
	);
}

export default Body;
