import { ArrowUpRight, Bot, CheckCircle2 } from "lucide-react";

const priorities = [
  "Publier un TikTok avant 18 h",
  "Vérifier les statistiques Dialotel",
  "Renforcer la présence des experts entre 20 h et 22 h",
];

export default function CEOCard() {
  return (
    <section className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-slate-900 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-cyan-400 p-3 text-slate-950">
            <Bot className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm text-cyan-300">CEO AI</p>
            <h2 className="text-lg font-semibold text-white">
              Priorités du jour
            </h2>
          </div>
        </div>

        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
          Actif
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {priorities.map((priority) => (
          <div
            key={priority}
            className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-3"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />

            <p className="text-sm leading-6 text-slate-300">{priority}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-end justify-between rounded-xl bg-cyan-500/10 p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-cyan-300">
            Impact estimé
          </p>

          <p className="mt-1 text-3xl font-bold text-white">+420 €</p>
        </div>

        <ArrowUpRight className="h-6 w-6 text-cyan-400" />
      </div>
    </section>
  );
}