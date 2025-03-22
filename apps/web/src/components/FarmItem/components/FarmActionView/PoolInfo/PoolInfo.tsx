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
    merkleApy: string;
    isAutoCompounded: boolean;
    underlyingApy: string;
    marketCapLoading?: boolean;
    vaultTvlLoading?: boolean;
    farm: PoolDef;
    createdAt?: number;
}
const PoolInfo = ({
    marketCap,
    vaultTvl,
    description,
    source,
    showFlywheelChart,
    beraApy,
    merkleApy,
    isAutoCompounded,
    underlyingApy,
    marketCapLoading,
    vaultTvlLoading,
    farm,
    createdAt,
}: IProps) => {
    const createdDate = new Date((createdAt ?? 0) * 1000);
    const createdDateString = createdDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const { originPlatform, token_type: tokenType, token1, token2, token3 } = farm;

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
                    {farm.id === 8 && (
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
                    )}
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
                                            ) : originPlatform === FarmOriginPlatform.Burrbear ? (
                                                <>
                                                    <img src={wberaLogo} alt="WBERA" className="w-5 h-5" />
                                                    WBERA
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
                                </>
                            )}
                            {farm.id === 8 && (
                                <tr>
                                    <td className="p-4 text-textWhite font-medium">
                                        <div className="flex items-center gap-2">
                                            <img src={wberaLogo} alt="BTX" className="w-5 h-5" />
                                            BERA (Jumper Only)
                                        </div>
                                    </td>
                                    <td className="p-4 text-gradientPrimary font-bold text-right">
                                        Claim from Jumper Campaign
                                    </td>
                                </tr>
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
                {merkleApy !== "0" && (
                    <StatInfo
                        title="Additional Merkl APR"
                        value={merkleApy + "%"}
                        iconUrl={<GoRocket color="white" size={25} />}
                    />
                )}
                {createdAt && <StatInfo title="Created On" value={createdDateString} iconUrl={created} />}
            </div>
        </div>
    );
};

export default PoolInfo;
