import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { encodeFunctionData, getContract, erc20Abi, Address, zeroAddress } from "viem";
import closemodalicon from "src/assets/images/closemodalicon.svg";
import PoolButton from "src/components/PoolButton/PoolButton";
import MobileModalContainer from "src/components/MobileModalContainer/MobileModalContainer";
import Staking from "src/components/Staking/Staking";
import UnStaking from "src/components/Staking/UnStaking";
import { Tabs } from "src/components/Tabs/Tabs";
import { CHAIN_ID } from "src/types/enums";
import { awaitTransaction, toEth, toWei } from "src/utils/common";
import { useWallet } from "@beratrax/core/hooks";
import useFarms from "src/state/farms/hooks/useFarms";
import { useFarmApys } from "src/state/farms/hooks/useFarmApy";
import { approveErc20, getBalance } from "src/api/token";
import stakingAbi from "src/assets/abis/stakingAbi";
import stakingModalStyles from "./StakingModal.module.css";
import { ImSpinner8 } from "react-icons/im";
import { FaCircleCheck } from "react-icons/fa6";
import btxLogo from "./../../../assets/images/btxTokenLogo.png";
import { addressesByChainId } from "src/config/constants/contracts";

interface StakingModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

enum Tab {
  Stake = "Stake",
  Unstake = "Unstake",
}

