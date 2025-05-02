import { useMemo, useState } from "react";
import { Skeleton } from "ui/src/components/Skeleton/Skeleton";
import styles from "./FarmLpGraph.module.css";
import { LP_Prices } from "@beratrax/core/src/api/stats";
import { useLp } from "@beratrax/core/src/hooks";
import { PoolDef } from "@beratrax/core/src/config/constants/pools_json";
import { Pressable, Text, View, Platform, Dimensions } from "react-native";
import { Defs, LinearGradient, Stop } from "react-native-svg";

// Import victory libraries based on platform
import * as Victory from "victory";
import * as VictoryNative from "victory-native";

const { VictoryChart, VictoryLine, VictoryTheme, VictoryAxis, VictoryVoronoiContainer, VictoryArea, VictoryTooltip } =
  Platform.OS === "web" ? Victory : VictoryNative;

type GraphFilterType = "hour" | "day" | "week" | "month";

const GraphFilter = ({ text, onClick, isSelected }: { text: string; onClick?: () => void; isSelected?: boolean }) => {
  return (
    <Pressable onPress={onClick}>
      <Text
        className={` px-5 py-2 font-light rounded-2xl  text-[16px] ${
          isSelected ? "bg-gradientSecondary text-textPrimary" : "bg-bgDark text-textWhite"
        }`}
      >
        {text}
      </Text>
    </Pressable>
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

const FarmLpGraph = ({ farm }: { farm: PoolDef }) => {
  const [graphFilter, setGraphFilter] = useState<GraphFilterType>("day");

  const graphFiltersList: { text: string; type: GraphFilterType }[] = [
    { text: "1H", type: "hour" },
    { text: "1D", type: "day" },
    { text: "1W", type: "week" },
    { text: "1M", type: "month" },
  ];

  const downsampleData = (data: LP_Prices[], filter: GraphFilterType) => {
    if (!data || data.length === 0) return [];

    const filteredData: { date: string; lp: string; timestamp: number }[] = [];

    // Filter and sort entries by timestamp
    const filteredEntries = data
      .filter((entry) => entry.timestamp && typeof entry.lp === "number" && entry.lp > 0)
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

    // Make sure we have data in the selected time range
    const entriesInRange = filteredEntries.filter((entry) => entry.timestamp >= filterTimestamp);
    if (entriesInRange.length === 0) {
      // If no entries in range, take the most recent ones for display
      const recentEntries = filteredEntries.slice(-10); // Take last 10 entries
      if (recentEntries.length > 0) {
        const mostRecent = recentEntries[recentEntries.length - 1];
        filteredData.push({
          date: formatDate(mostRecent.timestamp, filter),
          lp: mostRecent.lp.toFixed(3),
          timestamp: mostRecent.timestamp,
        });
      }
      return filteredData;
    }

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

    // If we don't have any time slots, add at least one
    if (timeSlots.length === 0) {
      timeSlots.push(filterTimestamp);
    }

    // Process entries into appropriate time slots
    timeSlots.forEach((slotTime) => {
      const slotEntries = filteredEntries.filter(
        (entry) => entry.timestamp >= slotTime && entry.timestamp < slotTime + interval,
      );

      if (slotEntries.length > 0) {
        const key = formatDate(slotTime, filter);
        const totalLp = slotEntries.reduce((sum, entry) => sum + (entry.lp || 0), 0);
        const avgLp = totalLp / slotEntries.length;

        if (avgLp > 0) {
          filteredData.push({
            date: key,
            lp: avgLp.toFixed(3),
            timestamp: slotTime,
          });
        }
      }
    });

    return filteredData;
  };

  const { lp, isLpPriceLoading } = useLp(farm.id);

  const newData = useMemo(() => {
    const result = downsampleData(lp || [], graphFilter);
    return result;
  }, [lp, graphFilter]);

  const chartData = useMemo(() => {
    const result = newData.map((d) => ({
      x: d.date,
      y: parseFloat(d.lp), // ensure y is a number
    }));
    return result;
  }, [newData]);

  // Calculate y domain safely handling empty arrays
  const yDomain = useMemo(() => {
    if (chartData.length === 0) {
      return [0, 1] as [number, number]; // Default domain when no data
    }
    const minY = Math.min(...chartData.map((d) => d.y));
    const maxY = Math.max(...chartData.map((d) => d.y));
    // Check if min and max are the same (flat line)
    if (minY === maxY) {
      return [minY * 0.9, minY * 1.1] as [number, number]; // Add some padding
    }
    return [minY * 0.7, maxY * 1.1] as [number, number];
  }, [chartData]);

  const screenWidth = Dimensions.get("window").width;

  if (!screenWidth) return null;

  return (
    <View className="z-10 relative">
      <View style={{ marginTop: 10, width: "100%", height: 300 }}>
        {isLpPriceLoading ? (
          <Skeleton h={300} w={1200} />
        ) : (
          <>
            {chartData.length === 0 ? (
              <View style={{ height: 300, justifyContent: "center", alignItems: "center" }}>
                <Text className="text-textWhite">No data available for this time period</Text>
              </View>
            ) : (
              <VictoryChart
                width={screenWidth}
                height={300}
                theme={VictoryTheme.clean}
                padding={{ top: 40, bottom: 20, left: 0, right: 0 }}
                animate={false}
                domain={{
                  y: yDomain,
                }}
              >
                <Defs>
                  <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="5%" stopColor="#90BB62" stopOpacity="0.3" />
                    <Stop offset="95%" stopColor="#90BB62" stopOpacity="0" />
                  </LinearGradient>
                </Defs>

                <VictoryAxis
                  style={{
                    axis: { stroke: "transparent" },
                    ticks: { stroke: "transparent" },
                    tickLabels: { fill: "transparent" },
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  style={{
                    axis: { stroke: "transparent" },
                    ticks: { stroke: "transparent" },
                    tickLabels: { fill: "transparent" },
                  }}
                />

                <VictoryLine
                  data={chartData}
                  style={{
                    data: {
                      stroke: "#90BB62",
                      strokeWidth: 2,
                    },
                  }}
                />

                <VictoryArea
                  data={chartData}
                  style={{
                    data: {
                      fill: "url(#areaGradient)",
                      strokeWidth: 0,
                    },
                  }}
                />
              </VictoryChart>
            )}
          </>
        )}
      </View>
      <View className="flex flex-row justify-around sm:justify-center sm:gap-4">
        {graphFiltersList.map((filter, index) => (
          <GraphFilter
            key={index}
            text={filter.text}
            isSelected={graphFilter === filter.type}
            onClick={() => setGraphFilter(filter.type)}
          />
        ))}
      </View>
    </View>
  );
};
export default FarmLpGraph;

