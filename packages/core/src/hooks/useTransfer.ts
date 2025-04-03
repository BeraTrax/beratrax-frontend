import { useIsMutating, useMutation } from "@tanstack/react-query";
import { Address, erc20Abi, getContract, zeroAddress } from "viem";
import { TRANSFER_TOKEN } from "./../config/constants/query";
import { awaitTransaction } from "./../utils/common";
import useWallet from "./useWallet";

const useTransfer = () => {
  const { currentWallet, estimateTxGas, getClients } = useWallet();

  const _transferEth = async ({
    to,
    amount,
    max,
    chainId,
  }: {
    to: Address;
    amount: bigint;
    max?: boolean;
    chainId: number;
  }) => {
    if (!currentWallet) return;
    const client = await getClients(chainId);
    const balance = await client.public.getBalance({ address: currentWallet });
    if (max) amount = balance;
    const response = await awaitTransaction(
      client.wallet.sendTransaction({
        to,
        value: amount,
      }),
      client,
    );
    return response;
  };
  const _transferToken = async ({
    tokenAddress,
    to,
    amount,
    max,
    chainId,
  }: {
    tokenAddress: Address;
    to: Address;
    amount: bigint;
    max?: boolean;
    chainId: number;
  }) => {
    if (!currentWallet) return;
    const client = await getClients(chainId);

    const contract = getContract({
      address: tokenAddress,
      abi: erc20Abi,
      client,
    });
    if (max) {
      amount = await contract.read.balanceOf([currentWallet]);
    }
    const response = await awaitTransaction(contract.write.transfer([to, amount]), client);
    return response;
  };

  const _transfer = async (transferInfo: {
    tokenAddress: Address;
    to: Address;
    amount: bigint;
    max?: boolean;
    chainId: number;
  }) => {
    return transferInfo.tokenAddress === zeroAddress ? _transferEth(transferInfo) : _transferToken(transferInfo);
  };

  const { mutateAsync: transfer } = useMutation({
    mutationFn: _transfer,
    mutationKey: TRANSFER_TOKEN(currentWallet!),
  });

  const isMutatingToken = useIsMutating({ mutationKey: TRANSFER_TOKEN(currentWallet!) });

  return { transfer, isLoading: isMutatingToken > 0 };
};

export default useTransfer;
