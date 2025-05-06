import { PoolDef } from "@beratrax/core/src/config/constants/pools_json";
import { useApp, useTrax } from "@beratrax/core/src/hooks";
import React, { useEffect, useMemo, useState } from "react";
import { Image, View, Pressable, Text } from "react-native";
import { InfoIcon } from "ui/src/icons/Infoicon";
import { useRouter, Link } from "expo-router";
// import { Tooltip } from "react-tooltip";
import uuid from "react-uuid";
import { useAppDispatch, useAppSelector } from "@beratrax/core/src/state";
import { useFarmApy, useFarmDetails } from "@beratrax/core/src/state/farms/hooks";
import { toFixedFloor } from "@beratrax/core/src/utils/common";
import { Skeleton } from "ui/src/components/Skeleton/Skeleton";
import { DropDownView } from "./components/DropDownView/DropDownView";
import FarmRowChip from "./components/FarmRowChip/FarmRowChip";
import styles from "./FarmRow.module.css";

interface Props {
  farm: PoolDef;
  openedFarm: number | undefined;
  setOpenedFarm: Function;
}

const FarmRow: React.FC<Props> = ({ farm, openedFarm, setOpenedFarm }) => {
  const { lightMode } = useApp();
  const [dropDown, setDropDown] = useState(false);
  const { apy: farmApys, isLoading: isApyLoading } = useFarmApy(farm);
  const { farmDetails, isLoading: isFarmLoading } = useFarmDetails();
  const farmData = farmDetails[farm.id];
  const isLoading = isFarmLoading || isApyLoading;
  const key = uuid();
  const key2 = uuid();
  const key3 = uuid();
  const key4 = uuid();
  const dispatch = useAppDispatch();
  const { getTraxApy } = useTrax();
  const showVaultsWithFunds = useAppSelector((state) => state.settings.showVaultsWithFunds);
  const estimateTrax = useMemo(() => getTraxApy(farm.vault_addr), [getTraxApy, farm]);
  // const navigate = useNavigate();
  const router = useRouter();
  const handleNavigation = (route: string, target?: string) => {
    if (target) window.open(route, target);
    else router.push(route);
  };
  const handleClick = (e: any) => {
    // Check if router is initialized properly
    if (router) {
      try {
        router.push({
          pathname: "/Earn/[vaultAddr]",
          params: { vaultAddr: farm.vault_addr },
        });
      } catch (error) {
        // Fallback approach - using window.location for web context
        window.location.href = `/Earn/${farm.vault_addr}`;
      }
    } else {
      // If router is undefined, use direct navigation
      window.location.href = `/Earn/${farm.vault_addr}`;
    }
  };

  useEffect(() => {
    if (openedFarm !== farm?.id && dropDown) setDropDown(false);
    // if(!dropDown && openedFarm === farm?.id) setOpenedFarm(undefined)
  }, [openedFarm, dropDown, farm?.id]);

  if (isLoading) return <FarmRowSkeleton farm={farm} lightMode={lightMode} />;

  if (showVaultsWithFunds && parseFloat(farmData?.withdrawableAmounts[0].amountDollar || "0") < 0.01) return null;

  const hasDeposited =
    farmData?.withdrawableAmounts &&
    !isNaN(parseFloat(farmData?.withdrawableAmounts[0].amountDollar)) &&
    (parseInt(farmData?.withdrawableAmounts[0].amountDollar) > 0 ||
      Number(farmData?.withdrawableAmounts[0].amountDollar) > 0);

  const isHighlighted = farm.isCurrentWeeksRewardsVault;

  return (
    <View
      className={
        isHighlighted ? `relative p-[2px] rounded-3xl ${styles.gradientAnimation}` : `relative rounded-3xl bg-bgDark`
      }
    >
      <Pressable
        onPress={(e) => {
          if (!farm.isUpcoming) {
            e.preventDefault?.();
            handleClick(e);
          }
        }}
      >
        <View
          className={`
          ${!isHighlighted ? "bg-bgDark" : ""} 
          py-6 px-4 rounded-3xl relative cursor-pointer
          `}
        >
          <View className="flex flex-row justify-between items-center">
            {/* Asset Name and Logo */}
            <View className="flex flex-row items-center gap-2">
              <View className="flex flex-row justify-center items-center mr-2" style={{ position: "relative" }}>
                {farm?.logo1 && (
                  <Image
                    source={{ uri: farm.logo1 }}
                    alt={farm.alt1}
                    className="h-8 w-8 lg:h-14 lg:w-14 rounded-full"
                    style={{ zIndex: 1 }}
                  />
                )}
                {farm?.logo2 && (
                  <Image
                    source={{ uri: farm.logo2 }}
                    className="w-8 h-8 lg:h-14 lg:w-14 rounded-full -ml-4 sm:-ml-7"
                    alt={farm.alt2}
                    style={{ zIndex: 2, position: "relative" }}
                  />
                )}
                {farm?.logo3 && (
                  <Image
                    source={{ uri: farm.logo3 }}
                    className="w-8 h-8 lg:h-14 lg:w-14 rounded-full -ml-4 sm:-ml-7"
                    alt={farm.alt3}
                    style={{ zIndex: 3, position: "relative" }}
                  />
                )}
              </View>

              <View>
                <View className="flex flex-col">
                  <Text className="text-textWhite text-lg font-medium">{farm?.name}</Text>
                </View>
                <View className="flex flex-row items-center gap-1">
                  <FarmRowChip
                    text={farm?.platform + (farm?.secondary_platform ? ` | ${farm?.secondary_platform}` : "")}
                    color="invert"
                  />
                  <View className="flex flex-row">
                    <Image
                      alt={farm?.platform_alt}
                      className="w-4 h-4 rounded-full border border-bgDark"
                      source={{ uri: farm?.platform_logo }}
                    />
                    {farm?.secondary_platform && (
                      <Image
                        alt={farm?.secondary_platform}
                        className="w-4 h-4 rounded-full border border-bgDark"
                        source={{ uri: farm?.secondary_platform_logo }}
                      />
                    )}
                  </View>
                </View>
              </View>
            </View>

            {/* APY (Desktop) */}
            <View className="sm:block hidden">
              <View>
                {farmApys && toFixedFloor((farm.isUpcoming ? farm.total_apy : farmApys?.apy) || 0, 2) === 0 ? (
                  <Text className="text-textWhite">--</Text>
                ) : (
                  <View className="flex flex-col justify-end items-end">
                    <View className="flex justify-between gap-2">
                      {hasDeposited && !farm.isUpcoming && <FarmRowChip text="Deposited" />}
                      {farm.isCurrentWeeksRewardsVault && <FarmRowChip text="Boosted BGT" />}
                    </View>
                    <View className="flex gap-2 items-center">
                      <Text className="leading-7 text-textPrimary text-lg font-normal font-arame-mono">APY</Text>
                    </View>
                    <Text className="text-textWhite text-right">
                      {farm.isCurrentWeeksRewardsVault
                        ? "??? "
                        : farmApys && farmApys.apy < 0.01
                          ? farmApys.apy.toPrecision(2).slice(0, -1)
                          : toFixedFloor((farm.isUpcoming ? farm.total_apy : farmApys?.apy) || 0, 2).toString()}
                      %
                    </Text>
                    <Link href="/" id={key} data-tooltip-html={/* tooltip text here */ ""}>
                      {/* Possibly an info icon here */}
                    </Link>
                    {/* <Tooltip
                    anchorId={key}
                    className="shadow-md rounded-md bg-bgSecondary text-white px-2 py-1 leading-none"
                  /> */}
                  </View>
                )}
              </View>
            </View>

            {/* APY (Mobile) */}
            <View className="flex flex-col items-center justify-center min-w-[60px] mobile:block mobile:min-w-fit sm:hidden">
              {hasDeposited && !farm.isUpcoming && <FarmRowChip text="Deposited" />}
              {
                <>
                  <View className="flex flex-row gap-2 items-center">
                    <Text className="leading-7 text-textPrimary text-lg font-normal font-arame-mono">APY</Text>
                    <InfoIcon size={16} />
                  </View>
                  {farmApys && toFixedFloor((farm.isUpcoming ? farm.total_apy : farmApys?.apy) || 0, 2) === 0 ? (
                    <Text className="text-textWhite text-right">--</Text>
                  ) : (
                    <>
                      <Text className="text-textWhite text-right">
                        {farmApys && farmApys.apy < 0.01
                          ? farmApys.apy.toPrecision(2).slice(0, -1)
                          : toFixedFloor((farm.isUpcoming ? farm.total_apy : farmApys?.apy) || 0, 2).toString()}
                        %
                        <Link href="/" id={key2} data-tooltip-html={/* tooltip text here */ ""}>
                          {/* Possibly an info icon here */}
                        </Link>
                        {/* <Tooltip
                        anchorId={key2}
                        className="shadow-md rounded-md bg-bgDark text-white px-2 py-1 leading-none"
                      /> */}
                      </Text>
                    </>
                  )}
                </>
              }
            </View>
          </View>

          {/* This is your dropdown, if any */}
          {dropDown && <DropDownView farm={farm} />}
        </View>
      </Pressable>
    </View>
  );
};

