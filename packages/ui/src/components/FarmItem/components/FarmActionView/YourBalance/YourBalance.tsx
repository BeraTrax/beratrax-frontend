import { PoolDef, tokenNamesAndImages } from "@beratrax/core/src/config/constants/pools_json";
import { useWallet } from "@beratrax/core/src/hooks";
import { useFarmDetails } from "@beratrax/core/src/state/farms/hooks";
import useTokens from "@beratrax/core/src/state/tokens/useTokens";
import { FarmOriginPlatform } from "@beratrax/core/src/types/enums";
import { customCommify, formatCurrency, toEth } from "@beratrax/core/src/utils/common";
import { Skeleton } from "@beratrax/ui/src/components/Skeleton/Skeleton";
import { useMemo } from "react";
import { View, Text } from "react-native";
import { getAddress } from "viem";

// Reusable component for token earnings
const TokenEarning = ({
  earnings,
  token,
  chainId,
  prices,
}: {
  earnings: string | number | undefined;
  token: string | undefined;
  chainId: number;
  prices: Record<number, Record<string, number>>;
}) => {
  if (!earnings || !token) return null;

  const tokenAddress = token ? getAddress(token) : "";
  const tokenName = token ? tokenNamesAndImages[tokenAddress]?.name || "" : "";
  const earningsValue = Number(toEth(BigInt(earnings.toString())));
  const earningsValueUsd = earningsValue * (prices[chainId][tokenAddress] || 0);

  return (
    <View className="flex-1">
      <View className="flex flex-row items-center gap-x-3">
        <View className="flex flex-col">
          <Text className="text-green-500 text-lg font-medium flex items-center gap-x-2">
            ${customCommify(earningsValueUsd.toFixed(2))}
          </Text>
        </View>
        <View className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center">
          <Text className="text-green-500 text-md">↑</Text>
        </View>
      </View>
      <View className="flex gap-x-2 mt-2">
        <Text className="text-green-400/80 text-[16px] font-light">
          {customCommify(earningsValue.toFixed(5))} {tokenName}
        </Text>
      </View>
    </View>
  );
};

const YourBalance = ({ farm }: { farm: PoolDef }) => {
  const { isConnecting } = useWallet();
  const { balances, isBalancesLoading: isLoading, prices } = useTokens();
  const { vaultEarnings, isLoadingVaultEarnings, isVaultEarningsFirstLoad } = useFarmDetails();
  const stakedTokenValueUsd = useMemo(() => Number(balances[farm.chainId][farm.vault_addr]?.valueUsd), [balances]);
  const stakedTokenValueFormatted = useMemo(
    () => Number(balances[farm.chainId][farm.vault_addr]?.valueUsd / prices[farm.chainId][farm.lp_address]),
    [balances, prices],
  );

  const farmEarnings = useMemo(() => {
    if (!vaultEarnings?.length) return { earnings0: 0, token0: "", earnings1: 0, token1: "" };
    return (
      vaultEarnings.find((earning) => earning.tokenId === farm.id.toString()) || {
        earnings0: 0,
        token0: "",
        earnings1: 0,
        token1: "",
      }
    );
  }, [vaultEarnings, farm.id]);

  const renderEarningsSection = () => {
    return (
      <View className="w-full md:w-1/2 flex flex-col">
        <Text className="text-textWhite font-arame-mono font-normal text-[16px] leading-[18px] tracking-widest">
          YOUR EARNINGS
        </Text>
        <View className="bg-bgDark py-4 px-4 mt-2 rounded-2xl backdrop-blur-lg flex-1 flex flex-col justify-center">
          {isVaultEarningsFirstLoad ? (
            <Skeleton h={28} w={120} />
          ) : (
            <>
              <View className="flex flex-row gap-4">
                <TokenEarning
                  earnings={farmEarnings.earnings0}
                  token={farmEarnings.token0}
                  chainId={farm.chainId}
                  prices={prices}
                />
                {farmEarnings?.earnings1 && (
                  <TokenEarning
                    earnings={farmEarnings.earnings1}
                    token={farmEarnings.token1}
                    chainId={farm.chainId}
                    prices={prices}
                  />
                )}
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  const renderPositionSection = () => {
    return (
      <View className="w-full md:w-1/2 flex flex-col">
        <Text className="text-textWhite font-arame-mono font-normal text-[16px] leading-[18px] tracking-widest">
          YOUR POSITION
        </Text>
        <View className="bg-bgDark py-4 px-4 mt-2 rounded-2xl backdrop-blur-lg flex-1 flex flex-col justify-center">
          {isLoading || isConnecting ? (
            <>
              {/* <View className="h-7 w-32 bg-gray-700 rounded animate-pulse" />
              <View className="h-6 w-24 bg-gray-700 rounded animate-pulse mt-1" /> */}
            </>
          ) : (
            <>
              <View className="flex flex-row items-center gap-x-3">
                <Text className="text-textWhite text-lg font-medium">
                  ${stakedTokenValueUsd ? formatCurrency(stakedTokenValueUsd) : 0}
                </Text>
              </View>
              <View className="flex flex-row items-center gap-x-2 mt-2">
                <Text className="text-textSecondary text-[16px] font-light">
                  {stakedTokenValueFormatted ? stakedTokenValueFormatted?.toFixed(3) : 0} {farm.name}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  if (stakedTokenValueUsd === 0) return null;

  return (
    <View className="mt-10 relative">
      {(farm.originPlatform === FarmOriginPlatform.Infrared || farm.originPlatform === FarmOriginPlatform.Steer) &&
      !farm.isDeprecated ? (
        <View className="flex flex-col md:flex-row gap-4 md:items-stretch">
          {renderEarningsSection()}
          {renderPositionSection()}
        </View>
      ) : (
        <View>{renderPositionSection()}</View>
      )}
    </View>
  );
};

export default YourBalance;

