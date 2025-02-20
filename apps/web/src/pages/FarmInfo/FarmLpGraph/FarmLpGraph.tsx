import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "src/components/Skeleton/Skeleton";
import styles from "./FarmLpGraph.module.css";
import { LP_Prices } from "src/api/stats";
import useApp from "src/hooks/useApp";
import { useLp } from "src/hooks/useLp";
import { PoolDef } from "src/config/constants/pools_json";

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

const FarmLpGraph = ({ farm }: { farm: PoolDef }) => {
    const [graphFilter, setGraphFilter] = useState<GraphFilterType>("day");

    const graphFiltersList: { text: string; type: GraphFilterType }[] = [
        { text: "1H", type: "hour" },
        { text: "1D", type: "day" },
        { text: "1W", type: "week" },
        { text: "1M", type: "month" },
        { text: "1Y", type: "year" },
        { text: "ALL", type: "all" },
    ];

    const downsampleData = (data: LP_Prices[], filter: GraphFilterType) => {
        if (!data || data.length === 0) return;

        const filteredData: { date: string; lp: string }[] = [];
        const tempMap: { [key: string]: { date: string; lp: number; count: number } } = {};

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
            if (!entry.lp) {
                entry.lp = 0;
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
                tempMap[key] = { date: key, lp: entry.lp, count: 0 };
            }

            tempMap[key].lp += entry.lp;
            tempMap[key].count++;
        });

        for (const key in tempMap) {
            const averageLp = tempMap[key].lp / tempMap[key].count;
            filteredData.push({ date: key, lp: averageLp.toFixed(3) });
        }

        return filteredData;
    };

    const { lp, isLpPriceLoading } = useLp(farm.id);
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
    const newData = useMemo(() => downsampleData(lp || [], graphFilter), [lp, graphFilter]);

    return (
        <div className="z-10 relative">
            {/* <h1
                className={`${styles.apy_light} ${lightMode && styles.apy_dark}`}
                style={{ fontSize: "40px", fontWeight: "bold" }}
            >
                LP Price
            </h1>
            <div className={styles.specificApy}>
                <p className={`${styles.apy_light} ${lightMode && styles.apy_dark}`}>
                    <b>Average Price:</b>
                </p>
                {isLpPriceLoading ? (
                    <Skeleton h={20} w={20} />
                ) : (
                    <p className={`${styles.apy_light} ${lightMode && styles.apy_dark}`}>{averageLp.toFixed(2)}</p>
                )}
            </div> */}
            <div style={{ marginTop: "10px", width: "100%", height: "200px" }}>
                {isLpPriceLoading ? (
                    <Skeleton h={200} w={"100%"} />
                ) : (
                    <>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart width={1200} data={newData} margin={{ top: 100, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#90BB62" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#90BB62" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Tooltip
                                    contentStyle={{ background: "#1a1a1a", border: "none" }}
                                    labelStyle={{ color: "#fff" }}
                                    formatter={(value: any) => [`${value} LP`, "Price"]}
                                />
                                {/* <CartesianGrid stroke="#eee" strokeDasharray="5 5" /> */}
                                <Line
                                    type="linear"
                                    dataKey="lp"
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
export default FarmLpGraph;
