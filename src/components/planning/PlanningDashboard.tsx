import {
  AlertTriangle,
  CalendarDays,
  Clock3,
  Users,
} from "lucide-react";

import PlanningHeader from "@/components/planning/PlanningHeader";
import PlanningTimeline from "@/components/planning/PlanningTimeline";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import { getPrivatePlanning } from "@/services/planning.service";

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
  }).format(new Date(`${date}T12:00:00`));
}

function getNextChange(
  experts: Awaited<
    ReturnType<typeof getPrivatePlanning>
  >["experts"],
  date: string,
): {
  time: string;
  label: string;
} | null {
  const now = Date.now();

  const changes = experts
    .flatMap((expert) =>
      expert.slots.flatMap((slot) => [
        {
          time: slot.start,
          label: `${expert.name} commence`,
        },
        {
          time: slot.end,
          label: `${expert.name} termine`,
        },
      ]),
    )
    .filter((change) => {
      if (!change.time.startsWith(date)) {
        return false;
      }

      return (
        new Date(
          change.time.replace(" ", "T"),
        ).getTime() > now
      );
    })
    .sort(
      (a, b) =>
        new Date(
          a.time.replace(" ", "T"),
        ).getTime() -
        new Date(
          b.time.replace(" ", "T"),
        ).getTime(),
    );

  if (changes.length === 0) {
    return null;
  }

  return {
    time: changes[0].time.slice(11, 16),
    label: changes[0].label,
  };
}

export default async function PlanningDashboard() {
  const planning = await getPrivatePlanning();

  const nextChange = getNextChange(
    planning.experts,
    planning.date,
  );

  const averageHoursPerExpert =
    planning.expertsScheduled > 0
      ? planning.totalPlannedHours /
        planning.expertsScheduled
      : 0;

  const currentlyScheduledPercent =
    planning.expertsScheduled > 0
      ? Math.round(
          (planning.currentlyScheduled /
            planning.expertsScheduled) *
            100,
        )
      : 0;

  const lowCoverage =
    planning.expertsScheduled <= 2;

  const longDay =
    planning.totalPlannedHours >= 20;

  return (
    <div className="mx-auto max-w-[1600px] space-y-10">
      <PlanningHeader
        date={formatDate(planning.date)}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Experts planifiés"
          value={planning.expertsScheduled}
          subtitle="Aujourd’hui"
          icon={Users}
        />

        <StatCard
          title="Actuellement en service"
          value={planning.currentlyScheduled}
          subtitle={`${currentlyScheduledPercent} % des experts planifiés`}
          icon={CalendarDays}
        />

        <StatCard
          title="Heures planifiées"
          value={`${planning.totalPlannedHours.toLocaleString(
            "fr-FR",
            {
              maximumFractionDigits: 2,
            },
          )} h`}
          subtitle={`${averageHoursPerExpert.toLocaleString(
            "fr-FR",
            {
              maximumFractionDigits: 2,
            },
          )} h / expert`}
          icon={Clock3}
        />

        <StatCard
          title="Prochain mouvement"
          value={
            nextChange
              ? nextChange.time
              : "—"
          }
          subtitle={
            nextChange
              ? nextChange.label
              : "Aucun changement prévu"
          }
          icon={Clock3}
        />
      </section>

      <Card className="border-cyan-500/20 bg-cyan-500/5 p-6">
        <p className="text-sm font-medium text-cyan-400">
          CEO AI — Analyse planning
        </p>

        <h2 className="mt-2 text-xl font-semibold text-white">
          Couverture de la journée
        </h2>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Couverture actuelle
            </p>

            <p className="mt-2 text-2xl font-bold text-white">
              {currentlyScheduledPercent} %
            </p>

            <p className="mt-1 text-xs text-slate-500">
              experts actuellement planifiés
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Charge moyenne
            </p>

            <p className="mt-2 text-2xl font-bold text-white">
              {averageHoursPerExpert.toLocaleString(
                "fr-FR",
                {
                  maximumFractionDigits: 2,
                },
              )}{" "}
              h
            </p>

            <p className="mt-1 text-xs text-slate-500">
              par expert planifié
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Journée
            </p>

            <p className="mt-2 text-2xl font-bold text-white">
              {planning.totalPlannedHours.toLocaleString(
                "fr-FR",
                {
                  maximumFractionDigits: 2,
                },
              )}{" "}
              h
            </p>

            <p className="mt-1 text-xs text-slate-500">
              de présence cumulée
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {lowCoverage && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />

              <div>
                <p className="font-medium text-amber-400">
                  Couverture faible
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Peu d’experts sont planifiés aujourd’hui. Vérifie si la couverture correspond bien à l’activité attendue.
                </p>
              </div>
            </div>
          )}

          {longDay && (
            <div className="flex items-start gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
              <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />

              <div>
                <p className="font-medium text-cyan-400">
                  Forte couverture cumulée
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Le planning représente plus de 20 heures cumulées de présence aujourd’hui.
                </p>
              </div>
            </div>
          )}

          {!lowCoverage &&
            !longDay && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <p className="font-medium text-emerald-400">
                  Planning équilibré
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Aucun signal particulier n’est détecté sur la couverture actuelle.
                </p>
              </div>
            )}
        </div>
      </Card>

      <section>
        <div className="mb-5">
          <p className="text-sm font-medium text-cyan-400">
            Timeline
          </p>

          <h2 className="mt-1 text-2xl font-semibold text-white">
            Présence des experts
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Visualisation des créneaux réellement récupérés depuis Dialotel.
          </p>
        </div>

        <PlanningTimeline
          experts={planning.experts}
          date={planning.date}
        />
      </section>

      <section>
        <div className="mb-5">
          <p className="text-sm font-medium text-violet-400">
            Experts
          </p>

          <h2 className="mt-1 text-2xl font-semibold text-white">
            Détail du planning
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {planning.experts.map(
            (expert) => (
              <Card
                key={expert.id}
                className="p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-white">
                      {expert.name}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Expert #{expert.id}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      expert.currentlyScheduled
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {expert.currentlyScheduled
                      ? "En service"
                      : "Planifié"}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">
                      Durée
                    </p>

                    <p className="mt-1 font-semibold text-white">
                      {expert.plannedHours.toLocaleString(
                        "fr-FR",
                        {
                          maximumFractionDigits: 2,
                        },
                      )}{" "}
                      h
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Créneaux
                    </p>

                    <p className="mt-1 font-semibold text-white">
                      {expert.slots.length}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-2 border-t border-slate-800 pt-4">
                  {expert.slots.map(
                    (slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-slate-400">
                          {slot.start.slice(
                            11,
                            16,
                          )}
                        </span>

                        <span className="text-slate-600">
                          →
                        </span>

                        <span className="text-slate-300">
                          {slot.end.slice(
                            11,
                            16,
                          )}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </Card>
            ),
          )}
        </div>
      </section>
    </div>
  );
}