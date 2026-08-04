import type { ReactNode } from "react";

import Header from "./Header";
import { SidebarNav } from "./Sidebar";

type AppShellLayoutProps = {
  children: ReactNode;
};

export function AppShellLayout({ children }: AppShellLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="flex min-h-screen">
        <SidebarNav />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header />

          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}