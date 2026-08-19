"use client";

import {
  CheckSquare,
  Copy,
  ExternalLink,
  Mail,
  Megaphone,
  MessageSquare,
  Phone,
  Search,
  Square,
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

type Channel =
  | "SMS"
  | "EMAIL"
  | "APPEL";

interface CrmRelanceCenterProps {
  clients:
    DialotelClient[];
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

  return Math.max(
    0,
    Math.floor(
      (
        Date.now() -
        timestamp
      ) /
        (
          1000 *
          60 *
          60 *
          24
        ),
    ),
  );
}

function buildMessage(
  client:
    DialotelClient,
): string {
  const name =
    client.name ||
    client.pseudo ||
    "Bonjour";

  const expert =
    client.favoriteExpert;

  if (expert) {
    return (
      `Bonjour ${name}, ` +
      `nous espérons que vous allez bien. ` +
      `Cela fait quelque temps que nous n'avons pas eu le plaisir de vous retrouver sur Klarys Voyance. ` +
      `${expert}, que vous avez déjà consulté, reste disponible selon son planning. ` +
      `Nous serons ravis de vous accueillir à nouveau lorsque vous le souhaiterez.`
    );
  }

  return (
    `Bonjour ${name}, ` +
    `nous espérons que vous allez bien. ` +
    `Cela fait quelque temps que nous n'avons pas eu le plaisir de vous retrouver sur Klarys Voyance. ` +
    `Nos experts restent disponibles lorsque vous souhaitez reprendre une consultation.`
  );
}

function getSuggestedChannel(
  client:
    DialotelClient,
): Channel {
  if (client.phone) {
    return "SMS";
  }

  if (client.email) {
    return "EMAIL";
  }

  return "APPEL";
}

export default function CrmRelanceCenter({
  clients,
}: CrmRelanceCenterProps) {
  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    selectedIds,
    setSelectedIds,
  ] =
    useState<number[]>(
      [],
    );

  const candidates =
    useMemo(
      () =>
        clients
          .filter(
            (client) => {
              if (
                !client.crmCalculated
              ) {
                return false;
              }

              const days =
                getDaysSince(
                  client.lastConsultationDate,
                );

              if (
                days ===
                null
              ) {
                return false;
              }

              return (
                client.totalSpent >
                  0 &&
                days >= 90
              );
            },
          )
          .sort(
            (a, b) =>
              b.totalSpent -
              a.totalSpent,
          ),
      [
        clients,
      ],
    );

  const filteredCandidates =
    useMemo(
      () => {
        const normalized =
          search
            .trim()
            .toLowerCase();

        if (!normalized) {
          return candidates;
        }

        return candidates.filter(
          (client) =>
            [
              client.name,
              client.pseudo,
              client.email ?? "",
              client.phone ?? "",
              client.favoriteExpert ??
                "",
            ].some(
              (value) =>
                value
                  .toLowerCase()
                  .includes(
                    normalized,
                  ),
            ),
        );
      },
      [
        candidates,
        search,
      ],
    );

  const selectedClients =
    useMemo(
      () =>
        candidates.filter(
          (client) =>
            selectedIds.includes(
              client.id,
            ),
        ),
      [
        candidates,
        selectedIds,
      ],
    );

  /*
   * Pour SMS / Email, on garde
   * seulement les clients disposant
   * d'au moins un moyen de contact.
   */

  const campaignEligibleClients =
    useMemo(
      () =>
        selectedClients.filter(
          (client) =>
            Boolean(
              client.phone ||
                client.email,
            ),
        ),
      [
        selectedClients,
      ],
    );

  const campaignUrl =
    campaignEligibleClients.length >
    0
      ? `/dialotel/campagnes?clients=${campaignEligibleClients
          .map(
            (client) =>
              client.id,
          )
          .join(",")}`
      : "/dialotel/campagnes";

  function toggleClient(
    id: number,
  ) {
    setSelectedIds(
      (current) =>
        current.includes(
          id,
        )
          ? current.filter(
              (
                currentId,
              ) =>
                currentId !==
                id,
            )
          : [
              ...current,
              id,
            ],
    );
  }

  function selectAllVisible() {
    const visibleIds =
      filteredCandidates.map(
        (client) =>
          client.id,
      );

    setSelectedIds(
      (current) =>
        Array.from(
          new Set([
            ...current,
            ...visibleIds,
          ]),
        ),
    );
  }

  function clearSelection() {
    setSelectedIds(
      [],
    );
  }

  async function copyMessage(
    client:
      DialotelClient,
  ) {
    await navigator.clipboard.writeText(
      buildMessage(
        client,
      ),
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-medium text-violet-400">
              CEO AI — Centre de relance
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-white">
              Clients à recontacter
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              {candidates.length} clients ont une activité historique mais aucune consultation depuis au moins 90 jours.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

              <input
                value={
                  search
                }
                onChange={(
                  event,
                ) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Nom, email, téléphone, expert..."
                className="h-11 min-w-[300px] rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 text-sm text-white outline-none focus:border-violet-500"
              />
            </div>

            <button
              type="button"
              onClick={
                selectAllVisible
              }
              className="h-11 rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm text-slate-300 transition hover:border-violet-500/40 hover:text-white"
            >
              Tout sélectionner
            </button>

            <button
              type="button"
              onClick={
                clearSelection
              }
              className="h-11 rounded-xl border border-slate-700 bg-slate-950 px-4 text-sm text-slate-400 transition hover:text-white"
            >
              Effacer
            </button>
          </div>
        </div>
      </Card>

      <Card className="border-violet-500/20 bg-violet-500/5 p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm text-slate-400">
              Sélection actuelle
            </p>

            <p className="mt-1 text-2xl font-semibold text-white">
              {selectedIds.length} client
              {selectedIds.length !==
              1
                ? "s"
                : ""}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {campaignEligibleClients.length} avec téléphone ou email disponibles pour une campagne.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <p className="self-center text-sm text-slate-500">
              Aucun envoi automatique.
            </p>

            <Link
              href={
                campaignUrl
              }
              aria-disabled={
                campaignEligibleClients.length ===
                0
              }
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium transition ${
                campaignEligibleClients.length >
                0
                  ? "bg-violet-600 text-white hover:bg-violet-500"
                  : "pointer-events-none bg-slate-800 text-slate-600"
              }`}
            >
              <Megaphone className="h-4 w-4" />

              Créer une campagne
              {campaignEligibleClients.length >
              0
                ? ` (${campaignEligibleClients.length})`
                : ""}
            </Link>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {filteredCandidates.map(
          (client) => {
            const selected =
              selectedIds.includes(
                client.id,
              );

            const days =
              getDaysSince(
                client.lastConsultationDate,
              );

            const channel =
              getSuggestedChannel(
                client,
              );

            const message =
              buildMessage(
                client,
              );

            return (
              <Card
                key={
                  client.id
                }
                className={`p-5 transition ${
                  selected
                    ? "border-violet-500/40 bg-violet-500/5"
                    : ""
                }`}
              >
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
                  <button
                    type="button"
                    onClick={() =>
                      toggleClient(
                        client.id,
                      )
                    }
                    className="mt-1 shrink-0 text-slate-400 transition hover:text-violet-300"
                  >
                    {selected ? (
                      <CheckSquare className="h-5 w-5 text-violet-400" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">
                        {client.name ||
                          client.pseudo}
                      </h3>

                      <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-400">
                        {client.crmSegment ??
                          "Non classé"}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-3 text-sm text-slate-400 md:grid-cols-2 xl:grid-cols-4">
                      <p>
                        Dépensé :{" "}
                        <strong className="text-white">
                          {formatCurrency(
                            client.totalSpent,
                          )}{" "}
                          €
                        </strong>
                      </p>

                      <p>
                        Consultations :{" "}
                        <strong className="text-white">
                          {client.consultationsCount ??
                            0}
                        </strong>
                      </p>

                      <p>
                        Inactivité :{" "}
                        <strong className="text-white">
                          {days ??
                            "—"}{" "}
                          jours
                        </strong>
                      </p>

                      <p>
                        Expert favori :{" "}
                        <strong className="text-white">
                          {client.favoriteExpert ??
                            "—"}
                        </strong>
                      </p>
                    </div>

                    <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-violet-400">
                        Message proposé
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {message}
                      </p>
                    </div>
                  </div>

                  <div className="w-full xl:w-[230px]">
                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Canal conseillé
                      </p>

                      <div className="mt-3 flex items-center gap-2 text-white">
                        {channel ===
                        "SMS" ? (
                          <MessageSquare className="h-4 w-4 text-cyan-400" />
                        ) : channel ===
                          "EMAIL" ? (
                          <Mail className="h-4 w-4 text-violet-400" />
                        ) : (
                          <Phone className="h-4 w-4 text-amber-400" />
                        )}

                        <span className="font-medium">
                          {channel}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void copyMessage(
                          client,
                        )
                      }
                      className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
                    >
                      <Copy className="h-4 w-4" />
                      Copier le message
                    </button>

                    <Link
                      href={`/dialotel/clients/${client.id}`}
                      className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 text-sm font-medium text-violet-300 transition hover:bg-violet-500/20"
                    >
                      Client 360°
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </Card>
            );
          },
        )}

        {filteredCandidates.length ===
          0 && (
          <Card className="p-10 text-center">
            <p className="text-sm text-slate-500">
              Aucun client ne correspond aux critères de recherche.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}