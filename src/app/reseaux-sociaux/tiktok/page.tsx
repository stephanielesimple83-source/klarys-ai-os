import Link from "next/link";

import {
  cookies,
} from "next/headers";

import {
  getTikTokUserInfo,
  type TikTokUserInfo,
} from "@/services/tiktok.service";

interface TikTokPageProps {
  searchParams: Promise<{
    connected?: string;
    error?: string;
  }>;
}

export const dynamic =
  "force-dynamic";

export default async function TikTokPage({
  searchParams,
}: TikTokPageProps) {
  const params =
    await searchParams;

  const cookieStore =
    await cookies();

  const accessToken =
    cookieStore.get(
      "tiktok_access_token",
    )?.value;

  let user:
    TikTokUserInfo | null =
    null;

  let profileError:
    string | null =
    null;

  if (accessToken) {
    try {
      user =
        await getTikTokUserInfo(
          accessToken,
        );
    } catch (error) {
      profileError =
        error instanceof Error
          ? error.message
          : "Impossible de récupérer le profil TikTok.";
    }
  }

  const connected =
    Boolean(
      accessToken &&
        user,
    );

  const error =
    params.error ??
    profileError;

  const avatarUrl =
    user?.avatar_url ??
    user?.avatar_url_100 ??
    user?.avatar_large_url ??
    null;

  const displayName =
    user?.display_name ??
    "Compte TikTok";

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
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
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              {connected &&
              avatarUrl ? (
                <img
                  src={
                    avatarUrl
                  }
                  alt={
                    displayName
                  }
                  className="h-16 w-16 rounded-full border border-slate-700 object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-2xl font-bold text-slate-400">
                  T
                </div>
              )}

              <div>
                <h2 className="text-xl font-semibold">
                  {connected
                    ? displayName
                    : "Connexion TikTok"}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Sandbox TikTok — Login Kit +
                  Content Posting API
                </p>

                {connected &&
                  user?.open_id && (
                    <p className="mt-1 text-xs text-slate-600">
                      Compte TikTok connecté
                    </p>
                  )}
              </div>
            </div>

            {connected ? (
              <span className="inline-flex w-fit items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">
                ✓ TikTok connecté
              </span>
            ) : (
              <Link
                href="/api/auth/tiktok"
                className="inline-flex w-fit items-center justify-center rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-200"
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
                Klarys AI OS est maintenant connecté
                au compte TikTok{" "}
                <strong>
                  {displayName}
                </strong>
                .
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Nous pouvons maintenant préparer le
                premier test d&apos;envoi vidéo puis
                tester la publication directe.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5">
              <p className="font-semibold text-rose-300">
                Problème TikTok
              </p>

              <p className="mt-2 break-words text-sm text-rose-200">
                {error}
              </p>

              {!connected && (
                <Link
                  href="/api/auth/tiktok"
                  className="mt-4 inline-flex rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20"
                >
                  Reconnecter TikTok
                </Link>
              )}
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

            <p className="mt-2 text-xs text-emerald-300">
              {connected
                ? "✓ Actif"
                : "En attente"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-500">
              Envoi vidéo
            </p>

            <p className="mt-2 font-semibold">
              video.upload
            </p>

            <p className="mt-2 text-xs text-emerald-300">
              Autorisé
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-500">
              Publication directe
            </p>

            <p className="mt-2 font-semibold">
              video.publish
            </p>

            <p className="mt-2 text-xs text-emerald-300">
              Autorisé
            </p>
          </div>
        </section>

        {connected && (
          <section className="mt-6 rounded-3xl border border-violet-500/20 bg-violet-500/5 p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-300">
              Prochaine étape
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Premier contenu TikTok
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              La connexion est opérationnelle.
              Nous allons maintenant ajouter
              l&apos;interface permettant de choisir
              une vidéo, préparer son texte puis
              l&apos;envoyer vers TikTok.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}