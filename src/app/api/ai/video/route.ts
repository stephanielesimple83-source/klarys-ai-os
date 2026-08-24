import {
  NextRequest,
  NextResponse,
} from "next/server";

export const dynamic =
  "force-dynamic";

const RUNWAY_API_URL =
  "https://api.dev.runwayml.com/v1/text_to_video";

const RUNWAY_API_VERSION =
  "2024-11-06";

const MAX_SCENES = 4;
const SCENE_DURATION = 5;

type RunwayTask = {
  id?: string;

  estimatedCost?: {
    credits?: number;
  };

  error?: {
    message?: string;
  };

  message?: string;
};

async function startRunwayTask(
  apiKey: string,
  prompt: string,
) {
  const promptText =
    prompt
      .trim()
      .slice(0, 1000);

  if (!promptText) {
    throw new Error(
      "Un prompt de scène est vide.",
    );
  }

  const response =
    await fetch(
      RUNWAY_API_URL,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${apiKey}`,

          "Content-Type":
            "application/json",

          "X-Runway-Version":
            RUNWAY_API_VERSION,
        },

        body:
          JSON.stringify({
            model:
              "gen4.5",

            promptText,

            ratio:
              "720:1280",

            duration:
              SCENE_DURATION,
          }),

        cache:
          "no-store",
      },
    );

  const data =
    (await response.json()) as RunwayTask;

  if (!response.ok) {
    const runwayMessage =
      data?.error?.message ??
      data?.message ??
      "Runway a refusé la génération vidéo.";

    throw new Error(
      runwayMessage,
    );
  }

  if (!data?.id) {
    throw new Error(
      "Runway n'a pas retourné d'identifiant de génération.",
    );
  }

  return {
    taskId:
      data.id,

    estimatedCost:
      data.estimatedCost ??
      null,
  };
}

export async function POST(
  request: NextRequest,
) {
  try {
    const apiKey =
      process.env.RUNWAY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,

          error:
            "La clé API Runway n'est pas configurée.",
        },
        {
          status: 500,
        },
      );
    }

    const body =
      await request.json();

    /*
     * Ancien mode :
     * {
     *   prompt: "..."
     * }
     *
     * Nouveau mode :
     * {
     *   prompts: [
     *     "...",
     *     "...",
     *     "...",
     *     "..."
     *   ]
     * }
     */

    const singlePrompt =
      typeof body?.prompt ===
      "string"
        ? body.prompt.trim()
        : "";

    const requestedPrompts =
      Array.isArray(
        body?.prompts,
      )
        ? body.prompts
            .filter(
              (
                value: unknown,
              ): value is string =>
                typeof value ===
                  "string",
            )
            .map(
              (
                value: string,
              ) =>
                value.trim(),
            )
            .filter(Boolean)
        : [];

    const prompts =
      requestedPrompts.length >
      0
        ? requestedPrompts.slice(
            0,
            MAX_SCENES,
          )
        : singlePrompt
          ? [singlePrompt]
          : [];

    if (
      prompts.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "Au moins un prompt vidéo est obligatoire.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * On démarre les scènes
     * l'une après l'autre.
     *
     * Cela évite de déclencher
     * 4 appels Runway exactement
     * au même instant.
     */
    const tasks: Array<{
      scene: number;
      taskId: string;
      estimatedCost: unknown;
    }> = [];

    for (
      let index = 0;
      index < prompts.length;
      index++
    ) {
      const result =
        await startRunwayTask(
          apiKey,
          prompts[index],
        );

      tasks.push({
        scene:
          index + 1,

        taskId:
          result.taskId,

        estimatedCost:
          result.estimatedCost,
      });
    }

    /*
     * Compatibilité avec
     * l'interface actuelle :
     * si une seule scène est
     * demandée, on continue
     * de retourner taskId.
     */
    if (
      tasks.length === 1
    ) {
      return NextResponse.json({
        success: true,

        mode:
          "single",

        taskId:
          tasks[0].taskId,

        estimatedCost:
          tasks[0]
            .estimatedCost,

        duration:
          SCENE_DURATION,
      });
    }

    return NextResponse.json({
      success: true,

      mode:
        "multi-scene",

      sceneCount:
        tasks.length,

      sceneDuration:
        SCENE_DURATION,

      totalDuration:
        tasks.length *
        SCENE_DURATION,

      tasks,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur inconnue.";

    return NextResponse.json(
      {
        success: false,
        error:
          message,
      },
      {
        status: 500,
      },
    );
  }
}