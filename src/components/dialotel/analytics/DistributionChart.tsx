import { DonutChart } from "@/analytics";
import ChartCard from "@/analytics/ChartCard";
import { chartColors } from "@/config/charts";

interface DistributionChartProps {
  cabinetRevenue: number;
  synergyRevenue: number;
  cabinetPercent: number;
  synergyPercent: number;
}

export default function DistributionChart({
  cabinetRevenue,
  synergyRevenue,
  cabinetPercent,
  synergyPercent,
}: DistributionChartProps) {
  return (
    <ChartCard
      title="Répartition du CA"
      subtitle="Cabinet et Synergie — ce mois-ci"
      footer={
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">
              Cabinet
            </p>

            <p className="mt-1 font-semibold text-cyan-400">
              {cabinetPercent.toLocaleString("fr-FR", {
                maximumFractionDigits: 1,
              })}
              %
            </p>
          </div>

          <div className="text-right">
            <p className="text-slate-500">
              Synergie
            </p>

            <p className="mt-1 font-semibold text-violet-400">
              {synergyPercent.toLocaleString("fr-FR", {
                maximumFractionDigits: 1,
              })}
              %
            </p>
          </div>
        </div>
      }
    >
      <DonutChart
        valueSuffix=" €"
        data={[
          {
            name: "Cabinet",
            value: cabinetRevenue,
            color: chartColors.cabinet,
          },
          {
            name: "Synergie",
            value: synergyRevenue,
            color: chartColors.synergy,
          },
        ]}
      />
    </ChartCard>
  );
}