import { useMemo, useState } from "react";
import { FarmData, FarmDataExtended } from "src/types";
import { FarmSortOptions } from "src/types/enums";
import useWallet from "../../../hooks/useWallet";
import { useFarmApys } from "./useFarmApy";
import useFarmDetails from "./useFarmDetails";
import useFarms from "./useFarms";

const useEarnPage = () => {
    const { externalChainId } = useWallet();
    const { farms } = useFarms();
    const { farmDetails, isLoading, isFetched } = useFarmDetails();
    const [selectedPlatform, setSelectedPlatform] = useState<null | string>(null);
    const [sortSelected, setSortSelected] = useState<FarmSortOptions>(FarmSortOptions.APY_High_to_Low);
    const { apys } = useFarmApys();

    const sortFn = () => {
        let data: FarmDataExtended[] = farms.map((ele) => {
            const queryData = Object.values(farmDetails).find((item: FarmData) => item?.id === ele.id);
            return {
                ...ele,
                ...queryData,
                apy: apys[ele.id]?.apy,
            };
        });
        if (selectedPlatform) data = data.filter((item) => item.originPlatform === selectedPlatform);
        data = data.filter((item) => !item.isUpcoming);
        if (!isFetched) return data;

        // First sort by APY
        switch (sortSelected) {
            case FarmSortOptions.APY_High_to_Low:
                data = data.sort((a, b) => b.apy - a.apy);
                break;
            case FarmSortOptions.APY_Low_to_High:
                data = data.sort((a, b) => a.apy - b.apy);
                break;
            case FarmSortOptions.Deposit_High_to_Low:
                data = data.sort(
                    (a, b) =>
                        Number(b.withdrawableAmounts![0].amountDollar) - Number(a.withdrawableAmounts![0].amountDollar)
                );
                break;
            case FarmSortOptions.Deposit_Low_to_High:
                data = data.sort((a, b) => {
                    const aWithdrawableAmount =
                        a.withdrawableAmounts && a.withdrawableAmounts[0]
                            ? Number(a.withdrawableAmounts[0].amountDollar)
                            : 0;
                    const bWithdrawableAmount =
                        b.withdrawableAmounts && b.withdrawableAmounts[0]
                            ? Number(b.withdrawableAmounts[0].amountDollar)
                            : 0;

                    if (aWithdrawableAmount === 0 && bWithdrawableAmount !== 0) return 1;
                    if (aWithdrawableAmount !== 0 && bWithdrawableAmount === 0) return -1;
                    return aWithdrawableAmount - bWithdrawableAmount;
                });
                break;
            default:
                data = data.sort((a, b) => {
                    if (a.isCurrentWeeksRewardsVault && !b.isCurrentWeeksRewardsVault) return -1;
                    if (!a.isCurrentWeeksRewardsVault && b.isCurrentWeeksRewardsVault) return 1;

                    const aWithdrawableAmount =
                        a.withdrawableAmounts && a.withdrawableAmounts[0]
                            ? Number(a.withdrawableAmounts[0].amountDollar)
                            : 0;
                    const bWithdrawableAmount =
                        b.withdrawableAmounts && b.withdrawableAmounts[0]
                            ? Number(b.withdrawableAmounts[0].amountDollar)
                            : 0;

                    if (aWithdrawableAmount !== bWithdrawableAmount) {
                        return bWithdrawableAmount - aWithdrawableAmount;
                    }

                    if (a.token_type !== b.token_type) {
                        if (a.token_type === "Token") return -1;
                        if (b.token_type === "Token") return 1;
                    }

                    if (a.isCrossChain !== b.isCrossChain) {
                        // @ts-ignore
                        return a.isCrossChain - b.isCrossChain;
                    }
                    return 0;
                });
                break;
        }

        // Then group by platform while maintaining the APY order
        data = data.sort((a, b) => {
            if (a.originPlatform !== b.originPlatform) {
                return a.originPlatform.localeCompare(b.originPlatform);
            }
            return 0;
        });

        console.log(data);
        return data;
    };

    const sortedFarms = useMemo(() => {
        return sortFn();
    }, [sortSelected, selectedPlatform, farmDetails, farms, isFetched, externalChainId]);

    const upcomingFarms = useMemo(() => {
        return farms.filter((item) => item.isUpcoming);
    }, [farms]);

    return {
        sortedFarms,
        upcomingFarms,
        farms,
        apys,
        farmDetails,
        selectedPlatform,
        setSelectedPlatform,
        sortSelected,
        setSortSelected,
    };
};

export default useEarnPage;

