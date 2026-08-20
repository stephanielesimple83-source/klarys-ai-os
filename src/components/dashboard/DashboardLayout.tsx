import KpiGrid from "./KpiGrid";
import DashboardChart from "./DashboardChart";
import CEOCard from "./CEOCard";
import BusinessGoal from "./BusinessGoal";
import RecentActivity from "./RecentActivity";

export default function DashboardContent() {
  return (
    <div className="space-y-8">

      <KpiGrid />

      <div className="grid gap-8 xl:grid-cols-3">

        <div className="xl:col-span-2">
          <DashboardChart />
        </div>

        <CEOCard />

      </div>

      <div className="grid gap-8 lg:grid-cols-2">

        <BusinessGoal />

        <RecentActivity />

      </div>

    </div>
  );
}
