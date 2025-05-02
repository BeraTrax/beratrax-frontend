import Tokendetailspageleftsideleaves from "@beratrax/core/src/assets/images/tokendetailspageleftsideleaves.svg";
import Tokendetailspagestoprightleaves from "@beratrax/core/src/assets/images/tokendetailspagestoprightleaves.svg";
import { IS_LEGACY } from "@beratrax/core/src/config/constants";
import { PoolDef } from "@beratrax/core/src/config/constants/pools_json";
import { useDetailInput, useWallet } from "@beratrax/core/src/hooks";
import { useAppDispatch, useAppSelector } from "@beratrax/core/src/state";
import { setFarmDetailInputOptions } from "@beratrax/core/src/state/farms/farmsReducer";
import { useFarmApy } from "@beratrax/core/src/state/farms/hooks";
import { FarmDetailInputOptions } from "@beratrax/core/src/state/farms/types";
import useTokens from "@beratrax/core/src/state/tokens/useTokens";
import { FarmOriginPlatform, FarmTransactionType } from "@beratrax/core/src/types/enums";
import { formatCurrency, toFixedFloor } from "@beratrax/core/src/utils/common";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import BackButton from "ui/src/components/BackButton/BackButton";
import { Skeleton } from "ui/src/components/Skeleton/Skeleton";
import { SvgImage } from "ui/src/components/SvgImage/SvgImage";
import FarmActionModal from "./FarmActionModal/FarmActionModal";
import PoolInfo from "./PoolInfo/PoolInfo";
import TokenPriceAndGraph from "./TokenPriceAndGraph/TokenPriceAndGraph";
import YourBalance from "./YourBalance/YourBalance";
import { View, Text, Pressable, ScrollView } from "react-native";

export const FarmActionView: React.FC<{ farm: PoolDef }> = ({ farm }) => {
  const dispatch = useAppDispatch();
  const { currentWallet, isConnecting } = useWallet();
  const { openConnectModal } = useConnectModal();
  const { apy: farmApys } = useFarmApy(farm);
  const {
    isBalancesLoading: isLoading,
    prices: {
      [farm.chainId]: { [farm.vault_addr]: vaultPrice },
    },
    totalSupplies,
    isTotalSuppliesLoading,
  } = useTokens();
  const [marketCap, setMarketCap] = useState<string | null>(null);
  const [vaultTvl, setVaultTvl] = useState<string | null>(null);
  const isMarketCapAndVaultLoading =
    isTotalSuppliesLoading || marketCap === null || vaultTvl === null || marketCap === "0";

  const router = useRouter();
  const { withdrawable, isLoadingFarm } = useDetailInput(farm);

  const [openDepositModal, setOpenDepositModal] = useState(false);

  const transactionType = useAppSelector((state) =>
    IS_LEGACY ? FarmTransactionType.Withdraw : state.farms.farmDetailInputOptions.transactionType,
  );

  useEffect(() => {
    (async () => {
      try {
        if (Number(vaultPrice) > 0) {
          setMarketCap(formatCurrency(Number(totalSupplies[farm.chainId][farm.lp_address].supplyUsd)));
          setVaultTvl(formatCurrency(Number(totalSupplies[farm.chainId][farm.vault_addr].supplyUsd)));
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, [totalSupplies]);

  const setFarmOptions = (opt: Partial<FarmDetailInputOptions>) => {
    dispatch(setFarmDetailInputOptions(opt));
    setOpenDepositModal(true);
  };

  return (
    <>
      <View className="flex-1 mb-10 w-full min-h-screen bg-bgSecondary relative">
        <View className="absolute top-[45%]">
          <SvgImage source={Tokendetailspageleftsideleaves} height={200} width={200} />
        </View>
        <View className="absolute right-0 top-0">
          <SvgImage source={Tokendetailspagestoprightleaves} height={200} width={200} />
        </View>
        <View className="pt-14 px-4 pb-2">
          {openDepositModal ? (
            <></>
          ) : (
            <>
              <ScrollView>
                <BackButton onClick={() => router.back()} />
                <View className="relative mt-4 mb-24 sm:mb-0">
                  <TokenPriceAndGraph farm={farm} />
                  <YourBalance farm={farm} />
                  <PoolInfo
                    marketCap={`$${marketCap}`}
                    vaultTvl={`$${vaultTvl}`}
                    description={farm.description}
                    source={farm.source}
                    showFlywheelChart={farm.originPlatform === FarmOriginPlatform.Infrared && farm.id !== 7}
                    beraApy={
                      farm.isCurrentWeeksRewardsVault
                        ? "??? "
                        : farmApys && farmApys.apy < 0.01
                          ? farmApys.apy.toPrecision(2).slice(0, -1)
                          : toFixedFloor((farm.isUpcoming ? farm.total_apy : farmApys?.apy) || 0, 2).toString()
                    }
                    underlyingApy={
                      farm.isCurrentWeeksRewardsVault
                        ? "??? "
                        : toFixedFloor((farm.isUpcoming ? farm.total_apy : farmApys?.feeApr) || 0, 2).toString()
                    }
                    isAutoCompounded={farm.description?.includes("compounded") || false}
                    marketCapLoading={isMarketCapAndVaultLoading}
                    vaultTvlLoading={isMarketCapAndVaultLoading}
                  />
                </View>
              </ScrollView>
              <View
                className={`flex flex-row gap-2 absolute bottom-4 left-4 right-4 justify-center w-full ${
                  Number(withdrawable?.amount || "0") ? "pr-4" : ""
                }`}
              >
                {isConnecting || isLoading ? (
                  <>
                    {/* <Skeleton w={100} h={72} bRadius={40} className="flex-1" /> */}
                    {Number(withdrawable?.amount || "0") > 0 && (
                      <Skeleton w={100} h={72} bRadius={40} className="flex-1" />
                    )}
                  </>
                ) : (
                  <>
                    <Pressable
                      className="flex-1"
                      onPress={() => {
                        !currentWallet
                          ? openConnectModal && openConnectModal()
                          : !IS_LEGACY && setFarmOptions({ transactionType: FarmTransactionType.Deposit });
                      }}
                    >
                      <Text className="bg-buttonPrimaryLight w-full py-5 px-4 text-xl font-bold tracking-widest rounded-[40px] uppercase text-center">
                        {!currentWallet ? "Sign In/ Up to Deposit" : FarmTransactionType.Deposit}
                      </Text>
                    </Pressable>

                    {Number(withdrawable?.amount || "0") > 0 && (
                      <Pressable
                        className="flex-1"
                        disabled={!currentWallet}
                        onPress={() => {
                          !IS_LEGACY &&
                            setFarmOptions({
                              transactionType: FarmTransactionType.Withdraw,
                            });
                        }}
                      >
                        <Text className="bg-bgDark border border-gradientPrimary text-gradientPrimary w-full py-5 px-4 text-xl font-bold tracking-widest rounded-[40px] uppercase text-center">
                          {FarmTransactionType.Withdraw}
                        </Text>
                      </Pressable>
                    )}
                  </>
                )}
              </View>
            </>
          )}
        </View>
      </View>
      <FarmActionModal open={openDepositModal} setOpen={setOpenDepositModal} farm={farm} />
    </>
  );
};

