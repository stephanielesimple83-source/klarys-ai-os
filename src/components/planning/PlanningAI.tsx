"use client";

import {
  BarChart3,
  BrainCircuit,
  CalendarDays,
  LayoutDashboard,
  PhoneCall,
  Users,
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
}

const dialotelItems: NavItem[] = [
  {
    label: "Vue Dialotel",
    href: "/dialotel",
    icon: PhoneCall,
  },
  {
    label: "Analytics",
    href: "/dialotel/analytics",
    icon: BarChart3,
  },
  {
    label: "Planning",
    href: "/dialotel/planning",
    icon: CalendarDays,
  },
  {
    label: "Clients",
    href: "/dialotel/clients",
    icon: Users,
  },
  {
    label: "CRM Intelligence",
    href: "/dialotel/crm",
    icon: BrainCircuit,
  },
];

export default function SidebarNav() {
  const pathname =
    usePathname();

  return (
    <nav className="space-y-6">
      <div>
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
          Navigation
        </p>

        <Link
          href="/"
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
            pathname === "/"
              ? "bg-cyan-500/10 text-cyan-300"
              : "text-slate-400 hover:bg-slate-900 hover:text-white"
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />

          Dashboard
        </Link>
      </div>

      <div>
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
          Dialotel
        </p>

        <div className="space-y-1">
          {dialotelItems.map(
            (item) => {
              const Icon =
                item.icon;

              const isActive =
                item.href ===
                "/dialotel"
                  ? pathname ===
                    "/dialotel"
                  : pathname ===
                      item.href ||
                    pathname.startsWith(
                      `${item.href}/`,
                    );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    isActive
                      ? "bg-cyan-500/10 text-cyan-300"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />

                  {item.label}
                </Link>
              );
            },
          )}
        </div>
      </div>
    </nav>
  );
}
