"use client";

import Link from "next/link";

import TikTokVideoAssembler from "@/components/tiktok/TikTokVideoAssembler";

import {
  useEffect,
  useState,
} from "react";

type GeneratedScene = {
  role: string;
  voiceText: string;
  screenText: string;
  visualPrompt: string;
};

type GeneratedContent = {
  title: string;
  hook: string;
  script: string;
  screenText: string[];
  caption: string;
  hashtags: string[];
  visualIdea: string;
  scenes?: GeneratedScene[];
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
  outputUrl?: string | null;
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

type SavedStudioProject = {
  version: 1;
  selectedType: string;
  subject: string;
  tone: string;
  generated: GeneratedContent | null;
  scenes: SceneState[];
  characterReferenceUrl?: string;
  characterTaskId?: string;
  characterStatus?: string;
  savedAt: string;
};

const STUDIO_STORAGE_KEY =
  "klarys-ai-os:tiktok-studio:current-project";

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

  const [
    characterReferenceUrl,
    setCharacterReferenceUrl,
  ] =
    useState("");

  const [
    characterTaskId,
    setCharacterTaskId,
  ] =
    useState("");

  const [
    characterStatus,
    setCharacterStatus,
  ] =
    useState("");

  const [
    characterLoading,
    setCharacterLoading,
  ] =
    useState(false);

  const [
    characterError,
    setCharacterError,
  ] =
    useState("");

  const [
    projectRestored,
    setProjectRestored,
  ] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function restoreProject() {
      try {
        const raw =
          window.localStorage.getItem(
            STUDIO_STORAGE_KEY,
          );

        if (!raw) {
          return;
        }

        const saved =
          JSON.parse(
            raw,
          ) as SavedStudioProject;

        if (
          saved?.version !== 1
        ) {
          return;
        }

        setSelectedType(
          saved.selectedType ??
            "",
        );

        setSubject(
          saved.subject ??
            "",
        );

        setTone(
          saved.tone ||
            "Naturel et chaleureux",
        );

        setGenerated(
          saved.generated ??
            null,
        );

        setCharacterReferenceUrl(
          saved.characterReferenceUrl ??
            "",
        );

        setCharacterTaskId(
          saved.characterTaskId ??
            "",
        );

        setCharacterStatus(
          saved.characterStatus ??
            "",
        );

        const savedScenes =
          Array.isArray(
            saved.scenes,
          )
            ? saved.scenes
            : [];

        /*
         * Les URL Runway peuvent être
         * temporaires. Au rechargement,
         * on réinterroge donc les taskId
         * existants pour récupérer leur
         * statut et une URL vidéo fraîche,
         * sans relancer ni repayer la
         * génération.
         */
        const refreshedScenes =
          await Promise.all(
            savedScenes.map(
              async (
                scene,
              ) => {
                /*
                 * Une scène sans taskId ne
                 * doit jamais rester bloquée
                 * sur INITIALIZING, PENDING
                 * ou RUNNING après un refresh.
                 */
                if (
                  !scene.taskId
                ) {
                  return {
                    ...scene,

                    status:
                      scene.status ===
                      "SUCCEEDED"
                        ? "SUCCEEDED"
                        : "WAITING",

                    videoUrl:
                      scene.status ===
                      "SUCCEEDED"
                        ? scene.videoUrl
                        : "",
                  };
                }

                try {
                  const statusData =
                    await checkVideoStatus(
                      scene.taskId,
                    );

                  return {
                    ...scene,

                    status:
                      statusData.status ??
                      scene.status,

                    videoUrl:
                      statusData.videoUrl ??
                      scene.videoUrl,
                  };
                } catch {
                  return scene;
                }
              },
            ),
          );

        if (
          cancelled
        ) {
          return;
        }

        setScenes(
          refreshedScenes,
        );

        setCurrentScene(0);
        setVideoError("");
      } catch (
        restoreError
      ) {
        console.error(
          "Impossible de restaurer le projet TikTok Studio.",
          restoreError,
        );
      } finally {
        if (
          !cancelled
        ) {
          setProjectRestored(
            true,
          );
        }
      }
    }

    void restoreProject();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (
      !projectRestored
    ) {
      return;
    }

    const project:
      SavedStudioProject = {
        version: 1,

        selectedType,

        subject,

        tone,

        generated,

        scenes,

        characterReferenceUrl,

        characterTaskId,

        characterStatus,

        savedAt:
          new Date().toISOString(),
      };

    try {
      window.localStorage.setItem(
        STUDIO_STORAGE_KEY,
        JSON.stringify(
          project,
        ),
      );
    } catch (
      saveError
    ) {
      console.error(
        "Impossible de sauvegarder le projet TikTok Studio.",
        saveError,
      );
    }
  }, [
    projectRestored,
    selectedType,
    subject,
    tone,
    generated,
    scenes,
    characterReferenceUrl,
    characterTaskId,
    characterStatus,
  ]);

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
    setCharacterReferenceUrl("");
    setCharacterTaskId("");
    setCharacterStatus("");
    setCharacterError("");

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
                type:
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
    setCharacterReferenceUrl("");
    setCharacterTaskId("");
    setCharacterStatus("");
    setCharacterError("");
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

  async function waitForCharacterCompletion(
    taskId: string,
  ) {
    for (
      let attempt = 0;
      attempt < 100;
      attempt++
    ) {
      await wait(4000);

      const statusData =
        await checkVideoStatus(
          taskId,
        );

      const status =
        statusData.status ??
        "UNKNOWN";

      setCharacterStatus(
        status,
      );

      if (
        status ===
        "SUCCEEDED"
      ) {
        const outputUrl =
          statusData.outputUrl ??
          statusData.videoUrl ??
          "";

        if (!outputUrl) {
          throw new Error(
            "L'image personnage est terminée mais aucune URL n'a été retournée.",
          );
        }

        setCharacterReferenceUrl(
          outputUrl,
        );

        return outputUrl;
      }

      if (
        status ===
          "FAILED" ||
        status ===
          "CANCELED"
      ) {
        throw new Error(
          "Runway n'a pas pu générer le personnage de référence.",
        );
      }
    }

    throw new Error(
      "La génération du personnage est toujours en cours après plusieurs minutes.",
    );
  }

  async function generateCharacterReference() {
    if (!generated) {
      setCharacterError(
        "Génère d'abord le contenu TikTok.",
      );

      return;
    }

    setCharacterLoading(true);
    setCharacterError("");
    setCharacterReferenceUrl("");
    setCharacterTaskId("");
    setCharacterStatus(
      "INITIALIZING",
    );

    try {
      const response =
        await fetch(
          "/api/ai/character",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                prompt:
                  `Photorealistic cinematic reference portrait for the recurring main character of this TikTok video. Adult French woman, early thirties, shoulder-length warm brown hair, brown eyes, refined natural facial features, elegant cream beige blouse, discreet small gold earrings. Warm natural daylight, sophisticated modern interior, realistic skin texture, calm confident expression, medium portrait framing showing face, hairstyle, blouse and upper body clearly. The exact same woman, hairstyle and clothing will be reused across four cinematic vertical scenes. No tarot cards, no objects in hands, no text, no subtitles, no logo, no watermark. Shared visual direction: ${generated.visualIdea}`.slice(
                    0,
                    1000,
                  ),
              }),
          },
        );

      const data =
        (await response.json()) as
          VideoStartResponse;

      if (
        !response.ok ||
        !data.success ||
        !data.taskId
      ) {
        throw new Error(
          data.error ||
            "Impossible de générer le personnage de référence.",
        );
      }

      setCharacterTaskId(
        data.taskId,
      );

      setCharacterStatus(
        "PENDING",
      );

      await waitForCharacterCompletion(
        data.taskId,
      );
    } catch (error) {
      setCharacterError(
        error instanceof Error
          ? error.message
          : "Impossible de générer le personnage de référence.",
      );
    } finally {
      setCharacterLoading(false);
    }
  }

  function buildScenePrompts(
    content: GeneratedContent,
  ) {
    /*
     * Nouvelle génération : l'API IA fournit directement
     * quatre prompts narratifs distincts. On les utilise
     * tels quels au lieu de reconstruire quatre variantes
     * à partir du script global.
     */
    if (
      Array.isArray(content.scenes) &&
      content.scenes.length >= 4 &&
      content.scenes
        .slice(0, 4)
        .every(
          (scene) =>
            typeof scene.visualPrompt === "string" &&
            scene.visualPrompt.trim(),
        )
    ) {
      return content.scenes
        .slice(0, 4)
        .map((scene, index) => `
Vertical cinematic TikTok video, portrait 9:16, approximately 5 seconds.

SCENE ${index + 1} - ${scene.role}.

Narrative meaning:
${scene.voiceText}

Visual direction:
${scene.visualPrompt}

Shared art direction:
${content.visualIdea}

Continuity and quality rules:
- realistic natural movement
- elegant cinematic lighting
- keep the same person and wardrobe across scenes when the same person is used
- this scene must have a distinct action and composition from the other scenes
- no logos
- no subtitles
- no readable text
- no watermark
- do not add candles, crystals, smoke, tarot cards or mystical props unless they are explicitly useful to THIS scene's narrative
        `.trim());
    }

    /*
     * Compatibilité avec les anciens projets sauvegardés :
     * s'ils ne possèdent pas encore content.scenes, on garde
     * une génération de secours sans casser leur restauration.
     */
    const text1 =
      content.screenText?.[0] ??
      content.hook;
    const text2 =
      content.screenText?.[1] ??
      content.script;
    const text3 =
      content.screenText?.[2] ??
      content.script;
    const text4 =
      content.screenText?.[3] ??
      content.caption;

    return [text1, text2, text3, text4].map(
      (text, index) => `
Vertical cinematic TikTok video, portrait 9:16, approximately 5 seconds.
Scene ${index + 1}: ${getSceneTitle(index + 1)}.
Theme: ${content.title}.
Narrative meaning: ${text}.
Overall visual direction: ${content.visualIdea}.
Create one concrete human action that visually expresses this exact meaning.
Use a distinct composition and action. Avoid generic mystical decoration.
No logos, subtitles, readable text or watermark.
      `.trim(),
    );
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
      attempt < 100;
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
      `La scène ${sceneNumber} est toujours en cours après 10 minutes. Vérifie son statut avant de relancer.`,
    );
  }

  async function startOneScene(
    sceneNumber: number,
    prompt: string,
    testMode = false,
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

                referenceImageUrl:
                  characterReferenceUrl ||
                  undefined,

                testMode,
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
        updateScene(
          sceneNumber,
          {
            taskId:
              "",

            status:
              "WAITING",

            videoUrl:
              "",
          },
        );

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

    updateScene(
      sceneNumber,
      {
        taskId:
          "",

        status:
          "WAITING",

        videoUrl:
          "",
      },
    );

    throw new Error(
      lastError ||
        `Impossible de démarrer la scène ${sceneNumber}.`,
    );
  }

  async function testFirstScene() {
    if (!generated) {
      setVideoError(
        "Génère d'abord le contenu.",
      );

      return;
    }

    if (
      !characterReferenceUrl
    ) {
      setVideoError(
        "Génère et valide d'abord le personnage de référence.",
      );

      return;
    }

    const prompts =
      buildScenePrompts(
        generated,
      );

    if (!prompts[0]) {
      setVideoError(
        "Le prompt de la scène 1 est introuvable.",
      );

      return;
    }

    setVideoLoading(true);
    setVideoError("");
    setCurrentScene(1);

    const testScenes:
      SceneState[] =
      prompts.map(
        (
          _prompt,
          index,
        ) => {
          const sceneNumber =
            index + 1;

          const existing =
            scenes.find(
              (scene) =>
                scene.scene ===
                sceneNumber,
            );

          if (
            sceneNumber === 1
          ) {
            return {
              scene:
                1,

              title:
                getSceneTitle(
                  1,
                ),

              taskId:
                "",

              status:
                "WAITING",

              videoUrl:
                "",
            };
          }

          return (
            existing ?? {
              scene:
                sceneNumber,

              title:
                getSceneTitle(
                  sceneNumber,
                ),

              taskId:
                "",

              status:
                "WAITING",

              videoUrl:
                "",
            }
          );
        },
      );

    setScenes(
      testScenes,
    );

    try {
      const taskId =
        await startOneScene(
          1,
          prompts[0],
          true,
        );

      await waitForSceneCompletion(
        1,
        taskId,
      );

      setCurrentScene(0);
    } catch (error) {
      setVideoError(
        error instanceof Error
          ? error.message
          : "Impossible de tester la scène 1.",
      );
    } finally {
      setCurrentScene(0);
      setVideoLoading(false);
    }
  }

  async function createVideo() {
    if (!generated) {
      setVideoError(
        "Génère d'abord le contenu.",
      );

      return;
    }

    if (
      !characterReferenceUrl
    ) {
      setVideoError(
        "Génère et valide d'abord le personnage de référence.",
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

  async function resumeMissingScenes() {
    if (!generated) {
      setVideoError(
        "Génère d'abord le contenu.",
      );

      return;
    }

    if (
      !characterReferenceUrl
    ) {
      setVideoError(
        "Le personnage de référence est manquant. Génère-le avant de reprendre les scènes.",
      );

      return;
    }

    if (
      scenes.length === 0
    ) {
      await createVideo();

      return;
    }

    setVideoLoading(true);
    setVideoError("");

    const prompts =
      buildScenePrompts(
        generated,
      );

    try {
      for (
        let index = 0;
        index < prompts.length;
        index++
      ) {
        const sceneNumber =
          index + 1;

        const existingScene =
          scenes.find(
            (scene) =>
              scene.scene ===
              sceneNumber,
          );

        if (
          existingScene?.status ===
          "SUCCEEDED"
        ) {
          continue;
        }

        setCurrentScene(
          sceneNumber,
        );

        /*
         * Si la scène possède déjà
         * un taskId Runway, on ne
         * paie pas une nouvelle
         * génération : on reprend
         * simplement son suivi.
         */
        if (
          existingScene?.taskId &&
          existingScene.status !==
            "FAILED" &&
          existingScene.status !==
            "CANCELED"
        ) {
          await waitForSceneCompletion(
            sceneNumber,
            existingScene.taskId,
          );
        } else {
          /*
           * Pas de taskId :
           * cette scène n'a jamais
           * été démarrée. On crée
           * uniquement celle-ci.
           */
          const taskId =
            await startOneScene(
              sceneNumber,
              prompts[index],
            );

          await waitForSceneCompletion(
            sceneNumber,
            taskId,
          );
        }

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
          : "Impossible de reprendre la génération.",
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

  const firstScene =
    scenes.find(
      (scene) =>
        scene.scene === 1,
    );

  const firstSceneSucceeded =
    firstScene?.status ===
      "SUCCEEDED" &&
    Boolean(
      firstScene.videoUrl,
    );

  const testCanRun =
    Boolean(
      generated &&
      characterReferenceUrl,
    ) &&
    !videoLoading &&
    !firstSceneSucceeded;

  const finalCanRun =
    Boolean(
      generated &&
      characterReferenceUrl,
    ) &&
    !videoLoading &&
    !allScenesFinished;

  /*
   * Aperçu exact des prompts qui seront envoyés à Runway.
   * Aucun crédit Runway n'est utilisé pour cet aperçu.
   */
  const runwayPromptPreview =
    generated
      ? buildScenePrompts(
          generated,
        )
      : [];

  function continueToTikTok() {
    if (!generated) {
      setVideoError(
        "Aucun contenu TikTok n'est disponible.",
      );

      return;
    }

    const savedVideoUrl =
      window.localStorage.getItem(
        "klarys-ai-os:tiktok-studio:saved-final-video",
      );

    if (!savedVideoUrl) {
      setVideoError(
        "Sauvegarde d'abord la vidéo finale avant de continuer vers TikTok.",
      );

      return;
    }

    const draft = {
      videoUrl:
        savedVideoUrl,

      title:
        generated.title,

      caption:
        generated.caption,

      hashtags:
        generated.hashtags,

      hook:
        generated.hook,

      script:
        generated.script,

      createdAt:
        new Date().toISOString(),
    };

    window.localStorage.setItem(
      "klarys-ai-os:tiktok:current-draft",
      JSON.stringify(
        draft,
      ),
    );

    window.location.href =
      "/reseaux-sociaux/tiktok";
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
              Prépare ton contenu
              puis transforme-le en
              une vidéo verticale
              composée de quatre
              scènes IA.
            </p>

            {projectRestored && (
              <p className="mt-3 text-xs text-emerald-300">
                ✓ Projet sauvegardé automatiquement sur cet appareil
              </p>
            )}
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

            {Array.isArray(
              generated.scenes,
            ) &&
              generated.scenes.length >=
                4 && (
                <div className="mt-7 rounded-3xl border border-cyan-500/30 bg-cyan-500/5 p-6">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-300">
                        Vérification avant Runway
                      </p>

                      <h3 className="mt-2 text-xl font-bold text-white">
                        Contrôle les 4 scènes avant de générer
                      </h3>

                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                        Vérifie le texte raconté, le texte affiché et le prompt visuel exact de chaque scène. Aucun crédit Runway n&apos;est utilisé tant que tu ne cliques pas sur le bouton de génération.
                      </p>
                    </div>

                    <span className="w-fit rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-300">
                      0 crédit utilisé
                    </span>
                  </div>

                  <div className="mt-6 grid gap-5 lg:grid-cols-2">
                    {generated.scenes
                      .slice(0, 4)
                      .map(
                        (
                          scene,
                          index,
                        ) => (
                          <article
                            key={`${scene.role}-${index}`}
                            className="rounded-2xl border border-slate-700 bg-slate-950 p-5"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">
                                  Scène{" "}
                                  {index + 1}
                                </p>

                                <h4 className="mt-1 text-lg font-semibold text-white">
                                  {scene.role ||
                                    getSceneTitle(
                                      index +
                                        1,
                                    )}
                                </h4>
                              </div>

                              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                                5 secondes
                              </span>
                            </div>

                            <div className="mt-5">
                              <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                                Texte raconté
                              </p>

                              <p className="mt-2 text-sm leading-6 text-slate-200">
                                {
                                  scene.voiceText
                                }
                              </p>
                            </div>

                            <div className="mt-5">
                              <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                                Texte à l&apos;écran
                              </p>

                              <p className="mt-2 text-sm leading-6 text-slate-200">
                                {
                                  scene.screenText
                                }
                              </p>
                            </div>

                            <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                                Direction visuelle IA
                              </p>

                              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                                {
                                  scene.visualPrompt
                                }
                              </p>
                            </div>

                            <details className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
                              <summary className="cursor-pointer text-sm font-semibold text-slate-300">
                                Voir le prompt exact envoyé à Runway
                              </summary>

                              <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-slate-400">
                                {
                                  runwayPromptPreview[
                                    index
                                  ] ?? ""
                                }
                              </pre>
                            </details>
                          </article>
                        ),
                      )}
                  </div>

                  <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <p className="text-sm font-semibold text-amber-300">
                      Vérifie avant de lancer
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      Si une scène ne correspond pas au script, utilise « Régénérer le contenu » avant de payer une nouvelle génération Runway.
                    </p>
                  </div>
                </div>
              )}

            <div className="mt-7 rounded-3xl border border-fuchsia-500/30 bg-fuchsia-500/5 p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-fuchsia-300">
                    Personnage de référence
                  </p>

                  <h3 className="mt-2 text-xl font-bold text-white">
                    Garde la même femme dans les 4 scènes
                  </h3>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                    Génère une image de référence une seule fois. Cette même image sera ensuite transmise aux quatre vidéos Runway pour améliorer la continuité du visage, des cheveux et de la tenue.
                  </p>
                </div>

                {characterReferenceUrl && (
                  <span className="w-fit rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300">
                    ✓ Référence prête
                  </span>
                )}
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-[220px_1fr]">
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                  {characterReferenceUrl ? (
                    <img
                      src={
                        characterReferenceUrl
                      }
                      alt="Personnage de référence"
                      className="aspect-[9/16] w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[9/16] items-center justify-center p-5 text-center text-sm leading-6 text-slate-500">
                      {characterLoading
                        ? "Runway crée le personnage de référence..."
                        : "Aucun personnage de référence généré."}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm leading-6 text-slate-300">
                    Vérifie surtout le visage, la coiffure et la tenue. Si cette femme te convient, conserve-la avant de lancer les quatre scènes.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={
                        generateCharacterReference
                      }
                      disabled={
                        characterLoading ||
                        videoLoading
                      }
                      className="rounded-xl bg-fuchsia-500 px-5 py-3 font-semibold text-white transition hover:bg-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {characterLoading
                        ? "Création du personnage..."
                        : characterReferenceUrl
                          ? "🔄 Régénérer le personnage"
                          : "👤 Générer le personnage de référence"}
                    </button>
                  </div>

                  {characterStatus && (
                    <p className="mt-3 text-xs text-slate-500">
                      Statut Runway :{" "}
                      <strong className="text-slate-300">
                        {characterStatus ===
                        "SUCCEEDED"
                          ? "Image de référence prête"
                          : getVideoStatusLabel(
                              characterStatus,
                            )}
                      </strong>
                    </p>
                  )}

                  {characterError && (
                    <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
                      <p className="text-sm text-rose-200">
                        {
                          characterError
                        }
                      </p>
                    </div>
                  )}

                  {characterReferenceUrl && (
                    <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                      <p className="text-sm font-semibold text-emerald-300">
                        Cette image sera utilisée pour les 4 scènes
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        Si elle te convient, tu peux passer à l&apos;étape suivante. Sinon, régénère-la avant de dépenser les crédits vidéo.
                      </p>
                    </div>
                  )}
                </div>
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
                Commence par le test de 2 secondes à 10 crédits. Si le personnage reste cohérent, la version finale utilise Gen-4 Turbo : 25 crédits par scène de 5 secondes, soit 100 crédits pour les 4 scènes.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                    Test continuité
                  </p>
                  <p className="mt-2 text-lg font-bold text-white">
                    2 secondes · 10 crédits
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Gen-4 Turbo. Ce bouton ne génère que la scène 1.
                  </p>
                </div>

                <div className="rounded-2xl border border-violet-500/25 bg-violet-500/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                    Génération finale
                  </p>
                  <p className="mt-2 text-lg font-bold text-white">
                    4 × 5 secondes · 100 crédits
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    25 crédits par scène avec Gen-4 Turbo.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={
                    testFirstScene
                  }
                  disabled={
                    !testCanRun
                  }
                  className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-6 py-3 font-semibold text-cyan-200 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {videoLoading &&
                  currentScene === 1 &&
                  !firstSceneSucceeded
                    ? "🧪 Test scène 1 en cours..."
                    : firstSceneSucceeded
                      ? "✓ Test scène 1 réussi"
                      : "🧪 Tester scène 1 · 10 crédits"}
                </button>

                <button
                  type="button"
                  onClick={
                    scenes.length > 0
                      ? resumeMissingScenes
                      : createVideo
                  }
                  disabled={
                    !finalCanRun ||
                    !firstSceneSucceeded
                  }
                  className="rounded-xl bg-violet-500 px-6 py-3 font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {allScenesFinished
                    ? "✓ Les 4 scènes sont terminées"
                    : !characterReferenceUrl
                      ? "👤 Génère d'abord le personnage"
                      : !firstSceneSucceeded
                        ? "🔒 Valide d'abord le test scène 1"
                        : scenes.length > 0
                          ? "▶ Générer les scènes restantes · max 75 crédits"
                          : "🎬 Générer les 4 scènes · 100 crédits"}
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

              {firstSceneSucceeded && (
                <div className="mt-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4">
                  <p className="text-sm font-semibold text-emerald-300">
                    ✓ Test de continuité réussi côté génération
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Regarde la vidéo de la scène 1 ci-dessous. Si le personnage te convient, le bouton violet permet de lancer uniquement les scènes restantes.
                  </p>
                </div>
              )}

              {videoLoading && (
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>
                      {currentScene === 1 &&
                      !firstSceneSucceeded
                        ? "Test scène 1"
                        : "Génération séquentielle"}
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
                                ? scene.scene === 1
                                  ? "Scène prête à être générée."
                                  : "Cette scène n'a pas encore été générée."
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

              {allScenesFinished && (
                <TikTokVideoAssembler
                  videoUrls={
                    scenes
                      .sort(
                        (
                          first,
                          second,
                        ) =>
                          first.scene -
                          second.scene,
                      )
                      .map(
                        (scene) =>
                          scene.videoUrl,
                      )
                  }
                  overlayTexts={[
                    generated.hook,
                    ...generated.screenText,
                  ]}
                  voiceScript={
                    generated.script
                  }
                />
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
                <button
                  type="button"
                  onClick={
                    continueToTikTok
                  }
                  className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  Continuer vers TikTok →
                </button>
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