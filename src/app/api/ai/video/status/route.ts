import {
  NextRequest,
  NextResponse,
} from "next/server";

export const dynamic =
  "force-dynamic";

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

    const taskId =
      typeof body?.taskId ===
      "string"
        ? body.taskId.trim()
        : "";

    if (!taskId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "taskId est obligatoire.",
        },
        {
          status: 400,
        },
      );
    }

    const response =
      await fetch(
        `https://api.dev.runwayml.com/v1/tasks/${encodeURIComponent(
          taskId,
        )}`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${apiKey}`,

            "X-Runway-Version":
              RUNWAY_API_VERSION,
          },

          cache:
            "no-store",
        },
      );

    const data =
      await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,

          status:
            response.status,

          error:
            data?.message ??
            data?.error ??
            "Impossible de récupérer le statut Runway.",

          runway:
            data,
        },
        {
          status:
            response.status,
        },
      );
    }

    const status =
      data?.status ??
      "UNKNOWN";

    const output =
      Array.isArray(
        data?.output,
      )
        ? data.output
        : [];

    const outputUrl =
      typeof output?.[0] ===
      "string"
        ? output[0]
        : null;

    /*
     * Compatibilité :
     * videoUrl reste disponible pour
     * le code vidéo existant.
     *
     * outputUrl est le nom générique
     * utilisé aussi pour une image.
     */
    const videoUrl =
      outputUrl;

    const failureCode =
      typeof data?.failureCode ===
      "string"
        ? data.failureCode
        : null;

    const failure =
      typeof data?.failure ===
      "string"
        ? data.failure
        : null;

    let failureMessage:
      string | null =
      null;

    if (
      status ===
      "FAILED"
    ) {
      if (
        failureCode?.startsWith(
          "SAFETY.",
        ) ||
        failureCode ===
          "INPUT_PREPROCESSING.SAFETY.TEXT"
      ) {
        failureMessage =
          "Runway a refusé cette génération pour des raisons de modération du contenu.";
      } else if (
        failureCode?.startsWith(
          "INTERNAL.BAD_OUTPUT",
        )
      ) {
        failureMessage =
          "Runway a rejeté le rendu généré. Le prompt devra être légèrement simplifié ou reformulé.";
      } else if (
        failureCode ===
        "INPUT_PREPROCESSING.INTERNAL"
      ) {
        failureMessage =
          "Runway a rencontré un problème temporaire pendant l'analyse du prompt.";
      } else if (
        failureCode ===
        "THIRD_PARTY.UNAVAILABLE"
      ) {
        failureMessage =
          "Le moteur utilisé par Runway est temporairement indisponible.";
      } else if (
        failureCode ===
        "ASSET.INVALID"
      ) {
        failureMessage =
          "Runway a refusé une ressource utilisée pour la génération.";
      } else if (
        failureCode ===
          "INTERNAL" ||
        !failureCode
      ) {
        failureMessage =
          "Runway a rencontré une erreur interne pendant la génération.";
      } else {
        failureMessage =
          "Runway n'a pas pu terminer cette génération.";
      }

      if (failure) {
        failureMessage +=
          ` Détail : ${failure}`;
      }
    }

    return NextResponse.json({
      success: true,

      taskId,

      status,

      outputUrl,

      videoUrl,

      failureCode,

      failure,

      failureMessage,

      runway:
        data,
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