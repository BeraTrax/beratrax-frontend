import { Outlet, useLocation } from "react-router-dom";
import BottomBar from "src/components/Bottombar/BottomBar";
import { InternetConnectionModal } from "src/components/modals/InternetConnectionModal/InternetConnectionModal";
import Sidebar from "src/components/Sidebar/Sidebar";
import { RoutesPaths } from "src/config/constants";
import { useAppSelector } from "src/state";
import { useRefCodeLoaded } from "src/state/account/useAccountData";

function Home() {
  const { isOnline } = useAppSelector((state) => state.internet);
  const { pathname } = useLocation();
  useRefCodeLoaded();

  const isBottomBarVisible = Object.values([
    RoutesPaths.Home,
    RoutesPaths.Farms,
    RoutesPaths.UserGuide,
    RoutesPaths.Leaderboard,
  ]).includes(pathname);

  return (
    <div className={`w-full h-[100dvh] fixed inset-0 overflow-hidden bg-bgSecondary`}>
      <div className="w-full h-[100dvh] flex flex-col lg:flex-row overflow-hidden font-league-spartan bg-bgSecondary ">
        {/* sidebar */}
        <div className="flex-[2] max-w-[var(--side-bar-width)] hidden lg:block">
          <Sidebar />
        </div>

        {/* right side */}
        <div
          className={`flex-[10] w-full h-full flex flex-col relative overflow-y-auto pb-16 lg:pb-0 [&>p]:text-textWhite [&>p]:text-3xl [&>p]:font-bold`}
        >
          <Outlet />
          {isBottomBarVisible ? <BottomBar /> : <></>}




        </div>
      </div>
      {!isOnline && <InternetConnectionModal />}
    </div>
  );
}

export default Home;