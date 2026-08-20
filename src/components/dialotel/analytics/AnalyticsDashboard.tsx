import {
  CalendarDays,
  CircleDollarSign,
  PhoneCall,
  Users,
} from "lucide-react";

import DistributionChart from "@/components/dialotel/analytics/DistributionChart";
import ExpertsChart from "@/components/dialotel/analytics/ExpertsChart";
import HourlyChart from "@/components/dialotel/analytics/HourlyChart";
import RevenueChart from "@/components/dialotel/analytics/RevenueChart";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import Section from "@/components/ui/Section";
import StatCard from "@/components/ui/StatCard";
import { getDialotelAnalytics } from "@/services/analytics.service";

function formatCurrency(value: number): string {
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function calculateChange(
  current: number,
  previous: number,
): number | null {
  if (previous === 0) {
    return null;
  }

  return ((current - previous) / previous) * 100;
}

function formatChange(
  value: number | null,
): string {
  if (value === null) {
    return "Comparaison indisponible";
  }

  const sign = value >= 0 ? "+" : "";

  return `${sign}${value.toLocaleString("fr-FR", {
    maximumFractionDigits: 1,
  })} % vs mois prÃ©cÃ©dent`;
}

export default async function AnalyticsDashboard() {
  const analytics = await getDialotelAnalytics();

  const cabinetChange = calculateChange(
    analytics.revenue.month.cabinet,
    analytics.revenue.previousMonth.cabinet,
  );

  const synergyChange = calculateChange(
    analytics.revenue.month.synergy,
    analytics.revenue.previousMonth.synergy,
  );

  const totalChange = calculateChange(
    analytics.revenue.month.total,
    analytics.revenue.previousMonth.total,
  );

  const bestExpert = analytics.experts[0];

  return (
    <div className="mx-auto max-w-[1600px] space-y-10">
      <PageHeader
        badge="Dialotel Analytics"
        title="Centre dâ€™analyse"
        description="Analysez sÃ©parÃ©ment le Cabinet et la Synergie, les performances des experts, le Live et la couverture du planning."
        rightContent={
          <Badge variant="success">
            Analytics connectÃ©s
          </Badge>
        }
      />

      <Section
        title="Chiffre dâ€™affaires"
        subtitle="Le Cabinet et la Synergie restent sÃ©parÃ©s dans toutes les analyses."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Cabinet"
            value={`${formatCurrency(
              analytics.revenue.month.cabinet,
            )} â‚¬`}
            subtitle="Ce mois-ci"
            trend={formatChange(cabinetChange)}
            trendType={
              cabinetChange === null
                ? "neutral"
                : cabinetChange >= 0
                  ? "positive"
                  : "negative"
            }
            icon={CircleDollarSign}
          />

          <StatCard
            title="Synergie"
            value={`${formatCurrency(
              analytics.revenue.month.synergy,
            )} â‚¬`}
            subtitle="Ce mois-ci"
            trend={formatChange(synergyChange)}
            trendType={
              synergyChange === null
                ? "neutral"
                : synergyChange >= 0
                  ? "positive"
                  : "negative"
            }
            icon={CircleDollarSign}
          />

          <StatCard
            title="Total"
            value={`${formatCurrency(
              analytics.revenue.month.total,
            )} â‚¬`}
            subtitle="Cabinet + Synergie"
            trend={formatChange(totalChange)}
            trendType={
              totalChange === null
                ? "neutral"
                : totalChange >= 0
                  ? "positive"
                  : "negative"
            }
            icon={CircleDollarSign}
          />

          <StatCard
            title="CA aujourdâ€™hui"
            value={`${formatCurrency(
              analytics.revenue.today.total,
            )} â‚¬`}
            subtitle={`Cabinet ${formatCurrency(
              analytics.revenue.today.cabinet,
            )} â‚¬ â€¢ Synergie ${formatCurrency(
              analytics.revenue.today.synergy,
            )} â‚¬`}
            icon={CircleDollarSign}
          />
        </div>
      </Section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <RevenueChart
          history={analytics.revenue.history}
        />

        <DistributionChart
          cabinetRevenue={
            analytics.distribution.cabinetRevenue
          }
          synergyRevenue={
            analytics.distribution.synergyRevenue
          }
          cabinetPercent={
            analytics.distribution.cabinetPercent
          }
          synergyPercent={
            analytics.distribution.synergyPercent
          }
        />
      </section>

      <Section
        title="Performance opÃ©rationnelle"
        subtitle="Experts, activitÃ© Live et couverture du planning."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Experts planifiÃ©s"
            value={
              analytics.planning.expertsScheduled
            }
            subtitle="Planning du jour"
            icon={Users}
          />

          <StatCard
            title="En service"
            value={
              analytics.planning.currentlyScheduled
            }
            subtitle="Actuellement planifiÃ©s"
            icon={CalendarDays}
          />

          <StatCard
            title="Consultations Live"
            value={analytics.live.currentCalls}
            subtitle="En cours maintenant"
            icon={PhoneCall}
          />

          <StatCard
            title="Appels manquÃ©s"
            value={analytics.live.missedCalls}
            subtitle="ActivitÃ© Live"
            icon={PhoneCall}
          />
        </div>
      </Section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ExpertsChart
          experts={analytics.experts}
        />

        <HourlyChart
          hourly={analytics.hourly}
        />
      </section>

      <Card className="border-cyan-500/20 bg-cyan-500/5 p-6">
        <p className="text-sm font-medium text-cyan-400">
          Analyse CEO AI
        </p>

        <h2 className="mt-2 text-xl font-semibold text-white">
          SynthÃ¨se de lâ€™activitÃ©
        </h2>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Cabinet
            </p>

            <p className="mt-2 text-lg font-semibold text-white">
              {analytics.distribution.cabinetPercent.toLocaleString(
                "fr-FR",
                {
                  maximumFractionDigits: 1,
                },
              )}
              % du CA
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Synergie
            </p>

            <p className="mt-2 text-lg font-semibold text-white">
              {analytics.distribution.synergyPercent.toLocaleString(
                "fr-FR",
                {
                  maximumFractionDigits: 1,
                },
              )}
              % du CA
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Top expert
            </p>

            <p className="mt-2 text-lg font-semibold text-white">
              {bestExpert
                ? bestExpert.name
                : "Non disponible"}
            </p>

            {bestExpert && (
              <p className="mt-1 text-xs text-cyan-400">
                {formatCurrency(
                  bestExpert.revenue,
                )}{" "}
                â‚¬
              </p>
            )}
          </div>
        </div>

        <p className="mt-5 text-sm leading-6 text-slate-400">
          Les graphiques historiques et horaires apparaÃ®tront
          uniquement lorsque des donnÃ©es Dialotel fiables seront
          disponibles. Aucun chiffre artificiel nâ€™est gÃ©nÃ©rÃ©.
        </p>
      </Card>
    </div>
  );
}
