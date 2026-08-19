import { AreaChart } from "@/analytics";
import ChartCard from "@/analytics/ChartCard";
import { chartColors } from "@/config/charts";
import type { AnalyticsHourlyPoint } from "@/services/analytics.service";

interface HourlyChartProps {
  hourly: AnalyticsHourlyPoint[];
}

export default function HourlyChart({
  hourly,
}: HourlyChartProps) {
  if (hourly.length === 0) {
    return (
      <ChartCard
        title="Activité horaire"
        subtitle="Consultations par heure"
      >
        <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/30 p-8">
          <div className="max-w-md text-center">
            <p className="font-medium text-white">
              Analyse horaire en préparation
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Cette zone sera alimentée dès que nous aurons
              connecté la véritable source horaire Dialotel.
            </p>
          </div>
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Activité horaire"
      subtitle="Nombre de consultations selon l’heure"
    >
      <AreaChart
        data={hourly}
        xKey="hour"
        series={[
          {
            key: "consultations",
            label: "Consultations",
            color: chartColors.total,
          },
        ]}
      />
    </ChartCard>
  );
}