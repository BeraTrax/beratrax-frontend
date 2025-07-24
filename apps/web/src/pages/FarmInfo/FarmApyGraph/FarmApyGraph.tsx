import { useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { VaultsApy } from "@beratrax/core/src/api/stats";
import { Skeleton } from "web/src/components/Skeleton/Skeleton";
import { PoolDef } from "@beratrax/core/src/config/constants/pools_json";
import { useSpecificVaultApy } from "@beratrax/core/src/hooks/useVaults";
import { useFarmApy } from "@beratrax/core/src/state/farms/hooks";

type GraphFilterType = "hour" | "day" | "week" | "month";

const GraphFilter = ({ text, onClick, isSelected }: { text: string; onClick?: () => void; isSelected?: boolean }) => {
	return (
		<button
			onClick={onClick}
			className={` px-5 py-2 font-light rounded-2xl  text-[16px] ${
				isSelected ? "bg-gradientSecondary text-textPrimary" : "bg-bgDark text-textWhite"
			}`}
		>
			{text}
		</button>
	);
};

const formatDate = (timestamp: number, filter: GraphFilterType): string => {
	const date = new Date(timestamp * 1000);
	const hours = date.getHours();
	const minutes = date.getMinutes();
	const day = date.getDate();
	const month = date.getMonth() + 1;

	switch (filter) {
		case "hour":
			return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
		case "day":
			return `${hours.toString().padStart(2, "0")}:00`;
		case "week":
		case "month":
			return `${day}/${month}`;
		default:
			return `${day}/${month}/${date.getFullYear()}`;
	}
};

const FarmApyGraph = ({ farm }: { farm: PoolDef }) => {
	const [graphFilter, setGraphFilter] = useState<GraphFilterType>("week");

	const graphFiltersList: { text: string; type: GraphFilterType }[] = [
		{ text: "1H", type: "hour" },
		{ text: "1D", type: "day" },
		{ text: "1W", type: "week" },
		{ text: "1M", type: "month" },
	];

	const downsampleData = (data: VaultsApy[], filter: GraphFilterType) => {
		if (!data || data.length === 0) return [];

		const filteredData: { date: string; apy: string; timestamp: number }[] = [];

		// Filter and sort entries by timestamp
		const filteredEntries = data.filter((entry) => entry.timestamp && entry.apy && entry.apy > 0).sort((a, b) => a.timestamp - b.timestamp);

		if (filteredEntries.length === 0) return [];

		const now = Date.now() / 1000;
		const firstValidTimestamp = filteredEntries[0].timestamp;
		let filterTimestamp = now;

		switch (filter) {
			case "hour":
				filterTimestamp = now - 60 * 60;
				break;
			case "day":
				filterTimestamp = now - 24 * 60 * 60;
				break;
			case "week":
				const today = new Date();
				today.setHours(0, 0, 0, 0); // midnight today
				filterTimestamp = today.getTime() / 1000 - 6 * 24 * 60 * 60;
				break;
			case "month":
				filterTimestamp = now - 30 * 24 * 60 * 60;
				break;
		}

		// Use the later of filterTimestamp or firstValidTimestamp
		filterTimestamp = Math.max(filterTimestamp, firstValidTimestamp);

		// Generate time slots based on the filter type
		const timeSlots: number[] = [];
		const interval =
			filter === "hour"
				? 5 * 60 // 5 minutes for hour view
				: filter === "day"
					? 60 * 60 // 1 hour for day view
					: filter === "week"
						? 24 * 60 * 60 // 1 day for week view
						: 24 * 60 * 60; // 1 day for month view

		for (let t = filterTimestamp; t <= now; t += interval) {
			timeSlots.push(t);
		}

		// Process entries into appropriate time slots
		timeSlots.forEach((slotTime) => {
			const slotEntries = filteredEntries.filter((entry) => entry.timestamp >= slotTime && entry.timestamp < slotTime + interval);

			if (slotEntries.length > 0) {
				const key = formatDate(slotTime, filter);
				const totalApy = slotEntries.reduce((sum, entry) => sum + (entry.apy || 0), 0);
				const avgApy = totalApy / slotEntries.length;

				if (avgApy > 0) {
					filteredData.push({
						date: key,
						apy: avgApy.toFixed(3),
						timestamp: slotTime,
					});
				}
			}
		});

		return filteredData;
	};

	const { vaultApy, isLoading: isLoadingVaultApy, isFetched: isFetchedVaultApy } = useSpecificVaultApy(farm.id);
	const { apy: farmApys, isLoading: isApyLoading } = useFarmApy(farm);
	// Update the first entry in vaultApy with the current APY from farmApys if available

	const beratraxApy = useMemo(() => downsampleData(vaultApy?.beratraxApy || [], graphFilter), [vaultApy, graphFilter]);
	const underlyingApr = useMemo(() => downsampleData(vaultApy?.underlyingApr || [], graphFilter), [vaultApy, graphFilter]);
	const updatedBeratraxApy = useMemo(() => {
		if (!beratraxApy || beratraxApy.length === 0 || !farmApys || !farmApys.apy) {
			return beratraxApy;
		}

		const result = [...beratraxApy];
		if (result[result.length - 1]) {
			result[result.length - 1] = {
				...result[result.length - 1],
				apy: farm.isAutoCompounded ? farmApys.apy.toFixed(2).toString() : String((farmApys.feeApr + farmApys.rewardsApr).toFixed(2)),
			};
		}

		return result;
	}, [beratraxApy, farmApys]);

	const updatedUnderlyingApr = useMemo(() => {
		if (!underlyingApr || underlyingApr.length === 0 || !farmApys || !farmApys.apy) {
			return underlyingApr;
		}

		const result = [...underlyingApr];
		if (result[result.length - 1]) {
			result[result.length - 1] = {
				...result[result.length - 1],
				apy: String((farmApys.feeApr + farmApys.rewardsApr).toFixed(2)),
			};
		}

		return result;
	}, [underlyingApr, farmApys]);

	const [minApy, maxApy] = useMemo(() => {
		if (!updatedBeratraxApy || updatedBeratraxApy.length === 0) {
			if (!updatedUnderlyingApr || updatedUnderlyingApr.length === 0) return [0, 100];
			const values = updatedUnderlyingApr.map((d) => parseFloat(d.apy));
			return [Math.min(...values), Math.max(...values)];
		}

		const beratraxValues = updatedBeratraxApy.map((d) => parseFloat(d.apy));
		const underlyingValues = updatedUnderlyingApr?.map((d) => parseFloat(d.apy)) || [];
		const allValues = [...beratraxValues, ...underlyingValues];

		return [Math.min(...allValues), Math.max(...allValues)];
	}, [updatedBeratraxApy, updatedUnderlyingApr]);

	return (
		<div className="z-10 relative">
			<div style={{ marginTop: "10px", width: "100%", height: "300px" }}>
				{isLoadingVaultApy ? (
					<Skeleton h={300} w={"100%"} />
				) : (
					<>
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart width={1200} data={updatedBeratraxApy} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
								<defs>
									<linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor={farm.isAutoCompounded ? "#90BB62" : "#8884d8"} stopOpacity={0.2} />
										<stop offset="95%" stopColor={farm.isAutoCompounded ? "#90BB62" : "#8884d8"} stopOpacity={0} />
									</linearGradient>
									<linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor={farm.isAutoCompounded ? "#8884d8" : "#90BB62"} stopOpacity={0.2} />
										<stop offset="95%" stopColor={farm.isAutoCompounded ? "#8884d8" : "#90BB62"} stopOpacity={0} />
									</linearGradient>
								</defs>
								<XAxis dataKey="date" tick={false} axisLine={false} height={0} />
								<YAxis tick={false} axisLine={false} width={0} domain={[minApy * 0.9, maxApy * 1.1]} />
								<Tooltip
									contentStyle={{ background: "#1a1a1a", border: "none" }}
									labelStyle={{ color: "#fff" }}
									formatter={(value: any, name: string) => [`${value}%`, name === "apy" ? "Trax APY" : "Underlying APR"]}
									labelFormatter={(label) => label}
								/>
								{farm.isAutoCompounded && (
									<Area
										type="monotone"
										dataKey="apy"
										name="apy"
										stroke="#90BB62"
										strokeWidth={2}
										fill="url(#colorUv)"
										fillOpacity={1}
										connectNulls
									/>
								)}
								<Area
									type="monotone"
									dataKey="apy"
									name="underlyingApr"
									data={updatedUnderlyingApr}
									stroke={farm.isAutoCompounded ? "#8884d8" : "#90BB62"}
									strokeWidth={2}
									fill="url(#colorPv)"
									fillOpacity={1}
									connectNulls
								/>
							</AreaChart>
						</ResponsiveContainer>
					</>
				)}
			</div>
			<div className="flex justify-around sm:justify-center sm:gap-4">
				{graphFiltersList.map((filter, index) => (
					<GraphFilter
						key={index}
						text={filter.text}
						isSelected={graphFilter === filter.type}
						onClick={() => setGraphFilter(filter.type)}
					/>
				))}
			</div>
			<div className="text-center my-4">
				<p className="text-sm text-textSecondary">Historical {farm.isAutoCompounded ? "Trax APY" : "Underlying APR"} of the vault</p>
			</div>
		</div>
	);
};
export default FarmApyGraph;
