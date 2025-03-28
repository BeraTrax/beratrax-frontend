import earnpagedots from "@beratrax/core/src/assets/images/earnpagedots.svg";
import earnpageleaves from "@beratrax/core/src/assets/images/earnpagetoprightleaves1.svg";
import earnpageleaves2 from "@beratrax/core/src/assets/images/earnpagetoprightleaves2.svg";
import { IS_LEGACY } from "@beratrax/core/src/config/constants";
import { useEarnPage } from "@beratrax/core/src/state/farms/hooks";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "web/src/components/BackButton/BackButton";
import FarmRow from "web/src/components/FarmItem/FarmRow";

function Farms() {
  const navigate = useNavigate();
  const [openedFarm, setOpenedFarm] = useState<number | undefined>();
  const { sortedFarms, upcomingFarms, farms, selectedPlatform, setSelectedPlatform, setSortSelected, sortSelected } =
    useEarnPage();

  return (
    <div className="relative text-textWhite h-full overflow-y-auto overflow-x-hidden font-league-spartan">
      <img src={earnpageleaves2} alt="Dark green leaves" className="absolute -top-4 -right-1 w-50" />
      <img src={earnpageleaves} alt="Light green leaves" className="absolute top-0 right-0 w-40" />
      <img src={earnpagedots} alt="Dots" className="absolute top-2 right-14 w-40" />

      <div className="h-full pt-14 px-4 pb-2">
        <BackButton onClick={() => navigate(-1)} />

        {/* Heading */}
        <div className="mt-4">
          <h5 className="text-3xl font-bold uppercase">Earn</h5>
        </div>

        {farms.length === 0 ? (
          <div className="flex flex-col gap-2">
            <h6 className="mb-9 text-lg font-light">Vaults coming soon</h6>
          </div>
        ) : (
          <h6 className="mb-9 text-lg font-light">Available Protocols</h6>
        )}

        {/* Vaults */}
        <div className="flex flex-col gap-2">
          {sortedFarms
            ? sortedFarms
                .filter((farm) => (IS_LEGACY ? farm.isDeprecated : !farm.isDeprecated))
                .map((farm, index) => (
                  <FarmRow key={index + "nowallet"} farm={farm} openedFarm={openedFarm} setOpenedFarm={setOpenedFarm} />
                ))
            : farms
                .filter((farm) => (IS_LEGACY ? farm.isDeprecated : !farm.isDeprecated))
                .map((farm, index) => (
                  <FarmRow key={index + "nowallet"} farm={farm} openedFarm={openedFarm} setOpenedFarm={setOpenedFarm} />
                ))}
        </div>
        {/* Bottom padding */}
        {(window.location.origin.includes("staging") || window.location.origin.includes("localhost")) &&
          upcomingFarms.length > 0 && (
            <div className="flex flex-col mt-2 gap-2">
              {upcomingFarms.map((farm, index) => (
                <FarmRow key={index + "nowallet"} farm={farm} openedFarm={openedFarm} setOpenedFarm={setOpenedFarm} />
              ))}
            </div>
          )}
        <div className="h-32"></div>
      </div>
    </div>
  );
}

export default Farms;
