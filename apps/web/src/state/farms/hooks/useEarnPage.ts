import { useMemo, useState } from "react";
import { FarmData, FarmDataExtended } from "src/types";
import { FarmSortOptions } from "src/types/enums";
import useWallet from "../../../hooks/useWallet";
import { useFarmApys } from "./useFarmApy";
import useFarmDetails from "./useFarmDetails";
import useFarms from "./useFarms";
import { isVaultNew } from "src/utils/common";

type Comparator<T> = (a: T, b: T) => number;

/**
 * Chains multiple comparators in order: each is tried in turn until one returns non-zero.
 */
function chainSort<T>(...fns: Comparator<T>[]): Comparator<T> {
    return (a, b) => {
        for (const fn of fns) {
            const res = fn(a, b);
            if (res !== 0) return res;
        }
        return 0;
    };
}

function multiSort<T>(data: T[], fns: Comparator<T>[]): T[] {
    fns.forEach((fn) => {
        data = data.sort(fn);
    });
    return data;
}

const useEarnPage = () => {
    const { externalChainId } = useWallet();
    const { farms } = useFarms();
    const { farmDetails, isLoading, isFetched } = useFarmDetails();
    const [selectedPlatform, setSelectedPlatform] = useState<null | string>(null);
    const [sortSelected, setSortSelected] = useState<FarmSortOptions>();
    const { apys } = useFarmApys();

    const sortFn = (): FarmDataExtended[] => {
        let data: FarmDataExtended[] = farms.map((ele) => {
            const queryData = Object.values(farmDetails).find((item) => item?.id === ele.id) as FarmData;
            return {
                ...ele,
                ...queryData,
                apy: apys[ele.id]?.apy ?? 0,
            };
        });

        if (selectedPlatform) {
            data = data.filter(
                (item) => item.originPlatform === selectedPlatform || item.secondary_platform === selectedPlatform
            );
        }
        data = data.filter((item) => !item.isDeprecated);

        // Filter for new vaults when New sort option is selected
        if (sortSelected === FarmSortOptions.New) {
            data = data.filter((item) => isVaultNew(Number(item.createdAt)));
        }

        data = data.map((item) => {
            const amtDollar = Number(item.withdrawableAmounts?.[0]?.amountDollar ?? 0);
            return {
                ...item,
                _hasDeposit: amtDollar > 0,
                _depositAmt: amtDollar,
                _apy: item.apy,
                _priority: item.priorityOrder ?? Number.POSITIVE_INFINITY,
            };
        });

        // 5) Build comparators for each priority
        const hasDepositCmp: Comparator<any> = (a, b) => b._depositAmt - a._depositAmt;

        const apyHighCmp: Comparator<any> = (a, b) => b._apy - a._apy;
        const apyLowCmp: Comparator<any> = (a, b) => a._apy - b._apy;

        const depositHighCmp: Comparator<any> = (a, b) => b._depositAmt - a._depositAmt;
        const depositLowCmp: Comparator<any> = (a, b) => a._depositAmt - b._depositAmt;

        const newVaultCmp: Comparator<any> = (a, b) => {
            const aNew = isVaultNew(Number(a.createdAt));
            const bNew = isVaultNew(Number(b.createdAt));
            return aNew === bNew ? 0 : aNew ? -1 : 1;
        };

        const currentWeekRewardCmp: Comparator<any> = (a, b) =>
            b.isCurrentWeeksRewardsVault === a.isCurrentWeeksRewardsVault ? 0 : a.isCurrentWeeksRewardsVault ? -1 : 1;

        const tokenTypeCmp: Comparator<any> = (a, b) => {
            if (a.token_type === b.token_type) return 0;
            return a.token_type === "Token" ? -1 : 1;
        };

        const platformCmp: Comparator<any> = (a, b) => a.originPlatform.localeCompare(b.originPlatform);

        const priorityOrderCmp: Comparator<any> = (a, b) => a._priority - b._priority;

        let comparator: Comparator<any>[] = [];

        switch (sortSelected) {
            case FarmSortOptions.APY_High_to_Low:
                comparator.push(priorityOrderCmp, hasDepositCmp, apyHighCmp);
                break;
            case FarmSortOptions.APY_Low_to_High:
                comparator.push(priorityOrderCmp, hasDepositCmp, apyLowCmp);
                break;
            case FarmSortOptions.Deposit_High_to_Low:
                comparator.push(priorityOrderCmp, hasDepositCmp, depositHighCmp);
                break;
            case FarmSortOptions.Deposit_Low_to_High:
                comparator.push(priorityOrderCmp, hasDepositCmp, depositLowCmp);
                break;
            case FarmSortOptions.New:
                comparator.push(priorityOrderCmp, newVaultCmp, hasDepositCmp, apyHighCmp);
                break;
            default:
                comparator.push(apyHighCmp, priorityOrderCmp, hasDepositCmp, newVaultCmp);
                break;
        }

        data = multiSort(data, comparator);

        return data;
    };

    const sortedFarms = useMemo(() => {
        return sortFn();
    }, [sortSelected, selectedPlatform, farmDetails, farms, isFetched, externalChainId, apys]);

    return {
        sortedFarms,
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

