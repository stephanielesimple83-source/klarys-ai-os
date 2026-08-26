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

    const promptText =
      customPrompt ||
      `
Photorealistic cinematic portrait of an elegant adult French woman in her early thirties.
Shoulder-length warm brown hair, natural hairstyle, brown eyes, refined natural facial features.
She wears the same elegant cream beige blouse and discreet small gold earrings.
Warm natural daylight, bright modern French interior, sophisticated but approachable appearance.
Medium portrait framing showing her face, hairstyle, blouse and upper body clearly.
Natural realistic skin texture, realistic photography, contemporary elegant aesthetic.
Neutral calm confident expression.
This woman will be used as the exact recurring main character of a vertical cinematic video series.
No tarot cards, no objects in hands, no text, no subtitles, no logo, no watermark.
      `.trim();

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
                "gen4_image_turbo",

              promptText:
                promptText.slice(
                  0,
                  1000,
                ),

              ratio:
                "720:1280",
            }),

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

      return NextResponse.json(
        {
          success: false,

          error:
            `Runway HTTP ${response.status} — ${
              runwayMessage ||
              response.statusText ||
              "Erreur Runway inconnue."
            }`,

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
            "Runway n'a pas retourné d'identifiant pour l'image.",

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
      estimatedCost:
        runwayData.estimatedCost ??
        null,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur inconnue.";

    console.error(
      "RUNWAY CHARACTER ERROR",
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