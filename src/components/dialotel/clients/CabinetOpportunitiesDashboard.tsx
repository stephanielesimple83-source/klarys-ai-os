"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  Crown,
  MessageSquareText,
  PhoneCall,
  RefreshCcw,
  Target,
  TrendingUp,
  UserRoundCheck,
} from "lucide-react";

import Link from "next/link";

import Card from "@/components/ui/Card";

interface CabinetOpportunityClient {
  clientId: number;
  pseudo: string;
  name: string;
  phone: string | null;
  email: string | null;

  commercialOffers: boolean;

  crmSegment: string | null;
  crmScore: number | null;

  totalSpent: number;
  consultationsCount: number;
  averageSpentPerConsultation: number;

  lastConsultationDate: string | null;
  daysSinceLastConsultation: number | null;

  favoriteExpert: string | null;
  lastPromo: string | null;

  priority:
    | "CRITIQUE"
    | "HAUTE"
    | "MOYENNE"
    | "FAIBLE";

  opportunityScore: number;

  reasons: string[];
  explanation: string[];

  estimatedHistoricalValue: number;
}

interface CabinetOpportunitySummary {
  generatedAt: string;

  totalClientsAnalyzed: number;
  eligibleClients: number;

  excludedClients: {
    noPhone: number;
    commercialOffersDisabled: number;
    noCommercialHistory: number;
  };

  priorities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };

  potential: {
    totalHistoricalValue: number;
    averageHistoricalValuePerClient: number;
    averageSpentPerConsultation: number;
  };

  recommendedCampaignSize: number;

  clients: CabinetOpportunityClient[];
}

