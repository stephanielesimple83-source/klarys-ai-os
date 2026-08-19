import type { Expert } from "@/types/dialotel";

interface Props {
  experts: Expert[];
}

const statusColors = {
  online: "bg-emerald-500 text-white",
  busy: "bg-amber-500 text-white",
  offline: "bg-red-500 text-white",
  unknown: "bg-slate-500 text-white",
};

export default function ExpertsTable({ experts }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 p-6">
        <h2 className="text-xl font-bold text-white">
          Experts Dialotel
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          {experts.length} experts récupérés depuis Dialotel
        </p>
      </div>

      <div className="divide-y divide-slate-800">
        {experts.map((expert) => (
          <div
            key={expert.id}
            className="flex items-center justify-between gap-4 p-5 transition hover:bg-slate-800/40"
          >
            <div className="flex min-w-0 items-center gap-4">
              {expert.avatar ? (
                <img
                  src={expert.avatar}
                  alt={expert.name}
                  width={56}
                  height={56}
                  className="h-14 w-14 shrink-0 rounded-full border border-slate-700 object-cover"
                />
              ) : (
                <div className="h-14 w-14 shrink-0 rounded-full bg-slate-700" />
              )}

              <div className="min-w-0">
                <h3 className="truncate font-semibold text-white">
                  {expert.name}
                </h3>

                <p className="text-sm text-slate-400">
                  Code : {expert.code}
                </p>
              </div>
            </div>

            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                statusColors[expert.status]
              }`}
            >
              {expert.statusLabel}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}