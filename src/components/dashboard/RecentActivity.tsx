import {
  Bell,
  ShoppingBag,
  PhoneCall,
  Globe,
} from "lucide-react";

export default function RecentActivity() {
  const activities = [
    {
      icon: ShoppingBag,
      title: "Nouvelle commande Shopify",
      description: "Pack protéines - 49,90 €",
      time: "Il y a 5 min",
    },
    {
      icon: PhoneCall,
      title: "Consultation terminée",
      description: "Durée : 22 minutes",
      time: "Il y a 18 min",
    },
    {
      icon: Globe,
      title: "Nouvelle réservation",
      description: "Séance Psycho-énergétique",
      time: "Il y a 42 min",
    },
    {
      icon: Bell,
      title: "Objectif quotidien",
      description: "72 % atteint",
      time: "Aujourd'hui",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-6 text-xl font-bold text-white">
        Activité récente
      </h2>

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activity.icon;

          return (
            <div
              key={index}
              className="flex items-start gap-4 rounded-xl border border-slate-800 p-4 transition hover:border-cyan-500/40"
            >
              <div className="rounded-lg bg-cyan-500/10 p-3">
                <Icon className="h-5 w-5 text-cyan-400" />
              </div>

              <div className="flex-1">
                <p className="font-semibold text-white">
                  {activity.title}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  {activity.description}
                </p>
              </div>

              <span className="text-xs text-slate-500">
                {activity.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}