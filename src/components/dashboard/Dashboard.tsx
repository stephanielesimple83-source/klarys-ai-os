import BusinessGoal from "./BusinessGoal";
import BusinessScore from "./BusinessScore";
import CeoAssistant from "@/components/ai/CeoAssistant";
import DashboardChart from "./DashboardChart";
import KpiGrid from "./KpiGrid";
import RecentActivity from "./RecentActivity";

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <section className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Vue d’ensemble
          </h2>

          <p className="mt-2 text-slate-400">
            Suivez les indicateurs essentiels de Klarys Voyance.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-400">
          Objectif mensuel :{" "}
          <span className="font-semibold text-cyan-400">6 000 €</span>
        </div>
      </section>

      <KpiGrid />

      <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <DashboardChart />

        <div className="space-y-6">
          <BusinessScore />
          <CeoAssistant />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <BusinessGoal />
        <RecentActivity />
      </section>
    </div>
  );
}