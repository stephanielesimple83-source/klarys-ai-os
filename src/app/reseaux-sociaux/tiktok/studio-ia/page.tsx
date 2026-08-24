"use client";

import Link from "next/link";

import {
  useState,
} from "react";

type GeneratedContent = {
  title: string;
  hook: string;
  script: string;
  screenText: string[];
  caption: string;
  hashtags: string[];
  visualIdea: string;
  duration: string;
};

type AIResponse = {
  success?: boolean;
  content?: GeneratedContent;
  error?: string;
};

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

const tones = [
  "Naturel et chaleureux",
  "Mystique et élégant",
  "Doux et rassurant",
  "Dynamique TikTok",
  "Pédagogique et professionnel",
];

export default function TikTokAIStudioPage() {
  const [
    selectedType,
    setSelectedType,
  ] = useState("");

  const [
    subject,
    setSubject,
  ] = useState("");

  const [
    tone,
    setTone,
  ] = useState(
    "Naturel et chaleureux",
  );

  const [
    generated,
    setGenerated,
  ] =
    useState<GeneratedContent | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  async function generateContent() {
    if (!selectedType) {
      setError(
        "Choisis d'abord un type de contenu.",
      );

      return;
    }

    setLoading(true);
    setError("");
    setGenerated(null);

    try {
      const response =
        await fetch(
          "/api/ai/tiktok",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              contentType:
                selectedType,

              subject,

              tone,
            }),
          },
        );

      const data: AIResponse =
        await response.json();

      if (
        !response.ok ||
        !data.success ||
        !data.content
      ) {
        throw new Error(
          data.error ||
            "Impossible de générer le contenu.",
        );
      }

      setGenerated(
        data.content,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Impossible de générer le contenu.",
      );
    } finally {
      setLoading(false);
    }
  }

  function chooseType(
    title: string,
  ) {
    setSelectedType(title);
    setGenerated(null);
    setError("");
  }

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
              Prépare tes contenus
              TikTok avec
              l&apos;IA : accroche,
              script, texte à
              l&apos;écran, légende
              et hashtags.
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
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-300">
                Étape 1
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Quel contenu veux-tu
                créer ?
              </h2>
            </div>

            <span className="w-fit rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-2 text-xs font-semibold text-violet-300">
              Compte Klarys
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contentTypes.map(
              (content) => {
                const selected =
                  selectedType ===
                  content.title;

                return (
                  <button
                    key={
                      content.title
                    }
                    type="button"
                    onClick={() =>
                      chooseType(
                        content.title,
                      )
                    }
                    className={`group rounded-3xl border p-6 text-left transition ${
                      selected
                        ? "border-violet-400 bg-violet-500/10"
                        : "border-slate-800 bg-slate-900 hover:border-violet-500/50"
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${
                        selected
                          ? "bg-violet-500/20"
                          : "bg-slate-800"
                      }`}
                    >
                      {
                        content.icon
                      }
                    </div>

                    <h3 className="mt-5 text-lg font-semibold">
                      {
                        content.title
                      }
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {
                        content.description
                      }
                    </p>

                    <p className="mt-5 text-sm font-semibold text-violet-300">
                      {selected
                        ? "✓ Sélectionné"
                        : "Choisir →"}
                    </p>
                  </button>
                );
              },
            )}
          </div>
        </section>

        {selectedType && (
          <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-300">
              Étape 2
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Prépare ta demande
            </h2>

            <div className="mt-6 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4">
              <p className="text-xs uppercase tracking-wider text-violet-300">
                Type choisi
              </p>

              <p className="mt-1 font-semibold">
                {selectedType}
              </p>
            </div>

            <div className="mt-6">
              <label
                htmlFor="subject"
                className="text-sm font-semibold text-slate-300"
              >
                Sujet ou idée
              </label>

              <textarea
                id="subject"
                value={subject}
                onChange={(
                  event,
                ) =>
                  setSubject(
                    event.target
                      .value,
                  )
                }
                rows={4}
                className="mt-2 w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400"
                placeholder="Exemple : un message sur les personnes qui traversent une période de doute..."
              />

              <p className="mt-2 text-xs text-slate-500">
                Tu peux aussi
                laisser vide :
                l&apos;IA choisira
                elle-même une idée.
              </p>
            </div>

            <div className="mt-5">
              <label
                htmlFor="tone"
                className="text-sm font-semibold text-slate-300"
              >
                Ton de la vidéo
              </label>

              <select
                id="tone"
                value={tone}
                onChange={(
                  event,
                ) =>
                  setTone(
                    event.target
                      .value,
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-violet-400"
              >
                {tones.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ),
                )}
              </select>
            </div>

            <button
              type="button"
              onClick={
                generateContent
              }
              disabled={loading}
              className="mt-7 inline-flex items-center justify-center rounded-xl bg-violet-500 px-6 py-3 font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "L'IA prépare ton contenu..."
                : "✨ Générer avec l'IA"}
            </button>

            {error && (
              <div className="mt-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
                <p className="text-sm text-rose-200">
                  {error}
                </p>
              </div>
            )}
          </section>
        )}

        {generated && (
          <section className="mt-8 rounded-3xl border border-emerald-500/20 bg-slate-900 p-7">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
                  Contenu généré
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  {generated.title}
                </h2>
              </div>

              <span className="w-fit rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-xs font-semibold text-emerald-300">
                {
                  generated.duration
                }
              </span>
            </div>

            <div className="mt-7 grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                  Accroche
                </p>

                <p className="mt-3 text-lg font-semibold leading-7">
                  {
                    generated.hook
                  }
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                  Idée visuelle
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {
                    generated.visualIdea
                  }
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                Script vidéo
              </p>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-200">
                {
                  generated.script
                }
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                Texte à
                l&apos;écran
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {generated.screenText.map(
                  (
                    text,
                    index,
                  ) => (
                    <span
                      key={`${text}-${index}`}
                      className="rounded-xl border border-violet-500/20 bg-violet-500/5 px-3 py-2 text-sm text-violet-200"
                    >
                      {index + 1}.{" "}
                      {text}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                Légende TikTok
              </p>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                {
                  generated.caption
                }
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {generated.hashtags.map(
                  (hashtag) => (
                    <span
                      key={
                        hashtag
                      }
                      className="rounded-full bg-slate-800 px-3 py-1 text-xs text-emerald-300"
                    >
                      {hashtag}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={
                  generateContent
                }
                disabled={loading}
                className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-5 py-3 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/20"
              >
                🔄 Régénérer
              </button>

              <Link
                href="/reseaux-sociaux/tiktok"
                className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Continuer vers TikTok →
              </Link>
            </div>
          </section>
        )}

        {!generated && (
          <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-300">
              L&apos;IA préparera
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
        )}
      </div>
    </main>
  );
}