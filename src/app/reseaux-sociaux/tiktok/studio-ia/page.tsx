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

type VideoStartResponse = {
  success?: boolean;
  taskId?: string;
  duration?: number;
  error?: string;
};

type VideoStatusResponse = {
  success?: boolean;
  taskId?: string;
  status?: string;
  videoUrl?: string | null;
  error?: string;
};

type SceneState = {
  scene: number;
  title: string;
  taskId: string;
  status: string;
  videoUrl: string;
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

function wait(
  milliseconds: number,
) {
  return new Promise(
    (resolve) =>
      setTimeout(
        resolve,
        milliseconds,
      ),
  );
}

function getVideoStatusLabel(
  status: string,
) {
  switch (status) {
    case "WAITING":
      return "En attente";

    case "INITIALIZING":
      return "Initialisation";

    case "PENDING":
      return "En attente Runway";

    case "RUNNING":
      return "Création en cours";

    case "SUCCEEDED":
      return "Vidéo terminée";

    case "FAILED":
      return "Échec";

    case "CANCELED":
      return "Annulée";

    case "THROTTLED":
      return "Limitation Runway";

    default:
      return status;
  }
}

function getSceneTitle(
  scene: number,
) {
  switch (scene) {
    case 1:
      return "Accroche";

    case 2:
      return "Développement";

    case 3:
      return "Message central";

    case 4:
      return "Conclusion";

    default:
      return `Scène ${scene}`;
  }
}

export default function TikTokAIStudioPage() {
  const [
    selectedType,
    setSelectedType,
  ] =
    useState("");

  const [
    subject,
    setSubject,
  ] =
    useState("");

  const [
    tone,
    setTone,
  ] =
    useState(
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
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    videoLoading,
    setVideoLoading,
  ] =
    useState(false);

  const [
    videoError,
    setVideoError,
  ] =
    useState("");

  const [
    scenes,
    setScenes,
  ] =
    useState<SceneState[]>(
      [],
    );

  const [
    currentScene,
    setCurrentScene,
  ] =
    useState(0);

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

    setScenes([]);
    setCurrentScene(0);
    setVideoError("");

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

            body:
              JSON.stringify({
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
    setSelectedType(
      title,
    );

    setGenerated(null);
    setError("");

    setScenes([]);
    setCurrentScene(0);
    setVideoError("");
  }

  async function checkVideoStatus(
    taskId: string,
  ) {
    const response =
      await fetch(
        "/api/ai/video/status",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              taskId,
            }),
        },
      );

    const data:
      VideoStatusResponse =
      await response.json();

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.error ||
          "Impossible de récupérer le statut de la vidéo.",
      );
    }

    return data;
  }

  function buildScenePrompts(
    content: GeneratedContent,
  ) {
    const text1 =
      content.screenText?.[0] ??
      content.hook;

    const text2 =
      content.screenText?.[1] ??
      content.script;

    const text3 =
      content.screenText?.[2] ??
      content.script;

    return [
      `
Vertical cinematic TikTok video, portrait 9:16.

SCENE 1 - OPENING HOOK.

Theme:
${content.title}

Visual direction:
${content.visualIdea}

Mood:
${tone}

Opening idea:
${content.hook}

Visual inspiration:
${text1}

Create an immediate and elegant opening.
Strong visual impact in the first second.
Smooth realistic movement.
Natural cinematic lighting.
Professional social media aesthetic.
Keep visual continuity suitable for a four-scene sequence.
No logos.
No subtitles.
No readable text.
No watermark.
      `.trim(),

      `
Vertical cinematic TikTok video, portrait 9:16.

SCENE 2 - DEVELOPMENT.

Theme:
${content.title}

Main visual direction:
${content.visualIdea}

Mood:
${tone}

Story:
${content.script}

Visual inspiration:
${text2}

Continue the same visual universe as scene 1.
Create a natural progression.
Elegant camera movement.
Warm atmospheric details.
Professional TikTok aesthetic.
No logos.
No subtitles.
No readable text.
No watermark.
      `.trim(),

      `
Vertical cinematic TikTok video, portrait 9:16.

SCENE 3 - CENTRAL MESSAGE.

Theme:
${content.title}

Main visual direction:
${content.visualIdea}

Mood:
${tone}

Central message:
${content.script}

Visual inspiration:
${text3}

Create the strongest symbolic or emotional moment.
Maintain visual continuity with the previous scenes.
Natural cinematic movement.
Elegant composition.
Not overloaded.
No logos.
No subtitles.
No readable text.
No watermark.
      `.trim(),

      `
Vertical cinematic TikTok video, portrait 9:16.

SCENE 4 - CONCLUSION.

Theme:
${content.title}

Main visual direction:
${content.visualIdea}

Mood:
${tone}

Closing message:
${content.caption}

Create a gentle and memorable ending.
Maintain continuity with the previous scenes.
Elegant final movement.
Calm satisfying conclusion.
Professional TikTok aesthetic.
No logos.
No subtitles.
No readable text.
No watermark.
      `.trim(),
    ];
  }

  function updateScene(
    sceneNumber: number,
    changes: Partial<SceneState>,
  ) {
    setScenes(
      (previous) =>
        previous.map(
          (scene) =>
            scene.scene ===
            sceneNumber
              ? {
                  ...scene,
                  ...changes,
                }
              : scene,
        ),
    );
  }

  async function waitForSceneCompletion(
    sceneNumber: number,
    taskId: string,
  ) {
    for (
      let attempt = 0;
      attempt < 35;
      attempt++
    ) {
      await wait(6000);

      const statusData =
        await checkVideoStatus(
          taskId,
        );

      const status =
        statusData.status ??
        "UNKNOWN";

      updateScene(
        sceneNumber,
        {
          status,

          videoUrl:
            statusData.videoUrl ??
            "",
        },
      );

      if (
        status ===
        "SUCCEEDED"
      ) {
        if (
          !statusData.videoUrl
        ) {
          throw new Error(
            `La scène ${sceneNumber} est terminée mais aucune vidéo n'a été retournée.`,
          );
        }

        return statusData.videoUrl;
      }

      if (
        status ===
          "FAILED" ||
        status ===
          "CANCELED"
      ) {
        throw new Error(
          `La scène ${sceneNumber} n'a pas pu être générée.`,
        );
      }

      if (
        status ===
        "THROTTLED"
      ) {
        await wait(8000);
      }
    }

    throw new Error(
      `La scène ${sceneNumber} prend plus de temps que prévu.`,
    );
  }

  async function startOneScene(
    sceneNumber: number,
    prompt: string,
  ) {
    setCurrentScene(
      sceneNumber,
    );

    updateScene(
      sceneNumber,
      {
        status:
          "INITIALIZING",
      },
    );

    let lastError = "";

    for (
      let attempt = 0;
      attempt < 4;
      attempt++
    ) {
      const response =
        await fetch(
          "/api/ai/video",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                prompt,
              }),
          },
        );

      const data:
        VideoStartResponse =
        await response.json();

      if (
        response.ok &&
        data.success &&
        data.taskId
      ) {
        const taskId =
          data.taskId;

        updateScene(
          sceneNumber,
          {
            taskId,
            status:
              "PENDING",
          },
        );

        return taskId;
      }

      lastError =
        data.error ||
        "Runway a refusé la génération.";

      const isThrottle =
        response.status ===
          429 ||
        lastError
          .toLowerCase()
          .includes(
            "thrott",
          ) ||
        lastError
          .toLowerCase()
          .includes(
            "rate",
          );

      if (
        !isThrottle
      ) {
        throw new Error(
          lastError,
        );
      }

      updateScene(
        sceneNumber,
        {
          status:
            "THROTTLED",
        },
      );

      await wait(
        10000,
      );
    }

    throw new Error(
      lastError ||
        `Impossible de démarrer la scène ${sceneNumber}.`,
    );
  }

  async function createVideo() {
    if (!generated) {
      setVideoError(
        "Génère d'abord le contenu.",
      );

      return;
    }

    setVideoLoading(true);
    setVideoError("");
    setCurrentScene(1);

    const prompts =
      buildScenePrompts(
        generated,
      );

    const initialScenes:
      SceneState[] =
      prompts.map(
        (
          _prompt,
          index,
        ) => ({
          scene:
            index + 1,

          title:
            getSceneTitle(
              index + 1,
            ),

          taskId:
            "",

          status:
            "WAITING",

          videoUrl:
            "",
        }),
      );

    setScenes(
      initialScenes,
    );

    try {
      for (
        let index = 0;
        index < prompts.length;
        index++
      ) {
        const sceneNumber =
          index + 1;

        const taskId =
          await startOneScene(
            sceneNumber,
            prompts[index],
          );

        await waitForSceneCompletion(
          sceneNumber,
          taskId,
        );

        if (
          sceneNumber < 4
        ) {
          await wait(
            8000,
          );
        }
      }

      setCurrentScene(0);
    } catch (error) {
      setVideoError(
        error instanceof Error
          ? error.message
          : "Impossible de créer la vidéo.",
      );
    } finally {
      setVideoLoading(false);
    }
  }

  async function refreshVideoStatuses() {
    if (
      scenes.length === 0
    ) {
      return;
    }

    setVideoLoading(true);
    setVideoError("");

    try {
      const updated:
        SceneState[] = [];

      for (
        const scene of scenes
      ) {
        if (
          !scene.taskId ||
          scene.status ===
            "SUCCEEDED"
        ) {
          updated.push(
            scene,
          );

          continue;
        }

        const data =
          await checkVideoStatus(
            scene.taskId,
          );

        updated.push({
          ...scene,

          status:
            data.status ??
            scene.status,

          videoUrl:
            data.videoUrl ??
            scene.videoUrl,
        });
      }

      setScenes(
        updated,
      );
    } catch (error) {
      setVideoError(
        error instanceof Error
          ? error.message
          : "Impossible de vérifier les scènes.",
      );
    } finally {
      setVideoLoading(false);
    }
  }

  const finishedSceneCount =
    scenes.filter(
      (scene) =>
        scene.status ===
        "SUCCEEDED",
    ).length;

  const allScenesFinished =
    scenes.length === 4 &&
    finishedSceneCount === 4;

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
              Prépare ton contenu
              puis transforme-le en
              une vidéo verticale
              composée de quatre
              scènes IA.
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
                    disabled={
                      videoLoading
                    }
                    className={`group rounded-3xl border p-6 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
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
                disabled={
                  videoLoading
                }
                onChange={(
                  event,
                ) =>
                  setSubject(
                    event.target
                      .value,
                  )
                }
                rows={4}
                className="mt-2 w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400 disabled:opacity-50"
                placeholder="Exemple : un message sur les personnes qui traversent une période de doute..."
              />
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
                disabled={
                  videoLoading
                }
                onChange={(
                  event,
                ) =>
                  setTone(
                    event.target
                      .value,
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-violet-400 disabled:opacity-50"
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
              disabled={
                loading ||
                videoLoading
              }
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
                Texte à l&apos;écran
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

            <div className="mt-7 rounded-3xl border border-violet-500/30 bg-violet-500/5 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-300">
                Étape 3
              </p>

              <h3 className="mt-2 text-xl font-bold">
                Créer la vidéo complète
                avec l&apos;IA
              </h3>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                Les 4 scènes de 5
                secondes sont créées
                l&apos;une après
                l&apos;autre pour éviter
                les limitations Runway.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={
                    createVideo
                  }
                  disabled={
                    videoLoading
                  }
                  className="rounded-xl bg-violet-500 px-6 py-3 font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {videoLoading
                    ? currentScene > 0
                      ? `🎬 Scène ${currentScene}/4 — ${finishedSceneCount} terminée(s)`
                      : "🎬 Finalisation..."
                    : "🎬 Créer les 4 scènes IA"}
                </button>

                {scenes.length > 0 &&
                  !videoLoading &&
                  !allScenesFinished && (
                    <button
                      type="button"
                      onClick={
                        refreshVideoStatuses
                      }
                      className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                      Actualiser les statuts
                    </button>
                  )}
              </div>

              {videoLoading && (
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>
                      Génération
                      séquentielle
                    </span>

                    <span>
                      {
                        finishedSceneCount
                      }
                      /4
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full bg-violet-500 transition-all duration-500"
                      style={{
                        width:
                          `${finishedSceneCount * 25}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {scenes.length > 0 && (
                <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  {scenes.map(
                    (scene) => (
                      <div
                        key={
                          scene.scene
                        }
                        className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                              Scène{" "}
                              {
                                scene.scene
                              }
                            </p>

                            <p className="mt-1 text-sm font-semibold">
                              {
                                scene.title
                              }
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                              scene.status ===
                              "SUCCEEDED"
                                ? "bg-emerald-500/10 text-emerald-300"
                                : scene.status ===
                                    "FAILED"
                                  ? "bg-rose-500/10 text-rose-300"
                                  : scene.status ===
                                      "THROTTLED"
                                    ? "bg-amber-500/10 text-amber-300"
                                    : "bg-violet-500/10 text-violet-300"
                            }`}
                          >
                            {getVideoStatusLabel(
                              scene.status,
                            )}
                          </span>
                        </div>

                        {scene.videoUrl ? (
                          <div className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-black">
                            <video
                              src={
                                scene.videoUrl
                              }
                              controls
                              playsInline
                              className="aspect-[9/16] w-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="mt-4 flex aspect-[9/16] items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900">
                            <p className="px-4 text-center text-xs leading-5 text-slate-500">
                              {scene.status ===
                              "WAITING"
                                ? "Cette scène démarrera après la précédente."
                                : scene.status ===
                                    "THROTTLED"
                                  ? "Runway temporise. Nouvelle tentative automatique..."
                                  : scene.status ===
                                        "RUNNING" ||
                                      scene.status ===
                                        "PENDING"
                                    ? "Runway génère cette scène..."
                                    : "Préparation de la scène..."}
                            </p>
                          </div>
                        )}

                        {scene.taskId && (
                          <p className="mt-3 break-all text-[10px] text-slate-700">
                            {
                              scene.taskId
                            }
                          </p>
                        )}
                      </div>
                    ),
                  )}
                </div>
              )}

              {videoError && (
                <div className="mt-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
                  <p className="text-sm text-rose-200">
                    {videoError}
                  </p>
                </div>
              )}

              {allScenesFinished && (
                <div className="mt-7 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
                  <p className="font-semibold text-emerald-300">
                    ✓ Les 4 scènes sont
                    terminées
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Nous avons maintenant
                    quatre clips de
                    5 secondes, soit
                    environ 20 secondes.
                    L&apos;étape suivante
                    sera de les assembler
                    automatiquement en
                    un seul MP4.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={
                  generateContent
                }
                disabled={
                  loading ||
                  videoLoading
                }
                className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-5 py-3 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                🔄 Régénérer le contenu
              </button>

              {allScenesFinished && (
                <Link
                  href="/reseaux-sociaux/tiktok"
                  className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  Continuer vers TikTok →
                </Link>
              )}
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
              ].map(
                (item) => (
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
                ),
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}