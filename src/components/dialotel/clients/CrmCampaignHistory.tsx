"use client";

import {
  Clock,
  Mail,
  MessageSquare,
  RefreshCcw,
  Trash2,
  Users,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Card from "@/components/ui/Card";

import {
  deleteCampaign,
  getCampaigns,
} from "@/services/campaigns.service";

import type {
  DialotelCampaign,
} from "@/services/campaigns.service";

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

function formatDate(
  value: string,
): string {
  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    "fr-FR",
    {
      dateStyle:
        "short",

      timeStyle:
        "short",
    },
  );
}

function statusClasses(
  status:
    DialotelCampaign["status"],
): string {
  switch (status) {
    case "BROUILLON":
      return "border-slate-600 bg-slate-800 text-slate-300";

    case "PRETE":
      return "border-amber-500/30 bg-amber-500/10 text-amber-300";

    case "ENVOYEE":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }
}

export default function CrmCampaignHistory() {
  const [
    campaigns,
    setCampaigns,
  ] =
    useState<
      DialotelCampaign[]
    >(
      [],
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const loadCampaigns =
    useCallback(
      async () => {
        setLoading(
          true,
        );

        setError(
          null,
        );

        try {
          const result =
            await getCampaigns();

          setCampaigns(
            result.campaigns,
          );
        } catch (
          loadError
        ) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Impossible de charger les campagnes.",
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [],
    );

  useEffect(
    () => {
      void loadCampaigns();
    },
    [
      loadCampaigns,
    ],
  );

  async function handleDelete(
    id: string,
  ) {
    try {
      await deleteCampaign(
        id,
      );

      setCampaigns(
        (current) =>
          current.filter(
            (campaign) =>
              campaign.id !==
              id,
          ),
      );
    } catch (
      deleteError
    ) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Impossible de supprimer la campagne.",
      );
    }
  }

  const totalRecipients =
    campaigns.reduce(
      (
        total,
        campaign,
      ) =>
        total +
        campaign.recipientsCount,
      0,
    );

  const totalValue =
    campaigns.reduce(
      (
        total,
        campaign,
      ) =>
        total +
        campaign.historicalValue,
      0,
    );

  return (
    <div className="space-y-6">
      <Card className="border-violet-500/20 bg-violet-500/5 p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-violet-400">
              CEO AI — Historique
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-white">
              Journal des campagnes
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              Historique persistant des campagnes commerciales enregistrées dans l&apos;API Klarys AI.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void loadCampaigns()
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 text-sm text-slate-300 transition hover:text-white"
          >
            <RefreshCcw className="h-4 w-4" />

            Actualiser
          </button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Campagnes
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {campaigns.length}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 text-slate-500">
            <Users className="h-4 w-4" />

            <p className="text-xs uppercase tracking-wide">
              Destinataires
            </p>
          </div>

          <p className="mt-2 text-2xl font-bold text-white">
            {totalRecipients}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Valeur historique ciblée
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {formatCurrency(
              totalValue,
            )}{" "}
            €
          </p>
        </Card>
      </div>

      {error && (
        <Card className="border-rose-500/20 bg-rose-500/5 p-5">
          <p className="text-sm text-rose-300">
            {error}
          </p>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white">
          Campagnes enregistrées
        </h2>

        {loading ? (
          <div className="py-14 text-center">
            <RefreshCcw className="mx-auto h-7 w-7 animate-spin text-violet-400" />

            <p className="mt-4 text-sm text-slate-500">
              Chargement des campagnes...
            </p>
          </div>
        ) : campaigns.length ===
          0 ? (
          <div className="py-14 text-center">
            <Clock className="mx-auto h-8 w-8 text-slate-700" />

            <p className="mt-4 text-sm text-slate-500">
              Aucune campagne enregistrée pour le moment.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {campaigns.map(
              (campaign) => (
                <div
                  key={
                    campaign.id
                  }
                  className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5"
                >
                  <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-semibold text-white">
                          {campaign.name}
                        </h3>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${statusClasses(
                            campaign.status,
                          )}`}
                        >
                          {campaign.status}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />

                          {formatDate(
                            campaign.createdAt,
                          )}
                        </span>

                        <span className="flex items-center gap-1">
                          {campaign.channel ===
                          "SMS" ? (
                            <MessageSquare className="h-3.5 w-3.5" />
                          ) : (
                            <Mail className="h-3.5 w-3.5" />
                          )}

                          {campaign.channel}
                        </span>

                        <span>
                          {campaign.recipientsCount} destinataire
                          {campaign.recipientsCount !==
                          1
                            ? "s"
                            : ""}
                        </span>

                        <span>
                          {formatCurrency(
                            campaign.historicalValue,
                          )}{" "}
                          €
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void handleDelete(
                          campaign.id,
                        )
                      }
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 text-xs text-rose-300 transition hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-4 w-4" />

                      Supprimer
                    </button>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </Card>
    </div>
  );
}