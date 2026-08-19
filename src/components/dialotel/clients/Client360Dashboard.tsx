import {
  BadgeEuro,
  CalendarDays,
  Crown,
  Mail,
  Phone,
  Sparkles,
  Star,
  Target,
  UserRound,
} from "lucide-react";

import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";

import type {
  CrmSegment,
  DialotelClientDetail,
} from "@/services/client-detail.service";

interface Client360DashboardProps {
  client: DialotelClientDetail;
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

function getSegmentLabel(
  segment: CrmSegment,
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
  }
}

function getSegmentClasses(
  segment: CrmSegment,
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
  }
}

function getOpportunityText(
  client: DialotelClientDetail,
): string {
  if (client.crmSegment === "VIP") {
    return "Client à très forte valeur. Priorité à la fidélisation, aux attentions personnalisées et à la qualité de service.";
  }

  if (client.crmSegment === "PREMIUM") {
    return "Client à forte valeur avec un potentiel élevé de fidélisation. Une approche personnalisée peut renforcer la récurrence.";
  }

  if (client.crmSegment === "REGULIER") {
    return "Client régulier. Il peut être intéressant de renforcer la fidélité et d’identifier ses experts ou prestations préférées.";
  }

  if (client.crmSegment === "OCCASIONNEL") {
    return "Client occasionnel. Une relance pertinente peut aider à augmenter la fréquence de consultation.";
  }

  return "Client actuellement considéré comme inactif. Une analyse de la date de dernière consultation peut aider à décider d’une éventuelle relance.";
}

