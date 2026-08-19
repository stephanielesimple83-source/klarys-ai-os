"use client";

import {
  AlertTriangle,
  ArrowDown,
  CheckCircle2,
  Crown,
  ExternalLink,
  RefreshCcw,
  Sparkles,
  Target,
  UserRoundCheck,
  UserRoundX,
  Users,
  WalletCards,
} from "lucide-react";

import Link from "next/link";
import { useMemo } from "react";

import CrmPriorityActions from "@/components/dialotel/clients/CrmPriorityActions";

import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";

import type {
  DialotelClient,
} from "@/services/clients.service";

interface CrmIntelligenceDashboardProps {
  clients: DialotelClient[];
  totalClients: number;
  crmCalculatedClients: number;
  crmRemainingClients: number;
  crmAnalysisRunning: boolean;
}

function formatCurrency(
  value: number,
): string {
  return value.toLocaleString(
    "fr-FR",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  );
}

function formatPercent(
  value: number,
): string {
  return value.toLocaleString(
    "fr-FR",
    {
      maximumFractionDigits: 1,
    },
  );
}

function parseFrenchDate(
  value: string | null,
): number {
  if (!value) {
    return 0;
  }

  const match =
    value.match(
      /^(\d{2})\/(\d{2})\/(\d{4})$/,
    );

  if (!match) {
    return 0;
  }

  const [
    ,
    day,
    month,
    year,
  ] = match;

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
  ).getTime();
}

function getDaysSince(
  value: string | null,
): number | null {
  const timestamp =
    parseFrenchDate(
      value,
    );

  if (!timestamp) {
    return null;
  }

  const difference =
    Date.now() -
    timestamp;

  return Math.max(
    0,
    Math.floor(
      difference /
        (
          1000 *
          60 *
          60 *
          24
        ),
    ),
  );
}

function getSegmentClasses(
  segment:
    | string
    | null,
): string {
  switch (segment) {
    case "VIP":
      return "border-amber-400/30 bg-amber-400/10 text-amber-300";

    case "PREMIUM":
      return "border-violet-400/30 bg-violet-400/10 text-violet-300";

    case "REGULIER":
      return "border-cyan-400/30 bg-cyan-400/10 text-cyan-300";

    case "OCCASIONNEL":
      return "border-slate-600 bg-slate-800 text-slate-300";

    case "INACTIF":
      return "border-rose-500/30 bg-rose-500/10 text-rose-300";

    default:
      return "border-slate-700 bg-slate-800 text-slate-400";
  }
}

function getSegmentLabel(
  segment:
    | string
    | null,
): string {
  switch (segment) {
    case "VIP":
      return "VIP";

    case "PREMIUM":
      return "Premium";

    case "REGULIER":
      return "Régulier";

    case "OCCASIONNEL":
      return "Occasionnel";

    case "INACTIF":
      return "Inactif";

    default:
      return "Non calculé";
  }
}

