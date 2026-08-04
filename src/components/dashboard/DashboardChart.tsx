"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { day: "Lun", revenue: 180 },
  { day: "Mar", revenue: 240 },
  { day: "Mer", revenue: 205 },
  { day: "Jeu", revenue: 310 },
  { day: "Ven", revenue: 286 },
  { day: "Sam", revenue: 390 },
  { day: "Dim", revenue: 420 },
];

export default function DashboardChart() {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">
          Évolution du chiffre d’affaires
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Performance sur les 7 derniers jours
        </p>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="4 4" />

            <XAxis
              dataKey="day"
              stroke="#64748b"
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              stroke="#64748b"
              tickLine={false}
              axisLine={false}
              width={40}
            />

            <Tooltip
              contentStyle={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "12px",
              }}
              labelStyle={{ color: "#f8fafc" }}
              itemStyle={{ color: "#22d3ee" }}
              formatter={(value) => [`${value} €`, "CA"]}
            />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#22d3ee"
              strokeWidth={3}
              dot={{ fill: "#22d3ee", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}