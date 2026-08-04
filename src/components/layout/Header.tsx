import { Bell, CircleUserRound } from "lucide-react";

export default function Header() {
  return (
    <header className="flex min-h-20 items-center justify-between border-b border-slate-800 bg-slate-950/60 px-5 backdrop-blur md:px-8">
      <div>
        <p className="text-sm text-slate-500">Tableau de bord</p>

        <h1 className="text-xl font-semibold text-white">
          Bonjour Stéphanie 👋
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400 sm:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Système opérationnel
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-slate-400 transition hover:text-white"
        >
          <Bell className="h-5 w-5" />
        </button>

        <button
          type="button"
          aria-label="Profil"
          className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-cyan-400"
        >
          <CircleUserRound className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}