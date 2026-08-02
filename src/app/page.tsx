export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-cyan-400">
          KLARYS AI OS
        </h1>

        <p className="mt-6 text-xl text-slate-300">
          Le centre de pilotage intelligent de votre entreprise.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-4 max-w-xl mx-auto">
          <div className="rounded-xl bg-slate-900 p-6 border border-cyan-500">
            📞 Dialotel
          </div>

          <div className="rounded-xl bg-slate-900 p-6 border border-cyan-500">
            🌐 Wix
          </div>

          <div className="rounded-xl bg-slate-900 p-6 border border-cyan-500">
            📱 Réseaux sociaux
          </div>

          <div className="rounded-xl bg-slate-900 p-6 border border-cyan-500">
            🤖 CEO AI
          </div>
        </div>

        <p className="mt-12 text-sm text-slate-500">
          Version Alpha 0.0.1
        </p>
      </div>
    </main>
  );
}