export default function Client360Dashboard({
  client,
}: Client360DashboardProps) {
  const averageConsultation =
    client.consultationsCount > 0
      ? client.consultationsAmount /
        client.consultationsCount
      : 0;

  return (
    <div className="mx-auto max-w-[1600px] space-y-10">
      <PageHeader
        badge="Client 360°"
        title={
          client.fullName ||
          client.pseudo ||
          `Client #${client.id}`
        }
        description="Vue complète du client Dialotel : identité, valeur, historique, segmentation CRM et relation commerciale."
        rightContent={
          <div
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold ${getSegmentClasses(
              client.crmSegment,
            )}`}
          >
            <Crown className="h-4 w-4" />

            {getSegmentLabel(
              client.crmSegment,
            )}
          </div>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Dépenses totales"
          value={`${formatCurrency(
            client.totalSpent,
          )} €`}
          subtitle="Valeur client"
          icon={BadgeEuro}
        />

        <StatCard
          title="Consultations"
          value={client.consultationsCount}
          subtitle="Historique privé"
          icon={CalendarDays}
        />

        <StatCard
          title="Panier moyen"
          value={`${formatCurrency(
            averageConsultation,
          )} €`}
          subtitle="Par consultation"
          icon={Star}
        />

        <StatCard
          title="Expert favori"
          value={
            client.favoriteExpert ??
            "Non déterminé"
          }
          subtitle="Selon l'historique"
          icon={Sparkles}
        />

        <StatCard
          title="Score CRM"
          value={`${client.crmScore}/100`}
          subtitle={getSegmentLabel(
            client.crmSegment,
          )}
          icon={Target}
        />
      </section>

      <Card className="border-cyan-500/20 bg-cyan-500/5 p-6">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-medium text-cyan-400">
              CRM Intelligence
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-white">
              Segment{" "}
              {getSegmentLabel(
                client.crmSegment,
              )}
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Score calculé automatiquement à partir de la valeur client, de la fréquence de consultation, de la récence et de la fidélité expert.
            </p>
          </div>

          <div className="min-w-[180px]">
            <div className="flex items-end justify-between">
              <span className="text-sm text-slate-500">
                Score
              </span>

              <span className="text-3xl font-bold text-white">
                {client.crmScore}
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-cyan-400"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      client.crmScore,
                    ),
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {client.crmReason.map(
            (reason) => (
              <div
                key={reason}
                className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4"
              >
                <div className="flex gap-3">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />

                  <p className="text-sm leading-6 text-slate-300">
                    {reason}
                  </p>
                </div>
              </div>
            ),
          )}
        </div>
      </Card>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <p className="text-sm font-medium text-cyan-400">
            Identité
          </p>

          <h2 className="mt-2 text-xl font-semibold text-white">
            Informations client
          </h2>

          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-3">
              <UserRound className="mt-1 h-4 w-4 text-slate-500" />

              <div>
                <p className="text-xs text-slate-500">
                  Pseudo
                </p>

                <p className="text-sm text-white">
                  {client.pseudo ?? "—"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="mt-1 h-4 w-4 text-slate-500" />

              <div>
                <p className="text-xs text-slate-500">
                  E-mail
                </p>

                <p className="text-sm text-white">
                  {client.email ?? "—"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="mt-1 h-4 w-4 text-slate-500" />

              <div>
                <p className="text-xs text-slate-500">
                  Téléphone
                </p>

                <p className="text-sm text-white">
                  {client.phone ?? "—"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Date de naissance
              </p>

              <p className="mt-1 text-sm text-white">
                {client.birthDate ?? "—"}

                {client.age !== null
                  ? ` • ${client.age} ans`
                  : ""}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Segment Dialotel
              </p>

              <p className="mt-1 text-sm text-white">
                {client.segment ??
                  "Non renseigné"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Offres commerciales
              </p>

              <p className="mt-1 text-sm text-white">
                {client.commercialOffers === null
                  ? "Non renseigné"
                  : client.commercialOffers
                    ? "Oui"
                    : "Non"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-sm font-medium text-violet-400">
            Acquisition
          </p>

          <h2 className="mt-2 text-xl font-semibold text-white">
            Référent & source
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-500">
                Référent
              </p>

              <p className="mt-1 text-sm text-white">
                {client.referrer.referrer ??
                  "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Source
              </p>

              <p className="mt-1 text-sm text-white">
                {client.referrer.source ??
                  "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Medium
              </p>

              <p className="mt-1 text-sm text-white">
                {client.referrer.medium ??
                  "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Campagne
              </p>

              <p className="mt-1 text-sm text-white">
                {client.referrer.campaign ??
                  "—"}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Commentaire
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              {client.comment ??
                "Aucun commentaire enregistré."}
            </p>
          </div>
        </Card>
      </section>

      <Card className="border-violet-500/20 bg-violet-500/5 p-6">
        <div className="flex items-start gap-4">
          <Target className="mt-1 h-6 w-6 shrink-0 text-violet-400" />

          <div>
            <p className="text-sm font-medium text-violet-400">
              CEO AI — Opportunité client
            </p>

            <h2 className="mt-2 text-xl font-semibold text-white">
              Action recommandée
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              {getOpportunityText(
                client,
              )}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div>
          <p className="text-sm font-medium text-cyan-400">
            Historique
          </p>

          <h2 className="mt-1 text-2xl font-semibold text-white">
            Consultations privées
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {client.consultationsCount} consultation
            {client.consultationsCount > 1
              ? "s"
              : ""}
          </p>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-4">
                  Date
                </th>

                <th className="px-3 py-4">
                  Cabinet
                </th>

                <th className="px-3 py-4">
                  Expert
                </th>

                <th className="px-3 py-4">
                  Durée
                </th>

                <th className="px-3 py-4">
                  Prestation
                </th>

                <th className="px-3 py-4">
                  Montant
                </th>

                <th className="px-3 py-4">
                  État
                </th>
              </tr>
            </thead>

            <tbody>
              {client.consultations.map(
                (consultation) => (
                  <tr
                    key={consultation.id}
                    className="border-b border-slate-800/70 transition hover:bg-slate-800/30"
                  >
                    <td className="px-3 py-4 text-sm text-slate-300">
                      {consultation.date ?? "—"}

                      {consultation.time && (
                        <p className="mt-1 text-xs text-slate-500">
                          {consultation.time}
                        </p>
                      )}
                    </td>

                    <td className="px-3 py-4 text-sm text-slate-300">
                      {consultation.cabinet ??
                        "—"}
                    </td>

                    <td className="px-3 py-4 font-medium text-white">
                      {consultation.expert ??
                        "—"}
                    </td>

                    <td className="px-3 py-4 text-sm text-slate-300">
                      {consultation.duration ??
                        "—"}
                    </td>

                    <td className="px-3 py-4">
                      <div className="flex flex-wrap gap-2">
                        {consultation.services.length >
                        0 ? (
                          consultation.services.map(
                            (service) => (
                              <span
                                key={service}
                                className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300"
                              >
                                {service}
                              </span>
                            ),
                          )
                        ) : (
                          <span className="text-slate-600">
                            —
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-3 py-4 font-semibold text-cyan-400">
                      {formatCurrency(
                        consultation.amount,
                      )}{" "}
                      €
                    </td>

                    <td className="px-3 py-4 text-sm text-slate-300">
                      {consultation.status ??
                        "—"}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}