export default FarmRow;

const FarmRowSkeleton = ({ farm, lightMode }: { farm: PoolDef; lightMode: boolean }) => {
  const { apy: farmApys, isLoading: isApyLoading } = useFarmApy(farm);
  const key = uuid();
  const { farmDetails, isLoading: isFarmLoading } = useFarmDetails();
  const farmData = farmDetails[farm.id];

  return (
    <View>
      <View className="flex justify-between gap-5 px-6 py-4 text-center">
        {/* Asset Name and Logo */}

        <View className="flex justify-center flex-row items-center">
          <View className="flex mr-2">
            {farm.logo1 ? <Image alt={farm.alt1} className={`h-11 md:h-14 rounded-full`} src={farm.logo1} /> : null}

            {farm.logo2 ? (
              <Image alt={farm.alt2} className={`w-11 h-11 md:w-14 md:h-14 ml-[-10px] rounded-full`} src={farm.logo2} />
            ) : null}
            {farm.logo3 ? (
              <Image alt={farm.alt3} className={`w-11 h-11 md:w-14 md:h-14 ml-[-10px] rounded-full`} src={farm.logo3} />
            ) : null}
          </View>

          <View>
            <View>
              <Text className={`whitespace-nowrap text-[17px] font-bold text-textWhite`}>{farm.name}</Text>
              {/* <div className="flex items-center">
                                <p className={`text-textWhite text-sm mr-1`}>{farm.platform}</p>
                                <img
                                    alt={farm.platform_alt}
                                    className="w-4 rounded-full border-black bg-black"
                                    src={farm.platform_logo}
                                />
                            </div> */}
            </View>
          </View>
        </View>

        {/* APY */}
        {isApyLoading ? (
          <View className={`flex-col justify-center items-center sm:flex hidden`}>
            <Skeleton w={50} h={30} />
          </View>
        ) : (
          <View className={`gap-1 justify-center items-center sm:flex hidden`}>
            <View className={`flex items-center flex-col gap-[6px]`}>
              <Text className={`whitespace-nowrap text-lg	 font-bold text-textWhite`}>
                {farmApys && farmApys.apy < 0.01
                  ? farmApys.apy.toPrecision(2).slice(0, -1)
                  : toFixedFloor(farmApys?.apy || 0, 2).toString()}
                %
              </Text>
              <Link
                href="/"
                id={key}
                data-tooltip-html={`<p>
                                            <b>Base APRs</b>
                                        </p>
                                        ${
                                          farmApys && Number(farmApys.rewardsApr.toFixed(3))
                                            ? `<p>LP Rewards: ${farmApys.rewardsApr.toFixed(3)}%</p>`
                                            : ``
                                        }
                                        ${
                                          farmApys && Number(farmApys.feeApr.toFixed(2))
                                            ? `<p>Trading Fees: ${farmApys.feeApr.toFixed(3)}%</p>`
                                            : ``
                                        }
                                        ${
                                          farmApys && Number(farmApys.compounding.toFixed(3))
                                            ? `<p>Compounding: ${farmApys.compounding.toFixed(3)}%</p>`
                                            : ``
                                        }`}
              >
                {/* <CgInfo className={`text-textPrimary text-right	 ml-1`} /> */}
              </Link>
              {/* <Tooltip anchorId={key} className={`shadow-md rounded-md bg-bgDark text-white px-2 py-1 leading-none`} /> */}
            </View>
          </View>
        )}

        {/* How much the user has deposited */}
        {/* <div className={`flex-[2] flex flex-col justify-center items-center desktop-farm`}>
                    {!farmData && <Skeleton w={50} h={30} />}
                </div> */}

        {/* How much the user has Earned */}

        {/* <div className={`container1 ${lightMode && "container1--light"} desktop`}>
                    {isFarmLoading && <Skeleton w={50} h={30} />}
                </div> */}

        {/* Mobile View */}

        {/* APY */}

        <View
          className={`flex flex-col min-w-14 gap-1 mobile:min-w-full mobile:flex-row justify-center items-center sm:hidden`}
        >
          {isApyLoading ? (
            <Skeleton w={50} h={30} />
          ) : (
            <View
              className={`flex flex-col min-w-14 gap-1 mobile:min-w-full mobile:flex-row justify-center items-center`}
            >
              <Text className={`whitespace-nowrap text-lg	 font-bold text-textWhite`}>APY</Text>
              <Text className={`whitespace-nowrap text-lg	 font-bold text-textWhite`}>
                {farmApys && farmApys.apy < 0.01
                  ? farmApys.apy.toPrecision(2).slice(0, -1)
                  : toFixedFloor(farmApys?.apy || 0, 2).toString()}
                %
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

