export default function BusinessScore() {
  const score = 91;

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">Business Score</p>

          <h2 className="mt-2 text-5xl font-bold text-cyan-400">
            {score}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Excellente dynamique
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs uppercase text-slate-500">
            Santé globale
          </p>

          <p className="mt-2 font-semibold text-emerald-400">
            +4 cette semaine
          </p>
        </div>
      </div>

      <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-cyan-400"
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="mt-3 flex justify-between text-xs text-slate-500">
        <span>0</span>
        <span>100</span>
      </div>
    </section>
  );
}