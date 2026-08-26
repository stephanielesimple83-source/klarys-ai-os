import {
  NextRequest,
  NextResponse,
} from "next/server";

export const dynamic =
  "force-dynamic";

const RUNWAY_TEXT_TO_VIDEO_URL =
  "https://api.dev.runwayml.com/v1/text_to_video";

const RUNWAY_IMAGE_TO_VIDEO_URL =
  "https://api.dev.runwayml.com/v1/image_to_video";

const RUNWAY_API_VERSION =
  "2024-11-06";

const SCENE_DURATION = 5;

function getRunwayErrorMessage(
  data: unknown,
) {
  if (
    !data ||
    typeof data !== "object"
  ) {
    return "";
  }

  const record =
    data as Record<
      string,
      unknown
    >;

  if (
    typeof record.message ===
    "string"
  ) {
    return record.message;
  }

  if (
    typeof record.error ===
    "string"
  ) {
    return record.error;
  }

  if (
    record.error &&
    typeof record.error ===
      "object"
  ) {
    const errorObject =
      record.error as Record<
        string,
        unknown
      >;

    if (
      typeof errorObject.message ===
      "string"
    ) {
      return errorObject.message;
    }

    if (
      typeof errorObject.detail ===
      "string"
    ) {
      return errorObject.detail;
    }

    if (
      typeof errorObject.code ===
      "string"
    ) {
      return errorObject.code;
    }

    try {
      return JSON.stringify(
        errorObject,
      );
    } catch {
      return "";
    }
  }

  if (
    typeof record.detail ===
    "string"
  ) {
    return record.detail;
  }

  if (
    typeof record.failure ===
    "string"
  ) {
    return record.failure;
  }

  if (
    typeof record.reason ===
    "string"
  ) {
    return record.reason;
  }

  return "";
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

    const prompt =
      typeof body?.prompt ===
      "string"
        ? body.prompt.trim()
        : "";

    const referenceImageUrl =
      typeof body?.referenceImageUrl ===
      "string"
        ? body.referenceImageUrl.trim()
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

    const useReferenceImage =
      Boolean(
        referenceImageUrl,
      );

    const runwayUrl =
      useReferenceImage
        ? RUNWAY_IMAGE_TO_VIDEO_URL
        : RUNWAY_TEXT_TO_VIDEO_URL;

    /*
     * Runway 2024-11-06 :
     * pour positionner explicitement
     * l'image en première frame,
     * promptImage doit être un tableau
     * d'objets { uri, position }.
     *
     * On n'envoie PAS "position"
     * comme propriété top-level.
     */
    const runwayBody =
      useReferenceImage
        ? {
            model:
              "gen4.5",

            promptImage: [
              {
                uri:
                  referenceImageUrl,

                position:
                  "first",
              },
            ],

            promptText,

            ratio:
              "720:1280",

            duration:
              SCENE_DURATION,
          }
        : {
            model:
              "gen4.5",

            promptText,

            ratio:
              "720:1280",

            duration:
              SCENE_DURATION,
          };

    const response =
      await fetch(
        runwayUrl,
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
            JSON.stringify(
              runwayBody,
            ),

          cache:
            "no-store",
        },
      );

    const rawResponse =
      await response.text();

    let data: unknown =
      null;

    try {
      data =
        rawResponse
          ? JSON.parse(
              rawResponse,
            )
          : null;
    } catch {
      data =
        rawResponse;
    }

    if (!response.ok) {
      let runwayMessage =
        getRunwayErrorMessage(
          data,
        );

      if (
        !runwayMessage &&
        typeof data ===
          "string"
      ) {
        runwayMessage =
          data;
      }

      if (
        !runwayMessage
      ) {
        runwayMessage =
          response.statusText ||
          "Erreur Runway inconnue.";
      }

      const fullMessage =
        `Runway HTTP ${response.status} — ${runwayMessage}`;

      console.error(
        "RUNWAY VIDEO ERROR",
        {
          mode:
            useReferenceImage
              ? "image-to-video"
              : "text-to-video",

          status:
            response.status,

          statusText:
            response.statusText,

          response:
            data,
        },
      );

      return NextResponse.json(
        {
          success: false,

          status:
            response.status,

          error:
            fullMessage,

          runway:
            data,
        },
        {
          status:
            response.status,
        },
      );
    }

    if (
      !data ||
      typeof data !==
        "object"
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "Réponse Runway invalide.",

          runway:
            data,
        },
        {
          status: 502,
        },
      );
    }

    const runwayData =
      data as Record<
        string,
        unknown
      >;

    const taskId =
      typeof runwayData.id ===
      "string"
        ? runwayData.id
        : "";

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

      generationMode:
        useReferenceImage
          ? "image-to-video"
          : "text-to-video",

      referenceImageUsed:
        useReferenceImage,

      estimatedCost:
        runwayData
          .estimatedCost ??
        null,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur inconnue.";

    console.error(
      "RUNWAY ROUTE ERROR",
      error,
    );

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