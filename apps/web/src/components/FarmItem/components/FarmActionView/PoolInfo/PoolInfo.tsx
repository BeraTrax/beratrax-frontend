import farmFunctions from "src/api/pools";
import created from "src/assets/images/created.svg";
import flywheelChart from "src/assets/images/flywheelChart.png";
import flywheelChartMobile from "src/assets/images/flywheelChartMobile.png";
import marketcap from "src/assets/images/marketcap.svg";
import volume from "src/assets/images/volume.svg";

const StatInfo = ({
    iconUrl,
    title,
    subtitle,
    value,
}: {
    iconUrl: string;
    title: string;
    subtitle?: string;
    value: number | string;
}) => {
    return (
        <div className="flex items-center gap-4 bg-bgDark py-4 px-4 mt-2 rounded-2xl backdrop-blur-lg">
            <img src={iconUrl} alt={title} className="flex-shrink-0 flex-grow-0 w-10 h-10" />
            <div className={"flex-1"}>
                <h2 className="text-textWhite text-lg font-medium">{title}</h2>
                {subtitle && <p className="text-textSecondary text-[16px] font-light">{subtitle}</p>}
            </div>
            <h2 className="text-textWhite text-lg font-medium">{value}</h2>
        </div>
    );
};
interface IProps {
    marketCap: string;
    vaultTvl: string;
    description?: string;
    source?: string;
    showFlywheelChart?: boolean;
}
const PoolInfo = ({ marketCap, vaultTvl, description, source, showFlywheelChart }: IProps) => {
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
            <div className="mt-4 flex flex-col gap-2">
                <StatInfo title="Market cap" value={marketCap} iconUrl={marketcap} />
                <StatInfo title="Vault Liquidity" value={vaultTvl} iconUrl={volume} />
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
