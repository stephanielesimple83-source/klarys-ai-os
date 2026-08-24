import Link from "next/link";

export const dynamic = "force-dynamic";

const contentTypes = [
  {
    title: "Tirage du jour",
    description:
      "Créer une courte vidéo autour d'un tirage ou d'un message du jour.",
    icon: "🔮",
  },
  {
    title: "Message du jour",
    description:
      "Créer un message inspirant court adapté à TikTok.",
    icon: "✨",
  },
  {
    title: "Voyance",
    description:
      "Préparer une vidéo pour présenter la voyance, un thème ou une question.",
    icon: "🃏",
  },
  {
    title: "Psycho-énergétique",
    description:
      "Créer du contenu pédagogique autour du bien-être psycho-énergétique.",
    icon: "🌿",
  },
  {
    title: "Présentation d'une séance",
    description:
      "Expliquer simplement le déroulement ou l'objectif d'une séance.",
    icon: "💫",
  },
  {
    title: "Présentation Klarys",
    description:
      "Créer une vidéo pour présenter ton univers et tes activités.",
    icon: "🎥",
  },
];

export default function TikTokAIStudioPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-300">
              Klarys AI OS — TikTok
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              Studio IA Vidéo
            </h1>

            <p className="mt-3 max-w-3xl text-slate-400">
              Prépare tes contenus TikTok avec
              l&apos;IA : idée, accroche, script,
              texte à l&apos;écran, légende et
              hashtags.
            </p>
          </div>

          <Link
            href="/reseaux-sociaux/tiktok"
            className="inline-flex w-fit rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
          >
            ← Retour à TikTok
          </Link>
        </div>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-300">
                Étape 1
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Quel contenu veux-tu créer ?
              </h2>
            </div>

            <span className="rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-2 text-xs font-semibold text-violet-300">
              Compte Klarys
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contentTypes.map((content) => (
              <button
                key={content.title}
                type="button"
                className="group rounded-3xl border border-slate-800 bg-slate-900 p-6 text-left transition hover:border-violet-500/50 hover:bg-slate-900/80"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-2xl transition group-hover:bg-violet-500/10">
                  {content.icon}
                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  {content.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {content.description}
                </p>

                <p className="mt-5 text-sm font-semibold text-violet-300">
                  Choisir →
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-300">
            Ce que l&apos;IA préparera
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              "Accroche",
              "Script vidéo",
              "Texte écran",
              "Légende",
              "Hashtags",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/10 text-sm font-bold text-violet-300">
                  ✓
                </div>

                <p className="mt-3 text-sm font-semibold">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-violet-500/20 bg-violet-500/5 p-7">
          <p className="text-sm font-semibold text-violet-300">
            Prochaine évolution
          </p>

          <h2 className="mt-2 text-xl font-bold">
            Génération vidéo automatique
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Une fois le générateur de contenu
            connecté, nous ajouterons la création
            de la vidéo, son aperçu et son transfert
            vers le module TikTok déjà opérationnel.
          </p>
        </section>
      </div>
    </main>
  );
}