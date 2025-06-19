import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { getDashboardChart } from "../services/dashboardService";
import { getAllScripts } from "../services/scriptService";
import { message, Select } from "antd";

type DataPoint = {
  date: string;
  close: number;
};

const DashboardChart: React.FC = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [selectedStock, setSelectedStock] = useState("NTPC.NS");
  const [scripts, setScripts] = useState<{ value: string; label: string }[]>(
    []
  );
  const fetchDropdownData = async () => {
    try {
      const [scriptsResponse] = await Promise.all([
        getAllScripts({ pageNumber: 1, pageSize: 4000 }),
      ]);

      console.log("scriptsResponse", scriptsResponse);
      const scriptOptions = scriptsResponse.data.map((script: any) => {
        let yahooSymbol = script.name;

        if (script.type === "NSE") yahooSymbol += ".NS";
        else if (script.type === "BSE") yahooSymbol += ".BO";
        // Add more exchange types if needed

        return {
          value: script.symbol, // Yahoo-compatible symbol
          label: `${script.name} (${script.type})`,
        };
      });
      setScripts(scriptOptions);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      message.error("Failed to load dropdown data");
    }
  };
  useEffect(() => {
    fetchDropdownData();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getDashboardChart(selectedStock);
        // console.log("chart data", response);
        setData(response);
      } catch (err) {
        console.error("Error fetching stock data", err);
      }
    };
    if (selectedStock) fetchData();
  }, [selectedStock]);

  // Calculate YAxis ticks with interval of 5
  const calculateTicks = () => {
    if (data.length === 0) return [];

    const closeValues = data.map((item) => item.close);
    const minClose = Math.min(...closeValues);
    const maxClose = Math.max(...closeValues);

    const minTick = Math.floor(minClose / 5) * 5;
    const maxTick = Math.ceil(maxClose / 5) * 5;

    const ticks = [];
    for (let i = minTick; i <= maxTick; i += 5) {
      ticks.push(i);
    }

    return ticks;
  };
const handleScriptFilterChange = (value: string | null) => {
    if (value) setSelectedStock(value);
  };
  return (
    <div className=" shadow rounded-xl p-5 h-[400px]" style={{background:"#E6F4EA"}}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          {selectedStock} – Market Activity Overview
        </h2>
        <div className="flex gap-4">
           <Select
          allowClear
          showSearch
          placeholder="Select a stock"
          style={{ width: 300 }}
          value={selectedStock}
          onChange={handleScriptFilterChange}
          options={scripts}
          optionFilterProp="label"
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
        />
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(date: string) =>
              new Date(date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            }
          />
          <YAxis
            yAxisId="right"
            orientation="left"
            domain={["dataMin - 5", "dataMax + 5"]}
            ticks={calculateTicks()}
            tickFormatter={(value) => value.toFixed(2)}
            label={{
              value: "Closing Price",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip
            formatter={(value, name) => {
              if (name === "close") {
                return [(value as number).toFixed(2), "Closing Price"];
              }
              return [value, name];
            }}
          />
          <Legend />
           <Bar
      yAxisId="right"
      dataKey="close"
      fill="#00695C"
      barSize={20}
      radius={[4, 4, 0, 0]}
    />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DashboardChart;
