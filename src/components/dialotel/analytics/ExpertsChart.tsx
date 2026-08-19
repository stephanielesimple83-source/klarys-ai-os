import { BarChart } from "@/analytics";
import ChartCard from "@/analytics/ChartCard";
import { chartColors } from "@/config/charts";
import type { AnalyticsExpert } from "@/services/analytics.service";

interface ExpertsChartProps {
  experts: AnalyticsExpert[];
}

export default function ExpertsChart({
  experts,
}: ExpertsChartProps) {
  const data = experts
    .filter(
      (expert) =>
        expert.revenue > 0 ||
        expert.calls > 0,
    )
    .slice(0, 10)
    .map((expert) => ({
      name: expert.name,
      revenue: expert.revenue,
      calls: expert.calls,
    }));

  if (data.length === 0) {
    return (
      <ChartCard
        title="Performance des experts"
        subtitle="Classement selon les données Dialotel"
      >
        <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/30 p-8 text-center">
          <p className="text-sm text-slate-500">
            Aucune statistique expert disponible.
          </p>
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Performance des experts"
      subtitle="Top 10 selon le chiffre d’affaires"
    >
      <BarChart
        data={data}
        xKey="name"
        valueSuffix=" €"
        series={[
          {
            key: "revenue",
            label: "Chiffre d’affaires",
            color: chartColors.cabinet,
          },
        ]}
      />
    </ChartCard>
  );
}