const StakingModal = ({ open, setOpen }: StakingModalProps) => {
  const { getClients, currentWallet, getPublicClient, getWalletClient } = useWallet();
  const { farms } = useFarms();
  const { apys } = useFarmApys();

  const [btxBalance, setBTXBalance] = useState<string>("0");
  const [stakeAmount, setStakeAmount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [isVoting, setIsVoting] = useState<boolean>(false);
  const [isStakingLive, setIsStakingLive] = useState<boolean>(false);
  const [unstakeAmount, setUnstakeAmount] = useState<number>(0);
  const [vaults, setVaults] = useState<any[]>([]);
  const [selectedVault, setSelectedVault] = useState<Address>();
  const [userStake, setUserStake] = useState<bigint>(0n);
  const [userCurrentVote, setUserCurrentVote] = useState<number>();
  const [tab, setTab] = React.useState<Tab>(Tab.Stake);

  const publicClient = getPublicClient(CHAIN_ID.BERACHAIN);
  const BTXAddress = addressesByChainId[CHAIN_ID.BERACHAIN].btxAddress as Address;
  const stakingAddress = addressesByChainId[CHAIN_ID.BERACHAIN].stakingAddress as Address;

  const fetchBTXBalance = useCallback(async () => {
    const balance = await getBalance(BTXAddress, currentWallet!, { public: publicClient });
    setBTXBalance(toEth(balance));
  }, [currentWallet, publicClient]);

  const checkStakingPeriod = async () => {
    const contract = getContract({ address: stakingAddress, abi: stakingAbi, client: { public: publicClient } });
    const periodEndBlock = (await contract.read.periodEndBlock()) as bigint;
    const currentBlockNumber = await publicClient.getBlockNumber();
    setIsStakingLive(currentBlockNumber < periodEndBlock);
  };

  const fetchUserData = async () => {
    if (!currentWallet) return;
    await Promise.all([
      fetchBTXBalance(),
      getUserStake(),
      getUserCurrentVote(),
      checkStakingPeriod(),
      getVotingVaults(),
    ]);
  };

  const getUserStake = async () => {
    const contract = getContract({ address: stakingAddress, abi: stakingAbi, client: { public: publicClient } });
    const userInfo = (await contract.read.userInfo([currentWallet])) as any;
    setUserStake(userInfo[1]);
  };

  const getUserCurrentVote = async () => {
    const contract = getContract({ address: stakingAddress, abi: stakingAbi, client: { public: publicClient } });
    const epochId = await contract.read.epochId();
    const userVote = await contract.read.userVote([epochId, currentWallet]);
    setUserCurrentVote(userVote as number);
  };

  const getVotingVaults = async () => {
    const contract = getContract({ address: stakingAddress, abi: stakingAbi, client: { public: publicClient } });
    const liveVotingVaults = (await contract.read.getProposals([false])) as Address[];
    const epochId = await contract.read.epochId();
    const voteCounts = await Promise.all(
      liveVotingVaults.map(async (proposalAddress) => {
        const voteCount = await contract.read.proposalToVoteCount([proposalAddress, epochId]);
        return { proposalAddress, voteCount };
      })
    );
    const vaults = farms
      .filter((farm) => farm.rewardVault && liveVotingVaults.includes(farm.rewardVault))
      .map((farm) => ({
        ...farm,
        apys: apys[farm.id],
        votes: voteCounts.find((vote) => vote.proposalAddress === farm.rewardVault)?.voteCount,
      }));
    setVaults(vaults);
  };

  useEffect(() => {
    fetchUserData();
  }, [currentWallet, open]);

  const handleStake = async () => {
    try {
      setLoading(true);
      const client = await getClients(CHAIN_ID.BERACHAIN);
      const approval = await approveErc20(
        BTXAddress,
        stakingAddress,
        toWei(stakeAmount),
        currentWallet!,
        CHAIN_ID.BERACHAIN,
        getPublicClient,
        getWalletClient
      );
      if (!approval.status) throw new Error("Approval failed");

      await awaitTransaction(
        client.wallet.sendTransaction({
          to: stakingAddress,
          data: encodeFunctionData({
            abi: stakingAbi,
            functionName: "stake",
            args: [currentWallet, toWei(stakeAmount)],
          }),
        }),
        client
      );
      setStakeAmount(0);
      await fetchUserData();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async () => {
    try {
      setLoading(true);
      const client = await getClients(CHAIN_ID.BERACHAIN);

      await awaitTransaction(
        client.wallet.sendTransaction({
          to: stakingAddress,
          data: encodeFunctionData({
            abi: stakingAbi,
            functionName: "unstake",
            args: [toWei(unstakeAmount)],
          }),
        }),
        client
      );
      setUnstakeAmount(0);
      await fetchUserData();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    try {
      setIsVoting(true);
      const client = await getClients(CHAIN_ID.BERACHAIN);
      await awaitTransaction(
        client.wallet.sendTransaction({
          to: stakingAddress,
          data: encodeFunctionData({ abi: stakingAbi, functionName: "vote", args: [selectedVault!] }),
        }),
        client
      );
      await fetchUserData();
    } catch (error) {
      console.error(error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <MobileModalContainer open={open}>
      <div className="px-4 py-4 bg-bgDark rounded-t-3xl">
        <div className=" h-12 w-full  relative ">
          <button className="text-textWhite p-8 absolute -top-6 -right-4   " onClick={() => setOpen(false)}>
            <img src={closemodalicon} alt="close-modal" />
          </button>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={btxLogo} alt="BTX" className="w-8 h-8" />
              <h2 className="text-2xl font-bold text-textWhite">Stake BTX</h2>
            </div>
          </div>

          <div className="-mx-4 relative">
            <div className="overflow-x-auto">
              <Tabs className="max-h-24 whitespace-nowrap px-4 min-w-min">
                {Object.values(Tab).map((_tab, i) => (
                  <PoolButton
                    key={i}
                    variant={2}
                    onClick={() => {
                      setTab(_tab);
                    }}
                    description={_tab}
                    active={tab === _tab}
                    className="whitespace-nowrap inline-block"
                  />
                ))}
              </Tabs>
            </div>
          </div>
          {tab === Tab.Stake && (
            <Staking
              userStake={userStake}
              btxBalance={btxBalance}
              stakeAmount={stakeAmount}
              setStakeAmount={setStakeAmount}
              loading={loading}
              isStakingLive={isStakingLive}
              handleStake={handleStake}
            />
          )}

          {tab === Tab.Unstake && (
            <UnStaking
              userStake={userStake}
              btxBalance={btxBalance}
              unstakeAmount={unstakeAmount}
              setUnstakeAmount={setUnstakeAmount}
              loading={loading}
              isStakingLive={isStakingLive}
              handleUnstake={handleUnstake}
            />
          )}
        </div>
        <div className={`mt-8 border-t border-borderDark pt-6 ${stakingModalStyles.customScrollbar} `}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-textWhite">Select Vault to Vote</h3>
            <div className="text-sm text-textGrey">
              {!userCurrentVote && userStake
                ? `Vote with your ${Number(toEth(userStake)).toFixed(2)} BTX`
                : `${vaults.length} vaults available`}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {/* This would be mapped over vault data in real implementation */}
            {vaults.map((vault, index) => (
              <button
                key={index}
                className={`relative group bg-bgSecondary hover:bg-opacity-80 rounded-xl p-4 transition-all duration-200 border border-borderDark hover:border-borderLight ${
                  vault.rewardVault === selectedVault ? "border-borderLight bg-opacity-80" : ""
                }
                                ${vault.rewardVault === userCurrentVote ? "cursor-not-allowed" : ""}`}
                onClick={() => vault.rewardVault != userCurrentVote && setSelectedVault(vault.rewardVault)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradientPrimary flex items-center justify-center">
                    <span className="text-bgDark font-bold">{index + 1}</span>
                  </div>
                  <span className="text-textWhite font-medium">
                    {vault.name} ({vault.originPlatform})
                  </span>
                  {userCurrentVote == vault.rewardVault && <FaCircleCheck className="text-textPrimary" />}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-textWhite">Current Votes</span>
                    <span className="text-textWhite">{Number(vault.votes)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-textWhite">APR</span>
                    <span className="text-gradientPrimary">{Number(vault.apys.apy).toFixed(2)}%</span>
                  </div>
                </div>

                <div
                  className={`absolute inset-0 rounded-xl transition-opacity duration-200 ${
                    vault.rewardVault === userCurrentVote
                      ? "bg-gradientPrimary opacity-20"
                      : "bg-gradientPrimary opacity-0 group-hover:opacity-10"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
        <button
          className={`w-full mt-4 px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2 ${
            !isStakingLive || isVoting || !selectedVault || !userStake
              ? "bg-buttonDisabled cursor-not-allowed"
              : "bg-buttonPrimary hover:bg-buttonPrimaryLight"
          } text-textBlack`}
          onClick={handleVote}
        >
          {isVoting && <ImSpinner8 className="animate-spinFast" />}
          {!isStakingLive
            ? "Voting Period Has Ended. Please wait for the next epoch"
            : isVoting
            ? "Voting..."
            : !userStake
            ? "You must stake BTX to be able to vote"
            : !userCurrentVote
            ? `Vote with your ${Number(toEth(userStake)).toFixed(0)} BTX`
            : "Vote"}
        </button>
      </div>
    </MobileModalContainer>
  );
};

export default memo(StakingModal);
