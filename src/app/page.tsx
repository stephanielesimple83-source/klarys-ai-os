import { AppShellLayout } from "@/components/layout/app-shell-layout";
import KpiGrid from "@/components/dashboard/KpiGrid";

export default function Home() {
  return (
    <AppShellLayout>
      <section>
        <h1 className="text-3xl font-bold text-white">
          Tableau de bord Klarys AI OS
        </h1>

        <p className="mt-3 text-slate-400">
          Bienvenue dans votre centre de pilotage intelligent.
        </p>

        <div className="mt-10">
          <KpiGrid />
        </div>
      </section>
    </AppShellLayout>
  );
}