import type { ReactNode } from "react";

import Header from "./Header";
import Sidebar from "./Sidebar";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#0b1120] text-white">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <Header />

          <main className="p-5 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}