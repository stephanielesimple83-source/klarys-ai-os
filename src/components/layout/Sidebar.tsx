"use client";

import {
  Bot,
  Globe2,
  LayoutDashboard,
  Megaphone,
  PhoneCall,
  Settings,
} from "lucide-react";

import { usePathname } from "next/navigation";

const navigation = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    label: "Dialotel",
    icon: PhoneCall,
    href: "/dialotel/crm",
  },
  {
    label: "Wix",
    icon: Globe2,
    href: "/wix",
  },
  {
    label: "Réseaux sociaux",
    icon: Megaphone,
    href: "/social",
  },
  {
    label: "CEO AI",
    icon: Bot,
    href: "/ceo-ai",
  },
];

export default function Sidebar() {
  const pathname =
    usePathname();

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
          const Icon =
            item.icon;

          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(
                  item.href,
                );

          return (
            <a
              key={item.label}
              href={item.href}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                active
                  ? "bg-cyan-400 text-slate-950"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />

              <span>
                {item.label}
              </span>
            </a>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <a
          href="/settings"
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
        >
          <Settings className="h-5 w-5" />

          <span>
            Paramètres
          </span>
        </a>
      </div>
    </aside>
  );
}