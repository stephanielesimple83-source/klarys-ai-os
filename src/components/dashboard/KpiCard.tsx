import type { LucideIcon } from "lucide-react";

type KpiCardProps = {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  trend?: string;
};

export default function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: KpiCardProps) {
  return (
    <article className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg transition duration-200 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-cyan-950/30">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{title}</p>

          <p className="mt-3 text-4xl font-bold text-white">{value}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 transition group-hover:bg-cyan-500 group-hover:text-slate-950">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{subtitle}</p>

        {trend ? (
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            {trend}
          </span>
        ) : null}
      </div>
    </article>
  );
}