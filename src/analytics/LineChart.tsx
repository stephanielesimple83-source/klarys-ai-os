"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface LineChartSeries {
  key: string;
  label: string;
  color: string;
}

interface LineChartProps<T extends object> {
  data: T[];
  xKey: string;
  series: LineChartSeries[];
  height?: number;
  valueSuffix?: string;
}

export default function LineChart<T extends object>({
  data,
  xKey,
  series,
  height = 320,
  valueSuffix = "",
}: LineChartProps<T>) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
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
            tick={{
              fill: "#94a3b8",
              fontSize: 12,
            }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{
              fill: "#94a3b8",
              fontSize: 12,
            }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) =>
              `${Number(value).toLocaleString(
                "fr-FR",
              )}${valueSuffix}`
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
            formatter={(value) =>
              `${Number(value ?? 0).toLocaleString(
                "fr-FR",
                {
                  maximumFractionDigits: 2,
                },
              )}${valueSuffix}`
            }
          />

          <Legend />

          {series.map((item) => (
            <Line
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.label}
              stroke={item.color}
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 5,
              }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}