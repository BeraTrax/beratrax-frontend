import { useEffect, useMemo, useState } from "react";
import { CgSpinner } from "react-icons/cg";
import { IoInformationCircle } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { dismissNotify, notifyError, notifyLoading, notifySuccess } from "src/api/notify";
import { approveErc20 } from "src/api/token";
import rewardVaultAbi from "src/assets/abis/rewardVaultAbi";
import FarmRowChip from "src/components/FarmItem/components/FarmRowChip/FarmRowChip";
import { VaultMigrator } from "src/components/VaultMigrator/VaultMigrator";
import { RoutesPaths } from "src/config/constants";
import useTrax from "src/hooks/useTrax";
import useWallet from "src/hooks/useWallet";
import { useAppSelector } from "src/state";
import useFarmDetails from "src/state/farms/hooks/useFarmDetails";
import useTokens from "src/state/tokens/useTokens";
import { Vault } from "src/types";
import { awaitTransaction, formatCurrency, toEth, toFixedFloor } from "src/utils/common";
import { encodeFunctionData, formatEther, getAddress } from "viem";
import styles from "./VaultItem.module.css";

interface Props {
    vault: Vault;
}

function useOldPrice(chainId: number, address: string) {
    const { isLoadingEarnings } = useFarmDetails();
    const { oldPrices, isFetchingOldPrices, isLoadedOldPrices } = useAppSelector((state) => state.tokens);

    return {
        oldPrice: oldPrices[chainId]?.[address],
        isLoading: (isLoadingEarnings || isFetchingOldPrices) && !isLoadedOldPrices,
    };
}

