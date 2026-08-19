import {
  Building2,
  Network,
  Sigma,
} from "lucide-react";

import Card from "@/components/ui/Card";

interface RevenueOverviewProps {
  cabinetToday: number;
  synergyToday: number;
  cabinetMonth: number;
  synergyMonth: number;
  cabinetPreviousMonth: number;
  synergyPreviousMonth: number;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function calculateChange(
  current: number,
  previous: number,
): number | null {
  if (previous === 0) {
    return null;
  }

  return ((current - previous) / previous) * 100;
}

function Trend({
  value,
}: {
  value: number | null;
}) {
  if (value === null) {
    return (
      <span className="text-xs text-slate-500">
        Comparaison indisponible
      </span>
    );
  }

  const positive = value >= 0;

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        positive
          ? "bg-emerald-500/10 text-emerald-400"
          : "bg-rose-500/10 text-rose-400"
      }`}
    >
      {positive ? "▲" : "▼"}{" "}
      {Math.abs(value).toLocaleString("fr-FR", {
        maximumFractionDigits: 1,
      })}
      %
    </span>
  );
}

export default function RevenueOverview({
  cabinetToday,
  synergyToday,
  cabinetMonth,
  synergyMonth,
  cabinetPreviousMonth,
  synergyPreviousMonth,
}: RevenueOverviewProps) {
  const totalToday =
    cabinetToday + synergyToday;

  const totalMonth =
    cabinetMonth + synergyMonth;

  const cabinetChange = calculateChange(
    cabinetMonth,
    cabinetPreviousMonth,
  );

  const synergyChange = calculateChange(
    synergyMonth,
    synergyPreviousMonth,
  );

  const cabinetShare =
    totalMonth > 0
      ? (cabinetMonth / totalMonth) * 100
      : 0;

  const synergyShare =
    totalMonth > 0
      ? (synergyMonth / totalMonth) * 100
      : 0;

  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-medium text-cyan-400">
          Chiffre d’affaires
        </p>

        <h2 className="mt-1 text-xl font-semibold text-white">
          Cabinet et Synergie
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Les deux activités sont suivies séparément.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-400">
                Cabinet
              </p>

              <p className="mt-3 text-3xl font-bold text-white">
                {formatCurrency(cabinetToday)} €
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Aujourd’hui
              </p>
            </div>

            <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
              <Building2 className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 border-t border-slate-800 pt-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-500">
                  Ce mois-ci
                </p>

                <p className="mt-1 text-lg font-semibold text-white">
                  {formatCurrency(cabinetMonth)} €
                </p>
              </div>

              <Trend value={cabinetChange} />
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Part du CA mensuel :{" "}
              <span className="font-medium text-slate-300">
                {cabinetShare.toLocaleString("fr-FR", {
                  maximumFractionDigits: 1,
                })}
                %
              </span>
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-400">
                Synergie
              </p>

              <p className="mt-3 text-3xl font-bold text-white">
                {formatCurrency(synergyToday)} €
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Aujourd’hui
              </p>
            </div>

            <div className="rounded-xl bg-violet-500/10 p-3 text-violet-400">
              <Network className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 border-t border-slate-800 pt-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-500">
                  Ce mois-ci
                </p>

                <p className="mt-1 text-lg font-semibold text-white">
                  {formatCurrency(synergyMonth)} €
                </p>
              </div>

              <Trend value={synergyChange} />
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Part du CA mensuel :{" "}
              <span className="font-medium text-slate-300">
                {synergyShare.toLocaleString("fr-FR", {
                  maximumFractionDigits: 1,
                })}
                %
              </span>
            </p>
          </div>
        </Card>

        <Card className="border-emerald-500/20 bg-emerald-500/5 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-emerald-400">
                Total
              </p>

              <p className="mt-3 text-3xl font-bold text-white">
                {formatCurrency(totalToday)} €
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Aujourd’hui
              </p>
            </div>

            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
              <Sigma className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 border-t border-emerald-500/10 pt-5">
            <p className="text-xs text-slate-500">
              Total ce mois-ci
            </p>

            <p className="mt-1 text-lg font-semibold text-white">
              {formatCurrency(totalMonth)} €
            </p>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">
                  Cabinet
                </span>

                <span className="text-cyan-400">
                  {formatCurrency(cabinetMonth)} €
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Synergie
                </span>

                <span className="text-violet-400">
                  {formatCurrency(synergyMonth)} €
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}