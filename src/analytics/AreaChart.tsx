"use client";

import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface AreaChartSeries {
  key: string;
  label: string;
  color: string;
}

interface AreaChartProps<T extends object> {
  data: T[];
  xKey: string;
  series: AreaChartSeries[];
  height?: number;
  valueSuffix?: string;
}

export default function AreaChart<T extends object>({
  data,
  xKey,
  series,
  height = 320,
  valueSuffix = "",
}: AreaChartProps<T>) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            {series.map((item) => (
              <linearGradient
                key={item.key}
                id={`gradient-${item.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={item.color}
                  stopOpacity={0.35}
                />

                <stop
                  offset="95%"
                  stopColor={item.color}
                  stopOpacity={0}
                />
              </linearGradient>
            ))}
          </defs>

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
            <Area
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.label}
              stroke={item.color}
              strokeWidth={2.5}
              fill={`url(#gradient-${item.key})`}
              activeDot={{
                r: 5,
              }}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}