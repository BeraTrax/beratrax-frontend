import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "src/components/Skeleton/Skeleton";
import { TVLHistory } from "src/api/stats";
import { useSpecificVaultTvl } from "src/hooks/useVaults";
import { PoolDef } from "src/config/constants/pools_json";

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

const FarmTvlGraph = ({ farm }: { farm: PoolDef }) => {
    const [graphFilter, setGraphFilter] = useState<GraphFilterType>("day");

    const graphFiltersList: { text: string; type: GraphFilterType }[] = [
        { text: "1H", type: "hour" },
        { text: "1D", type: "day" },
        { text: "1W", type: "week" },
        { text: "1M", type: "month" },
    ];

    const downsampleData = (data: TVLHistory[], filter: GraphFilterType) => {
        if (!data || data.length === 0) return [];

        const filteredData: { date: string; tvl: string; timestamp: number }[] = [];

        // Filter and sort entries by timestamp
        const filteredEntries = data
            .filter((entry) => entry.timestamp && entry.tvl && entry.tvl > 0)
            .sort((a, b) => a.timestamp - b.timestamp);

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
                filterTimestamp = now - 7 * 24 * 60 * 60;
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
            const slotEntries = filteredEntries.filter(
                (entry) => entry.timestamp >= slotTime && entry.timestamp < slotTime + interval
            );

            if (slotEntries.length > 0) {
                const key = formatDate(slotTime, filter);
                const totalTvl = slotEntries.reduce((sum, entry) => sum + (entry.tvl || 0), 0);
                const avgTvl = totalTvl / slotEntries.length;

                if (avgTvl > 0) {
                    filteredData.push({
                        date: key,
                        tvl: avgTvl.toFixed(3),
                        timestamp: slotTime,
                    });
                }
            }
        });

        return filteredData;
    };

    const { vaultTvl, isLoading: isLoadingVaultTvl, isFetched: isFetchedVaultTvl } = useSpecificVaultTvl(farm.id);
    const newData = useMemo(() => downsampleData(vaultTvl || [], graphFilter), [vaultTvl, graphFilter]);
    return (
        <div className="z-10 relative">
            <div style={{ marginTop: "10px", width: "100%", height: "300px" }}>
                {isLoadingVaultTvl ? (
                    <Skeleton h={300} w={"100%"} />
                ) : (
                    <>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart width={1200} data={newData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                                <defs>
                                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#90BB62" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#90BB62" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" tick={false} axisLine={false} height={0} />
                                <YAxis tick={false} axisLine={false} width={0} />
                                <Tooltip
                                    contentStyle={{ background: "#1a1a1a", border: "none" }}
                                    labelStyle={{ color: "#fff" }}
                                    formatter={(value: any) => [`$${value}`, "Price"]}
                                    labelFormatter={(label) => label}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="tvl"
                                    stroke="#90BB62"
                                    strokeWidth={2}
                                    fill="url(#colorUv)"
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
                <p className="text-sm text-textSecondary">Historical Total Value Locked in the vault</p>
            </div>
        </div>
    );
};
export default FarmTvlGraph;
