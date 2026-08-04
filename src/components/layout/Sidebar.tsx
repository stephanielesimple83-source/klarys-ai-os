export function SidebarNav() {
  return (
    <aside className="min-h-screen w-72 border-r border-slate-800 bg-slate-950 p-6">
      <h1 className="text-2xl font-bold text-cyan-400">KLARYS AI OS</h1>

      <p className="mt-2 text-sm text-slate-500">
        Centre de pilotage intelligent
      </p>

      <nav className="mt-10 space-y-3">
        <button className="w-full rounded-xl bg-cyan-500 p-3 text-left font-semibold text-black">
          🏠 Dashboard
        </button>

        <button className="w-full rounded-xl p-3 text-left hover:bg-slate-800">
          📞 Dialotel
        </button>

        <button className="w-full rounded-xl p-3 text-left hover:bg-slate-800">
          🌐 Wix
        </button>

        <button className="w-full rounded-xl p-3 text-left hover:bg-slate-800">
          📱 Réseaux sociaux
        </button>

        <button className="w-full rounded-xl p-3 text-left hover:bg-slate-800">
          🤖 CEO AI
        </button>

        <button className="w-full rounded-xl p-3 text-left hover:bg-slate-800">
          ⚙️ Paramètres
        </button>
      </nav>
    </aside>
  );
}