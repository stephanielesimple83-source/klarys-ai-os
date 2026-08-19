interface PlanningSlot {
  id: number;
  start: string;
  end: string;
}

interface PlanningExpert {
  id: number;
  name: string;
  color: string;
  plannedMinutes: number;
  plannedHours: number;
  currentlyScheduled: boolean;
  slots: PlanningSlot[];
}

interface PlanningTimelineProps {
  experts: PlanningExpert[];
  date: string;
}

const START_HOUR = 0;
const END_HOUR = 24;

function getMinutesFromStartOfDay(value: string): number {
  const time = value.split(" ")[1];

  if (!time) {
    return 0;
  }

  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

function calculatePosition(value: string): number {
  const minutes = getMinutesFromStartOfDay(value);
  const totalMinutes = (END_HOUR - START_HOUR) * 60;

  return (minutes / totalMinutes) * 100;
}

function calculateWidth(
  start: string,
  end: string,
  selectedDate: string,
): number {
  const startDate = start.split(" ")[0];
  const endDate = end.split(" ")[0];

  let startMinutes =
    startDate < selectedDate
      ? 0
      : getMinutesFromStartOfDay(start);

  let endMinutes =
    endDate > selectedDate
      ? 24 * 60
      : getMinutesFromStartOfDay(end);

  if (endMinutes === 0 && endDate > startDate) {
    endMinutes = 24 * 60;
  }

  startMinutes = Math.max(0, startMinutes);
  endMinutes = Math.min(24 * 60, endMinutes);

  const duration = Math.max(0, endMinutes - startMinutes);

  return (duration / (24 * 60)) * 100;
}

function formatTime(value: string): string {
  const time = value.split(" ")[1];

  return time?.slice(0, 5) ?? "";
}

export default function PlanningTimeline({
  experts,
  date,
}: PlanningTimelineProps) {
  const hours = Array.from(
    { length: 13 },
    (_, index) => index * 2,
  );

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <div>
        <p className="text-sm font-medium text-cyan-400">
          Timeline
        </p>

        <h2 className="mt-2 text-xl font-semibold text-white">
          Planning des experts
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Vue chronologique des disponibilités du jour.
        </p>
      </div>

      <div className="mt-7 overflow-x-auto">
        <div className="min-w-[1000px]">
          <div className="grid grid-cols-[180px_1fr] gap-4 border-b border-slate-800 pb-3">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Expert
            </div>

            <div className="relative h-6">
              {hours.map((hour) => {
                const left = (hour / 24) * 100;

                return (
                  <span
                    key={hour}
                    className="absolute -translate-x-1/2 text-xs text-slate-500"
                    style={{
                      left: `${left}%`,
                    }}
                  >
                    {String(hour).padStart(2, "0")}h
                  </span>
                );
              })}
            </div>
          </div>

          <div className="divide-y divide-slate-800/80">
            {experts.map((expert) => (
              <div
                key={expert.id}
                className="grid grid-cols-[180px_1fr] gap-4 py-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        expert.currentlyScheduled
                          ? "bg-emerald-400"
                          : "bg-slate-600"
                      }`}
                    />

                    <p className="truncate font-medium text-white">
                      {expert.name}
                    </p>
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    {expert.plannedHours.toLocaleString("fr-FR", {
                      maximumFractionDigits: 2,
                    })}{" "}
                    h planifiées
                  </p>
                </div>

                <div className="relative h-12 overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
                  {hours.map((hour) => {
                    const left = (hour / 24) * 100;

                    return (
                      <div
                        key={hour}
                        className="absolute inset-y-0 border-l border-slate-800/70"
                        style={{
                          left: `${left}%`,
                        }}
                      />
                    );
                  })}

                  {expert.slots.map((slot) => {
                    const slotStartDate = slot.start.split(" ")[0];

                    const left =
                      slotStartDate < date
                        ? 0
                        : calculatePosition(slot.start);

                    const width = calculateWidth(
                      slot.start,
                      slot.end,
                      date,
                    );

                    return (
                      <div
                        key={slot.id}
                        className={`absolute top-1/2 h-7 -translate-y-1/2 rounded-lg border px-2 text-[11px] font-medium shadow-sm ${
                          expert.currentlyScheduled
                            ? "border-emerald-400/30 bg-emerald-500/20 text-emerald-200"
                            : "border-cyan-400/20 bg-cyan-500/15 text-cyan-200"
                        }`}
                        style={{
                          left: `${left}%`,
                          width: `${Math.max(width, 1.5)}%`,
                        }}
                        title={`${expert.name} : ${formatTime(
                          slot.start,
                        )} → ${formatTime(slot.end)}`}
                      >
                        <span className="block truncate leading-7">
                          {formatTime(slot.start)} →{" "}
                          {formatTime(slot.end)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {experts.length === 0 && (
              <div className="py-10 text-center text-sm text-slate-500">
                Aucun expert planifié pour cette journée.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}