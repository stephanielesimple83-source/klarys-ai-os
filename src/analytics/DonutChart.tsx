"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface DonutDataItem {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutDataItem[];
  height?: number;
  valueSuffix?: string;
  innerRadius?: number;
  outerRadius?: number;
}

export default function DonutChart({
  data,
  height = 320,
  valueSuffix = "",
  innerRadius = 70,
  outerRadius = 100,
}: DonutChartProps) {
  const total = data.reduce(
    (sum, item) => sum + item.value,
    0,
  );

  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
            stroke="none"
          >
            {data.map((item) => (
              <Cell
                key={item.name}
                fill={item.color}
              />
            ))}
          </Pie>

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
              `${Number(value ?? 0).toLocaleString(
                "fr-FR",
                {
                  maximumFractionDigits: 2,
                },
              )}${valueSuffix}`,
            ]}
          />

          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{
              fontSize: "12px",
              paddingTop: "16px",
            }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Total
          </p>

          <p className="mt-1 text-2xl font-bold text-white">
            {total.toLocaleString("fr-FR", {
              maximumFractionDigits: 2,
            })}
            {valueSuffix}
          </p>
        </div>
      </div>
    </div>
  );
}