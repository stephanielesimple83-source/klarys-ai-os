"use client";

import {
  Crown,
  ExternalLink,
  Mail,
  Phone,
  Search,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import {
  useMemo,
  useState,
} from "react";

import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";

import type {
  CrmSegment,
  DialotelClient,
} from "@/services/clients.service";

interface ClientsDashboardProps {
  clients: DialotelClient[];
  totalClients: number;
  crmCalculatedClients: number;
}

type SegmentFilter =
  | "ALL"
  | CrmSegment
  | "NON_CALCULE";

type SortMode =
  | "spent"
  | "score"
  | "name"
  | "recent";

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
      return "RÃ©gulier";

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

function getDateSortValue(
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

export default function ClientsDashboard({
  clients,
  totalClients,
  crmCalculatedClients,
}: ClientsDashboardProps) {
  const [search, setSearch] =
    useState("");

  const [
    segmentFilter,
    setSegmentFilter,
  ] =
    useState<SegmentFilter>(
      "ALL",
    );

  const [sort, setSort] =
    useState<SortMode>(
      "spent",
    );

  const filteredClients =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      const result =
        clients.filter(
          (client) => {
            const matchesSearch =
              !normalizedSearch ||
              [
                client.name,
                client.pseudo,
                client.email ?? "",
                client.phone ?? "",
                client.code ?? "",
                client.favoriteExpert ?? "",
              ].some(
                (value) =>
                  value
                    .toLowerCase()
                    .includes(
                      normalizedSearch,
                    ),
              );

            if (
              !matchesSearch
            ) {
              return false;
            }

            if (
              segmentFilter ===
              "ALL"
            ) {
              return true;
            }

            if (
              segmentFilter ===
              "NON_CALCULE"
            ) {
              return (
                !client.crmCalculated
              );
            }

            return (
              client.crmSegment ===
              segmentFilter
            );
          },
        );

      return [
        ...result,
      ].sort(
        (a, b) => {
          if (
            sort ===
            "spent"
          ) {
            return (
              b.totalSpent -
              a.totalSpent
            );
          }

          if (
            sort ===
            "score"
          ) {
            return (
              (b.crmScore ?? -1) -
              (a.crmScore ?? -1)
            );
          }

          if (
            sort ===
            "name"
          ) {
            return (
              a.name ||
              a.pseudo
            ).localeCompare(
              b.name ||
                b.pseudo,
              "fr",
            );
          }

          return (
            getDateSortValue(
              b.lastConsultationDate,
            ) -
            getDateSortValue(
              a.lastConsultationDate,
            )
          );
        },
      );
    }, [
      clients,
      search,
      segmentFilter,
      sort,
    ]);

  const totalSpent =
    clients.reduce(
      (
        total,
        client,
      ) =>
        total +
        client.totalSpent,
      0,
    );

  const averageSpent =
    clients.length > 0
      ? totalSpent /
        clients.length
      : 0;

  const crmClients =
    clients.filter(
      (client) =>
        client.crmCalculated,
    );

  const vipClients =
    crmClients.filter(
      (client) =>
        client.crmSegment ===
        "VIP",
    );

  const bestClient =
    [...clients].sort(
      (a, b) =>
        b.totalSpent -
        a.totalSpent,
    )[0];

  return (
    <div className="mx-auto max-w-[1700px] space-y-10">
      <PageHeader
        badge="CRM Intelligence"
        title="Clients"
        description="Analysez votre fichier Dialotel, vos segments CRM et les fiches Client 360Â°."
        rightContent={
          <Badge variant="success">
            {crmCalculatedClients} CRM calculÃ©
            {crmCalculatedClients > 1
              ? "s"
              : ""}
          </Badge>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Clients"
          value={totalClients}
          subtitle="Fichier Dialotel"
          icon={Users}
        />

        <StatCard
          title="CRM analysÃ©s"
          value={crmCalculatedClients}
          subtitle={`${Math.round(
            totalClients > 0
              ? (
                  crmCalculatedClients /
                  totalClients
                ) *
                  100
              : 0,
          )} % du fichier`}
          icon={Sparkles}
        />

        <StatCard
          title="VIP"
          value={vipClients.length}
          subtitle="Clients haute valeur"
          icon={Crown}
        />

        <StatCard
          title="CA clients"
          value={`${formatCurrency(
            totalSpent,
          )} â‚¬`}
          subtitle="DÃ©penses cumulÃ©es"
          icon={WalletCards}
        />

        <StatCard
          title="DÃ©pense moyenne"
          value={`${formatCurrency(
            averageSpent,
          )} â‚¬`}
          subtitle="Par client"
          icon={WalletCards}
        />
      </section>

      {bestClient && (
        <Card className="border-cyan-500/20 bg-cyan-500/5 p-6">
          <p className="text-sm font-medium text-cyan-400">
            CEO AI â€” Client Ã  forte valeur
          </p>

          <div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {bestClient.name ||
                  bestClient.pseudo}
              </h2>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                {bestClient.crmSegment ? (
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${getSegmentClasses(
                      bestClient.crmSegment,
                    )}`}
                  >
                    {getSegmentLabel(
                      bestClient.crmSegment,
                    )}
                  </span>
                ) : (
                  <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-400">
                    CRM non calculÃ©
                  </span>
                )}

                {bestClient.crmScore !==
                  null && (
                  <span className="text-sm text-slate-400">
                    Score{" "}
                    <strong className="text-white">
                      {bestClient.crmScore}
                      /100
                    </strong>
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <p className="text-3xl font-bold text-cyan-400">
                {formatCurrency(
                  bestClient.totalSpent,
                )}{" "}
                â‚¬
              </p>

              <Link
                href={`/dialotel/clients/${bestClient.id}`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
              >
                Client 360Â°
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Fichier clients
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {filteredClients.length} rÃ©sultat
              {filteredClients.length > 1
                ? "s"
                : ""}
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

              <input
                value={search}
                onChange={(
                  event,
                ) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Nom, pseudo, email, tÃ©lÃ©phone, expert..."
                className="h-11 min-w-[300px] rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 text-sm text-white outline-none transition focus:border-cyan-500"
              />
            </div>

            <select
              value={
                segmentFilter
              }
              onChange={(
                event,
              ) =>
                setSegmentFilter(
                  event.target
                    .value as SegmentFilter,
                )
              }
              className="h-11 rounded-xl border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none focus:border-cyan-500"
            >
              <option value="ALL">
                Tous les segments
              </option>

              <option value="VIP">
                ðŸ‘‘ VIP
              </option>

              <option value="PREMIUM">
                Premium
              </option>

              <option value="REGULIER">
                RÃ©gulier
              </option>

              <option value="OCCASIONNEL">
                Occasionnel
              </option>

              <option value="INACTIF">
                Inactif
              </option>

              <option value="NON_CALCULE">
                CRM non calculÃ©
              </option>
            </select>

            <select
              value={sort}
              onChange={(
                event,
              ) =>
                setSort(
                  event.target
                    .value as SortMode,
                )
              }
              className="h-11 rounded-xl border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none focus:border-cyan-500"
            >
              <option value="spent">
                DÃ©penses
              </option>

              <option value="score">
                Score CRM
              </option>

              <option value="recent">
                DerniÃ¨re consultation
              </option>

              <option value="name">
                Nom A â†’ Z
              </option>
            </select>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[1450px]">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-4">
                  Client
                </th>

                <th className="px-3 py-4">
                  CRM
                </th>

                <th className="px-3 py-4">
                  Contact
                </th>

                <th className="px-3 py-4">
                  Expert favori
                </th>

                <th className="px-3 py-4">
                  DerniÃ¨re consultation
                </th>

                <th className="px-3 py-4">
                  Consultations
                </th>

                <th className="px-3 py-4">
                  DÃ©pensÃ©
                </th>

                <th className="px-3 py-4 text-right">
                  Fiche
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredClients.map(
                (client) => (
                  <tr
                    key={client.id}
                    className="border-b border-slate-800/70 transition hover:bg-slate-800/30"
                  >
                    <td className="px-3 py-4">
                      <Link
                        href={`/dialotel/clients/${client.id}`}
                        className="group block"
                      >
                        <p className="font-medium text-white transition group-hover:text-cyan-300">
                          {client.name ||
                            client.pseudo ||
                            `Client ${client.id}`}
                        </p>

                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <span>
                            #{client.id}
                          </span>

                          {client.code && (
                            <>
                              <span>
                                â€¢
                              </span>

                              <span>
                                Code{" "}
                                {client.code}
                              </span>
                            </>
                          )}
                        </div>
                      </Link>
                    </td>

                    <td className="px-3 py-4">
                      {client.crmSegment ? (
                        <div className="space-y-2">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getSegmentClasses(
                              client.crmSegment,
                            )}`}
                          >
                            {getSegmentLabel(
                              client.crmSegment,
                            )}
                          </span>

                          <p className="text-xs text-slate-500">
                            Score{" "}
                            <span className="font-medium text-white">
                              {client.crmScore ??
                                0}
                              /100
                            </span>
                          </p>
                        </div>
                      ) : (
                        <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-500">
                          Non calculÃ©
                        </span>
                      )}
                    </td>

                    <td className="px-3 py-4">
                      <div className="space-y-2 text-sm">
                        {client.email && (
                          <div className="flex items-center gap-2 text-slate-300">
                            <Mail className="h-4 w-4 text-slate-500" />

                            <span className="max-w-[220px] truncate">
                              {client.email}
                            </span>
                          </div>
                        )}

                        {client.phone && (
                          <div className="flex items-center gap-2 text-slate-300">
                            <Phone className="h-4 w-4 text-slate-500" />

                            <span>
                              {client.phone}
                            </span>
                          </div>
                        )}

                        {!client.email &&
                          !client.phone && (
                            <span className="text-slate-600">
                              â€”
                            </span>
                          )}
                      </div>
                    </td>

                    <td className="px-3 py-4">
                      {client.favoriteExpert ? (
                        <div>
                          <p className="font-medium text-white">
                            {client.favoriteExpert}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Expert le plus consultÃ©
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-600">
                          â€”
                        </span>
                      )}
                    </td>

                    <td className="px-3 py-4 text-sm text-slate-300">
                      {client.lastConsultationDate ??
                        "â€”"}
                    </td>

                    <td className="px-3 py-4">
                      {client.consultationsCount !==
                      null ? (
                        <span className="font-medium text-white">
                          {client.consultationsCount}
                        </span>
                      ) : (
                        <span className="text-slate-600">
                          â€”
                        </span>
                      )}
                    </td>

                    <td className="px-3 py-4">
                      <span className="font-semibold text-cyan-400">
                        {formatCurrency(
                          client.totalSpent,
                        )}{" "}
                        â‚¬
                      </span>
                    </td>

                    <td className="px-3 py-4 text-right">
                      <Link
                        href={`/dialotel/clients/${client.id}`}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs font-medium text-slate-300 transition hover:border-cyan-500/50 hover:text-cyan-300"
                      >
                        Voir
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>

          {filteredClients.length ===
            0 && (
            <div className="py-16 text-center">
              <p className="text-sm text-slate-500">
                Aucun client ne correspond Ã  ces critÃ¨res.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
