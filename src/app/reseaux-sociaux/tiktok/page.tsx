import Link from "next/link";

interface TikTokPageProps {
  searchParams: Promise<{
    connected?: string;
    error?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function TikTokPage({
  searchParams,
}: TikTokPageProps) {
  const params = await searchParams;

  const connected =
    params.connected === "1";

  const error = params.error;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-300">
          Klarys AI OS — Réseaux sociaux
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          TikTok
        </h1>

        <p className="mt-3 max-w-2xl text-slate-400">
          Connecte ton compte TikTok pour préparer,
          envoyer et publier tes contenus depuis
          Klarys AI OS.
        </p>

        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-7">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <h2 className="text-xl font-semibold">
                Connexion TikTok
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Sandbox TikTok — Login Kit +
                Content Posting API
              </p>
            </div>

            {connected ? (
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">
                ✓ TikTok connecté
              </span>
            ) : (
              <Link
                href="/api/auth/tiktok"
                className="rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Connecter TikTok
              </Link>
            )}
          </div>

          {connected && (
            <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <p className="font-semibold text-emerald-300">
                Connexion réussie
              </p>

              <p className="mt-2 text-sm text-slate-300">
                Klarys AI OS a reçu l'autorisation
                de ton compte TikTok.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5">
              <p className="font-semibold text-rose-300">
                Connexion TikTok impossible
              </p>

              <p className="mt-2 break-words text-sm text-rose-200">
                {error}
              </p>
            </div>
          )}
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-500">
              Connexion
            </p>

            <p className="mt-2 font-semibold">
              Login Kit
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-500">
              Envoi vidéo
            </p>

            <p className="mt-2 font-semibold">
              video.upload
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-500">
              Publication directe
            </p>

            <p className="mt-2 font-semibold">
              video.publish
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}