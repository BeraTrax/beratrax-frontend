import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import tokendetailspageleftsideleaves from "src/assets/images/tokendetailspageleftsideleaves.svg";
import tokendetailspagestoprightleaves from "src/assets/images/tokendetailspagestoprightleaves.svg";
import BackButton from "src/components/BackButton/BackButton";
import { IS_LEGACY } from "src/config/constants";
import { PoolDef } from "src/config/constants/pools_json";
import { useDetailInput } from "src/hooks/useDetailInput";
import useWallet from "src/hooks/useWallet";
import { useAppDispatch, useAppSelector } from "src/state";
import { setFarmDetailInputOptions } from "src/state/farms/farmsReducer";
import { FarmDetailInputOptions } from "src/state/farms/types";
import { FarmTransactionType } from "src/types/enums";
import FarmActionModal from "./FarmActionModal/FarmActionModal";
import PoolInfo from "./PoolInfo/PoolInfo";
import TokenPriceAndGraph from "./TokenPriceAndGraph/TokenPriceAndGraph";
import YourBalance from "./YourBalance/YourBalance";
import { formatCurrency } from "src/utils/common";
import { Skeleton } from "src/components/Skeleton/Skeleton";
import useTokens from "src/state/tokens/useTokens";

export const FarmActionView: React.FC<{ farm: PoolDef }> = ({ farm }) => {
    const dispatch = useAppDispatch();
    const { currentWallet, isConnecting } = useWallet();
    const {
        isBalancesLoading: isLoading,
        prices: {
            [farm.chainId]: { [farm.vault_addr]: vaultPrice },
        },
        totalSupplies,
    } = useTokens();
    const [marketCap, setMarketCap] = useState<string>("0");
    const [vaultTvl, setVaultTvl] = useState<string>("0");

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
                                        {Number(withdrawable?.amount || "0") && (
                                            <Skeleton w="100%" h="72px" bRadius={40} />
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <button
                                            disabled={!currentWallet}
                                            className={`${
                                                !currentWallet
                                                    ? "bg-buttonDisabled cursor-not-allowed"
                                                    : "bg-buttonPrimaryLight"
                                            } lg:max-w-64 w-full py-5 px-4 text-xl font-bold tracking-widest rounded-[40px] uppercase`}
                                            onClick={() => {
                                                !IS_LEGACY &&
                                                    setFarmOptions({ transactionType: FarmTransactionType.Deposit });
                                            }}
                                        >
                                            {!currentWallet ? "Sign in to Deposit" : FarmTransactionType.Deposit}
                                            <br />
                                        </button>
                                        {Number(withdrawable?.amount || "0") && (
                                            <button
                                                disabled={!currentWallet}
                                                className={`lg:max-w-64 bg-bgDark border border-gradientPrimary text-gradientPrimary w-full py-5 px-4 text-xl font-bold tracking-widest rounded-[40px] uppercase`}
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
