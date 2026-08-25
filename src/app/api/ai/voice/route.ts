import {
  NextRequest,
  NextResponse,
} from "next/server";

export const dynamic =
  "force-dynamic";

const OPENAI_SPEECH_URL =
  "https://api.openai.com/v1/audio/speech";

export async function POST(
  request: NextRequest,
) {
  try {
    const apiKey =
      process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "La clé API OpenAI n'est pas configurée.",
        },
        {
          status: 500,
        },
      );
    }

    const body =
      await request.json();

    const text =
      typeof body?.text === "string"
        ? body.text.trim()
        : "";

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Le texte de la voix est obligatoire.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * On limite volontairement le texte.
     * Notre vidéo TikTok dure environ
     * 20 secondes.
     */
    const input =
      text.slice(0, 1200);

    const response =
      await fetch(
        OPENAI_SPEECH_URL,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${apiKey}`,

            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              model:
                "gpt-4o-mini-tts",

              voice:
                "coral",

              input,

              instructions:
                "Parle en français avec une voix féminine naturelle, chaleureuse, douce et élégante. Adopte un rythme fluide adapté à une courte vidéo TikTok. Évite un ton théâtral ou exagérément mystique.",

              response_format:
                "mp3",
            }),
        },
      );

    if (!response.ok) {
      const rawError =
        await response.text();

      console.error(
        "OPENAI VOICE ERROR",
        {
          status:
            response.status,

          response:
            rawError,
        },
      );

      return NextResponse.json(
        {
          success: false,

          error:
            `OpenAI Voice HTTP ${response.status} — ${rawError}`,
        },
        {
          status:
            response.status,
        },
      );
    }

    const audio =
      await response.arrayBuffer();

    return new NextResponse(
      audio,
      {
        status: 200,

        headers: {
          "Content-Type":
            "audio/mpeg",

          "Cache-Control":
            "no-store",
        },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur inconnue.";

    console.error(
      "OPENAI VOICE ROUTE ERROR",
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