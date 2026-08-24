import {
  NextRequest,
  NextResponse,
} from "next/server";

export const dynamic = "force-dynamic";

const RUNWAY_API_URL =
  "https://api.dev.runwayml.com/v1/text_to_video";

const RUNWAY_API_VERSION =
  "2024-11-06";

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

    const prompt =
      typeof body?.prompt === "string"
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

    /*
     * Runway limite le promptText
     * de cet endpoint à 1000 caractères.
     */
    const promptText =
      prompt.slice(0, 1000);

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

          body: JSON.stringify({
            model: "gen4.5",

            promptText,

            /*
             * Format vertical TikTok.
             */
            ratio: "720:1280",

            /*
             * Première génération courte
             * afin de tester l'intégration
             * sans consommer inutilement
             * beaucoup de crédits.
             */
            duration: 5,
          }),

          cache: "no-store",
        },
      );

    const data =
      await response.json();

    if (!response.ok) {
      const runwayMessage =
        data?.error?.message ??
        data?.message ??
        data?.error ??
        "Runway a refusé la génération vidéo.";

      return NextResponse.json(
        {
          success: false,
          status: response.status,
          error:
            typeof runwayMessage ===
            "string"
              ? runwayMessage
              : JSON.stringify(
                  runwayMessage,
                ),
          runway: data,
        },
        {
          status: response.status,
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
          runway: data,
        },
        {
          status: 502,
        },
      );
    }

    return NextResponse.json({
      success: true,

      taskId,

      estimatedCost:
        data?.estimatedCost ??
        null,

      runway: data,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur inconnue.";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: 500,
      },
    );
  }
}