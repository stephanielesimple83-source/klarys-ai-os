import {
  CircleDollarSign,
  PhoneCall,
  Target,
  Users,
} from "lucide-react";

import KpiCard from "./KpiCard";

export default function KpiGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        title="Chiffre d’affaires"
        value="286 €"
        subtitle="Aujourd’hui"
        trend="+18 %"
        icon={CircleDollarSign}
      />

      <KpiCard
        title="Consultations"
        value="34"
        subtitle="Privé et Audiotel"
        trend="+6"
        icon={PhoneCall}
      />

      <KpiCard
        title="Experts connectés"
        value="12"
        subtitle="Équipe et synergies"
        icon={Users}
      />

      <KpiCard
        title="Objectif mensuel"
        value="38 %"
        subtitle="2 286 € sur 6 000 €"
        icon={Target}
      />
    </div>
  );
}