export default function CrmIntelligenceDashboard({
  clients,
  totalClients,
  crmCalculatedClients,
  crmRemainingClients,
  crmAnalysisRunning,
}: CrmIntelligenceDashboardProps) {
  const analyzedClients =
    useMemo(
      () =>
        clients.filter(
          (client) =>
            client.crmCalculated,
        ),
      [
        clients,
      ],
    );

  /*
   * =========================================
   * CLIENTS ACTIFS
   * =========================================
   */

  const activeClients =
    useMemo(
      () =>
        analyzedClients.filter(
          (client) => {
            const totalSpent =
              Number(
                client.totalSpent,
              );

            const consultationsCount =
              Number(
                client.consultationsCount,
              );

            const hasValidSpent =
              Number.isFinite(
                totalSpent,
              );

            const hasValidConsultations =
              Number.isFinite(
                consultationsCount,
              );

            if (
              !hasValidSpent ||
              !hasValidConsultations
            ) {
              return false;
            }

            return (
              totalSpent > 0 ||
              consultationsCount > 0
            );
          },
        ),
      [
        analyzedClients,
      ],
    );

  /*
   * =========================================
   * COMPTES SANS ACTIVITÉ
   * =========================================
   */

  const noActivityClients =
    useMemo(
      () =>
        analyzedClients.filter(
          (client) => {
            const totalSpent =
              Number(
                client.totalSpent,
              );

            const consultationsCount =
              Number(
                client.consultationsCount,
              );

            const hasValidSpent =
              Number.isFinite(
                totalSpent,
              );

            const hasValidConsultations =
              Number.isFinite(
                consultationsCount,
              );

            if (
              !hasValidSpent ||
              !hasValidConsultations
            ) {
              return false;
            }

            return (
              totalSpent <= 0 &&
              consultationsCount <= 0
            );
          },
        ),
      [
        analyzedClients,
      ],
    );

  /*
   * =========================================
   * DONNÉES INCOMPLÈTES
   * =========================================
   */

  const incompleteClients =
    useMemo(
      () =>
        analyzedClients.filter(
          (client) => {
            const totalSpent =
              Number(
                client.totalSpent,
              );

            const consultationsCount =
              Number(
                client.consultationsCount,
              );

            return (
              !Number.isFinite(
                totalSpent,
              ) ||
              !Number.isFinite(
                consultationsCount,
              )
            );
          },
        ),
      [
        analyzedClients,
      ],
    );

  const vipClients =
    useMemo(
      () =>
        analyzedClients
          .filter(
            (client) =>
              client.crmSegment ===
              "VIP",
          )
          .sort(
            (a, b) =>
              b.totalSpent -
              a.totalSpent,
          ),
      [
        analyzedClients,
      ],
    );

  const premiumClients =
    useMemo(
      () =>
        analyzedClients
          .filter(
            (client) =>
              client.crmSegment ===
              "PREMIUM",
          )
          .sort(
            (a, b) =>
              b.totalSpent -
              a.totalSpent,
          ),
      [
        analyzedClients,
      ],
    );

  const regularClients =
    useMemo(
      () =>
        analyzedClients.filter(
          (client) =>
            client.crmSegment ===
            "REGULIER",
        ),
      [
        analyzedClients,
      ],
    );

  const occasionalClients =
    useMemo(
      () =>
        analyzedClients.filter(
          (client) =>
            client.crmSegment ===
            "OCCASIONNEL",
        ),
      [
        analyzedClients,
      ],
    );

  const inactiveClients =
    useMemo(
      () =>
        analyzedClients.filter(
          (client) =>
            client.crmSegment ===
            "INACTIF",
        ),
      [
        analyzedClients,
      ],
    );

  const clientsToReactivate =
    useMemo(
      () =>
        activeClients
          .filter(
            (client) => {
              const days =
                getDaysSince(
                  client.lastConsultationDate,
                );

              if (
                days === null
              ) {
                return false;
              }

              return (
                days >= 90 &&
                client.totalSpent > 0
              );
            },
          )
          .sort(
            (a, b) =>
              b.totalSpent -
              a.totalSpent,
          ),
      [
        activeClients,
      ],
    );

  const highValueAtRisk =
    useMemo(
      () =>
        activeClients
          .filter(
            (client) => {
              const days =
                getDaysSince(
                  client.lastConsultationDate,
                );

              if (
                days === null
              ) {
                return false;
              }

              return (
                days >= 90 &&
                client.totalSpent >=
                  1000
              );
            },
          )
          .sort(
            (a, b) =>
              b.totalSpent -
              a.totalSpent,
          ),
      [
        activeClients,
      ],
    );

  const notCalculatedClients =
    useMemo(
      () =>
        clients.filter(
          (client) =>
            !client.crmCalculated,
        ),
      [
        clients,
      ],
    );

  const topClients =
    useMemo(
      () =>
        [
          ...activeClients,
        ]
          .sort(
            (a, b) =>
              b.totalSpent -
              a.totalSpent,
          )
          .slice(
            0,
            10,
          ),
      [
        activeClients,
      ],
    );

  const totalAnalyzedRevenue =
    activeClients.reduce(
      (
        total,
        client,
      ) =>
        total +
        client.totalSpent,
      0,
    );

  const vipRevenue =
    vipClients.reduce(
      (
        total,
        client,
      ) =>
        total +
        client.totalSpent,
      0,
    );

  const premiumRevenue =
    premiumClients.reduce(
      (
        total,
        client,
      ) =>
        total +
        client.totalSpent,
      0,
    );

  const strategicRevenue =
    vipRevenue +
    premiumRevenue;

  const strategicRevenuePercent =
    totalAnalyzedRevenue >
    0
      ? (
          strategicRevenue /
          totalAnalyzedRevenue
        ) *
        100
      : 0;

  const reactivationRevenue =
    clientsToReactivate.reduce(
      (
        total,
        client,
      ) =>
        total +
        client.totalSpent,
      0,
    );

  /*
   * =========================================
   * SCORES
   * =========================================
   */

  const averageGlobalCrmScore =
    analyzedClients.length >
    0
      ? Math.round(
          analyzedClients.reduce(
            (
              total,
              client,
            ) =>
              total +
              (
                client.crmScore ??
                0
              ),
            0,
          ) /
            analyzedClients.length,
        )
      : 0;

  const averageActiveCrmScore =
    activeClients.length >
    0
      ? Math.round(
          activeClients.reduce(
            (
              total,
              client,
            ) =>
              total +
              (
                client.crmScore ??
                0
              ),
            0,
          ) /
            activeClients.length,
        )
      : 0;

  const activeClientsPercent =
    analyzedClients.length >
    0
      ? (
          activeClients.length /
          analyzedClients.length
        ) *
        100
      : 0;

  const noActivityClientsPercent =
    analyzedClients.length >
    0
      ? (
          noActivityClients.length /
          analyzedClients.length
        ) *
        100
      : 0;

  const incompleteClientsPercent =
    analyzedClients.length >
    0
      ? (
          incompleteClients.length /
          analyzedClients.length
        ) *
        100
      : 0;

  const coveragePercent =
    totalClients > 0
      ? Math.min(
          100,
          Math.round(
            (
              crmCalculatedClients /
              totalClients
            ) *
              100,
          ),
        )
      : 0;

  const remainingClients =
    Math.max(
      0,
      crmRemainingClients,
    );

  const crmComplete =
    remainingClients ===
      0 ||
    crmCalculatedClients >=
      totalClients;

  const classifiedClients =
    activeClients.length +
    noActivityClients.length +
    incompleteClients.length;

  return (
    <div className="mx-auto max-w-[1700px] space-y-10">
      <PageHeader
        badge="CEO AI"
        title="CRM Intelligence"
        description="Priorisez vos meilleurs clients, détectez les opportunités de fidélisation et identifiez les clients à réactiver."
      />

      <Card className="border-cyan-500/20 bg-cyan-500/5 p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                crmAnalysisRunning
                  ? "bg-cyan-500/10 text-cyan-400"
                  : crmComplete
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-violet-500/10 text-violet-400"
              }`}
            >
              {crmAnalysisRunning ? (
                <RefreshCcw className="h-6 w-6 animate-spin" />
              ) : crmComplete ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <Sparkles className="h-6 w-6" />
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-cyan-400">
                Couverture CRM
              </p>

              <h2 className="mt-1 text-2xl font-semibold text-white">
                {crmCalculatedClients} /{" "}
                {totalClients} clients
                analysés
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                {crmAnalysisRunning
                  ? "Le moteur CRM analyse actuellement les clients restants."
                  : crmComplete
                    ? "L'analyse CRM du fichier clients est à jour."
                    : `${remainingClients} client${remainingClients > 1 ? "s" : ""} reste${remainingClients > 1 ? "nt" : ""} à analyser.`}
              </p>
            </div>
          </div>

          <div className="min-w-[280px] xl:min-w-[380px]">
            <div className="flex items-end justify-between">
              <span className="text-sm text-slate-400">
                Progression
              </span>

              <span className="text-3xl font-bold text-white">
                {coveragePercent}%
              </span>
            </div>

            <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-cyan-400 transition-all duration-500"
                style={{
                  width: `${coveragePercent}%`,
                }}
              />
            </div>

            <div className="mt-3 flex justify-between text-xs text-slate-500">
              <span>
                {crmCalculatedClients} analysés
              </span>

              <span>
                {remainingClients} restants
              </span>
            </div>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
        <StatCard
          title="Clients actifs"
          value={
            activeClients.length
          }
          subtitle={`${formatPercent(
            activeClientsPercent,
          )}% des analysés`}
          icon={Users}
        />

        <StatCard
          title="Sans activité"
          value={
            noActivityClients.length
          }
          subtitle={`${formatPercent(
            noActivityClientsPercent,
          )}% des analysés`}
          icon={UserRoundX}
        />

        <StatCard
          title="Données incomplètes"
          value={
            incompleteClients.length
          }
          subtitle={`${formatPercent(
            incompleteClientsPercent,
          )}% des analysés`}
          icon={AlertTriangle}
        />

        <StatCard
          title="Score actifs"
          value={`${averageActiveCrmScore}/100`}
          subtitle="Indicateur CEO AI"
          icon={Target}
        />

        <StatCard
          title="Score global"
          value={`${averageGlobalCrmScore}/100`}
          subtitle="Inclut comptes à 0"
          icon={Sparkles}
        />

        <StatCard
          title="VIP + Premium"
          value={
            vipClients.length +
            premiumClients.length
          }
          subtitle="Clients stratégiques"
          icon={Crown}
        />

        <StatCard
          title="À réactiver"
          value={
            clientsToReactivate.length
          }
          subtitle="90 jours ou plus"
          icon={RefreshCcw}
        />
      </section>

      <Card className="border-violet-500/20 bg-violet-500/5 p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
            <div>
              <p className="text-sm font-medium text-violet-400">
                CEO AI — Lecture CRM
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-white">
                Qualité du portefeuille clients
              </h2>

              <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
                Sur{" "}
                <strong className="text-white">
                  {crmCalculatedClients}
                </strong>{" "}
                comptes analysés,{" "}
                <strong className="text-white">
                  {activeClients.length}
                </strong>{" "}
                présentent une activité commerciale réelle,{" "}
                <strong className="text-white">
                  {noActivityClients.length}
                </strong>{" "}
                sont sans activité et{" "}
                <strong className="text-white">
                  {incompleteClients.length}
                </strong>{" "}
                présentent des données incomplètes.
              </p>
            </div>

            <div className="grid min-w-[360px] gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Actifs
                </p>

                <p className="mt-2 text-xl font-bold text-white">
                  {activeClients.length}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Sans activité
                </p>

                <p className="mt-2 text-xl font-bold text-white">
                  {noActivityClients.length}
                </p>
              </div>

              <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4">
                <p className="text-xs uppercase tracking-wide text-orange-300">
                  Données incomplètes
                </p>

                <p className="mt-2 text-xl font-bold text-white">
                  {incompleteClients.length}
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                <p className="text-xs uppercase tracking-wide text-cyan-300">
                  Total classé
                </p>

                <p className="mt-2 text-xl font-bold text-white">
                  {classifiedClients}
                  {" / "}
                  {analyzedClients.length}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
              <p className="text-sm font-medium text-cyan-400">
                Score CRM commercial
              </p>

              <div className="mt-3 flex items-end gap-3">
                <p className="text-4xl font-bold text-white">
                  {averageActiveCrmScore}
                </p>

                <p className="pb-1 text-sm text-slate-500">
                  /100
                </p>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Moyenne calculée uniquement sur les clients ayant au moins une dépense ou une consultation exploitable.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-950/40 p-5">
              <p className="text-sm font-medium text-slate-400">
                Score global brut
              </p>

              <div className="mt-3 flex items-end gap-3">
                <p className="text-4xl font-bold text-white">
                  {averageGlobalCrmScore}
                </p>

                <p className="pb-1 text-sm text-slate-500">
                  /100
                </p>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Inclut tous les comptes analysés, y compris ceux sans activité.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {incompleteClients.length >
        0 && (
        <Card className="border-orange-500/20 bg-orange-500/5 p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="mt-1 h-6 w-6 shrink-0 text-orange-400" />

            <div className="flex-1">
              <p className="text-sm font-medium text-orange-400">
                Contrôle qualité CRM
              </p>

              <h2 className="mt-2 text-xl font-semibold text-white">
                Données clients incomplètes
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                {incompleteClients.length} clients possèdent une valeur non exploitable dans leurs données de dépenses ou de consultations.
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Total classé :{" "}
                <strong className="text-white">
                  {classifiedClients}
                </strong>{" "}
                /{" "}
                <strong className="text-white">
                  {analyzedClients.length}
                </strong>
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {incompleteClients
                  .slice(
                    0,
                    15,
                  )
                  .map(
                    (client) => (
                      <Link
                        key={
                          client.id
                        }
                        href={`/dialotel/clients/${client.id}`}
                        className="rounded-lg border border-orange-500/20 bg-slate-950 px-3 py-2 text-xs text-orange-300 transition hover:border-orange-400/50"
                      >
                        {client.name ||
                          client.pseudo ||
                          `Client #${client.id}`}
                      </Link>
                    ),
                  )}
              </div>
            </div>
          </div>
        </Card>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-amber-300">
            VIP
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            {vipClients.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Clients stratégiques
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-violet-300">
            Premium
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            {premiumClients.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Forte valeur
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-cyan-300">
            Réguliers
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            {regularClients.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Relation récurrente
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Occasionnels
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            {occasionalClients.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Potentiel à développer
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-rose-300">
            Inactifs
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            {inactiveClients.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            À surveiller
          </p>
        </Card>
      </section>

      <Card className="border-violet-500/20 bg-violet-500/5 p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
            <div>
              <p className="text-sm font-medium text-violet-400">
                CEO AI — Priorités
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-white">
                Actions recommandées
              </h2>

              <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
                {vipClients.length} clients VIP et{" "}
                {premiumClients.length} Premium représentent{" "}
                <strong className="text-white">
                  {formatPercent(
                    strategicRevenuePercent,
                  )}
                  %
                </strong>{" "}
                de la valeur active analysée.{" "}
                {clientsToReactivate.length} clients présentent une opportunité de réactivation, dont{" "}
                {highValueAtRisk.length} clients à forte valeur.
              </p>
            </div>

            <div className="grid min-w-[340px] gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Valeur analysée
                </p>

                <p className="mt-2 text-xl font-bold text-white">
                  {formatCurrency(
                    totalAnalyzedRevenue,
                  )}{" "}
                  €
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  VIP + Premium
                </p>

                <p className="mt-2 text-xl font-bold text-white">
                  {formatCurrency(
                    strategicRevenue,
                  )}{" "}
                  €
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Réactivation
                </p>

                <p className="mt-2 text-xl font-bold text-white">
                  {formatCurrency(
                    reactivationRevenue,
                  )}{" "}
                  €
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <a
              href="#vip"
              className="flex items-center justify-between rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 transition hover:bg-amber-400/10"
            >
              <div>
                <p className="text-sm font-medium text-amber-300">
                  Voir les VIP
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {vipClients.length} clients
                </p>
              </div>

              <ArrowDown className="h-4 w-4 text-amber-300" />
            </a>

            <a
              href="#reactivation"
              className="flex items-center justify-between rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4 transition hover:bg-cyan-400/10"
            >
              <div>
                <p className="text-sm font-medium text-cyan-300">
                  À réactiver
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {clientsToReactivate.length} clients
                </p>
              </div>

              <ArrowDown className="h-4 w-4 text-cyan-300" />
            </a>

            <a
              href="#top-clients"
              className="flex items-center justify-between rounded-2xl border border-violet-400/20 bg-violet-400/5 p-4 transition hover:bg-violet-400/10"
            >
              <div>
                <p className="text-sm font-medium text-violet-300">
                  Top clients
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Classement valeur
                </p>
              </div>

              <ArrowDown className="h-4 w-4 text-violet-300" />
            </a>

            <a
              href="#sans-activite"
              className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-900/50 p-4 transition hover:bg-slate-800"
            >
              <div>
                <p className="text-sm font-medium text-slate-300">
                  Sans activité
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {noActivityClients.length} comptes
                </p>
              </div>

              <ArrowDown className="h-4 w-4 text-slate-400" />
            </a>
          </div>
        </div>
      </Card>

      <CrmPriorityActions clients={clients} />

      <section className="grid gap-6 xl:grid-cols-2">
        <Card
          id="vip"
          className="scroll-mt-8 p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-amber-300">
                👑 Haute valeur
              </p>

              <h2 className="mt-2 text-xl font-semibold text-white">
                Clients VIP
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {formatCurrency(
                  vipRevenue,
                )}{" "}
                € de valeur cumulée
              </p>
            </div>

            <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">
              {vipClients.length}
            </span>
          </div>

          <div className="mt-6 space-y-3">
            {vipClients
              .slice(
                0,
                10,
              )
              .map(
                (
                  client,
                  index,
                ) => (
                  <Link
                    key={
                      client.id
                    }
                    href={`/dialotel/clients/${client.id}`}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/40 p-4 transition hover:border-amber-400/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 font-bold text-amber-300">
                        {index +
                          1}
                      </div>

                      <div>
                        <p className="font-medium text-white">
                          {client.name ||
                            client.pseudo}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Score{" "}
                          {client.crmScore ??
                            0}
                          /100
                          {client.favoriteExpert
                            ? ` • ${client.favoriteExpert}`
                            : ""}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-amber-300">
                        {formatCurrency(
                          client.totalSpent,
                        )}{" "}
                        €
                      </p>

                      <ExternalLink className="ml-auto mt-2 h-3.5 w-3.5 text-slate-600" />
                    </div>
                  </Link>
                ),
              )}
          </div>
        </Card>

        <Card
          id="reactivation"
          className="scroll-mt-8 p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-cyan-400">
                Opportunités
              </p>

              <h2 className="mt-2 text-xl font-semibold text-white">
                Clients à réactiver
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {formatCurrency(
                  reactivationRevenue,
                )}{" "}
                € de valeur historique
              </p>
            </div>

            <RefreshCcw className="h-5 w-5 text-cyan-400" />
          </div>

          <div className="mt-6 space-y-3">
            {clientsToReactivate
              .slice(
                0,
                10,
              )
              .map(
                (client) => {
                  const days =
                    getDaysSince(
                      client.lastConsultationDate,
                    );

                  return (
                    <Link
                      key={
                        client.id
                      }
                      href={`/dialotel/clients/${client.id}`}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/40 p-4 transition hover:border-cyan-400/30"
                    >
                      <div>
                        <p className="font-medium text-white">
                          {client.name ||
                            client.pseudo}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Dernière consultation :{" "}
                          {client.lastConsultationDate ??
                            "—"}
                        </p>

                        {days !==
                          null && (
                          <p className="mt-1 text-xs text-cyan-400">
                            {days} jours sans consultation
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-white">
                          {formatCurrency(
                            client.totalSpent,
                          )}{" "}
                          €
                        </p>

                        <span
                          className={`mt-2 inline-flex rounded-full border px-2 py-1 text-[11px] font-medium ${getSegmentClasses(
                            client.crmSegment,
                          )}`}
                        >
                          {getSegmentLabel(
                            client.crmSegment,
                          )}
                        </span>
                      </div>
                    </Link>
                  );
                },
              )}
          </div>
        </Card>
      </section>

      {highValueAtRisk.length >
        0 && (
        <Card className="border-rose-500/20 bg-rose-500/5 p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="mt-1 h-6 w-6 shrink-0 text-rose-400" />

            <div>
              <p className="text-sm font-medium text-rose-400">
                CEO AI — Attention prioritaire
              </p>

              <h2 className="mt-2 text-xl font-semibold text-white">
                Clients à forte valeur en risque de décrochage
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                {highValueAtRisk.length} clients ont généré au moins 1 000 € mais n&apos;ont pas consulté depuis au moins 90 jours.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card
        id="top-clients"
        className="scroll-mt-8 p-6"
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-cyan-400">
              Classement
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-white">
              Top clients actifs
            </h2>
          </div>

          <Link
            href="/dialotel/clients"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm text-slate-300 transition hover:border-cyan-500/40 hover:text-cyan-300"
          >
            Voir tous les clients
            <Users className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-4">
                  #
                </th>

                <th className="px-3 py-4">
                  Client
                </th>

                <th className="px-3 py-4">
                  Segment
                </th>

                <th className="px-3 py-4">
                  Score
                </th>

                <th className="px-3 py-4">
                  Expert favori
                </th>

                <th className="px-3 py-4">
                  Consultations
                </th>

                <th className="px-3 py-4">
                  Dépensé
                </th>
              </tr>
            </thead>

            <tbody>
              {topClients.map(
                (
                  client,
                  index,
                ) => (
                  <tr
                    key={
                      client.id
                    }
                    className="border-b border-slate-800/70"
                  >
                    <td className="px-3 py-4 text-slate-500">
                      {index +
                        1}
                    </td>

                    <td className="px-3 py-4">
                      <Link
                        href={`/dialotel/clients/${client.id}`}
                        className="font-medium text-white hover:text-cyan-300"
                      >
                        {client.name ||
                          client.pseudo}
                      </Link>
                    </td>

                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs ${getSegmentClasses(
                          client.crmSegment,
                        )}`}
                      >
                        {getSegmentLabel(
                          client.crmSegment,
                        )}
                      </span>
                    </td>

                    <td className="px-3 py-4 text-white">
                      {client.crmScore ??
                        0}
                      /100
                    </td>

                    <td className="px-3 py-4 text-slate-300">
                      {client.favoriteExpert ??
                        "—"}
                    </td>

                    <td className="px-3 py-4 text-slate-300">
                      {client.consultationsCount ??
                        "—"}
                    </td>

                    <td className="px-3 py-4 font-semibold text-cyan-400">
                      {formatCurrency(
                        client.totalSpent,
                      )}{" "}
                      €
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card
        id="sans-activite"
        className="scroll-mt-8 border-slate-700 bg-slate-900/40 p-6"
      >
        <div className="flex items-start gap-4">
          <UserRoundX className="mt-1 h-6 w-6 text-slate-400" />

          <div>
            <p className="font-medium text-white">
              Comptes sans activité
            </p>

            <p className="mt-2 text-sm text-slate-400">
              {noActivityClients.length} comptes ne présentent actuellement ni dépense ni consultation exploitable.
            </p>
          </div>
        </div>
      </Card>

      {remainingClients >
        0 && (
        <Card className="border-slate-700 bg-slate-900/40 p-6">
          <div className="flex items-start gap-4">
            <UserRoundCheck className="mt-1 h-6 w-6 text-slate-400" />

            <div>
              <p className="font-medium text-white">
                Analyse CRM en cours
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Il reste {remainingClients} clients à analyser.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card className="border-emerald-500/20 bg-emerald-500/5 p-6">
        <div className="flex items-start gap-4">
          <WalletCards className="mt-1 h-6 w-6 text-emerald-400" />

          <div>
            <p className="text-sm font-medium text-emerald-400">
              CEO AI — Synthèse business
            </p>

            <h2 className="mt-2 text-xl font-semibold text-white">
              Valeur du portefeuille actif
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              {activeClients.length} clients présentent une activité réelle pour une valeur cumulée de{" "}
              <strong className="text-white">
                {formatCurrency(
                  totalAnalyzedRevenue,
                )}{" "}
                €
              </strong>
              . Le scorae CRM commercial moyen est de{" "}
              <strong className="text-white">
                {averageActiveCrmScore}/100
              </strong>
              .
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}