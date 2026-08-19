import { LineChart } from "@/analytics";
import ChartCard from "@/analytics/ChartCard";
import { chartSeries } from "@/config/charts";
import type { AnalyticsRevenuePoint } from "@/services/analytics.service";

interface RevenueChartProps {
  history: AnalyticsRevenuePoint[];
}

export default function RevenueChart({
  history,
}: RevenueChartProps) {
  if (history.length === 0) {
    return (
      <ChartCard
        title="Évolution du chiffre d’affaires"
        subtitle="Cabinet, Synergie et Total"
      >
        <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/30 p-8">
          <div className="max-w-md text-center">
            <p className="font-medium text-white">
              Historique en préparation
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Nous n’affichons aucune donnée fictive. La courbe
              apparaîtra lorsque l’historique journalier Dialotel
              sera connecté.
            </p>
          </div>
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Évolution du chiffre d’affaires"
      subtitle="Cabinet, Synergie et Total"
    >
      <LineChart
        data={history}
        xKey="date"
        valueSuffix=" €"
        series={[
          {
            key: "cabinet",
            label: chartSeries.cabinet.label,
            color: chartSeries.cabinet.color,
          },
          {
            key: "synergy",
            label: chartSeries.synergy.label,
            color: chartSeries.synergy.color,
          },
          {
            key: "total",
            label: chartSeries.total.label,
            color: chartSeries.total.color,
          },
        ]}
      />
    </ChartCard>
  );
}