import useWallet from "./useWallet";
import { approveErc20, checkApproval, getAllowanceAmount } from "src/api/token";
import { Address } from "viem";
import { useAppDispatch } from "src/state";
import { setTokenAllowance } from "src/state/farms/farmsReducer";

export const useApprovalErc20 = () => {
    const { currentWallet, getClients, getPublicClient, getWalletClient } = useWallet();
    const dispatch = useAppDispatch();

    const approve = async (contractAddress: Address, spender: Address, amount: bigint, chainId: number) => {
        if (!currentWallet) return;
        const success = await approveErc20(contractAddress, spender, amount, currentWallet, chainId, getPublicClient, getWalletClient);
        
        // If approval was successful, store the new allowance
        if (success && currentWallet) {
            dispatch(setTokenAllowance({
                userAddress: currentWallet,
                chainId,
                tokenAddress: contractAddress,
                zapperAddress: spender,
                allowance: amount.toString()
            }));
        }
        
        return success;
    };

    const getAllowance = async (contractAddress: Address, spender: Address, amount: bigint, chainId: number) => {
        if (!currentWallet) return;
        
        // Check if approval is sufficient
        const isApproved = await checkApproval(contractAddress, spender, amount, currentWallet, getPublicClient(chainId));
        
        // If approved, also fetch and store the actual allowance value for future reference
        if (isApproved && currentWallet) {
            try {
                const actualAllowance = await getAllowanceAmount(contractAddress, spender, currentWallet, getPublicClient(chainId));
                
                dispatch(setTokenAllowance({
                    userAddress: currentWallet,
                    chainId,
                    tokenAddress: contractAddress,
                    zapperAddress: spender,
                    allowance: actualAllowance.toString()
                }));
            } catch (error) {
                console.error("Error fetching actual allowance:", error);
            }
        }
        
        return isApproved;
    };

    return { approve, getAllowance };
};
