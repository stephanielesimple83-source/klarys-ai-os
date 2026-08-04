import {
  Bot,
  Globe2,
  LayoutDashboard,
  Megaphone,
  PhoneCall,
  Settings,
} from "lucide-react";

const navigation = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    active: true,
  },
  {
    label: "Dialotel",
    icon: PhoneCall,
    active: false,
  },
  {
    label: "Wix",
    icon: Globe2,
    active: false,
  },
  {
    label: "Réseaux sociaux",
    icon: Megaphone,
    active: false,
  },
  {
    label: "CEO AI",
    icon: Bot,
    active: false,
  },
];

export default function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-slate-800 bg-slate-950 lg:flex lg:flex-col">
      <div className="border-b border-slate-800 px-6 py-6">
        <p className="text-lg font-bold tracking-wide text-cyan-400">
          KLARYS AI OS
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Centre de pilotage intelligent
        </p>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                item.active
                  ? "bg-cyan-400 text-slate-950"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
        >
          <Settings className="h-5 w-5" />
          <span>Paramètres</span>
        </button>
      </div>
    </aside>
  );
}