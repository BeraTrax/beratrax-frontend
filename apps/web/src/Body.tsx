import { Route, Routes } from "react-router-dom";
import Dashboard from "src/pages/Dashboard/Dashboard";
import Farms from "src/pages/Farms/Farms";
import { RoutesPaths } from "./config/constants";
import { useDataRefresh } from "./hooks/useDataRefresh";
import usePageTracking from "./hooks/usePageTracking";
import Leaderboard from "./pages/Dashboard/Leaderboard/Leaderboard";
import DeprecatedVaults from "./pages/DeprecatedVaults/DeprecatedVaults";
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
                <Route path={RoutesPaths.DeprecatedVaults} element={<DeprecatedVaults />} />
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
