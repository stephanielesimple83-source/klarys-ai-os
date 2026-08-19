import { Crown, Medal, Trophy } from "lucide-react";

import type { Expert } from "@/types/dialotel";

interface ExpertsRankingProps {
  experts: Expert[];
}

function formatCurrency(value: number): string {
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function ExpertsRanking({
  experts,
}: ExpertsRankingProps) {
  const ranking = [...experts]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const icons = [
    <Crown key="first" className="h-5 w-5 text-amber-400" />,
    <Medal key="second" className="h-5 w-5 text-slate-300" />,
    <Medal key="third" className="h-5 w-5 text-orange-400" />,
  ];

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-amber-500/10 p-3 text-amber-400">
          <Trophy className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm font-medium text-amber-400">
            Classement
          </p>

          <h2 className="text-xl font-semibold text-white">
            Top experts
          </h2>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {ranking.map((expert, index) => (
          <article
            key={expert.id}
            className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/40 p-4"
          >
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800">
                {icons[index] ?? (
                  <span className="text-sm font-bold text-slate-400">
                    {index + 1}
                  </span>
                )}
              </div>

              {expert.avatar ? (
                <img
                  src={expert.avatar}
                  alt={expert.name}
                  className="h-11 w-11 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="h-11 w-11 shrink-0 rounded-full bg-slate-800" />
              )}

              <div className="min-w-0">
                <p className="truncate font-semibold text-white">
                  {expert.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {expert.calls} appel
                  {expert.calls > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-bold text-cyan-400">
                {formatCurrency(expert.revenue)} €
              </p>

              <p className="mt-1 text-xs text-slate-500">
                CA
              </p>
            </div>
          </article>
        ))}

        {ranking.length === 0 && (
          <p className="text-sm text-slate-500">
            Aucune donnée disponible.
          </p>
        )}
      </div>
    </section>
  );
}