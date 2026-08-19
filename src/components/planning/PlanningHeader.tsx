interface PlanningHeaderProps {
  date: string;
}

export default function PlanningHeader({
  date,
}: PlanningHeaderProps) {
  return (
    <section className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
      <div>
        <p className="text-sm font-medium text-cyan-400">
          Module Dialotel
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
          Planning Intelligence
        </h1>

        <p className="mt-2 max-w-3xl text-slate-400">
          Analyse en temps réel des horaires, des experts et de la couverture du planning.
        </p>
      </div>

      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-4">
        <p className="text-xs uppercase tracking-wider text-cyan-300">
          Planning
        </p>

        <p className="mt-1 text-lg font-semibold text-white">
          {date}
        </p>
      </div>
    </section>
  );
}