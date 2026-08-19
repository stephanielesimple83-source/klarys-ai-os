"use client";

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface BarChartSeries {
  key: string;
  label: string;
  color: string;
}

interface BarChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  series: BarChartSeries[];
  height?: number;
  valueSuffix?: string;
}

export default function BarChart({
  data,
  xKey,
  series,
  height = 320,
  valueSuffix = "",
}: BarChartProps) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1e293b"
            vertical={false}
          />

          <XAxis
            dataKey={xKey}
            stroke="#64748b"
            tick={{
              fill: "#94a3b8",
              fontSize: 12,
            }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            stroke="#64748b"
            tick={{
              fill: "#94a3b8",
              fontSize: 12,
            }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) =>
              `${Number(value).toLocaleString("fr-FR")}${valueSuffix}`
            }
          />

          <Tooltip
            contentStyle={{
              background: "#0f172a",
              border: "1px solid #334155",
              borderRadius: "12px",
            }}
            labelStyle={{
              color: "#f8fafc",
            }}
            itemStyle={{
              color: "#cbd5e1",
            }}
            formatter={(value) => [
              `${Number(value ?? 0).toLocaleString("fr-FR", {
                maximumFractionDigits: 2,
              })}${valueSuffix}`,
            ]}
          />

          <Legend
            wrapperStyle={{
              fontSize: "12px",
              paddingTop: "16px",
            }}
          />

          {series.map((item) => (
            <Bar
              key={item.key}
              dataKey={item.key}
              name={item.label}
              fill={item.color}
              radius={[6, 6, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}