interface CabinetOpportunitiesDashboardProps {
  data: CabinetOpportunitySummary;
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

function getPriorityClasses(
  priority:
    CabinetOpportunityClient["priority"],
): string {
  switch (priority) {
    case "CRITIQUE":
      return "border-rose-500/30 bg-rose-500/10 text-rose-300";

    case "HAUTE":
      return "border-amber-500/30 bg-amber-500/10 text-amber-300";

    case "MOYENNE":
      return "border-cyan-500/30 bg-cyan-500/10 text-cyan-300";

    case "FAIBLE":
    default:
      return "border-slate-700 bg-slate-800 text-slate-300";
  }
}

function getSegmentClasses(
  segment: string | null,
): string {
  switch (segment) {
    case "VIP":
      return "border-amber-400/30 bg-amber-400/10 text-amber-300";

    case "PREMIUM":
      return "border-violet-400/30 bg-violet-400/10 text-violet-300";

    case "REGULIER":
      return "border-cyan-400/30 bg-cyan-400/10 text-cyan-300";

    case "OCCASIONNEL":
      return "border-slate-700 bg-slate-800 text-slate-300";

    default:
      return "border-slate-700 bg-slate-900 text-slate-500";
  }
}

export default function CabinetOpportunitiesDashboard({
  data,
}: CabinetOpportunitiesDashboardProps) {
  const strategicClients =
    data.clients.filter(
      (client) =>
        client.priority ===
          "CRITIQUE" ||
        client.priority ===
          "HAUTE",
    );

  const strategicHistoricalValue =
    strategicClients.reduce(
      (
        total,
        client,
      ) =>
        total +
        client.totalSpent,
      0,
    );

  /*
   * Sélection recommandée par le CEO AI.
   *
   * data.clients est déjà classé
   * par priorité et score d'opportunité.
   */
  const recommendedClients =
    data.clients.slice(
      0,
      Math.min(
        data.recommendedCampaignSize,
        data.clients.length,
      ),
    );

  const recommendedClientIds =
    recommendedClients.map(
      (client) =>
        client.clientId,
    );

  /*
   * La page /dialotel/campagnes sait déjà
   * lire le paramètre ?clients=...
   */
  const campaignHref =
    recommendedClientIds.length >
    0
      ? `/dialotel/campagnes?clients=${recommendedClientIds.join(
          ",",
        )}`
      : "/dialotel/campagnes";

  return (
    <div className="space-y-6">
      <Card className="border-rose-500/20 bg-rose-500/5 p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-400" />

              <p className="text-sm font-medium text-rose-400">
                CEO AI — CA Cabinet
              </p>
            </div>

            <h2 className="mt-2 text-2xl font-semibold text-white">
              Clients à relancer aujourd&apos;hui
            </h2>

            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
              Le moteur CRM a identifié{" "}
              <strong className="text-white">
                {data.eligibleClients}
              </strong>{" "}
              clients autorisés aux offres commerciales.
              Les profils ci-dessous sont classés selon leur
              valeur historique, leur fidélité et leur durée
              d&apos;inactivité.
            </p>
          </div>

          <div className="grid min-w-[360px] gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-rose-500/20 bg-slate-950/40 p-4">
              <p className="text-xs uppercase tracking-wide text-rose-300">
                Critiques
              </p>

              <p className="mt-2 text-2xl font-bold text-white">
                {data.priorities.critical}
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-slate-950/40 p-4">
              <p className="text-xs uppercase tracking-wide text-amber-300">
                Hautes
              </p>

              <p className="mt-2 text-2xl font-bold text-white">
                {data.priorities.high}
              </p>
            </div>

            <div className="rounded-2xl border border-violet-500/20 bg-slate-950/40 p-4">
              <p className="text-xs uppercase tracking-wide text-violet-300">
                Campagne conseillée
              </p>

              <p className="mt-2 text-2xl font-bold text-white">
                {data.recommendedCampaignSize}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                clients
              </p>
            </div>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-cyan-400">
            <UserRoundCheck className="h-4 w-4" />

            <p className="text-xs uppercase tracking-wide">
              Éligibles SMS
            </p>
          </div>

          <p className="mt-3 text-3xl font-bold text-white">
            {data.eligibleClients}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Offres commerciales autorisées
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 text-amber-300">
            <Crown className="h-4 w-4" />

            <p className="text-xs uppercase tracking-wide">
              Priorité forte
            </p>
          </div>

          <p className="mt-3 text-3xl font-bold text-white">
            {strategicClients.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Critiques + Hautes
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 text-violet-300">
            <TrendingUp className="h-4 w-4" />

            <p className="text-xs uppercase tracking-wide">
              Valeur historique
            </p>
          </div>

          <p className="mt-3 text-2xl font-bold text-white">
            {formatCurrency(
              strategicHistoricalValue,
            )}{" "}
            €
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Clients prioritaires affichés
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 text-emerald-300">
            <Target className="h-4 w-4" />

            <p className="text-xs uppercase tracking-wide">
              Moyenne historique
            </p>
          </div>

          <p className="mt-3 text-2xl font-bold text-white">
            {formatCurrency(
              data.potential
                .averageHistoricalValuePerClient,
            )}{" "}
            €
          </p>

          <p className="mt-2 text-xs text-slate-500">
            par client éligible
          </p>
        </Card>
      </section>

      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-cyan-400">
              Priorités du jour
            </p>

            <h3 className="mt-2 text-xl font-semibold text-white">
              Meilleurs profils de réactivation
            </h3>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-2 text-xs text-slate-400">
            <RefreshCcw className="h-3.5 w-3.5" />

            {data.totalClientsAnalyzed} clients analysés
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {data.clients.map(
            (
              client,
              index,
            ) => (
              <div
                key={
                  client.clientId
                }
                className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex min-w-0 flex-1 gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800 font-bold text-slate-300">
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-white">
                          {client.name ||
                            client.pseudo}
                        </h4>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getPriorityClasses(
                            client.priority,
                          )}`}
                        >
                          {client.priority}
                        </span>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${getSegmentClasses(
                            client.crmSegment,
                          )}`}
                        >
                          {client.crmSegment ??
                            "Sans segment"}
                        </span>
                      </div>

                      <div className="mt-3 grid gap-2 text-sm text-slate-400 sm:grid-cols-2 xl:grid-cols-4">
                        <p>
                          Score opportunité :{" "}
                          <strong className="text-white">
                            {client.opportunityScore}/100
                          </strong>
                        </p>

                        <p>
                          Score CRM :{" "}
                          <strong className="text-white">
                            {client.crmScore ??
                              "—"}
                          </strong>
                        </p>

                        <p>
                          Consultations :{" "}
                          <strong className="text-white">
                            {client.consultationsCount}
                          </strong>
                        </p>

                        <p>
                          Inactivité :{" "}
                          <strong className="text-white">
                            {client.daysSinceLastConsultation ??
                              "—"}{" "}
                            jours
                          </strong>
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                        <span>
                          Dernière consultation :{" "}
                          <strong className="text-slate-300">
                            {client.lastConsultationDate ??
                              "—"}
                          </strong>
                        </span>

                        <span>
                          Médium favori :{" "}
                          <strong className="text-slate-300">
                            {client.favoriteExpert ??
                              "—"}
                          </strong>
                        </span>

                        <span>
                          Dernière promo :{" "}
                          <strong className="text-slate-300">
                            {client.lastPromo ??
                              "—"}
                          </strong>
                        </span>
                      </div>

                      {client.explanation.length >
                        0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {client.explanation.map(
                            (
                              explanation,
                            ) => (
                              <span
                                key={
                                  explanation
                                }
                                className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-400"
                              >
                                {explanation}
                              </span>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid min-w-[280px] gap-3 sm:grid-cols-2 xl:min-w-[360px]">
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        CA historique
                      </p>

                      <p className="mt-2 text-xl font-bold text-white">
                        {formatCurrency(
                          client.totalSpent,
                        )}{" "}
                        €
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Moyenne / consultation
                      </p>

                      <p className="mt-2 text-xl font-bold text-cyan-300">
                        {formatCurrency(
                          client.averageSpentPerConsultation,
                        )}{" "}
                        €
                      </p>
                    </div>

                    <Link
                      href={`/dialotel/clients/${client.clientId}`}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm text-slate-300 transition hover:border-cyan-500/40 hover:text-cyan-300"
                    >
                      Client 360°
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>

                    <a
                      href={`tel:${client.phone ?? ""}`}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
                    >
                      <PhoneCall className="h-4 w-4" />
                      Contacter
                    </a>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </Card>

      <Card className="border-violet-500/20 bg-violet-500/5 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-violet-400">
              <MessageSquareText className="h-5 w-5" />

              <p className="text-sm font-medium">
                Campagne SMS Dialotel
              </p>
            </div>

            <h3 className="mt-2 text-xl font-semibold text-white">
              Préparer la prochaine campagne de réactivation
            </h3>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Le CEO AI recommande actuellement une sélection
              de{" "}
              <strong className="text-white">
                {recommendedClients.length}
              </strong>{" "}
              clients parmi les profils les plus prioritaires.
              Aucun SMS n&apos;est envoyé automatiquement.
            </p>
          </div>

          {recommendedClientIds.length >
          0 ? (
            <Link
              href={
                campaignHref
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-5 text-sm font-medium text-violet-300 transition hover:border-violet-400/50 hover:bg-violet-500/20 hover:text-violet-200"
            >
              <MessageSquareText className="h-4 w-4" />

              Préparer campagne SMS

              <ArrowUpRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex h-11 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 text-sm text-slate-500 opacity-60"
            >
              <MessageSquareText className="h-4 w-4" />

              Aucun client disponible
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}