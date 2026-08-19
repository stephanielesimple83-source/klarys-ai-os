import type { LucideIcon } from "lucide-react";

import Card from "@/components/ui/Card";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: string;
  trendType?: "positive" | "negative" | "neutral";
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = "neutral",
}: StatCardProps) {
  const trendStyles = {
    positive: "text-emerald-400 bg-emerald-500/10",
    negative: "text-rose-400 bg-rose-500/10",
    neutral: "text-slate-400 bg-slate-800",
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-slate-400">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-white">
            {value}
          </p>
        </div>

        {Icon && (
          <div className="shrink-0 rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {trend && (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${trendStyles[trendType]}`}
          >
            {trend}
          </span>
        )}

        {subtitle && (
          <p className="text-xs text-slate-500">
            {subtitle}
          </p>
        )}
      </div>
    </Card>
  );
}