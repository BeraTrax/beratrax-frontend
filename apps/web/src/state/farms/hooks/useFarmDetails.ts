import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "src/state";
import useWallet from "../../../hooks/useWallet";
import useFarms from "./useFarms";
import { updateFarmDetails, reset, updateEarnings } from "src/state/farms/farmsReducer";
import useTokens from "../../../state/tokens/useTokens";

const useFarmDetails = () => {
    const { farms } = useFarms();
    const { balances, isBalancesFetched, isBalancesLoading, decimals, totalSupplies } = useTokens();
    const { prices, isPricesFetched, isPricesLoading } = useTokens();
    const { isLoading, farmDetails, isFetched, account, earnings, isLoadingEarnings } = useAppSelector(
        (state) => state.farms
    );
    const { currentWallet, getPublicClient } = useWallet();
    const dispatch = useAppDispatch();

    const reloadFarmData = useCallback(async () => {
        if (isBalancesFetched && isPricesFetched && currentWallet) {
            await dispatch(
                updateFarmDetails({ farms, totalSupplies, currentWallet, balances, prices, decimals, getPublicClient })
            );
            await dispatch(
                updateEarnings({
                    farms,
                    currentWallet,
                    getPublicClient,
                    decimals,
                    prices,
                    balances,
                    totalSupplies,
                })
            );
        }
    }, [farms, dispatch, currentWallet, balances, prices, decimals, isBalancesFetched, isPricesFetched, totalSupplies]);

    useEffect(() => {
        if (currentWallet !== account) dispatch(reset());
    }, [account, currentWallet]);

    return {
        isFetched,
        isLoading: (isLoading && !isFetched) || isBalancesLoading || isPricesLoading,
        isFetching: isLoading,
        reloadFarmData,
        farmDetails,
        earnings,
        isLoadingEarnings,
    };
};

export default useFarmDetails;
