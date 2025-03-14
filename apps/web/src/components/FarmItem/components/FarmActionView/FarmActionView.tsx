import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import tokendetailspageleftsideleaves from "src/assets/images/tokendetailspageleftsideleaves.svg";
import tokendetailspagestoprightleaves from "src/assets/images/tokendetailspagestoprightleaves.svg";
import BackButton from "src/components/BackButton/BackButton";
import { Skeleton } from "src/components/Skeleton/Skeleton";
import { IS_LEGACY } from "@beratrax/core/src/config/constants";
import { PoolDef } from "@beratrax/core/src/config/constants/pools_json";
import { useDetailInput } from "@beratrax/core/src/hooks";
import { useWallet } from "@beratrax/core/src/hooks";
import { useAppDispatch, useAppSelector } from "@beratrax/core/src/state";
import { setFarmDetailInputOptions } from "@beratrax/core/src/state/farms/farmsReducer";
import { useFarmApy } from "@beratrax/core/src/state/farms/hooks";
import { FarmDetailInputOptions } from "@beratrax/core/src/state/farms/types";
import useTokens from "@beratrax/core/src/state/tokens/useTokens";
import { FarmOriginPlatform, FarmTransactionType } from "src/types/enums";
import { formatCurrency, toFixedFloor } from "src/utils/common";
import FarmActionModal from "./FarmActionModal/FarmActionModal";
import PoolInfo from "./PoolInfo/PoolInfo";
import TokenPriceAndGraph from "./TokenPriceAndGraph/TokenPriceAndGraph";
import YourBalance from "./YourBalance/YourBalance";

export const FarmActionView: React.FC<{ farm: PoolDef }> = ({ farm }) => {
  const dispatch = useAppDispatch();
  const { currentWallet, isConnecting } = useWallet();
  const { openConnectModal } = useConnectModal();
  const { apy: farmApys, isLoading: isApyLoading } = useFarmApy(farm);
  const {
    isBalancesLoading: isLoading,
    prices: {
      [farm.chainId]: { [farm.vault_addr]: vaultPrice },
    },
    totalSupplies,
    isLoading: isTotalSuppliesLoading,
  } = useTokens();
  const [marketCap, setMarketCap] = useState<string | null>(null);
  const [vaultTvl, setVaultTvl] = useState<string | null>(null);
  const isMarketCapAndVaultLoading =
    isTotalSuppliesLoading || marketCap === null || vaultTvl === null || marketCap === "0";

  const navigate = useNavigate();
  const { withdrawable, isLoadingFarm } = useDetailInput(farm);

  const [openDepositModal, setOpenDepositModal] = useState(false);

  const transactionType = useAppSelector((state) =>
    IS_LEGACY ? FarmTransactionType.Withdraw : state.farms.farmDetailInputOptions.transactionType
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
      <div className="mb-10 w-full min-h-screen ">
        <img src={tokendetailspageleftsideleaves} alt="Leaves" className="absolute top-[47.5%] w-40" />
        <img src={tokendetailspagestoprightleaves} alt={"Leaves"} className="absolute top-0 right-0 " />
        <div className="pt-14 px-4 pb-2 mb-28">
          {openDepositModal ? (
            <></>
          ) : (
            <>
              <BackButton onClick={() => navigate(-1)} />
              <div className="relative mt-4">
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
              </div>
              <div
                className={`flex gap-2 fixed bottom-4 justify-center ${
                  Number(withdrawable?.amount || "0") ? "pr-4" : ""
                }`}
                style={{ width: "-webkit-fill-available" }}
              >
                {isConnecting || isLoading ? (
                  <>
                    <Skeleton w="100%" h="72px" bRadius={40} />
                    {Number(withdrawable?.amount || "0") && <Skeleton w="100%" h="72px" bRadius={40} />}
                  </>
                ) : (
                  <>
                    <button
                      className={`${
                        !currentWallet ? "lg:max-w-80" : "lg:max-w-64"
                      } bg-buttonPrimaryLight w-full py-5 px-4 text-xl font-bold tracking-widest rounded-[40px] uppercase`}
                      onClick={() => {
                        !currentWallet
                          ? openConnectModal && openConnectModal()
                          : !IS_LEGACY && setFarmOptions({ transactionType: FarmTransactionType.Deposit });
                      }}
                    >
                      {!currentWallet ? "Sign In/ Up to Deposit" : FarmTransactionType.Deposit}
                      <br />
                    </button>
                    {Number(withdrawable?.amount || "0") && (
                      <button
                        disabled={!currentWallet}
                        className={`lg:max-w-80 bg-bgDark border border-gradientPrimary text-gradientPrimary w-full py-5 px-4 text-xl font-bold tracking-widest rounded-[40px] uppercase`}
                        onClick={() => {
                          !IS_LEGACY &&
                            setFarmOptions({
                              transactionType: FarmTransactionType.Withdraw,
                            });
                        }}
                      >
                        {FarmTransactionType.Withdraw}
                      </button>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <FarmActionModal open={openDepositModal} setOpen={setOpenDepositModal} farm={farm} />
    </>
  );
};
