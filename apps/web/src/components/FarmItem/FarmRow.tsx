import React, { useEffect, useMemo, useState } from "react";
import { CgInfo } from "react-icons/cg";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import uuid from "react-uuid";
import { PoolDef } from "src/config/constants/pools_json";
import useApp from "src/hooks/useApp";
import useTrax from "src/hooks/useTrax";
import useWallet from "src/hooks/useWallet";
import { useAppDispatch, useAppSelector } from "src/state";
import useFarmApy from "src/state/farms/hooks/useFarmApy";
import useFarmDetails from "src/state/farms/hooks/useFarmDetails";
import { toFixedFloor } from "src/utils/common";
import { Skeleton } from "../Skeleton/Skeleton";
import { DropDownView } from "./components/DropDownView/DropDownView";
import FarmRowChip from "./components/FarmRowChip/FarmRowChip";
import styles from "./FarmRow.module.css";

const BTXTokenomics = "https://contraxfi.medium.com/contrax-initial-tokenomics-837d062596a4";
interface Props {
    farm: PoolDef;
    openedFarm: number | undefined;
    setOpenedFarm: Function;
}

const FarmRow: React.FC<Props> = ({ farm, openedFarm, setOpenedFarm }) => {
    const { lightMode } = useApp();
    const { externalChainId } = useWallet();
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
    const navigate = useNavigate();
    const handleNavigation = (route: string, target?: string) => {
        if (target) window.open(route, target);
        else navigate(route);
    };
    const handleClick = (e: any) => {
        handleNavigation("/earn/" + farm.vault_addr);
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

    const isHighlighted = farm.isCurrentWeeksRewardsVault || farm.isBoosted;

    return (
        <div
            className={
                isHighlighted
                    ? `relative p-[2px] rounded-3xl ${styles.gradientAnimation}`
                    : `relative rounded-3xl bg-bgDark`
            }
        >
            <div
                className={`
                            ${!isHighlighted ? "bg-bgDark" : ""} 
                            py-6 px-4 rounded-3xl relative cursor-pointer
                            `}
                onClick={!farm.isUpcoming ? handleClick : undefined}
            >
                <div className="flex justify-between items-center">
                    {/* Asset Name and Logo */}
                    <div className="flex items-center gap-2">
                        <div className="flex justify-center items-center gap-y-2 mr-2">
                            {farm?.logo1 && (
                                <img
                                    alt={farm?.alt1}
                                    className="mr-[-5px] h-8 md:mr-0 lg:h-14 max-w-fit rounded-full"
                                    src={farm?.logo1}
                                />
                            )}
                            {farm?.logo2 && (
                                <img
                                    alt={farm?.alt2}
                                    className="w-8 h-8 lg:h-14 lg:w-14 ml-[-10px] lg:ml-[-25px] max-w-fit rounded-full"
                                    src={farm?.logo2}
                                />
                            )}
                            {farm?.logo3 && (
                                <img
                                    alt={farm?.alt3}
                                    className="w-8 h-8 lg:h-14 lg:w-14 ml-[-10px] lg:ml-[-25px] max-w-fit rounded-full"
                                    src={farm?.logo3}
                                />
                            )}
                        </div>

                        <div>
                            <div className="flex flex-col">
                                <p className="text-textWhite text-lg font-medium">{farm?.name}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <FarmRowChip
                                    text={
                                        farm?.platform +
                                        (farm?.secondary_platform ? ` | ${farm?.secondary_platform}` : "")
                                    }
                                    color="invert"
                                />
                                <div className="flex">
                                    <img
                                        alt={farm?.platform_alt}
                                        className="w-4 rounded-full border border-bgDark"
                                        src={farm?.platform_logo}
                                    />
                                    {farm?.secondary_platform && (
                                        <img
                                            alt={farm?.secondary_platform}
                                            className="w-4 rounded-full border border-bgDark"
                                            src={farm?.secondary_platform_logo}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* APY (Desktop) */}
                    <div className="sm:block hidden">
                        <div>
                            {farmApys &&
                            toFixedFloor((farm.isUpcoming ? farm.total_apy : farmApys?.apy) || 0, 2) === 0 ? (
                                <p className="text-textWhite">--</p>
                            ) : (
                                <div className="flex flex-col justify-end items-end">
                                    <div className="flex justify-between gap-2">
                                        {hasDeposited && !farm.isUpcoming && <FarmRowChip text="Deposited" />}
                                        {farm.isCurrentWeeksRewardsVault && <FarmRowChip text="Boosted BGT" />}
                                        {farm.isBoosted && <FarmRowChip text={`Jumper Boost`} />}
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <p className="leading-7 text-textPrimary text-lg font-normal font-arame-mono">
                                            APY
                                        </p>
                                    </div>
                                    <p className="text-textWhite text-right">
                                        {farm.isCurrentWeeksRewardsVault
                                            ? "??? "
                                            : farmApys && farmApys.apy < 0.01
                                            ? (farmApys.apy + (farmApys.merklApr || 0)).toPrecision(2).slice(0, -1)
                                            : toFixedFloor(
                                                  (farm.isUpcoming ? farm.total_apy : farmApys?.apy) || 0,
                                                  2
                                              ).toString()}
                                        %
                                    </p>
                                    <a id={key} data-tooltip-html={/* tooltip text here */ ""}>
                                        {/* Possibly an info icon here */}
                                    </a>
                                    <Tooltip
                                        anchorId={key}
                                        className="shadow-md rounded-md bg-bgSecondary text-white px-2 py-1 leading-none"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* APY (Mobile) */}
                    <div className="flex flex-col items-center justify-center min-w-[60px] mobile:block mobile:min-w-fit sm:hidden">
                        {hasDeposited && !farm.isUpcoming && <FarmRowChip text="Deposited" />}
                        {
                            <>
                                <div className="flex gap-2 items-center">
                                    <p className="leading-7 text-textPrimary text-lg font-normal font-arame-mono">
                                        APY
                                    </p>
                                    <CgInfo className="text-textSecondary hoverable w-4 h-4" />
                                </div>
                                {farmApys &&
                                toFixedFloor((farm.isUpcoming ? farm.total_apy : farmApys?.apy) || 0, 2) === 0 ? (
                                    <p className="text-textWhite text-right">--</p>
                                ) : (
                                    <>
                                        <p className="text-textWhite text-right">
                                            {farmApys && farmApys.apy < 0.01
                                                ? farmApys.apy.toPrecision(2).slice(0, -1)
                                                : toFixedFloor(
                                                      (farm.isUpcoming ? farm.total_apy : farmApys?.apy) || 0,
                                                      2
                                                  ).toString()}
                                            %
                                            <a id={key2} data-tooltip-html={/* tooltip text here */ ""}>
                                                {/* Possibly an info icon here */}
                                            </a>
                                            <Tooltip
                                                anchorId={key2}
                                                className="shadow-md rounded-md bg-bgDark text-white px-2 py-1 leading-none"
                                            />
                                        </p>
                                    </>
                                )}
                            </>
                        }
                    </div>
                </div>

                {/* This is your dropdown, if any */}
                {dropDown && <DropDownView farm={farm} />}
            </div>
        </div>
    );
};

export default FarmRow;

const FarmRowSkeleton = ({ farm, lightMode }: { farm: PoolDef; lightMode: boolean }) => {
    const { apy: farmApys, isLoading: isApyLoading } = useFarmApy(farm);
    const key = uuid();
    const { farmDetails, isLoading: isFarmLoading } = useFarmDetails();
    const farmData = farmDetails[farm.id];

    return (
        <div>
            <div className="flex justify-between gap-5 px-6 py-4 text-center">
                {/* Asset Name and Logo */}

                <div className="flex justify-center flex-row items-center">
                    <div className="flex mr-2">
                        {farm.logo1 ? (
                            <img alt={farm.alt1} className={`h-11 md:h-14 rounded-full`} src={farm.logo1} />
                        ) : null}

                        {farm.logo2 ? (
                            <img
                                alt={farm.alt2}
                                className={`w-11 h-11 md:w-14 md:h-14 ml-[-10px] rounded-full`}
                                src={farm.logo2}
                            />
                        ) : null}
                        {farm.logo3 ? (
                            <img
                                alt={farm.alt3}
                                className={`w-11 h-11 md:w-14 md:h-14 ml-[-10px] rounded-full`}
                                src={farm.logo3}
                            />
                        ) : null}
                    </div>

                    <div>
                        <div>
                            <p className={`whitespace-nowrap text-[17px] font-bold text-textWhite`}>{farm.name}</p>
                            {/* <div className="flex items-center">
                                <p className={`text-textWhite text-sm mr-1`}>{farm.platform}</p>
                                <img
                                    alt={farm.platform_alt}
                                    className="w-4 rounded-full border-black bg-black"
                                    src={farm.platform_logo}
                                />
                            </div> */}
                        </div>
                    </div>
                </div>

                {/* APY */}
                {isApyLoading ? (
                    <div className={`flex-col justify-center items-center sm:flex hidden`}>
                        <Skeleton w={50} h={30} />
                    </div>
                ) : (
                    <div className={`gap-1 justify-center items-center sm:flex hidden`}>
                        <div className={`flex items-center flex-col gap-[6px]`}>
                            <p className={`whitespace-nowrap text-lg	 font-bold text-textWhite`}>
                                {farmApys && farmApys.apy < 0.01
                                    ? farmApys.apy.toPrecision(2).slice(0, -1)
                                    : toFixedFloor(farmApys?.apy || 0, 2).toString()}
                                %
                            </p>
                            <a
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
                                <CgInfo className={`text-textPrimary text-right	 ml-1`} />
                            </a>
                            <Tooltip
                                anchorId={key}
                                className={`shadow-md rounded-md bg-bgDark text-white px-2 py-1 leading-none`}
                            />
                        </div>
                    </div>
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

                <div
                    className={`flex flex-col min-w-14 gap-1 mobile:min-w-full mobile:flex-row justify-center items-center sm:hidden`}
                >
                    {isApyLoading ? (
                        <Skeleton w={50} h={30} />
                    ) : (
                        <div
                            className={`flex flex-col min-w-14 gap-1 mobile:min-w-full mobile:flex-row justify-center items-center`}
                        >
                            <p className={`whitespace-nowrap text-lg	 font-bold text-textWhite`}>APY</p>
                            <p className={`whitespace-nowrap text-lg	 font-bold text-textWhite`}>
                                {farmApys && farmApys.apy < 0.01
                                    ? farmApys.apy.toPrecision(2).slice(0, -1)
                                    : toFixedFloor(farmApys?.apy || 0, 2).toString()}
                                %
                            </p>
                        </div>
                    )}
                </div>

                {/* <div className={`mobile-view ${lightMode && "mobile-view--light"}`}> */}
                {/* How much the user has deposited */}

                {/* <div className={`container ${lightMode && "container--light"} deposite`}>
                        {isFarmLoading && <Skeleton w={50} h={30} />}
                    </div> */}

                {/* How much the user has Earned */}

                {/* <div className={`container1 ${lightMode && "container1--light"} earned`}>
                        {isFarmLoading && <Skeleton w={50} h={30} />}
                    </div> */}
                {/* </div> */}

                {/* <div className={`w-4 text-textWhite text-xl self-center`}>{true && <Skeleton w={20} h={20} />}</div> */}
            </div>
        </div>
    );
};
