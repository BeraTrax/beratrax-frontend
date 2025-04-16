import { FaArrowTrendUp } from "react-icons/fa6";
import { GoRocket } from "react-icons/go";
import created from "src/assets/images/created.svg";
import flywheelChart from "src/assets/images/flywheelChart.png";
import flywheelChartMobile from "src/assets/images/flywheelChartMobile.png";
import marketcap from "src/assets/images/marketcap.svg";
import volume from "src/assets/images/volume.svg";
import btxLogo from "src/assets/images/btxTokenLogo.png";
import { FarmOriginPlatform, FarmType } from "src/types/enums";
import { PoolDef, tokenNamesAndImages } from "src/config/constants/pools_json";
import { Apys } from "src/state/apys/types";
import { useMemo } from "react";
import { customCommify, toFixedFloor } from "src/utils/common";
import useFarmApy from "src/state/farms/hooks/useFarmApy";
import lbgtLogo from "src/assets/images/lbgt.svg";

const StatInfo = ({
    iconUrl,
    title,
    subtitle,
    value,
    isStatLoading,
}: {
    iconUrl: string | React.ReactNode;
    title: string;
    value: number | string;
    subtitle?: string;
    isStatLoading?: boolean;
}) => {
    return (
        <div className="flex items-center gap-4 bg-bgDark py-4 px-4 mt-2 rounded-2xl backdrop-blur-lg">
            {typeof iconUrl === "string" ? (
                <img src={iconUrl} alt={title} className="flex-shrink-0 flex-grow-0 w-10 h-10" />
            ) : (
                iconUrl
            )}
            <div className={"flex-1"}>
                <h2 className="text-textWhite text-lg font-medium">{title}</h2>
                {subtitle && <p className="text-textSecondary text-[16px] font-light">{subtitle}</p>}
            </div>
            {isStatLoading ? (
                <div className="h-7 w-32 bg-gray-700 rounded animate-pulse" />
            ) : (
                <h2 className="text-textWhite text-lg font-medium">{value}</h2>
            )}
        </div>
    );
};
interface IProps {
    farm: PoolDef;
    marketCap: string;
    vaultTvl: string;
    marketCapLoading?: boolean;
    vaultTvlLoading?: boolean;
}
const PoolInfo = ({ farm, marketCap, vaultTvl, marketCapLoading, vaultTvlLoading }: IProps) => {
    const {
        originPlatform,
        token_type: tokenType,
        token1,
        token2,
        token3,
        isAutoCompounded,
        description,
        source,
    } = farm;
    const { apy: farmApys } = useFarmApy(farm);

    const _underlyingApy = useMemo(() => {
        return toFixedFloor((farm.isUpcoming ? farm.total_apy : farmApys?.feeApr + farmApys?.rewardsApr) || 0, 2);
    }, [farmApys]);
    const underlyingApy = useMemo(() => {
        return farm.isCurrentWeeksRewardsVault ? "??? " : customCommify(_underlyingApy, { minimumFractionDigits: 0 });
    }, [farm.isCurrentWeeksRewardsVault, _underlyingApy]);
    const underlyingApyWithPoints = useMemo(() => {
        return farmApys.pointsApr > 0
            ? customCommify(_underlyingApy + farmApys?.pointsApr, { minimumFractionDigits: 0 }) + "%"
            : 0;
    }, [farmApys, _underlyingApy]);

    const _beratraxApy = useMemo(() => {
        return toFixedFloor((farm.isUpcoming ? farm.total_apy : farmApys?.apy) || 0, 2);
    }, [farmApys, farm.isCurrentWeeksRewardsVault, farm.isUpcoming, farm.total_apy]);

    const beraTraxApy = useMemo(() => {
        return farm.isCurrentWeeksRewardsVault ? "??? " : customCommify(_beratraxApy, { minimumFractionDigits: 0 });
    }, [farm.isCurrentWeeksRewardsVault, _beratraxApy]);
    const beraTraxApyWithPoints = useMemo(() => {
        return farmApys.pointsApr > 0
            ? customCommify(_beratraxApy + farmApys?.pointsApr, { minimumFractionDigits: 0 }) + "%"
            : 0;
    }, [farmApys, _beratraxApy]);

    const createdDate = new Date((farm.createdAt ?? 0) * 1000);
    const createdDateString = createdDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const showFlywheelChart = farm.originPlatform === FarmOriginPlatform.Infrared && farm.id !== 7;

    const token1Image = tokenNamesAndImages[token1]?.logos[0];
    const token2Image = token2 ? tokenNamesAndImages[token2]?.logos[0] : null;
    const token3Image = token3 ? tokenNamesAndImages[token3]?.logos[0] : null;
    const honeyLogo = tokenNamesAndImages["0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce"]?.logos[0];
    const wberaLogo = tokenNamesAndImages["0x6969696969696969696969696969696969696969"]?.logos[0];
    const ibgtLogo = tokenNamesAndImages["0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b"]?.logos[0];

    return (
        <div className=" mt-4 relative">
            {description && (
                <>
                    <h3 className="text-textWhite font-arame-mono font-normal text-[16px] leading-[18px] tracking-widest">
                        ABOUT
                    </h3>
                    {/* {farm.id === 8 && (
                        <p className="text-textWhite mt-4 text-[16px] font-light">
                            JUMPER CAMPAIGN NOTICE: The Boosted APY is only applicable for those who deposited through
                            the{" "}
                            <a
                                href="https://jumper.exchange/quests/rewards-from-beratrax-campaign-2"
                                target="_blank"
                                className="text-gradientPrimary uppercase hover:underline"
                            >
                                Jumper Campaign.
                            </a>
                        </p>
                    )} */}
                    <p className="text-textWhite mt-2 text-[16px] font-light">{description}</p>
                    <p className="text-textWhite mt-4 text-[16px] font-light">
                        You can see the underlying vault on the platform{" "}
                        <a href={source} target="_blank" className="text-gradientPrimary uppercase hover:underline">
                            here
                        </a>
                        .
                    </p>
                </>
            )}
            {showFlywheelChart && (
                <>
                    <img
                        src={flywheelChart}
                        alt="Flywheel Chart"
                        className="w-full xl:w-[1200px] h-auto hidden md:block"
                    />
                    <img src={flywheelChartMobile} alt="Flywheel Chart" className="w-full h-auto block md:hidden" />
                </>
            )}
            <div className="mt-6 mb-6">
                <h3 className="text-textWhite font-arame-mono font-normal text-[16px] leading-[18px] tracking-widest mb-4">
                    REWARDS BREAKDOWN
                </h3>
                <div className="overflow-hidden rounded-xl bg-bgSecondary">
                    <table className="w-full border-collapse">
                        <tbody>
                            {tokenType === FarmType.advanced && (
                                <tr className="border-b border-gray-700">
                                    <td className="p-4 text-textWhite font-medium">
                                        <div className="flex items-center">
                                            <div className="flex -space-x-2.5 mr-2">
                                                {token1Image && (
                                                    <img
                                                        src={token1Image}
                                                        alt={token1}
                                                        className="w-5 h-5 relative z-30"
                                                    />
                                                )}
                                                {token2Image && (
                                                    <img
                                                        src={token2Image}
                                                        alt={token2}
                                                        className="w-5 h-5 relative z-20"
                                                    />
                                                )}
                                                {token3Image && (
                                                    <img
                                                        src={token3Image}
                                                        alt={token3}
                                                        className="w-5 h-5 relative z-10"
                                                    />
                                                )}
                                            </div>
                                            LP Trading fees
                                        </div>
                                    </td>
                                    <td className="p-4 text-gradientPrimary font-bold text-right">Included in APY</td>
                                </tr>
                            )}

                            {/* TODO: change to dynamic reward token */}
                            {(isAutoCompounded || originPlatform === FarmOriginPlatform.Burrbear) && (
                                <tr className="border-b border-gray-700">
                                    <td className="p-4 text-textWhite font-medium">
                                        <div className="flex items-center gap-2">
                                            {originPlatform === FarmOriginPlatform.Infrared &&
                                            tokenType === FarmType.advanced ? (
                                                <>
                                                    <img src={ibgtLogo} alt="iBGT" className="w-5 h-5" />
                                                    iBGT
                                                </>
                                            ) : originPlatform === FarmOriginPlatform.Burrbear ||
                                              originPlatform === FarmOriginPlatform.BeraPaw ? (
                                                <>
                                                    {farm.id === 22 ? (
                                                        <>
                                                            <img src={wberaLogo} alt="WBERA" className="w-5 h-5" />
                                                            WBERA
                                                        </>
                                                    ) : (
                                                        <>
                                                            <img src={lbgtLogo} alt="LBGT" className="w-5 h-5" />
                                                            LBGT
                                                        </>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <img src={honeyLogo} alt="HONEY" className="w-5 h-5" />
                                                    HONEY
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-gradientPrimary font-bold text-right">
                                        Autocompounded to APY
                                    </td>
                                </tr>
                            )}
                            {originPlatform === FarmOriginPlatform.Infrared && (
                                <tr className="border-b border-gray-700">
                                    <td className="p-4 text-textWhite font-medium">
                                        <div className="flex items-center gap-2">
                                            <img src="/infrared.ico" alt="Infrared" className="w-5 h-5" />
                                            Infrared airdrop
                                        </div>
                                    </td>
                                    <td className="p-4 text-gradientPrimary font-bold text-right">Future claim</td>
                                </tr>
                            )}
                            {originPlatform === FarmOriginPlatform.Burrbear && (
                                <>
                                    {farm.name.includes("wgBERA") && (
                                        <tr className="border-b border-gray-700">
                                            <td className="p-4 text-textWhite font-medium">
                                                <div className="flex items-center gap-2">
                                                    <img src="/smilee.png" alt="Smilee" className="w-5 h-5" />
                                                    Love Score airdrop
                                                </div>
                                            </td>
                                            <td className="p-4 text-gradientPrimary font-bold text-right">
                                                Non-compounding APR (Future Claim)
                                            </td>
                                        </tr>
                                    )}
                                    <tr className="border-b border-gray-700">
                                        <td className="p-4 text-textWhite font-medium">
                                            <div className="flex items-center gap-2">
                                                <img src="/burrbear.ico" alt="Burrbear" className="w-5 h-5" />
                                                BURR Points (Burrbear Airdrop)
                                            </div>
                                        </td>
                                        <td className="p-4 text-gradientPrimary font-bold text-right">
                                            Non-compounding APR (Future Claim)
                                        </td>
                                    </tr>
                                    {farm.id !== 24 ? (
                                        <tr className="border-b border-gray-700">
                                            <td className="p-4 text-textWhite font-medium">
                                                <div className="flex items-center gap-2">
                                                    <img src="/beraborrow.png" alt="Beraborrow" className="w-5 h-5" />
                                                    Pollen Points (Beraborrow Airdrop)
                                                </div>
                                            </td>
                                            <td className="p-4 text-gradientPrimary font-bold text-right">
                                                4x Pollen Points (Future Claim)
                                            </td>
                                        </tr>
                                    ) : null}
                                </>
                            )}
                            <tr>
                                <td className="p-4 text-textWhite font-medium">
                                    <div className="flex items-center gap-2">
                                        <img src={btxLogo} alt="BTX" className="w-5 h-5" />
                                        BTX Points (BeraTrax Airdrop)
                                    </div>
                                </td>
                                <td className="p-4 text-gradientPrimary font-bold text-right">Future claim</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="mt-4 flex flex-col gap-2">
                <StatInfo title="Market cap" value={marketCap} iconUrl={marketcap} isStatLoading={marketCapLoading} />
                <StatInfo title="Vault Liquidity" value={vaultTvl} iconUrl={volume} isStatLoading={vaultTvlLoading} />

                <StatInfo
                    title={!isAutoCompounded ? "BeraTrax APY" : "Underlying APR"}
                    value={underlyingApy + "%"}
                    iconUrl={<FaArrowTrendUp color="white" size={25} />}
                />
                {underlyingApyWithPoints ? (
                    <StatInfo
                        title={!isAutoCompounded ? "BeraTrax APY with Points" : "Underlying APR with Points"}
                        value={underlyingApyWithPoints}
                        iconUrl={<FaArrowTrendUp color="white" size={25} />}
                    />
                ) : null}

                {isAutoCompounded ? (
                    <StatInfo
                        title="BeraTrax auto-compounded APY"
                        value={beraTraxApy + "%"}
                        iconUrl={<GoRocket color="white" size={25} />}
                    />
                ) : null}

                {isAutoCompounded && beraTraxApyWithPoints ? (
                    <StatInfo
                        title="BeraTrax APY with Points"
                        value={beraTraxApyWithPoints}
                        iconUrl={<GoRocket color="white" size={25} />}
                    />
                ) : null}
                {farmApys.merklApr > 0 && (
                    <StatInfo
                        title="Additional Merkl APR"
                        value={farmApys.merklApr?.toFixed(2) || "0" + "%"}
                        iconUrl={<GoRocket color="white" size={25} />}
                    />
                )}
                {farm.createdAt && <StatInfo title="Created On" value={createdDateString} iconUrl={created} />}
            </div>
        </div>
    );
};

export default PoolInfo;

