import {
  AlertTriangle,
  Building2,
  CircleCheck,
  Network,
  PhoneCall,
  Users,
} from "lucide-react";

import Card from "@/components/ui/Card";

interface CEODashboardCardProps {
  cabinetToday: number;
  synergyToday: number;
  consultations: number;
  connectedExperts: number;
  expertsTotal: number;
  currentCalls: number;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function CEODashboardCard({
  cabinetToday,
  synergyToday,
  consultations,
  connectedExperts,
  expertsTotal,
  currentCalls,
}: CEODashboardCardProps) {
  const totalToday = cabinetToday + synergyToday;

  const cabinetShare =
    totalToday > 0
      ? (cabinetToday / totalToday) * 100
      : 0;

  const synergyShare =
    totalToday > 0
      ? (synergyToday / totalToday) * 100
      : 0;

  const businessScore = Math.min(
    100,
    Math.round(
      45 +
        Math.min(25, connectedExperts * 3) +
        Math.min(20, consultations / 3) +
        Math.min(10, currentCalls * 5),
    ),
  );

  let recommendation =
    "L'activité est équilibrée entre le Cabinet et la Synergie.";

  if (cabinetShare < 25 && totalToday > 0) {
    recommendation =
      "Le Cabinet représente une faible part du chiffre d’affaires aujourd’hui. Il peut être utile de renforcer les consultations Cabinet.";
  } else if (synergyShare < 25 && totalToday > 0) {
    recommendation =
      "La Synergie représente une faible part du chiffre d’affaires aujourd’hui. Vérifie les disponibilités et l’activité des experts partenaires.";
  } else if (connectedExperts <= 2) {
    recommendation =
      "Peu d’experts sont actuellement disponibles. Surveille la couverture du planning et les prochains créneaux.";
  }

  return (
    <Card className="overflow-hidden border-cyan-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30">
      <div className="p-7">
        <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-start">
          <div>
            <p className="text-sm font-medium text-cyan-400">
              CEO AI
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              Centre de pilotage
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Analyse immédiate du Cabinet, de la Synergie et de
              l’activité opérationnelle.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4">
            <p className="text-xs uppercase tracking-wide text-emerald-400">
              Business Score
            </p>

            <div className="mt-2 flex items-end gap-2">
              <span className="text-4xl font-bold text-white">
                {businessScore}
              </span>

              <span className="pb-1 text-sm text-slate-500">
                / 100
              </span>
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
            <div className="flex items-center gap-2 text-cyan-400">
              <Building2 className="h-4 w-4" />

              <span className="text-sm font-medium">
                Cabinet
              </span>
            </div>

            <p className="mt-3 text-2xl font-bold text-white">
              {formatCurrency(cabinetToday)} €
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {cabinetShare.toLocaleString("fr-FR", {
                maximumFractionDigits: 1,
              })}
              % du CA du jour
            </p>
          </div>

          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4">
            <div className="flex items-center gap-2 text-violet-400">
              <Network className="h-4 w-4" />

              <span className="text-sm font-medium">
                Synergie
              </span>
            </div>

            <p className="mt-3 text-2xl font-bold text-white">
              {formatCurrency(synergyToday)} €
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {synergyShare.toLocaleString("fr-FR", {
                maximumFractionDigits: 1,
              })}
              % du CA du jour
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
            <div className="flex items-center gap-2 text-slate-300">
              <Users className="h-4 w-4" />

              <span className="text-sm font-medium">
                Experts
              </span>
            </div>

            <p className="mt-3 text-2xl font-bold text-white">
              {connectedExperts}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              sur {expertsTotal} actifs
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
            <div className="flex items-center gap-2 text-slate-300">
              <PhoneCall className="h-4 w-4" />

              <span className="text-sm font-medium">
                Consultations
              </span>
            </div>

            <p className="mt-3 text-2xl font-bold text-white">
              {consultations}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              ce mois-ci
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
            <div className="flex items-center gap-2 text-slate-300">
              <CircleCheck className="h-4 w-4" />

              <span className="text-sm font-medium">
                Live
              </span>
            </div>

            <p className="mt-3 text-2xl font-bold text-white">
              {currentCalls}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              consultation
              {currentCalls > 1 ? "s" : ""} en cours
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-amber-500/10 p-2 text-amber-400">
              <AlertTriangle className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-semibold text-amber-400">
                Recommandation CEO AI
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                {recommendation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}