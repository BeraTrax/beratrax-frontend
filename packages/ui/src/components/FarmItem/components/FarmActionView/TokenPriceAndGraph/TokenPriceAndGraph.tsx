import { PoolDef } from "@beratrax/core/src/config/constants/pools_json";
import { useLp } from "@beratrax/core/src/hooks";
import { customCommify } from "@beratrax/core/src/utils/common";
import { Skeleton } from "ui/src/components/Skeleton/Skeleton";
import FarmLpGraph from "ui/src/components/FarmItem/components/FarmActionView/FarmLpGraph/FarmLpGraph";
import FarmRowChip from "ui/src/components/FarmItem/components/FarmRowChip/FarmRowChip";
import { View, Text, Image } from "react-native";

interface TokenPriceProps {
  farm: PoolDef;
}

const PriceLoadingSkeleton = () => {
  return (
    <View className="mt-2">
      <Skeleton w={80} h={32} />
      <Skeleton w={100} h={16} className="mt-1" />
    </View>
  );
};

export const TokenPriceAndGraph: React.FC<{ farm: PoolDef }> = ({ farm }) => {
  const { lp, isLpPriceLoading } = useLp(farm.id);

  return (
    <View className="relative">
      <View className="z-10">
        <View className="flex flex-row justify-between">
          <View>
            <Text className="text-textWhite mt-3 text-xl font-bold">
              {farm.name} {farm.token2 && `LP`} Price
            </Text>
            {isLpPriceLoading ? (
              <PriceLoadingSkeleton />
            ) : (
              <View className="mt-2">
                <Text className="text-textWhite text-5xl font-bold ">${customCommify(lp?.[0]?.lp || 0)}</Text>
                <View className="flex gap-2 items-center justify-center text-[16px]">
                  {/* <PriceTrendIcon trend="increase" className="mb-[3px]" />
                                    <p className="text-gradientPrimary ">$50 (2,52%)</p>
                                    <span className="w-1 h-1 rounded-full bg-textSecondary" />
                                    <p className="text-textSecondary">Today</p> */}
                </View>
              </View>
            )}
          </View>
          <View className="flex flex-col mt-2 mr-3">
            <View className="flex flex-row items-center gap-2 mb-2 justify-end">
              <FarmRowChip text={[farm.platform, farm.secondary_platform].filter(Boolean).join(" | ")} color="invert" />
              <View className="flex flex-row">
                <Image
                  alt={farm?.platform_alt}
                  className="w-4 h-4 rounded-full border border-bgDark"
                  source={{ uri: `${farm?.platform_logo}` }}
                  style={{ width: 16, height: 16 }}
                />
                {farm.secondary_platform && (
                  <Image
                    className="w-4 h-4 rounded-full border border-bgDark"
                    source={{ uri: `${farm?.secondary_platform_logo}` }}
                  />
                )}
              </View>
            </View>
            <View className="flex flex-row items-center">
              {farm?.logo1 ? (
                <Image alt={farm?.alt1} className="w-16 h-16 rounded-full" source={{ uri: farm?.logo1 }} />
              ) : null}

              {farm?.logo2 ? (
                <Image alt={farm?.alt2} className="w-16 h-16 rounded-full -ml-8" source={{ uri: farm?.logo2 }} />
              ) : null}

              {farm?.logo3 ? (
                <Image alt={farm?.alt3} className="w-16 h-16 rounded-full -ml-8" source={{ uri: farm?.logo3 }} />
              ) : null}
            </View>
          </View>
        </View>
        <FarmLpGraph farm={farm} />
      </View>
    </View>
  );
};

export default TokenPriceAndGraph;

