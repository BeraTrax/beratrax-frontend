import { FaArrowTrendUp } from "react-icons/fa6";
import { GoRocket } from "react-icons/go";
import created from "src/assets/images/created.svg";
import flywheelChart from "src/assets/images/flywheelChart.png";
import flywheelChartMobile from "src/assets/images/flywheelChartMobile.png";
import marketcap from "src/assets/images/marketcap.svg";
import volume from "src/assets/images/volume.svg";
import { FarmOriginPlatform, FarmType } from "src/types/enums";

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
    marketCap: string;
    vaultTvl: string;
    description?: string;
    source?: string;
    showFlywheelChart?: boolean;
    beraApy: string;
    isAutoCompounded: boolean;
    underlyingApy: string;
    marketCapLoading?: boolean;
    vaultTvlLoading?: boolean;
    originPlatform?: FarmOriginPlatform;
    tokenType?: FarmType;
}
const PoolInfo = ({
    marketCap,
    vaultTvl,
    description,
    source,
    showFlywheelChart,
    beraApy,
    isAutoCompounded,
    underlyingApy,
    marketCapLoading,
    vaultTvlLoading,
    originPlatform,
    tokenType,
}: IProps) => {
    const createdTimestamp = 1739292658;
    const createdDate = new Date(createdTimestamp * 1000);
    const createdDateString = createdDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className=" mt-4 relative">
            {description && (
                <>
                    <h3 className="text-textWhite font-arame-mono font-normal text-[16px] leading-[18px] tracking-widest">
                        ABOUT
                    </h3>
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
                                    <td className="p-4 text-textWhite font-medium">Underlying Token</td>
                                    <td className="p-4 text-gradientPrimary font-bold text-right">
                                        Trading fees to APY
                                    </td>
                                </tr>
                            )}

                            {isAutoCompounded && originPlatform === FarmOriginPlatform.Infrared && (
                                <tr className="border-b border-gray-700">
                                    <td className="p-4 text-textWhite font-medium">iBGT</td>
                                    <td className="p-4 text-gradientPrimary font-bold text-right">
                                        Autocompounded to APY
                                    </td>
                                </tr>
                            )}
                            {originPlatform === FarmOriginPlatform.Infrared && (
                                <tr className="border-b border-gray-700">
                                    <td className="p-4 text-textWhite font-medium">Infrared airdrop</td>
                                    <td className="p-4 text-gradientPrimary font-bold text-right">Future claim</td>
                                </tr>
                            )}
                            {originPlatform === FarmOriginPlatform.Burrbear && (
                                <tr className="border-b border-gray-700">
                                    <td className="p-4 text-textWhite font-medium">Burrbear airdrop</td>
                                    <td className="p-4 text-gradientPrimary font-bold text-right">Future claim</td>
                                </tr>
                            )}
                            <tr>
                                <td className="p-4 text-textWhite font-medium">BTX airdrop</td>
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
                    title={!isAutoCompounded ? "BeraTrax APY" : "Underlying APY"}
                    value={underlyingApy + "%"}
                    iconUrl={<FaArrowTrendUp color="white" size={25} />}
                />
                {isAutoCompounded && (
                    <StatInfo
                        title="BeraTrax auto-compounded APY"
                        value={beraApy + "%"}
                        iconUrl={<GoRocket color="white" size={25} />}
                    />
                )}
                {/* <StatInfo title="Volume" subtitle="Past 24h" value={"$16.5M"} iconUrl={volume} /> */}
                {/* <StatInfo title="Holders" value={"-"} iconUrl={holders} /> */}
                {/* <StatInfo title="Circulating Supply" value={"1.0B"} iconUrl={circulatingsupply} /> */}
                <StatInfo title="Added" value={createdDateString} iconUrl={created} />
            </div>
            {/* <p className="mt-2 text-textSecondary text-[12px] font-light leading-[18px]">
                Uauctor, augue porta dignissim vestibulum, arcu diam lobortis velit, Ut auctor, augue porta dignissim
                vestibulumUauctor, augue porta dignissim vestibulum, arcu diam lobortis velit, Ut auctor, augue porta
                dignissim vestibulum
            </p> */}
        </div>
    );
};

export default PoolInfo;
