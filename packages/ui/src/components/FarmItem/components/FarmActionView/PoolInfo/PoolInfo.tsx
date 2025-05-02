import Created from "@beratrax/core/src/assets/images/created.svg";
import Marketcap from "@beratrax/core/src/assets/images/marketcap.svg";
import Volume from "@beratrax/core/src/assets/images/volume.svg";
import { SvgImage } from "ui/src/components/SvgImage/SvgImage";
import { TrendUpIcon } from "@beratrax/ui/src/icons/TrendUp";
import { RocketIcon } from "@beratrax/ui/src/icons/Rocket";
import { View, Image, Text } from "react-native";
import { Link } from "expo-router";
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
    <View className="flex flex-row items-center gap-4 bg-bgDark py-4 px-4 mt-2 rounded-2xl backdrop-blur-lg">
      {typeof iconUrl === "string" ? (
        <Image src={iconUrl} alt={title} className="flex-shrink-0 flex-grow-0 w-10 h-10" />
      ) : (
        iconUrl
      )}
      <View className={"flex-1"}>
        <Text className="text-textWhite text-lg font-medium">{title}</Text>
        {subtitle && <Text className="text-textSecondary text-[16px] font-light">{subtitle}</Text>}
      </View>
      {isStatLoading ? (
        <View className="h-7 w-32 bg-gray-700 rounded animate-pulse" />
      ) : (
        <Text className="text-textWhite text-lg font-medium">{value}</Text>
      )}
    </View>
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
}: IProps) => {
  const createdTimestamp = 1739292658;
  const createdDate = new Date(createdTimestamp * 1000);
  const createdDateString = createdDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <View className=" mt-4 relative">
      {description && (
        <>
          <Text className="text-textWhite font-arame-mono font-normal text-[16px] leading-[18px] tracking-widest">
            ABOUT
          </Text>
          <Text className="text-textWhite mt-2 text-[16px] font-light">{description}</Text>
          <Text className="text-textWhite mt-4 text-[16px] font-light">
            You can see the underlying vault on the platform{" "}
            <Link href={source!} target="_blank" className="text-gradientPrimary uppercase hover:underline">
              here
            </Link>
            .
          </Text>
        </>
      )}
      {showFlywheelChart && (
        <>
          <Image
            source={require("@beratrax/core/src/assets/images/flywheelChart.png")}
            style={{ width: "100%", height: "auto", aspectRatio: 1, display: "none" }}
            resizeMode="contain"
          />
          <Image
            source={require("@beratrax/core/src/assets/images/flywheelChartMobile.png")}
            style={{ width: "100%", height: "auto", aspectRatio: 1 }}
            resizeMode="contain"
          />
        </>
      )}
      <View className="mt-4 flex flex-col gap-2">
        <StatInfo title="Market cap" value={marketCap} iconUrl={<SvgImage source={Marketcap} height={25} width={25}/>} isStatLoading={marketCapLoading} />
        <StatInfo title="Vault Liquidity" value={vaultTvl} iconUrl={<SvgImage source={Volume} height={25} width={25}/>} isStatLoading={vaultTvlLoading} />
        <StatInfo
          title={!isAutoCompounded ? "BeraTrax APY" : "Underlying APY"}
          value={underlyingApy + "%"}
          iconUrl={<TrendUpIcon color="white" size={25} />}
        />
        {isAutoCompounded && (
          <StatInfo
            title="BeraTrax auto-compounded APY"
            value={beraApy + "%"}
            iconUrl={<RocketIcon color="white" size={25} />}
          />
        )}
        {/* <StatInfo title="Volume" subtitle="Past 24h" value={"$16.5M"} iconUrl={volume} /> */}
        {/* <StatInfo title="Holders" value={"-"} iconUrl={holders} /> */}
        {/* <StatInfo title="Circulating Supply" value={"1.0B"} iconUrl={circulatingsupply} /> */}
        <StatInfo title="Added" value={createdDateString} iconUrl={<SvgImage source={Created} height={25} width={25}/>} />
      </View>
      {/* <p className="mt-2 text-textSecondary text-[12px] font-light leading-[18px]">
                Uauctor, augue porta dignissim vestibulum, arcu diam lobortis velit, Ut auctor, augue porta dignissim
                vestibulumUauctor, augue porta dignissim vestibulum, arcu diam lobortis velit, Ut auctor, augue porta
                dignissim vestibulum
            </p> */}
    </View>
  );
};

export default PoolInfo;

