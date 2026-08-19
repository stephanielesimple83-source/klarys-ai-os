"use client";

import { Bot, Loader2 } from "lucide-react";
import { useCoreEngine } from "@/hooks/useCoreEngine";

export default function CeoAssistant() {
  const { data, loading } = useCoreEngine();

  if (loading || !data) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
          <span>Analyse du CEO AI…</span>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-slate-900 p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-cyan-400 p-3 text-slate-950">
          <Bot className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">CEO AI</h2>
          <p className="text-sm text-cyan-300">
            Business Score : {data.businessScore}/100
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="mb-3 font-semibold text-white">
          Recommandations
        </h3>

        <ul className="space-y-3">
          {data.recommendations.map((item, index) => (
            <li
              key={index}
              className="rounded-xl bg-slate-950/40 p-3 text-sm text-slate-300"
            >
              ✓ {item}
            </li>
          ))}
        </ul>
      </div>

      {data.alerts.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 font-semibold text-amber-400">
            Alertes
          </h3>

          <ul className="space-y-2">
            {data.alerts.map((alert, index) => (
              <li
                key={index}
                className="text-sm text-amber-300"
              >
                • {alert}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 border-t border-slate-800 pt-4 text-xs text-slate-500">
        Dernière analyse :
        <br />
        {new Date(data.generatedAt).toLocaleString("fr-FR")}
      </div>
    </section>
  );
}