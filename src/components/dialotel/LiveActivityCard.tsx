import {
  AlertTriangle,
  Clock3,
  PhoneCall,
  Radio,
} from "lucide-react";

import type { DialotelLiveData } from "@/types/dialotel";

interface LiveActivityCardProps {
  live: DialotelLiveData;
}

function formatAmount(
  amount: number | null,
  label: string,
): string {
  if (amount === null) {
    return label || "—";
  }

  return `${amount.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
}

export default function LiveActivityCard({
  live,
}: LiveActivityCardProps) {
  const latestCall = live.lastCalls[0];
  const latestMissed = live.missedCalls[0];

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
              <Radio className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-medium text-cyan-400">
                Activité en direct
              </p>

              <h2 className="text-xl font-semibold text-white">
                Consultations Dialotel
              </h2>
            </div>
          </div>
        </div>

        <div
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            live.currentCallsCount > 0
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-slate-800 text-slate-400"
          }`}
        >
          {live.currentCallsCount} consultation
          {live.currentCallsCount > 1 ? "s" : ""} en cours
        </div>
      </div>

      {live.currentCalls.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {live.currentCalls.map((call) => (
            <article
              key={call.id}
              className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5"
            >
              <div className="flex items-center gap-2 text-emerald-400">
                <PhoneCall className="h-4 w-4" />

                <span className="text-sm font-medium">
                  Consultation en cours
                </span>
              </div>

              <p className="mt-4 text-lg font-semibold text-white">
                {call.expert || "Expert"}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Client : {call.client || "Non renseigné"}
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">
                  {call.type || "Consultation"}
                </span>

                <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">
                  {call.minutes || "0 min"}
                </span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
          <p className="text-sm text-slate-400">
            Aucune consultation n'est actuellement en cours.
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-cyan-400" />

            <p className="text-sm font-medium text-white">
              Dernière consultation
            </p>
          </div>

          {latestCall ? (
            <>
              <p className="mt-4 text-lg font-semibold text-white">
                {latestCall.expert}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Client :{" "}
                {latestCall.client || "Non renseigné"}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500">Heure</p>
                  <p className="mt-1 text-white">
                    {latestCall.time}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Durée</p>
                  <p className="mt-1 text-white">
                    {latestCall.duration}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Type</p>
                  <p className="mt-1 text-white">
                    {latestCall.type}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Montant</p>
                  <p className="mt-1 font-semibold text-cyan-400">
                    {formatAmount(
                      latestCall.amount,
                      latestCall.amountLabel,
                    )}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              Aucune consultation récente.
            </p>
          )}
        </article>

        <article className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />

            <p className="text-sm font-medium text-amber-400">
              Dernier appel manqué
            </p>
          </div>

          {latestMissed ? (
            <>
              <p className="mt-4 text-lg font-semibold text-white">
                {latestMissed.expert}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {latestMissed.time} • {latestMissed.type}
              </p>

              <p className="mt-4 text-sm text-slate-400">
                Manqué par :{" "}
                <span className="font-medium text-white">
                  {latestMissed.missedBy || "Non renseigné"}
                </span>
              </p>
            </>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              Aucun appel manqué récent.
            </p>
          )}
        </article>
      </div>
    </section>
  );
}