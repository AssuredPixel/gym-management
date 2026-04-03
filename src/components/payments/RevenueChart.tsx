"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RevenueChartProps {
  data: Array<{
    month: string;
    revenue: number;
  }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-xl rounded-lg border border-gray-100">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-black text-primary">
          Revenue: ${((payload[0].value || 0) / 100).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ data }: RevenueChartProps) {
  const [timeframe, setTimeframe] = useState("6M");

  // Filter data based on timeframe
  const filteredData = React.useMemo(() => {
    if (timeframe === "3M") return data.slice(-3);
    if (timeframe === "6M") return data.slice(-6);
    return data; // 1Y
  }, [data, timeframe]);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-black text-gray-900">Monthly Revenue</h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Cash & Online Trends</p>
        </div>
        <div className="flex bg-gray-50 p-1 rounded-xl">
          {["3M", "6M", "1Y"].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${
                timeframe === t
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filteredData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fontWeight: 700, fill: "#999" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 700, fill: "#999" }}
              tickFormatter={(val) => `$${(val / 100).toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#FDF4F1" }} />
            <Bar
              dataKey="revenue"
              fill="#E8541A"
              radius={[6, 6, 0, 0]}
              barSize={40}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
