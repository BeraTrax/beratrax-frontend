import { useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "src/components/Skeleton/Skeleton";
import { TVLHistory } from "src/api/stats";
import { usePlatformTVLHistory } from "src/hooks/usePlatformTVL";

type GraphFilterType = "hour" | "day" | "week" | "month" | "year" | "all";

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

const PlatformTVLGraph = () => {
    const [graphFilter, setGraphFilter] = useState<GraphFilterType>("month");

    const graphFiltersList: { text: string; type: GraphFilterType }[] = [
        { text: "1H", type: "hour" },
        { text: "1D", type: "day" },
        { text: "1W", type: "week" },
        { text: "1M", type: "month" },
        { text: "1Y", type: "year" },
        { text: "ALL", type: "all" },
    ];

    const downsampleData = (data: TVLHistory[], filter: GraphFilterType) => {
        if (!data || data.length === 0) return;

        const filteredData: { date: string; tvl: string }[] = [];
        const tempMap: { [key: string]: { date: string; tvl: number; count: number } } = {};

        // Get current timestamp to filter data based on selected interval
        const now = Date.now() / 1000;
        let filterTimestamp = now;

        switch (filter) {
            case "hour":
                filterTimestamp = now - 60 * 60; // Last hour
                break;
            case "day":
                filterTimestamp = now - 24 * 60 * 60; // Last 24 hours
                break;
            case "week":
                filterTimestamp = now - 7 * 24 * 60 * 60; // Last 7 days
                break;
            case "month":
                filterTimestamp = now - 30 * 24 * 60 * 60; // Last 30 days
                break;
            case "year":
                filterTimestamp = now - 365 * 24 * 60 * 60; // Last year
                break;
            case "all":
                filterTimestamp = 0; // All data
                break;
        }

        const filteredEntries = data.filter((entry) => entry.timestamp >= filterTimestamp);

        filteredEntries.forEach((entry) => {
            const date = new Date(entry.timestamp * 1000);
            if (!entry.tvl) {
                entry.tvl = 0;
            }

            let key: string;

            // Format the key based on the selected filter
            switch (filter) {
                case "hour":
                    key = `${date.getHours()}:${date.getMinutes()}`;
                    break;
                case "day":
                    key = `${date.getHours()}:00`;
                    break;
                case "week":
                    key = `${date.getDate()}/${date.getMonth() + 1}`;
                    break;
                case "month":
                    key = `${date.getDate()}/${date.getMonth() + 1}`;
                    break;
                case "year":
                case "all":
                    key = `${date.getMonth() + 1}/${date.getFullYear()}`;
                    break;
                default:
                    key = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
            }

            if (!tempMap[key]) {
                tempMap[key] = { date: key, tvl: 0, count: 0 };
            }

            tempMap[key].tvl += entry.tvl;
            tempMap[key].count++;
        });

        for (const key in tempMap) {
            const averageTvl = tempMap[key].tvl / tempMap[key].count;
            filteredData.push({ date: key, tvl: averageTvl.toFixed(3) });
        }

        return filteredData;
    };

    const { platformTVLHistory, isLoading } = usePlatformTVLHistory();
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    const newData = useMemo(
        () => (downsampleData(platformTVLHistory || [], graphFilter) || []).reverse(),
        [platformTVLHistory, graphFilter]
    );

    const [minTvl, maxTvl] = useMemo(() => {
        if (!newData || newData.length === 0) return [0, 100];
    
        const values = newData.map(d => parseFloat(d.tvl));
        return [Math.min(...values), Math.max(...values)];
    }, [newData]);
    

    return (
        <div className="z-10 relative bg-bgSecondary rounded-lg p-6 border border-borderDark">
            <h1 className="text-textWhite text-2xl mb-6 font-arame-mono uppercase">Platform TVL</h1>
            <div style={{ marginTop: "10px", width: "100%", height: "200px" }}>
                {isLoading ? (
                    <Skeleton h={200} w={"100%"} />
                ) : (
                    <>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart width={1200} data={newData} margin={{ top: 20, right: 5, left: 5, bottom: 20 }}>
                                <defs>
                                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#90BB62" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#90BB62" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="date"
                                    stroke="#666"
                                    tick={{ fill: "#fff" }}
                                    label={{
                                        value: "Time",
                                        position: "bottom",
                                        fill: "#fff",
                                        offset: 0,
                                    }}
                                />
                                <YAxis
                                    stroke="#666"
                                    tick={{ fill: "#fff" }}
                                    tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                                    tickCount={6}
                                    interval="preserveStartEnd"
                                    domain={[minTvl * 0.9, maxTvl * 1.1]}
                                    label={{
                                        value: "TVL (Millions $)",
                                        angle: -90,
                                        position: "left",
                                        fill: "#fff",
                                        offset: 0,
                                        dy: -50,
                                    }}
                                />
                                <Tooltip
                                    contentStyle={{ background: "#1a1a1a", border: "none" }}
                                    labelStyle={{ color: "#fff" }}
                                    formatter={(value: any) => [`$${(Number(value) / 1000000).toFixed(2)}M`, "TVL"]}
                                />
                                <Line
                                    type="linear"
                                    dataKey="tvl"
                                    stroke="#90BB62"
                                    dot={false}
                                    fillOpacity={1}
                                    fill="url(#colorUv)"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </>
                )}
            </div>
            <div className="flex justify-around sm:justify-center sm:gap-4 mt-2">
                {graphFiltersList.map((filter, index) => (
                    <GraphFilter
                        key={index}
                        text={filter.text}
                        isSelected={graphFilter === filter.type}
                        onClick={() => setGraphFilter(filter.type)}
                    />
                ))}
            </div>
        </div>
    );
};
export default PlatformTVLGraph;
