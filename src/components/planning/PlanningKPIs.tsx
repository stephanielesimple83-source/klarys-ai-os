interface PlanningKPIsProps {
  expertsScheduled: number;
  currentlyScheduled: number;
  plannedHours: number;
  nextChange: string;
}

export default function PlanningKPIs({
  expertsScheduled,
  currentlyScheduled,
  plannedHours,
  nextChange,
}: PlanningKPIsProps) {
  const cards = [
    {
      label: "Experts prévus",
      value: expertsScheduled,
    },
    {
      label: "En service",
      value: currentlyScheduled,
    },
    {
      label: "Heures planifiées",
      value: plannedHours,
    },
    {
      label: "Prochain changement",
      value: nextChange,
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
        >
          <p className="text-sm text-slate-400">
            {card.label}
          </p>

          <p className="mt-3 text-3xl font-bold text-white">
            {card.value}
          </p>
        </article>
      ))}
    </section>
  );
}