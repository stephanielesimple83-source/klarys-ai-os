import {
  Clock3,
  CircleDollarSign,
  PhoneCall,
  Users,
  UserRoundCheck,
} from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import {
  getDialotelDashboard,
  getExperts,
} from "@/services/dialotel.service";

export default async function DialotelDashboard() {
  const dashboard = await getDialotelDashboard();
  const experts = await getExperts();

  const statusStyles = {
    online: "bg-emerald-500/10 text-emerald-400",
    busy: "bg-amber-500/10 text-amber-400",
    offline: "bg-slate-800 text-slate-400",
  };

  const statusLabels = {
    online: "Disponible",
    busy: "En consultation",
    offline: "Hors ligne",
  };

  const kpis = [
    {
      label: "Chiffre d’affaires",
      value: `${dashboard.revenue.toLocaleString("fr-FR")} €`,
      subtitle: "Aujourd’hui",
      icon: CircleDollarSign,
    },
    {
      label: "Consultations",
      value: dashboard.consultations.toString(),
      subtitle: "Privé et Audiotel",
      icon: PhoneCall,
    },
    {
      label: "Experts connectés",
      value: dashboard.connectedExperts.toString(),
      subtitle: "Équipe et synergies",
      icon: Users,
    },
    {
      label: "Appels en attente",
      value: dashboard.waitingCalls.toString(),
      subtitle: "À prendre en charge",
      icon: UserRoundCheck,
    },
    {
      label: "Durée moyenne",
      value: dashboard.averageDuration,
      subtitle: "Par consultation",
      icon: Clock3,
    },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-[1600px] space-y-8">
        <section className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <p className="text-sm font-medium text-cyan-400">
              Module Dialotel
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
              Pilotage des consultations
            </h1>

            <p className="mt-2 max-w-2xl text-slate-400">
              Suivez le chiffre d’affaires, les consultations et la
              disponibilité des experts depuis un seul écran.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            Données simulées actives
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;

            return (
              <article
                key={kpi.label}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">{kpi.label}</p>

                    <p className="mt-3 text-3xl font-bold text-white">
                      {kpi.value}
                    </p>
                  </div>

                  <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <p className="mt-4 text-xs text-slate-500">
                  {kpi.subtitle}
                </p>
              </article>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Experts de l’équipe
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Disponibilité et performance du jour
                </p>
              </div>

              <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400">
                {experts.length} profils affichés
              </span>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[650px] text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
                    <th className="pb-3 font-medium">Expert</th>
                    <th className="pb-3 font-medium">Statut</th>
                    <th className="pb-3 font-medium">Consultations</th>
                    <th className="pb-3 text-right font-medium">CA</th>
                  </tr>
                </thead>

                <tbody>
                  {experts.map((expert) => (
                    <tr
                      key={expert.id}
                      className="border-b border-slate-800/70 last:border-0"
                    >
                      <td className="py-4 font-medium text-white">
                        {expert.name}
                      </td>

                      <td className="py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[expert.status]}`}
                        >
                          {statusLabels[expert.status]}
                        </span>
                      </td>

                      <td className="py-4 text-slate-300">
                        {expert.calls}
                      </td>

                      <td className="py-4 text-right font-semibold text-cyan-400">
                        {expert.revenue.toLocaleString("fr-FR")} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <div className="space-y-6">
            <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold text-white">
                Répartition du jour
              </h2>

              <div className="mt-6 space-y-5">
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Consultations privées</span>
                    <span className="font-medium text-white">62 %</span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full w-[62%] rounded-full bg-cyan-400" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Audiotel</span>
                    <span className="font-medium text-white">38 %</span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full w-[38%] rounded-full bg-violet-400" />
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
              <p className="text-sm font-medium text-amber-400">
                Alerte opérationnelle
              </p>

              <h2 className="mt-2 text-lg font-semibold text-white">
                Deux appels sont actuellement en attente
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Le CEO AI recommandera bientôt les experts à solliciter selon
                leur disponibilité et leurs performances.
              </p>
            </article>
          </div>
        </section>
      </div>
    </AppShell>
  );
}