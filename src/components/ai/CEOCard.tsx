import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

type CEOCardProps = {
  cabinetRevenue: number;
  cabinetPreviousMonth: number;
  synergyRevenue: number;
  synergyPreviousMonth: number;
  consultations: number;
};

function calculateEvolution(current: number, previous: number): number {
  if (previous <= 0) {
    return 0;
  }

  return ((current - previous) / previous) * 100;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function CEOCard({
  cabinetRevenue,
  cabinetPreviousMonth,
  synergyRevenue,
  synergyPreviousMonth,
  consultations,
}: CEOCardProps) {
  const cabinetEvolution = calculateEvolution(
    cabinetRevenue,
    cabinetPreviousMonth,
  );

  const synergyEvolution = calculateEvolution(
    synergyRevenue,
    synergyPreviousMonth,
  );

  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        70 +
          Math.min(15, consultations / 4) +
          Math.max(-10, Math.min(10, synergyEvolution / 10)) +
          Math.max(-10, Math.min(10, cabinetEvolution / 10)),
      ),
    ),
  );

  const recommendations = [
    "Mettre en avant les consultations privées aujourd’hui.",
    "Préparer un live TikTok pour générer du trafic.",
    "Relancer les experts disponibles pour renforcer les créneaux.",
  ];

  return (
    <section className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 p-6 shadow-2xl shadow-cyan-950/20">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-400">
              <Bot className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm font-medium text-cyan-400">CEO AI</p>
              <h2 className="text-2xl font-bold text-white">
                Analyse de l’activité
              </h2>
            </div>
          </div>

          <p className="mt-5 text-base leading-7 text-slate-300">
            Le chiffre d’affaires Synergie progresse mieux que le Cabinet.
            L’activité reste soutenue avec {consultations} consultations ce
            mois-ci.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-400">CA Cabinet</span>

                {cabinetEvolution >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-rose-400" />
                )}
              </div>

              <p className="mt-3 text-2xl font-bold text-white">
                {formatCurrency(cabinetRevenue)} €
              </p>

              <p
                className={`mt-2 text-sm font-medium ${
                  cabinetEvolution >= 0
                    ? "text-emerald-400"
                    : "text-rose-400"
                }`}
              >
                {cabinetEvolution >= 0 ? "+" : ""}
                {cabinetEvolution.toFixed(2)} % vs mois précédent
              </p>
            </article>

            <article className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-400">CA Synergie</span>

                {synergyEvolution >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-rose-400" />
                )}
              </div>

              <p className="mt-3 text-2xl font-bold text-white">
                {formatCurrency(synergyRevenue)} €
              </p>

              <p
                className={`mt-2 text-sm font-medium ${
                  synergyEvolution >= 0
                    ? "text-emerald-400"
                    : "text-rose-400"
                }`}
              >
                {synergyEvolution >= 0 ? "+" : ""}
                {synergyEvolution.toFixed(2)} % vs mois précédent
              </p>
            </article>
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-white">
              Recommandations prioritaires
            </p>

            <div className="mt-3 space-y-3">
              {recommendations.map((recommendation) => (
                <div
                  key={recommendation}
                  className="flex items-start gap-3 text-sm text-slate-300"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  <span>{recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="w-full rounded-3xl border border-slate-800 bg-slate-950/60 p-6 xl:max-w-xs">
          <p className="text-sm text-slate-400">Business Score</p>

          <p className="mt-3 text-6xl font-bold tracking-tight text-cyan-400">
            {score}
          </p>

          <p className="mt-1 text-sm text-slate-500">sur 100</p>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-cyan-400 transition-all"
              style={{ width: `${score}%` }}
            />
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />

            <p className="text-sm leading-6 text-slate-300">
              Le CA Cabinet reste nettement inférieur au mois précédent.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}