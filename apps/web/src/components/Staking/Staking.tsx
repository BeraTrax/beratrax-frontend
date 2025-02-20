import { ImSpinner8 } from "react-icons/im";
import { toEth } from "src/utils/common";

interface StakingProps {
    userStake: bigint;
    btxBalance: string;
    stakeAmount: number;
    setStakeAmount: (amount: number) => void;
    loading: boolean;
    isStakingLive: boolean;
    handleStake: () => void;
}

export default function Staking({
    userStake,
    btxBalance,
    stakeAmount,
    setStakeAmount,
    loading,
    isStakingLive,
    handleStake,
}: StakingProps) {
    return (
        <div>
            <div className="bg-bgPrimary rounded-2xl p-4">
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <span className="text-textGray">Staked amount</span>
                        <span className="text-textGray">{Number(toEth(userStake || 0n))} BTX</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-textGray">Amount to Stake</span>
                        <span className="text-textGray">Balance: {Number(btxBalance) || 0} BTX</span>
                    </div>

                    <div className="flex gap-3 items-center">
                        <input
                            type="number"
                            placeholder="0.0"
                            className="w-full bg-transparent text-2xl text-bgDark outline-none placeholder:text-bgSecondary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:placeholder:opacity-0"
                            value={stakeAmount}
                            onChange={(e) => {
                                setStakeAmount(Number(e.target.value));
                            }}
                        />
                        <button
                            className="bg-gradientPrimary px-4 py-2 rounded-xl font-medium max-button-gradient text-bgDark hover:scale-105 shadow-lg"
                            onClick={() => {
                                setStakeAmount(Number(btxBalance) || 0);
                            }}
                        >
                            MAX
                        </button>
                    </div>
                </div>
            </div>

            <button
                className={`w-full mt-4 px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2 ${
                    loading || !stakeAmount || stakeAmount > Number(btxBalance || 0) || !isStakingLive
                        ? "bg-buttonDisabled cursor-not-allowed"
                        : "bg-buttonPrimary hover:bg-buttonPrimaryLight"
                } text-textBlack`}
                onClick={handleStake}
                disabled={loading || !stakeAmount}
            >
                {loading && <ImSpinner8 className="animate-spinFast" />}
                {loading
                    ? "Staking..."
                    : !isStakingLive
                    ? "Staking Period Has Ended. Please wait for the next epoch"
                    : stakeAmount > Number(btxBalance || 0)
                    ? "Insufficient funds"
                    : "Stake BTX"}
            </button>
        </div>
    );
}
