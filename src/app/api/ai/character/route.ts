import {
  NextRequest,
  NextResponse,
} from "next/server";

export const dynamic =
  "force-dynamic";

const RUNWAY_API_URL =
  "https://api.dev.runwayml.com/v1/text_to_image";

const RUNWAY_API_VERSION =
  "2024-11-06";

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

    const customPrompt =
      typeof body?.prompt ===
      "string"
        ? body.prompt.trim()
        : "";

    const defaultPrompt =
      `
Photorealistic cinematic portrait of an elegant adult French woman in her early thirties.
Shoulder-length warm brown hair, natural hairstyle, brown eyes and refined natural facial features.
She wears an elegant cream beige blouse and discreet small gold earrings.
Warm natural daylight in a bright modern elegant interior.
Natural realistic skin texture and realistic photography.
Calm, warm and confident facial expression.
Medium portrait framing showing her face, hairstyle, blouse and upper body clearly.
She is the recurring main character of a cinematic vertical social media video series.
Neutral pose, hands relaxed, looking naturally toward the camera.
No tarot cards.
No oracle cards.
No divination objects.
No objects in her hands.
No text.
No subtitles.
No logo.
No watermark.
      `.trim();

    const promptText =
      (
        customPrompt ||
        defaultPrompt
      ).slice(
        0,
        1000,
      );

    const runwayBody = {
      model:
        "gen4_image",

      promptText,

      ratio:
        "1080:1920",
    };

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
            JSON.stringify(
              runwayBody,
            ),

          cache:
            "no-store",
        },
      );

    /*
     * On récupère d'abord la
     * réponse brute afin de pouvoir
     * afficher les erreurs Runway
     * même si elles ne sont pas
     * retournées sous forme JSON.
     */
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
        "RUNWAY CHARACTER ERROR",
        {
          status:
            response.status,

          statusText:
            response.statusText,

          requestBody:
            runwayBody,

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
            "Runway n'a pas retourné d'identifiant pour la génération du personnage.",

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

      type:
        "character-reference",

      model:
        "gen4_image",

      ratio:
        "1080:1920",

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
      "RUNWAY CHARACTER ROUTE ERROR",
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