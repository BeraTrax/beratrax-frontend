import { useMemo, useState, useEffect } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "web/src/components/Skeleton/Skeleton";
import { Select } from "web/src/components/Select/Select";
import { PoolDef } from "@beratrax/core/src/config/constants/pools_json";
import useFarmApy from "@beratrax/core/src/state/farms/hooks/useFarmApy";
import useWallet from "@beratrax/core/src/hooks/useWallet";
import useTokens from "@beratrax/core/src/state/tokens/useTokens";
import { formatCurrency } from "@beratrax/core/src/utils/common";

const FarmEarningsGraph = ({ farm }: { farm: PoolDef }) => {
	const { currentWallet } = useWallet();
	const { balances } = useTokens();
	const [investmentAmount, setInvestmentAmount] = useState<number>(1000);
	const [months, setMonths] = useState<number>(12);

	const { apy: farmApys, isLoading: isApyLoading } = useFarmApy(farm);

	const isAutoCompounded = farm.isAutoCompounded;
	const underlyingApr = farmApys?.rewardsApr + farmApys?.feeApr;
	const autoCompoundedApy = farmApys?.apy;
	const userStake = useMemo(() => Number(balances[farm.chainId][farm.vault_addr]?.valueUsd), [balances]);

	useEffect(() => {
		if (currentWallet && userStake > 0) {
			setInvestmentAmount(Number(userStake.toFixed(2)));
		}
	}, [currentWallet, userStake]);

	const handleInvestmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (value === "") {
			setInvestmentAmount(0);
		} else {
			const numValue = parseFloat(value);
			if (!isNaN(numValue) && numValue >= 0) {
				setInvestmentAmount(numValue);
			}
		}
	};

	const handleMonthsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (value === "") {
			setMonths(0);
		} else {
			const numValue = parseInt(value);
			if (!isNaN(numValue) && numValue >= 1 && numValue <= 60) {
				setMonths(numValue);
			}
		}
	};

	const projectedAutoCompoundedEarnings = useMemo(() => {
		if (!underlyingApr || !investmentAmount) return [];
		if (isAutoCompounded && !autoCompoundedApy) return [];

		const initialInvestment = investmentAmount;
		const projectedData = [];

		// Determine if we should use daily or monthly intervals
		const useDailyIntervals = months <= 12;
		const totalDays = months * 30; // Approximate days in the period
		const intervalCount = useDailyIntervals ? totalDays : months;

		for (let i = 0; i <= intervalCount; i++) {
			const date = new Date();
			if (useDailyIntervals) {
				date.setDate(date.getDate() + i);
			} else {
				date.setMonth(date.getMonth() + i);
			}

			// Calculate time in years for the projection
			const timeInYears = useDailyIntervals ? i / 365 : i / 12;

			const simpleAprEarnings = initialInvestment * (1 + (underlyingApr / 100) * timeInYears);

			const dataPoint: any = {
				date: useDailyIntervals
					? date.toLocaleDateString(undefined, { day: "numeric", month: "short" })
					: date.toLocaleDateString(undefined, { month: "short", year: "numeric" }),
				simpleApr: simpleAprEarnings,
				timestamp: Math.floor(date.getTime() / 1000),
			};

			if (isAutoCompounded && autoCompoundedApy) {
				const frequency = 525600; // per minute
				const rewardsRate = (farmApys?.rewardsApr + farmApys.extraRewardsApr) / 100;
				const feeRate = farmApys?.feeApr / 100;

				const compoundedRewards = initialInvestment * Math.pow(1 + rewardsRate / frequency, frequency * timeInYears);
				const linearFeeEarnings = initialInvestment * (feeRate * timeInYears);

				dataPoint.autoCompounded = compoundedRewards + linearFeeEarnings;
			}

			projectedData.push(dataPoint);
		}

		return projectedData;
	}, [underlyingApr, autoCompoundedApy, investmentAmount, isAutoCompounded, months]);

	const [minEarnings, maxEarnings] = useMemo(() => {
		if (!projectedAutoCompoundedEarnings || projectedAutoCompoundedEarnings.length === 0) return [investmentAmount, investmentAmount * 2];

		const values = projectedAutoCompoundedEarnings.map((d) => (isAutoCompounded ? Math.max(d.autoCompounded, d.simpleApr) : d.simpleApr));

		return [investmentAmount, Math.max(...values) * 1.1];
	}, [projectedAutoCompoundedEarnings, investmentAmount, isAutoCompounded]);

	return (
		<div className="z-10 relative">
			<div className="flex flex-col items-center mb-4">
				<div className="flex gap-4 mb-2 items-center">
					<div className="relative h-12">
						<div className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary">$</div>
						<input
							type="number"
							value={investmentAmount || ""}
							onChange={handleInvestmentChange}
							className="bg-bgDark text-textWhite text-center text-lg h-full pl-8 pr-4 rounded-lg w-32 focus:outline-none focus:ring-2 focus:ring-gradientSecondary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-transparent"
							placeholder="Enter amount"
							min="0"
							step="0.01"
						/>
					</div>
					<div className="relative z-10 h-12">
						<div className="h-full">
							<Select
								value={months.toString()}
								setValue={(value) => setMonths(Number(value))}
								options={["3", "6", "12", "24"]}
								extraText={["months", "months", "months", "months"]}
								className="h-full bg-bgDark text-textWhite rounded-lg"
							/>
						</div>
					</div>
				</div>
				<p className="text-sm text-textSecondary">Enter investment amount and period to see projection</p>
			</div>
			<div style={{ marginTop: "10px", width: "100%", height: "300px" }}>
				{isApyLoading ? (
					<Skeleton h={300} w={"100%"} />
				) : (
					<>
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart width={1200} data={projectedAutoCompoundedEarnings} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
								<defs>
									{isAutoCompounded && (
										<linearGradient id="colorAutoCompounded" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="#90BB62" stopOpacity={0.2} />
											<stop offset="95%" stopColor="#90BB62" stopOpacity={0} />
										</linearGradient>
									)}
									<linearGradient id="colorSimpleApr" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor={isAutoCompounded ? "#8884d8" : "#90BB62"} stopOpacity={0.2} />
										<stop offset="95%" stopColor={isAutoCompounded ? "#8884d8" : "#90BB62"} stopOpacity={0} />
									</linearGradient>
								</defs>
								<XAxis dataKey="date" tick={false} axisLine={false} height={0} />
								<YAxis tick={false} axisLine={false} width={0} domain={[minEarnings, maxEarnings]} />
								<Tooltip
									contentStyle={{ background: "#1a1a1a", border: "none" }}
									labelStyle={{ color: "#fff" }}
									formatter={(value: any, name: string) => [
										`$${formatCurrency(value)}`,
										name === "autoCompounded" ? "Trax APY" : "Underlying APR",
									]}
									labelFormatter={(label) => label}
								/>
								{isAutoCompounded && (
									<Area
										type="monotone"
										dataKey="autoCompounded"
										name="autoCompounded"
										stroke="#90BB62"
										strokeWidth={2}
										fill="url(#colorAutoCompounded)"
										fillOpacity={1}
										connectNulls
									/>
								)}
								<Area
									type="monotone"
									dataKey="simpleApr"
									name="simpleApr"
									stroke={isAutoCompounded ? "#8884d8" : "#90BB62"}
									strokeWidth={2}
									fill="url(#colorSimpleApr)"
									fillOpacity={1}
									connectNulls
								/>
							</AreaChart>
						</ResponsiveContainer>
					</>
				)}
			</div>
			<div className="text-center my-2">
				<p className="text-sm text-textSecondary">
					{months}-Month Projection of ${formatCurrency(investmentAmount)} Investment
				</p>
			</div>
		</div>
	);
};
export default FarmEarningsGraph;
