import {
  Activity,
  PhoneCall,
  Users,
} from "lucide-react";

import CEODashboardCard from "@/components/ai/CEODashboardCard";
import ExpertsRanking from "@/components/dialotel/ExpertsRanking";
import ExpertsTable from "@/components/dialotel/ExpertsTable";
import LiveActivityCard from "@/components/dialotel/LiveActivityCard";
import RevenueOverview from "@/components/dialotel/RevenueOverview";
import AppShell from "@/components/layout/AppShell";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import Section from "@/components/ui/Section";
import StatCard from "@/components/ui/StatCard";
import { getDialotelStats } from "@/lib/api";
import {
  getExperts,
  getLiveData,
} from "@/services/dialotel.service";

function formatCurrency(value: number): string {
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function calculatePercentageChange(
  current: number,
  previous: number,
): number | null {
  if (previous === 0) {
    return null;
  }

  return ((current - previous) / previous) * 100;
}

function formatPercentage(
  value: number | null,
): string {
  if (value === null) {
    return "—";
  }

  const sign = value >= 0 ? "+" : "";

  return `${sign}${value.toLocaleString("fr-FR", {
    maximumFractionDigits: 1,
  })} %`;
}

export default async function DialotelDashboard() {
  const [stats, experts, live] = await Promise.all([
    getDialotelStats(),
    getExperts(),
    getLiveData(),
  ]);

  const cabinetToday =
    stats.caCabinet.aujourdHui;

  const synergyToday =
    stats.caSynergie.aujourdHui;

  const totalRevenueToday =
    cabinetToday + synergyToday;

  const connectedExperts = experts.filter(
    (expert) =>
      expert.status === "online" ||
      expert.status === "busy",
  ).length;

  const topExpert = [...experts].sort(
    (a, b) => b.revenue - a.revenue,
  )[0];

  const cabinetChange =
    calculatePercentageChange(
      stats.caCabinet.mois,
      stats.caCabinet.moisPrecedent,
    );

  const synergyChange =
    calculatePercentageChange(
      stats.caSynergie.mois,
      stats.caSynergie.moisPrecedent,
    );

  return (
    <AppShell>
      <div className="mx-auto max-w-[1600px] space-y-10">
        <PageHeader
          badge="Module Dialotel"
          title="Pilotage des consultations"
          description="Pilotez séparément le Cabinet et la Synergie, suivez l’activité Live et analysez les performances de vos experts."
          rightContent={
            <Badge variant="success">
              Données Dialotel connectées
            </Badge>
          }
        />

        <CEODashboardCard
          cabinetToday={cabinetToday}
          synergyToday={synergyToday}
          consultations={stats.consultations}
          connectedExperts={connectedExperts}
          expertsTotal={experts.length}
          currentCalls={live.currentCallsCount}
        />

        <RevenueOverview
          cabinetToday={cabinetToday}
          synergyToday={synergyToday}
          cabinetMonth={stats.caCabinet.mois}
          synergyMonth={stats.caSynergie.mois}
          cabinetPreviousMonth={
            stats.caCabinet.moisPrecedent
          }
          synergyPreviousMonth={
            stats.caSynergie.moisPrecedent
          }
        />

        <Section
          title="Vue opérationnelle"
          subtitle="Les indicateurs essentiels pour suivre l’activité en cours."
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="CA total aujourd’hui"
              value={`${formatCurrency(
                totalRevenueToday,
              )} €`}
              subtitle="Cabinet + Synergie"
              icon={Activity}
            />

            <StatCard
              title="Consultations"
              value={stats.consultations}
              subtitle="Ce mois-ci"
              icon={PhoneCall}
            />

            <StatCard
              title="Experts disponibles"
              value={connectedExperts}
              subtitle={`${experts.length} experts actifs`}
              icon={Users}
            />

            <StatCard
              title="Consultations Live"
              value={live.currentCallsCount}
              subtitle={
                live.currentCallsCount > 0
                  ? "En cours actuellement"
                  : "Aucune en cours"
              }
              icon={PhoneCall}
            />
          </div>
        </Section>

        <Section
          title="Activité Live"
          subtitle="Consultations en cours, dernières consultations et appels manqués."
        >
          <LiveActivityCard live={live} />
        </Section>

        <Section
          title="Performance des experts"
          subtitle="Disponibilité, consultations et chiffre d’affaires des experts."
        >
          <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <ExpertsTable experts={experts} />

            <div className="space-y-6">
              <ExpertsRanking experts={experts} />

              <Card className="p-6">
                <div>
                  <p className="text-sm font-medium text-slate-400">
                    Comparatif du mois
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-white">
                    Cabinet vs Synergie
                  </h2>
                </div>

                <div className="mt-6 space-y-6">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-cyan-400">
                          Cabinet
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Chiffre d’affaires Cabinet uniquement
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-white">
                          {formatCurrency(
                            stats.caCabinet.mois,
                          )}{" "}
                          €
                        </p>

                        <p
                          className={`mt-1 text-xs font-medium ${
                            cabinetChange !== null &&
                            cabinetChange >= 0
                              ? "text-emerald-400"
                              : "text-rose-400"
                          }`}
                        >
                          {formatPercentage(
                            cabinetChange,
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between gap-4 text-xs">
                      <span className="text-slate-500">
                        Mois précédent
                      </span>

                      <span className="text-slate-300">
                        {formatCurrency(
                          stats.caCabinet.moisPrecedent,
                        )}{" "}
                        €
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-violet-400">
                          Synergie
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Chiffre d’affaires Synergie uniquement
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-white">
                          {formatCurrency(
                            stats.caSynergie.mois,
                          )}{" "}
                          €
                        </p>

                        <p
                          className={`mt-1 text-xs font-medium ${
                            synergyChange !== null &&
                            synergyChange >= 0
                              ? "text-emerald-400"
                              : "text-rose-400"
                          }`}
                        >
                          {formatPercentage(
                            synergyChange,
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between gap-4 text-xs">
                      <span className="text-slate-500">
                        Mois précédent
                      </span>

                      <span className="text-slate-300">
                        {formatCurrency(
                          stats.caSynergie.moisPrecedent,
                        )}{" "}
                        €
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="border-cyan-500/20 bg-cyan-500/5 p-6">
                <p className="text-sm font-medium text-cyan-400">
                  Meilleure performance
                </p>

                <h2 className="mt-3 text-lg font-semibold text-white">
                  {topExpert
                    ? `Top expert : ${topExpert.name}`
                    : "Classement en attente"}
                </h2>

                {topExpert ? (
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {topExpert.name} totalise{" "}
                    <span className="font-semibold text-white">
                      {topExpert.calls} appel
                      {topExpert.calls > 1 ? "s" : ""}
                    </span>{" "}
                    pour un chiffre d’affaires de{" "}
                    <span className="font-semibold text-cyan-400">
                      {formatCurrency(
                        topExpert.revenue,
                      )}{" "}
                      €
                    </span>
                    .
                  </p>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Aucune donnée expert disponible.
                  </p>
                )}
              </Card>

              <Card className="border-violet-500/20 bg-violet-500/5 p-6">
                <p className="text-sm font-medium text-violet-400">
                  Règle de pilotage
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Le Cabinet et la Synergie sont analysés
                  séparément. Le total général sert uniquement
                  à donner une vue synthétique de l’activité.
                </p>
              </Card>
            </div>
          </div>
        </Section>
      </div>
    </AppShell>
  );
}