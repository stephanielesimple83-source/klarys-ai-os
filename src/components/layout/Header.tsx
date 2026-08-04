export default function Header() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-800 px-8">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-slate-500">Bonjour Stéphanie 👋</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-3 w-3 rounded-full bg-green-500" />
        <span className="text-green-400">CEO AI connecté</span>
      </div>
    </header>
  );
}