const VaultItem: React.FC<Props> = ({ vault }) => {
    const [isDepositing, setIsDepositing] = useState(false);
    const [vaultBalance, setVaultBalance] = useState(BigInt(0));
    const [rewards, setRewards] = useState(0n);
    const [isClaiming, setIsClaiming] = useState(false);
    const navigate = useNavigate();
    const { oldPrice, isLoading: isLoadingOldData } = useOldPrice(vault.chainId, vault.vault_addr);
    const { reloadFarmData, isVaultEarningsFirstLoad, vaultEarnings } = useFarmDetails();
    const { balances, prices, reloadBalances } = useTokens();
    const currentVaultEarningsUsd = useMemo(() => {
        const currentVaultEarnings = vaultEarnings?.find((earning) => Number(earning.tokenId) === Number(vault.id));
        if (!currentVaultEarnings) return 0;
        return (
            Number(toEth(BigInt(currentVaultEarnings?.earnings0 || 0n))) *
                prices[vault.chainId][currentVaultEarnings.token0 as `0x${string}`] +
            (currentVaultEarnings?.token1
                ? Number(toEth(BigInt(currentVaultEarnings?.earnings1 || 0n))) *
                  prices[vault.chainId][currentVaultEarnings.token1 as `0x${string}`]
                : 0)
        );
    }, [isVaultEarningsFirstLoad]);
    const { getClients, currentWallet, getPublicClient, getWalletClient } = useWallet();
    const { getTraxApy } = useTrax();
    const estimateTrax = useMemo(() => getTraxApy(vault.vault_addr), [getTraxApy, vault]);
    const { userVaultBalance, priceOfSingleToken, apys } = vault || {};
    const apy = apys?.apy;

    useEffect(() => {
        const getVaultBalance = async () => {
            try {
                const client = await getClients(vault.chainId);
                const vaultBalance =
                    BigInt(balances[vault.chainId][vault.vault_addr].valueWei) -
                    BigInt(balances[vault.chainId][vault.vault_addr].valueRewardVaultWei || 0);
                if (!vault.rewardVault) return;
                const rewards = (await client.public.readContract({
                    address: getAddress(vault.rewardVault!),
                    abi: rewardVaultAbi,
                    functionName: "earned",
                    args: [currentWallet!],
                })) as bigint;
                setRewards(rewards);
                setVaultBalance(vaultBalance);
            } catch (e) {
                console.log(e);
            }
        };
        getVaultBalance();
    }, [isDepositing, isClaiming]);

    const claimRewards = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        let id: string | undefined = undefined;
        try {
            setIsClaiming(true);
            id = notifyLoading({
                title: `Claiming rewards...`,
                message: `Claiming rewards...`,
            });

            const client = await getClients(vault.chainId);
            const tx = await awaitTransaction(
                client.wallet.sendTransaction({
                    to: vault.rewardVault!,
                    data: encodeFunctionData({
                        abi: rewardVaultAbi,
                        functionName: "getReward",
                        args: [currentWallet!],
                    }),
                }),
                client
            );

            await reloadBalances();
            if (!tx.status) {
                throw new Error(tx.error);
            } else {
                id && dismissNotify(id);
                notifySuccess({
                    title: "Claimed successfully",
                    message: `Claimed rewards`,
                });
            }
        } catch (e) {
            console.log(e);
            id && dismissNotify(id);
            notifyError({
                title: "Error",
                message: e.message,
            });
        } finally {
            setIsClaiming(false);
        }
    };

    const deposit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        let id: string | undefined = undefined;
        try {
            setIsDepositing(true);
            id = notifyLoading({
                title: `Depositing to ${vault.name} reward vault...`,
                message: `Depositing tokens to reward vault...`,
            });

            const client = await getClients(vault.chainId);
            if (
                !(
                    await approveErc20(
                        vault.vault_addr,
                        vault.rewardVault!,
                        vaultBalance,
                        currentWallet!,
                        vault.chainId,
                        getPublicClient,
                        getWalletClient
                    )
                ).status
            )
                throw new Error("Error approving vault!");

            const tx = await awaitTransaction(
                client.wallet.sendTransaction({
                    to: vault.rewardVault,
                    data: encodeFunctionData({
                        abi: rewardVaultAbi,
                        functionName: "stake",
                        args: [BigInt(vaultBalance)],
                    }),
                }),
                client
            );
            await reloadFarmData();
            if (!tx.status) {
                throw new Error(tx.error);
            } else {
                id && dismissNotify(id);
                notifySuccess({
                    title: "Deposited successfully",
                    message: `Deposited to ${vault.name} reward vault`,
                });
            }
        } catch (e) {
            console.log(e);
            id && dismissNotify(id);
            notifyError({
                title: "Error",
                message: e.message,
            });
        } finally {
            setIsDepositing(false);
        }
    };

    return (
        <div
            onClick={() => {
                if (vault.isDeprecated && vault.isUpgradable) return;
                navigate(`${RoutesPaths.Farms}/${vault.vault_addr}`);
            }}
            className={`
                cursor-pointer rounded-3xl p-6 shadow-md flex flex-col gap-5 border border-t-0 border-borderDark
                relative transition-all duration-300 ease-in-out hover:translate-y-[-4px]
                min-w-[calc(25%-12px)]
                max-[2000px]:min-w-[calc(33.33%-10.66px)]
                max-[1300px]:min-w-[calc(50%-8px)]
                max-[768px]:min-w-full
                ${vault.isCurrentWeeksRewardsVault ? styles.gradientAnimation : ""}
            `}
            style={{
                ...(!vault.isCurrentWeeksRewardsVault && {
                    background:
                        "radial-gradient(circle at 45% 151%, var(--new-color_primary) -40%, var(--new-background_dark) 75%)",
                }),
            }}
        >
            {vault.isDeprecated && vault.isUpgradable && <VaultMigrator vault={vault} />}
            <div className="flex justify-between align-top gap-2">
                {/* Main Heading */}
                <div className="flex flex-col gap-2 font-league-spartan text-lg">
                    <div className="flex items-center relative">
                        {vault.alt1 ? (
                            <img className="w-9 h-9 rounded-full" alt={vault.alt1} src={vault.logo1} />
                        ) : null}

                        {vault.alt2 ? (
                            <img className="w-9 h-9 rounded-full -ml-3" alt={vault.alt2} src={vault.logo2} />
                        ) : null}

                        {vault.alt3 ? (
                            <img className="w-9 h-9 rounded-full -ml-3" alt={vault.alt3} src={vault.logo3} />
                        ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-lg text-textWhite">{vault.name}</p>
                        {vault.isCurrentWeeksRewardsVault && (
                            <div className="group relative">
                                <IoInformationCircle
                                    className="text-xl text-textSecondary cursor-help"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2 bg-bgDark rounded-lg text-sm text-textWhite w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                    This vault is earning boosted BGT rewards from our Flywheel.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* Platform */}
                <div className="flex-col gap-1">
                    <div className="flex items-center gap-1 mb-2 justify-end">
                        <FarmRowChip
                            text={[vault?.platform, vault?.secondary_platform].filter(Boolean).join(" | ")}
                            color="invert"
                        />
                        <div className="flex">
                            <img
                                alt={vault?.platform_alt}
                                className="w-4 rounded-full border border-bgDark"
                                src={vault?.platform_logo}
                            />
                            {vault?.secondary_platform && (
                                <img
                                    className="w-4 rounded-full border border-bgDark"
                                    src={vault?.secondary_platform_logo}
                                />
                            )}
                        </div>
                    </div>
                    {vaultBalance > 0 && (
                        <div>
                            <button
                                className={`px-4 py-2 rounded-md transition-all transform duration-200 flex items-center justify-center gap-2 min-w-[160px] ${
                                    isDepositing
                                        ? "bg-buttonDisabled cursor-not-allowed"
                                        : "bg-buttonPrimary hover:bg-buttonPrimaryLight hover:scale-105 active:scale-95"
                                } text-black`}
                                onClick={deposit}
                                disabled={isDepositing}
                            >
                                {isDepositing && <CgSpinner className="animate-spin text-xl" />}
                                <span>{isDepositing ? "Depositing..." : "Deposit to rewards vault"}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className={`grid ${estimateTrax && Number(estimateTrax) > 0 ? "grid-cols-3" : "grid-cols-2"}`}>
                {/* Your Stake */}
                <div className="text-textSecondary border-r border-bgPrimary">
                    <div className="uppercase font-arame-mono mb-2 text-textPrimary text-lg">
                        <p>Your Earnings</p>
                    </div>
                    {!isVaultEarningsFirstLoad ? (
                        <div className="text-textWhite text-lg font-league-spartan leading-5">
                            <p className="text-green-500">+${formatCurrency(currentVaultEarningsUsd)}</p>
                            {/* <div style={{ minWidth: 60 }}>
                            {true || (isLoadingOldData && <Skeleton w={45} h={16} className="ml-1" />)}
                            {!isLoadingOldData &&
                                oldPrice &&
                                Number(
                                    (
                                        userVaultBalance * priceOfSingleToken -
                                        userVaultBalance * oldPrice[0].price
                                    ).toFixed(2)
                                ) !== 0 &&
                                (oldPrice[0].price > priceOfSingleToken ? (
                                    <span className="flex items-center text-red-500">
                                        <GoArrowDown />
                                        <p className="m-0 text-xs">
                                            $
                                            {formatCurrency(
                                                Math.abs(
                                                    userVaultBalance * priceOfSingleToken -
                                                        userVaultBalance * oldPrice[0].price
                                                )
                                            )}
                                        </p>
                                    </span>
                                ) : (
                                    <span className="flex items-center text-green-500">
                                        <GoArrowUp className="m-0 text-xs" />
                                        <p style={{ margin: 0, fontSize: 10 }}>
                                            $
                                            {formatCurrency(
                                                Math.abs(
                                                    userVaultBalance * oldPrice[0].price -
                                                        userVaultBalance * priceOfSingleToken
                                                )
                                            )}
                                        </p>
                                    </span>
                                ))}
                        </div> */}
                        </div>
                    ) : (
                        <div className="h-6 w-16 bg-white/30 rounded-md animate-pulse"></div>
                    )}
                </div>

                {/* APY */}
                <div
                    className={`text-textSecondary text-sm ml-4 ${
                        estimateTrax && Number(estimateTrax) > 0 ? "border-r border-bgPrimary" : ""
                    }`}
                >
                    <div className={"uppercase font-arame-mono mb-2 text-textPrimary text-lg"}>
                        <p>APY</p>
                    </div>
                    <div className="text-textWhite text-lg font-league-spartan leading-5	">
                        <p>
                            {vault.isCurrentWeeksRewardsVault
                                ? "??? %"
                                : toFixedFloor(apy || 0, 2) == 0
                                ? "--"
                                : apy < 0.01
                                ? `${apy.toPrecision(2).slice(0, -1)}%`
                                : `${toFixedFloor(apy, 2).toString()}%`}
                        </p>
                    </div>
                </div>
                {/* BTX per year */}
                {estimateTrax && Number(estimateTrax) > 0 && (
                    <div className="text-textSecondary text-sm ml-4">
                        <div className={"uppercase mb-2 text-textPrimary text-lg"}>
                            <p>BTX Points</p>
                        </div>
                        <div className={"text-textWhite font-league-spartan text-lg leading-5"}>
                            <p>{(Number(estimateTrax) / 365.25).toFixed(2)}/day</p>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex justify-end items-end gap-2">
                <div className="inline-flex items-end gap-2 bg-white/5 backdrop-blur-sm rounded-lg p-2">
                    <div className="uppercase font-arame-mono text-textPrimary text-md">
                        <p>Your Stake</p>
                    </div>
                    <div className="text-textWhite text-md font-league-spartan">
                        <p>${formatCurrency(userVaultBalance * priceOfSingleToken)}</p>
                    </div>
                </div>
            </div>
            {rewards > 0n ? (
                <div className={`grid grid-cols-2`}>
                    {/* Your Rewards */}
                    <div className="text-textSecondary">
                        <div className="uppercase font-arame-mono mb-2 text-textPrimary text-lg">
                            <p>Your Rewards</p>
                        </div>
                        <div className=" group relative text-textWhite text-lg font-league-spartan leading-5	">
                            <p>{formatCurrency(formatEther(rewards))} BGT</p>
                            <span className="invisible group-hover:visible absolute left-0 top-full z-10 bg-bgDark p-2 rounded-md border border-borderDark text-sm text-textWhite">
                                {formatCurrency(formatEther(rewards), 18)} BGT
                            </span>
                        </div>
                    </div>

                    {/* Claim Rewards */}
                    <div className="text-textSecondary text-xs ml-4 flex items-center justify-end">
                        <button
                            className={`px-2 py-1 rounded-md transition-all transform duration-200 flex items-center justify-center gap-2    ${
                                isClaiming
                                    ? "bg-buttonDisabled cursor-not-allowed"
                                    : "bg-buttonPrimary hover:bg-buttonPrimaryLight active:scale-95"
                            } text-black`}
                            onClick={claimRewards}
                            disabled={isClaiming}
                        >
                            {isClaiming && <CgSpinner className="animate-spin text-xl" />}
                            <span>{isClaiming ? "Claiming..." : "Claim Rewards"}</span>
                        </button>
                    </div>
                </div>
            ) : (
                <></>
            )}
        </div>
    );
};

export default VaultItem;
