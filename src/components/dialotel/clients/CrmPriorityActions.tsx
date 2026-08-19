"use client";

import {
  AlertTriangle,
  Check,
  Clipboard,
  Crown,
  ExternalLink,
  RefreshCcw,
  Send,
  Target,
  TrendingUp,
} from "lucide-react";

import Link from "next/link";

import {
  useMemo,
  useState,
} from "react";

import Card from "@/components/ui/Card";

import type {
  DialotelClient,
} from "@/services/clients.service";

type PriorityLevel =
  | "URGENTE"
  | "HAUTE"
  | "MOYENNE";

type PriorityFilter =
  | "ALL"
  | PriorityLevel;

interface CrmPriorityActionsProps {
  clients:
    DialotelClient[];
}

interface PriorityAction {
  client:
    DialotelClient;

  priority:
    PriorityLevel;

  score:
    number;

  daysSinceLastConsultation:
    number | null;

  recommendation:
    string;

  reason:
    string;

  message:
    string;
}

function parseFrenchDate(
  value:
    | string
    | null,
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
  value:
    | string
    | null,
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

function formatCurrency(
  value: number,
): string {
  return value.toLocaleString(
    "fr-FR",
    {
      minimumFractionDigits:
        2,

      maximumFractionDigits:
        2,
    },
  );
}

function getPriorityClasses(
  priority:
    PriorityLevel,
): string {
  switch (priority) {
    case "URGENTE":
      return "border-rose-500/30 bg-rose-500/10 text-rose-300";

    case "HAUTE":
      return "border-amber-500/30 bg-amber-500/10 text-amber-300";

    case "MOYENNE":
      return "border-cyan-500/30 bg-cyan-500/10 text-cyan-300";
  }
}

function getClientDisplayName(
  client:
    DialotelClient,
): string {
  return (
    client.name ||
    client.pseudo ||
    `Client ${client.id}`
  );
}

function buildReactivationMessage(
  client:
    DialotelClient,

  priority:
    PriorityLevel,

  days:
    number | null,
): string {
  const name =
    getClientDisplayName(
      client,
    );

  const expert =
    client.favoriteExpert;

  if (
    priority ===
    "URGENTE"
  ) {
    if (expert) {
      return (
        `Bonjour ${name}, ` +
        `nous espérons que vous allez bien. ` +
        `Cela fait quelque temps que nous n'avons pas eu le plaisir de vous retrouver. ` +
        `${expert}, que vous avez souvent consulté, est toujours présent(e) sur Klarys Voyance. ` +
        `Nous serions ravis de vous accueillir à nouveau prochainement.`
      );
    }

    return (
      `Bonjour ${name}, ` +
      `nous espérons que vous allez bien. ` +
      `Cela fait quelque temps que nous n'avons pas eu le plaisir de vous retrouver sur Klarys Voyance. ` +
      `Nous serions ravis de vous accueillir à nouveau prochainement.`
    );
  }

  if (
    priority ===
    "HAUTE"
  ) {
    if (expert) {
      return (
        `Bonjour ${name}, ` +
        `petit message de Klarys Voyance pour prendre de vos nouvelles. ` +
        `Vous aviez particulièrement apprécié vos consultations avec ${expert}. ` +
        `N'hésitez pas à venir découvrir ses prochaines disponibilités.`
      );
    }

    return (
      `Bonjour ${name}, ` +
      `petit message de Klarys Voyance pour prendre de vos nouvelles. ` +
      `Cela fait un moment que nous ne vous avons pas retrouvé parmi nous. ` +
      `Nos experts restent disponibles lorsque vous en ressentez le besoin.`
    );
  }

  if (expert) {
    return (
      `Bonjour ${name}, ` +
      `nous pensions à vous chez Klarys Voyance. ` +
      `${expert} fait partie des experts que vous avez déjà consultés. ` +
      `Nous serons heureux de vous retrouver quand vous le souhaiterez.`
    );
  }

  return (
    `Bonjour ${name}, ` +
    `nous pensions à vous chez Klarys Voyance. ` +
    `Nos experts restent disponibles lorsque vous souhaitez reprendre une consultation. ` +
    `Au plaisir de vous retrouver prochainement.`
  );
}

function buildPriorityAction(
  client:
    DialotelClient,
): PriorityAction | null {
  const days =
    getDaysSince(
      client.lastConsultationDate,
    );

  const spent =
    Number(
      client.totalSpent,
    );

  const consultations =
    Number(
      client.consultationsCount ??
        0,
    );

  const score =
    Number(
      client.crmScore ??
        0,
    );

  if (
    !Number.isFinite(
      spent,
    )
  ) {
    return null;
  }

  /*
   * =========================================
   * URGENTE
   * =========================================
   */

  if (
    spent >= 3000 &&
    days !== null &&
    days >= 90
  ) {
    return {
      client,

      priority:
        "URGENTE",

      score,

      daysSinceLastConsultation:
        days,

      recommendation:
        client.favoriteExpert
          ? `Relance personnalisée prioritaire autour de ${client.favoriteExpert}.`
          : "Relance personnalisée prioritaire.",

      reason:
        `Forte valeur historique de ${formatCurrency(
          spent,
        )} € et ${days} jours sans consultation.`,

      message:
        buildReactivationMessage(
          client,
          "URGENTE",
          days,
        ),
    };
  }

  /*
   * =========================================
   * HAUTE
   * =========================================
   */

  if (
    spent >= 1000 &&
    days !== null &&
    days >= 90
  ) {
    return {
      client,

      priority:
        "HAUTE",

      score,

      daysSinceLastConsultation:
        days,

      recommendation:
        client.favoriteExpert
          ? `Préparer une relance ciblée en mettant en avant ${client.favoriteExpert}.`
          : "Préparer une relance ciblée.",

      reason:
        `${formatCurrency(
          spent,
        )} € dépensés et ${days} jours sans consultation.`,

      message:
        buildReactivationMessage(
          client,
          "HAUTE",
          days,
        ),
    };
  }

  /*
   * =========================================
   * VIP / PREMIUM À SURVEILLER
   * =========================================
   */

  if (
    (
      client.crmSegment ===
        "VIP" ||
      client.crmSegment ===
        "PREMIUM"
    ) &&
    days !== null &&
    days >= 45
  ) {
    return {
      client,

      priority:
        "HAUTE",

      score,

      daysSinceLastConsultation:
        days,

      recommendation:
        "Entretenir la relation avec ce client stratégique avant une période d'inactivité prolongée.",

      reason:
        `${client.crmSegment} avec ${days} jours sans consultation.`,

      message:
        buildReactivationMessage(
          client,
          "HAUTE",
          days,
        ),
    };
  }

  /*
   * =========================================
   * MOYENNE
   * =========================================
   */

  if (
    spent > 0 &&
    days !== null &&
    days >= 90
  ) {
    return {
      client,

      priority:
        "MOYENNE",

      score,

      daysSinceLastConsultation:
        days,

      recommendation:
        "Ajouter ce client à une campagne de réactivation douce.",

      reason:
        `${formatCurrency(
          spent,
        )} € de valeur historique et ${days} jours sans consultation.`,

      message:
        buildReactivationMessage(
          client,
          "MOYENNE",
          days,
        ),
    };
  }

  /*
   * =========================================
   * CLIENT FIDÈLE EN BAISSE
   * =========================================
   */

  if (
    consultations >= 20 &&
    days !== null &&
    days >= 60
  ) {
    return {
      client,

      priority:
        "MOYENNE",

      score,

      daysSinceLastConsultation:
        days,

      recommendation:
        client.favoriteExpert
          ? `Réactiver la relation avec ${client.favoriteExpert}.`
          : "Prévoir une relance de fidélisation.",

      reason:
        `${consultations} consultations historiques et ${days} jours d'inactivité.`,

      message:
        buildReactivationMessage(
          client,
          "MOYENNE",
          days,
        ),
    };
  }

  return null;
}

export default function CrmPriorityActions({
  clients,
}: CrmPriorityActionsProps) {
  const [
    filter,
    setFilter,
  ] =
    useState<PriorityFilter>(
      "ALL",
    );

  const [
    copiedClientId,
    setCopiedClientId,
  ] =
    useState<
      number | null
    >(
      null,
    );

  const [
    selectedClientIds,
    setSelectedClientIds,
  ] =
    useState<number[]>(
      [],
    );

  function toggleClientSelection(
    clientId: number,
  ): void {
    setSelectedClientIds(
      (current) =>
        current.includes(
          clientId,
        )
          ? current.filter(
              (id) =>
                id !==
                clientId,
            )
          : [
              ...current,
              clientId,
            ],
    );
  }

  function clearSelection(): void {
    setSelectedClientIds(
      [],
    );
  }

  const actions =
    useMemo(
      () =>
        clients
          .filter(
            (client) =>
              client.crmCalculated,
          )
          .map(
            buildPriorityAction,
          )
          .filter(
            (
              action,
            ): action is PriorityAction =>
              action !==
              null,
          )
          .sort(
            (a, b) => {
              const priorityWeight:
                Record<
                  PriorityLevel,
                  number
                > = {
                URGENTE: 3,
                HAUTE: 2,
                MOYENNE: 1,
              };

              const priorityDifference =
                priorityWeight[
                  b.priority
                ] -
                priorityWeight[
                  a.priority
                ];

              if (
                priorityDifference !==
                0
              ) {
                return priorityDifference;
              }

              return (
                b.client.totalSpent -
                a.client.totalSpent
              );
            },
          ),
      [
        clients,
      ],
    );

  const urgentActions =
    actions.filter(
      (action) =>
        action.priority ===
        "URGENTE",
    );

  const highActions =
    actions.filter(
      (action) =>
        action.priority ===
        "HAUTE",
    );

  const mediumActions =
    actions.filter(
      (action) =>
        action.priority ===
        "MOYENNE",
    );

  const filteredActions =
    filter ===
    "ALL"
      ? actions
      : actions.filter(
          (action) =>
            action.priority ===
            filter,
        );

  async function copyMessage(
    action:
      PriorityAction,
  ): Promise<void> {
    try {
      await navigator.clipboard.writeText(
        action.message,
      );

      setCopiedClientId(
        action.client.id,
      );

      window.setTimeout(
        () => {
          setCopiedClientId(
            null,
          );
        },
        2000,
      );
    } catch {
      setCopiedClientId(
        null,
      );
    }
  }

  return (
    <Card className="border-violet-500/20 bg-violet-500/5 p-6">
      <div className="flex flex-col gap-7">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
          <div>
            <p className="text-sm font-medium text-violet-400">
              CEO AI — Actions prioritaires
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-white">
              Plan d&apos;action commercial
            </h2>

            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
              Le CRM a identifié{" "}
              <strong className="text-white">
                {actions.length}
              </strong>{" "}
              clients nécessitant une action commerciale, classés automatiquement par niveau de priorité.
            </p>
          </div>

          <div className="grid min-w-[360px] gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
              <div className="flex items-center gap-2 text-rose-300">
                <AlertTriangle className="h-4 w-4" />

                <p className="text-xs uppercase tracking-wide">
                  Urgentes
                </p>
              </div>

              <p className="mt-2 text-2xl font-bold text-white">
                {urgentActions.length}
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex items-center gap-2 text-amber-300">
                <Crown className="h-4 w-4" />

                <p className="text-xs uppercase tracking-wide">
                  Hautes
                </p>
              </div>

              <p className="mt-2 text-2xl font-bold text-white">
                {highActions.length}
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
              <div className="flex items-center gap-2 text-cyan-300">
                <TrendingUp className="h-4 w-4" />

                <p className="text-xs uppercase tracking-wide">
                  Moyennes
                </p>
              </div>

              <p className="mt-2 text-2xl font-bold text-white">
                {mediumActions.length}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              setFilter(
                "ALL",
              )
            }
            className={`rounded-xl border px-4 py-2 text-sm transition ${
              filter ===
              "ALL"
                ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
                : "border-slate-700 bg-slate-950/50 text-slate-400 hover:text-white"
            }`}
          >
            Toutes ({actions.length})
          </button>

          <button
            type="button"
            onClick={() =>
              setFilter(
                "URGENTE",
              )
            }
            className={`rounded-xl border px-4 py-2 text-sm transition ${
              filter ===
              "URGENTE"
                ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
                : "border-slate-700 bg-slate-950/50 text-slate-400 hover:text-white"
            }`}
          >
            Urgentes ({urgentActions.length})
          </button>

          <button
            type="button"
            onClick={() =>
              setFilter(
                "HAUTE",
              )
            }
            className={`rounded-xl border px-4 py-2 text-sm transition ${
              filter ===
              "HAUTE"
                ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                : "border-slate-700 bg-slate-950/50 text-slate-400 hover:text-white"
            }`}
          >
            Hautes ({highActions.length})
          </button>

          <button
            type="button"
            onClick={() =>
              setFilter(
                "MOYENNE",
              )
            }
            className={`rounded-xl border px-4 py-2 text-sm transition ${
              filter ===
              "MOYENNE"
                ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                : "border-slate-700 bg-slate-950/50 text-slate-400 hover:text-white"
            }`}
          >
            Moyennes ({mediumActions.length})
          </button>
        </div>

        {selectedClientIds.length > 0 && (
          <div className="sticky top-4 z-20 flex flex-col gap-3 rounded-2xl border border-cyan-500/30 bg-slate-950/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-white">
                {selectedClientIds.length} client{selectedClientIds.length > 1 ? "s" : ""} sélectionné{selectedClientIds.length > 1 ? "s" : ""}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Les messages resteront personnalisés pour chaque client.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={
                  clearSelection
                }
                className="h-10 rounded-xl border border-slate-700 px-4 text-sm text-slate-300 transition hover:bg-slate-900 hover:text-white"
              >
                Annuler
              </button>

              <Link
                href={`/dialotel/campagnes/nouvelle?clientIds=${selectedClientIds.join(",")}`}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                <Send className="h-4 w-4" />
                Préparer les {selectedClientIds.length} SMS
              </Link>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {filteredActions
            .slice(
              0,
              20,
            )
            .map(
              (action) => (
                <div
                  key={
                    action.client.id
                  }
                  className={`rounded-2xl border p-5 transition ${
                    selectedClientIds.includes(
                      action.client.id,
                    )
                      ? "border-cyan-400/60 bg-cyan-500/5"
                      : "border-slate-800 bg-slate-950/40"
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-300">
                      <input
                        type="checkbox"
                        checked={
                          selectedClientIds.includes(
                            action.client.id,
                          )
                        }
                        onChange={() =>
                          toggleClientSelection(
                            action.client.id,
                          )
                        }
                        className="h-5 w-5 rounded border-slate-600 bg-slate-900 accent-cyan-400"
                      />

                      Sélectionner pour un envoi groupé
                    </label>

                    {selectedClientIds.includes(
                      action.client.id,
                    ) && (
                      <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                        Sélectionné
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col justify-between gap-6 xl:flex-row">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getPriorityClasses(
                            action.priority,
                          )}`}
                        >
                          {action.priority}
                        </span>

                        <span className="text-xs text-slate-500">
                          Score CRM{" "}
                          {action.score}/100
                        </span>

                        {action.client.crmSegment && (
                          <span className="text-xs text-slate-500">
                            Segment{" "}
                            {
                              action.client
                                .crmSegment
                            }
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 text-lg font-semibold text-white">
                        {getClientDisplayName(
                          action.client,
                        )}
                      </h3>

                      <p className="mt-2 text-sm text-slate-400">
                        {action.reason}
                      </p>

                      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                        <div className="flex items-start gap-3">
                          <Target className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />

                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-violet-400">
                              Action recommandée
                            </p>

                            <p className="mt-1 text-sm leading-6 text-slate-300">
                              {action.recommendation}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl border border-cyan-500/10 bg-cyan-500/5 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-cyan-400">
                          Message proposé
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          {action.message}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            void copyMessage(
                              action,
                            )
                          }
                          className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 text-xs font-medium text-cyan-300 transition hover:bg-cyan-500/20"
                        >
                          {copiedClientId ===
                          action.client.id ? (
                            <>
                              <Check className="h-4 w-4" />
                              Message copié
                            </>
                          ) : (
                            <>
                              <Clipboard className="h-4 w-4" />
                              Copier le message
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="w-full xl:w-[230px]">
                      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Valeur client
                        </p>

                        <p className="mt-2 text-xl font-bold text-white">
                          {formatCurrency(
                            action.client
                              .totalSpent,
                          )}{" "}
                          €
                        </p>

                        <div className="mt-4 space-y-2 text-xs text-slate-500">
                          <p>
                            Consultations :{" "}
                            <span className="text-slate-300">
                              {action.client
                                .consultationsCount ??
                                0}
                            </span>
                          </p>

                          {action.client
                            .favoriteExpert && (
                            <p>
                              Expert favori :{" "}
                              <span className="text-slate-300">
                                {
                                  action.client
                                    .favoriteExpert
                                }
                              </span>
                            </p>
                          )}

                          {action.daysSinceLastConsultation !==
                            null && (
                            <p>
                              Inactivité :{" "}
                              <span className="text-slate-300">
                                {
                                  action.daysSinceLastConsultation
                                }{" "}
                                jours
                              </span>
                            </p>
                          )}

                          <p>
                            Dernière consultation :{" "}
                            <span className="text-slate-300">
                              {action.client
                                .lastConsultationDate ??
                                "—"}
                            </span>
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/dialotel/campagnes/nouvelle?clientId=${action.client.id}`}
                        className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                      >
                        <Send className="h-4 w-4" />
                        Préparer le SMS
                      </Link>

                      <Link
                        href={`/dialotel/clients/${action.client.id}`}
                        className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 text-sm font-medium text-violet-300 transition hover:bg-violet-500/20"
                      >
                        Client 360°
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ),
            )}

          {filteredActions.length ===
            0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 py-12 text-center">
              <p className="text-sm text-slate-500">
                Aucun client dans ce niveau de priorité.
              </p>
            </div>
          )}
        </div>

        {filteredActions.length >
          20 && (
          <p className="text-center text-xs text-slate-500">
            Affichage des 20 premières actions sur{" "}
            {filteredActions.length}.
          </p>
        )}
      </div>
    </Card>
  );
}