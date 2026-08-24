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
     * Cette route démarre désormais
     * UNE SEULE scène Runway.
     *
     * Le Studio attendra que cette
     * scène soit terminée avant
     * d'appeler cette route pour
     * la scène suivante.
     */

    const prompt =
      typeof body?.prompt ===
      "string"
        ? body.prompt.trim()
        : "";

    if (!prompt) {
      return NextResponse.json(
        {
          success: false,

          error:
            "Le prompt vidéo est obligatoire.",
        },
        {
          status: 400,
        },
      );
    }

    const promptText =
      prompt.slice(
        0,
        1000,
      );

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

      return NextResponse.json(
        {
          success: false,

          status:
            response.status,

          error:
            runwayMessage,

          runway:
            data,
        },
        {
          status:
            response.status,
        },
      );
    }

    const taskId =
      data?.id;

    if (!taskId) {
      return NextResponse.json(
        {
          success: false,

          error:
            "Runway n'a pas retourné d'identifiant de génération.",

          runway:
            data,
        },
        {
          status: 502,
        },
      );
    }

    return NextResponse.json({
      success: true,

      taskId,

      duration:
        SCENE_DURATION,

      estimatedCost:
        data?.estimatedCost ??
        null,
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