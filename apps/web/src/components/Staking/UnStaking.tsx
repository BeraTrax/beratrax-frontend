import { ImSpinner8 } from "react-icons/im";
import { toEth } from "@beratrax/core/src/utils/common";

interface UnstakingProps {
	userStake: bigint;
	btxBalance: string;
	unstakeAmount: number;
	setUnstakeAmount: (amount: number) => void;
	loading: boolean;
	isStakingLive: boolean;
	handleUnstake: () => void;
}

export default function UnStaking({
	userStake,
	btxBalance,
	unstakeAmount,
	setUnstakeAmount,
	loading,
	isStakingLive,
	handleUnstake,
}: UnstakingProps) {
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
							value={unstakeAmount}
							onChange={(e) => {
								setUnstakeAmount(Number(e.target.value));
							}}
						/>
						<button
							className="bg-gradientPrimary px-4 py-2 rounded-xl font-medium max-button-gradient text-bgDark hover:scale-105 shadow-lg"
							onClick={() => {
								setUnstakeAmount(Number(toEth(userStake || 0n)));
							}}
						>
							MAX
						</button>
					</div>
				</div>
			</div>

			<button
				className={`w-full mt-4 px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2 ${
					loading || !unstakeAmount || unstakeAmount > Number(toEth(userStake || 0n)) || !isStakingLive
						? "bg-buttonDisabled cursor-not-allowed"
						: "bg-buttonPrimary hover:bg-buttonPrimaryLight"
				} text-textBlack`}
				onClick={handleUnstake}
				disabled={loading || !unstakeAmount}
			>
				{loading && <ImSpinner8 className="animate-spinFast" />}
				{loading
					? "Unstaking..."
					: !isStakingLive
						? "Staking Period Has Ended. Please wait for the next epoch"
						: unstakeAmount > Number(toEth(userStake || 0n))
							? "Insufficient funds"
							: "Unstake BTX"}
			</button>
		</div>
	);
}
