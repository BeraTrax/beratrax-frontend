import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "src/components/BackButton/BackButton";
import { useDetailInput } from "@beratrax/core/src/hooks";
import pools_json from "@beratrax/core/src/config/constants/pools_json";
import { toWei } from "src/utils/common";
import { CHAIN_ID, FarmTransactionType } from "src/types/enums";
import {
  TransactionStep,
  TransactionStepStatus,
  TransactionTypes,
  ZapOutStep,
} from "@beratrax/core/src/state/transactions/types";
import { useAppDispatch } from "@beratrax/core/src/state";
import { updatePoints } from "@beratrax/core/src/state/account/accountReducer";
import { addTransactionDb } from "@beratrax/core/src/state/transactions/transactionsReducer";
import { setFarmDetailInputOptions } from "@beratrax/core/src/state/farms/farmsReducer";
import ConfirmFarmActionModal from "src/components/FarmItem/components/FarmActionView/ConfirmFarmActionModal/ConfirmFarmActionModal";
import { formatUnits } from "ethers/lib/utils";
import { useReadContract } from "wagmi";
import { erc20Abi, getAddress } from "viem";
import useTokens from "@beratrax/core/src/state/tokens/useTokens";

const DeprecatedVaults: React.FC = () => {
  const selectOption = [
    "0x62b70a28d16291d15886EF96F86535DC74a47CB7",
    "0x5075B3a26e9405a501adea925118c8B2328F6128",
    "0xBbB256Df8F60bb8B981b24A31BC9563Bd07af430",
    "0x866230C5e5cEF2A19DB6A0D50eD32d9F98E8e28D",
    "0x46bcD8aEf69012b3D878e805F196F232F41febC8",
  ];

  const navigate = useNavigate();
  const [vaultAddress, setVaultAddress] = useState(selectOption[0]);
  const [zapperAddress, setZapperAddress] = useState("");
  const { decimals } = useTokens();
  const dispatch = useAppDispatch();
  const [txId, setTxId] = useState("");
  const farm = pools_json.find((item) => item.vault_addr === vaultAddress) || pools_json[0];
  const {
    amount,
    toggleAmount,
    showInUsd,
    currentWallet,
    maxBalance,
    setMax,
    handleInput,
    withdrawable,
    depositable,
    getTokenAmount,
    handleSubmit,
    fetchingSlippage,
    handleToggleShowInUsdc,
    isLoadingFarm,
    max,
    slippage,
    isLoadingTransaction,
  } = useDetailInput(farm!);

  // Add this state at the top of your component
  const [isInitiatingWithdraw, setIsInitiatingWithdraw] = useState(false);
  const [confirmDeposit, setConfirmDeposit] = useState<boolean>();

  const { data: vaultBalance } = useReadContract({
    address: getAddress(vaultAddress),
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [currentWallet!],
  });

  useEffect(() => {
    const processWithdraw = async () => {
      if (!isInitiatingWithdraw || !max) return;
      const amount = getTokenAmount();
      if (!amount || Number(amount) === 0) return; // Wait until we have a non-zero amount

      if (!farm) return;
      setConfirmDeposit(true);
      let amountInWei = toWei(amount, decimals[farm.chainId][withdrawable!.tokenAddress]);
      let steps: TransactionStep[] = [];
      steps.push({
        status: TransactionStepStatus.PENDING,
        type: TransactionTypes.ZAP_OUT,
        amount: amountInWei.toString(),
      } as ZapOutStep);

      const dbTx = await dispatch(
        addTransactionDb({
          from: currentWallet!,
          amountInWei: amountInWei.toString(),
          date: new Date().toString(),
          type: "withdraw",
          farmId: farm.id,
          max: true,
          token: withdrawable!.tokenAddress,
          steps,
        })
      );

      const id = dbTx.payload._id;
      setTxId(id);
      await handleSubmit({ txId: id });
      await dispatch(updatePoints(currentWallet!));

      setIsInitiatingWithdraw(false);
    };

    processWithdraw();
  }, [max, amount, isInitiatingWithdraw]); // Add amount to dependencies

  const handleWithdraw = () => {
    if (!farm) return;
    setIsInitiatingWithdraw(true);
    setMax(true);
    dispatch(setFarmDetailInputOptions({ transactionType: FarmTransactionType.Withdraw }));
  };

  return (
    <div className="relative text-textWhite h-full overflow-y-auto overflow-x-hidden font-league-spartan">
      <div className="h-full pt-14 px-4 pb-2">
        <BackButton onClick={() => navigate(-1)} />

        {/* Heading */}
        <div className="mt-4">
          <h5 className="text-3xl font-bold uppercase">Deprecated Vaults</h5>
        </div>
        <h6 className="mb-9 text-lg font-light">Manage your deprecated positions</h6>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto mt-8">
          <div className="flex flex-col gap-6 bg-[#1a1b1f] rounded-xl p-6 md:p-8">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-300">Vault Address</label>
              <select
                value={vaultAddress}
                onChange={(e) => setVaultAddress(e.target.value)}
                className="w-full h-12 px-4 py-4 bg-[#2c2d33] rounded-lg border border-gray-600 text-white 
                                hover:border-gray-500 focus:border-borderLight focus:outline-none appearance-none 
                                cursor-pointer transition-colors bg-no-repeat bg-[length:24px_24px] bg-[center_right_1rem]
                                bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCA2TDggMTBMMTIgNiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=')]"
              >
                {selectOption.map((address) => (
                  <option key={address} value={address} className="bg-[#2c2d33] text-white" style={{ color: "white" }}>
                    {`${pools_json.find((item) => item.vault_addr === address)?.name} (${
                      pools_json.find((item) => item.vault_addr === address)?.platform
                    })`}
                  </option>
                ))}
              </select>
              {/* Vault Balance */}
              <div className="mt-4 p-4 bg-[#2c2d33] rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Your Balance</span>
                  <span className="text-lg font-medium">
                    {vaultBalance && decimals[farm?.chainId || CHAIN_ID.BERACHAIN]?.[getAddress(vaultAddress)]
                      ? formatUnits(
                          vaultBalance,
                          decimals[farm?.chainId || CHAIN_ID.BERACHAIN]?.[getAddress(vaultAddress)]
                        )
                      : "0.00"}
                  </span>
                </div>
              </div>
            </div>

            {/* Button */}
            <button
              className={`w-full mt-4 ${
                !farm ? "bg-gray-500 cursor-not-allowed" : "bg-bgPrimary hover:opacity-80"
              } text-white font-bold py-3 px-6 rounded-[40px] transition-colors duration-200 ease-in-out`}
              onClick={handleWithdraw}
              disabled={!farm}
            >
              Withdraw
            </button>
          </div>
        </div>

        {/* Bottom padding */}
        <div className="h-32"></div>
      </div>

      {/* Confirm Deposit / Withdraw Modal */}
      {confirmDeposit ? (
        <ConfirmFarmActionModal
          farm={farm}
          txId={txId}
          handleClose={(closeDepositModal?: boolean) => {
            setConfirmDeposit(false);
            if (closeDepositModal) {
              // setOpen(false);
              navigate("/");
            }
          }}
          depositInfo={{
            amount,
            showInUsd,
            token: "BERA",
            transactionType: FarmTransactionType.Withdraw,
          }}
        />
      ) : null}
    </div>
  );
};

export default DeprecatedVaults;
