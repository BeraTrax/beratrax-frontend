import { FC, useMemo } from "react";
import { View, Text, Pressable, ActivityIndicator, Image } from "react-native";
import { useTrax } from "@beratrax/core/src/hooks";

interface VaultItemProps {
  vault: any;
  onPress?: () => void;
}


const VaultItem: FC<VaultItemProps> = ({ vault, onPress }) => {
  
    const { getTraxApy } = useTrax();
    const { apys } = vault || {};
    const apy = apys?.apy;
    const estimateTrax = useMemo(() => getTraxApy(vault.vault_addr), [getTraxApy, vault]);
  
    const logo1Source = vault.logo1 ? { uri: vault.logo1 } : undefined;
    const logo2Source = vault.logo2 ? { uri: vault.logo2 } : undefined;
    const logo3Source = vault.logo3 ? { uri: vault.logo3 } : undefined;
    const platformLogoSource = vault.platform_logo ? { uri: vault.platform_logo } : undefined;
    const secondaryPlatformLogoSource = vault.secondary_platform_logo ? { uri: vault.secondary_platform_logo } : undefined;
  
    const userBalance = vault.userBalance || vault.userVaultBalance || 0;
    const priceOfSingleToken = vault.priceOfSingleToken || 1;
  
    const formattedUserValue = userBalance && priceOfSingleToken
      ? (userBalance * priceOfSingleToken).toFixed(2)
      : '0.00';

    return (
      <Pressable
        onPress={onPress}
        className={`  
                  cursor-pointer rounded-3xl p-6 shadow-md flex flex-col gap-5 border border-t-0 border-borderDark
                  relative transition-all duration-300 ease-in-out hover:translate-y-[-4px]
                  min-w-[calc(25%-12px)]
                  max-[2000px]:min-w-[calc(33.33%-10.66px)]
                  max-[1300px]:min-w-[calc(50%-8px)]
                  max-[768px]:min-w-full  
        `}
        style={{
          background: !vault.isCurrentWeeksRewardsVault
            ? "radial-gradient(circle at 45% 151%, var(--new-color_primary) -40%, var(--new-background_dark) 75%)"
            : undefined,
        }}
      >
        {vault.isCurrentWeeksRewardsVault && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 24,
              opacity: 0.4,
              backgroundColor: 'rgba(114, 178, 31, 0.4)',
            }}
          />
        )}
  
        <View className="flex flex-row justify-between align-top gap-2">
          <View className="flex flex-col gap-2 font-league-spartan text-lg">
            <View className="flex flex-row items-center relative">
              {logo1Source && (
                <Image
                  source={logo1Source}
                  style={{ width: 36, height: 36, borderRadius: 18 }}
                  resizeMode="contain"
                />
              )}
  
              {logo2Source && (
                <Image
                  source={logo2Source}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    marginLeft: -12
                  }}
                  resizeMode="contain"
                />
              )}
  
              {logo3Source && (
                <Image
                  source={logo3Source}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    marginLeft: -12 
                  }}
                  resizeMode="contain"
                />
              )}
            </View>
  
            <View className="flex flex-row items-center gap-2">
              <Text className="text-lg text-textWhite">{vault.name}</Text>
              {vault.isCurrentWeeksRewardsVault && (
                <View className="bg-bgPrimary px-2 py-1 rounded-md">
                  <Text className="text-xs text-bgDark">Current Week</Text>
                </View>
              )}
            </View>
          </View>
  
          {/* Platform */}
          <View className="flex-col gap-1">
            <View className="flex flex-row items-center gap-2 mb-2 justify-end">
              <View className="bg-textPrimary text-gradientSecondary relative p-[2px] px-2 rounded-lg text-sm font-bold">
                <Text>
                  {[vault?.platform, vault?.secondary_platform].filter(Boolean).join(" | ")}
                </Text>
              </View>
  
              {/* Platform Logos */}
              <View className="flex flex-row items-center">
                {platformLogoSource && (
                  <Image
                    source={platformLogoSource}
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: '#181818',
                      backgroundColor: '#ffffff'
                    }}
                    resizeMode="contain"
                  />
                )}
  
                {secondaryPlatformLogoSource && (
                  <Image
                    source={secondaryPlatformLogoSource}
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: '#181818',
                      marginLeft: 4,
                      backgroundColor: '#ffffff'
                    }}
                    resizeMode="contain"
                  />
                )}
              </View>
            </View>

            {vault.vaultBalance > 0 && vault.deposit && (
              <Pressable
                className={`px-4 py-2 rounded-md flex items-center justify-center gap-2 ${vault.isDepositing
                  ? "bg-buttonDisabled"
                  : "bg-buttonPrimary"
                  }`}
                onPress={(e) => {
                  e.stopPropagation();
                  vault.deposit && vault.deposit();
                }}
                disabled={vault.isDepositing}
              >
                {vault.isDepositing && <ActivityIndicator size="small" color="#000000" style={{ marginRight: 4 }} />}
                <Text className="text-bgDark text-xs font-medium">
                  {vault.isDepositing ? "Depositing..." : "Deposit to rewards vault"}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
  
        <View className="flex flex-row justify-between">
          {/* Your Stake section */}
          <View className="flex-1 border-r border-r-bgPrimary">
            <Text className="uppercase font-arame-mono mb-2 text-textPrimary text-lg">
              Your Stake
            </Text>
            <Text className="text-textWhite text-lg font-league-spartan">
              ${formattedUserValue}
            </Text>
          </View>
  
          {/* APY section */}
          <View className={`flex-1 ml-4 ${estimateTrax && Number(estimateTrax) > 0 ? "border-r border-r-bgPrimary" : ""}`}>
            <Text className="uppercase font-arame-mono mb-2 text-textPrimary text-lg">
              APY
            </Text>
            <Text className="text-textWhite text-lg font-league-spartan">
              {vault.isCurrentWeeksRewardsVault
                ? "??? %"
                : !apy
                  ? "--"
                  : apy < 0.01
                    ? `${apy.toPrecision(2)}%`
                    : `${apy.toFixed(2)}%`}
            </Text>
          </View>
  
          {/* BTX Points section */}
          {estimateTrax && Number(estimateTrax) > 0 ? (
            <View className="flex-1 ml-4">
              <Text className="uppercase font-arame-mono mb-2 text-textPrimary text-lg">
                BTX Points
              </Text>
              <Text className="text-textWhite text-lg font-league-spartan">
                {(Number(estimateTrax) / 365.25).toFixed(2)}/day
              </Text>
            </View>
          ) : null}
        </View>
  
        {/* Rewards section*/}
        {vault.rewards > 0 && (
          <View className="mt-3 pt-3 border-t border-t-bgPrimary flex flex-row justify-between items-center">
            <View>
              <Text className="uppercase font-arame-mono mb-2 text-textPrimary text-lg">
                Your Rewards
              </Text>
              <Text className="text-textWhite text-lg font-league-spartan">
                {vault.formattedRewards || '0.00'} BGT
              </Text>
            </View>
  
            <Pressable
              className={`px-2 py-1 rounded-md flex items-center justify-center gap-2 ${vault.isClaiming
                ? "bg-buttonDisabled"
                : "bg-buttonPrimary"
                }`}
              onPress={(e) => {
                e.stopPropagation();
                vault.claimRewards && vault.claimRewards();
              }}
              disabled={vault.isClaiming}
            >
              {vault.isClaiming && <ActivityIndicator size="small" color="#000000" style={{ marginRight: 4 }} />}
              <Text className="text-bgDark text-sm font-medium">
                {vault.isClaiming ? "Claiming..." : "Claim Rewards"}
              </Text>
            </Pressable>
          </View>
        )}
      </Pressable>
    );
  };
  
export default VaultItem;