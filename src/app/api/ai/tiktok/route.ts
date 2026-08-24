import {
  NextRequest,
  NextResponse,
} from "next/server";

export const dynamic =
  "force-dynamic";

const OPENAI_RESPONSES_URL =
  "https://api.openai.com/v1/responses";

const ALLOWED_CONTENT_TYPES = [
  "Tirage du jour",
  "Message du jour",
  "Voyance",
  "Psycho-énergétique",
  "Présentation d'une séance",
  "Présentation Klarys",
];

type GeneratedTikTokContent = {
  title: string;
  hook: string;
  script: string;
  screenText: string[];
  caption: string;
  hashtags: string[];
  visualIdea: string;
  duration: string;
};

function extractOutputText(
  data: unknown,
) {
  const response =
    data as {
      output?: Array<{
        type?: string;
        content?: Array<{
          type?: string;
          text?: string;
        }>;
      }>;
    };

  const texts: string[] = [];

  for (
    const item of
      response.output ?? []
  ) {
    for (
      const content of
        item.content ?? []
    ) {
      if (
        content.type ===
          "output_text" &&
        content.text
      ) {
        texts.push(
          content.text,
        );
      }
    }
  }

  return texts.join("\n").trim();
}

function parseJsonResponse(
  text: string,
): GeneratedTikTokContent {
  const cleaned =
    text
      .trim()
      .replace(
        /^```json\s*/i,
        "",
      )
      .replace(
        /^```\s*/i,
        "",
      )
      .replace(
        /\s*```$/,
        "",
      )
      .trim();

  return JSON.parse(
    cleaned,
  ) as GeneratedTikTokContent;
}

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
            "OPENAI_API_KEY est absente.",
        },
        {
          status: 500,
        },
      );
    }

    const body =
      await request.json();

    const contentType =
      String(
        body?.contentType ?? "",
      ).trim();

    const subject =
      String(
        body?.subject ?? "",
      ).trim();

    const tone =
      String(
        body?.tone ??
          "naturel, chaleureux et professionnel",
      ).trim();

    if (
      !ALLOWED_CONTENT_TYPES.includes(
        contentType,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Type de contenu invalide.",
        },
        {
          status: 400,
        },
      );
    }

    const prompt = `
Tu es le studio éditorial TikTok de Klarys.

Tu crées un contenu vidéo court en français pour le compte Klarys.

TYPE DE CONTENU :
${contentType}

SUJET OU IDÉE :
${subject || "Choisis toi-même un sujet pertinent et engageant."}

TON :
${tone}

OBJECTIF :
Créer un contenu TikTok naturel, crédible, humain, facile à comprendre et adapté à une vidéo verticale courte.

RÈGLES :
- Pas de clickbait agressif.
- Pas de promesse garantie.
- Pas de diagnostic médical.
- Pour la psycho-énergétique, rester dans le bien-être et l'accompagnement.
- Pour la voyance, présenter le contenu comme intuitif ou symbolique, jamais comme une certitude absolue.
- Ne pas créer de conseil dangereux.
- Ne pas inventer de témoignages.
- Éviter les phrases génériques trop "IA".
- Le français doit être naturel.
- L'accroche doit retenir l'attention dans les 2 premières secondes.
- Le script doit être facile à dire à voix haute.
- La vidéo visée doit durer environ 15 à 35 secondes.
- Les hashtags doivent être pertinents et raisonnables : 4 à 7 maximum.

RETOURNE UNIQUEMENT UN OBJET JSON VALIDE.
Aucun markdown.
Aucun texte avant ou après.

Utilise exactement cette structure :

{
  "title": "titre interne court",
  "hook": "phrase d'accroche",
  "script": "script complet à dire",
  "screenText": [
    "texte écran 1",
    "texte écran 2",
    "texte écran 3"
  ],
  "caption": "légende TikTok",
  "hashtags": [
    "#hashtag1",
    "#hashtag2"
  ],
  "visualIdea": "description simple de la vidéo ou des plans à utiliser",
  "duration": "20-30 secondes"
}
`;

    const response =
      await fetch(
        OPENAI_RESPONSES_URL,
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
                "gpt-5.6-luna",

              input:
                prompt,
            }),

          cache:
            "no-store",
        },
      );

    const data =
      await response.json();

    if (!response.ok) {
      const openAIError =
        data?.error?.message ??
        "Erreur OpenAI.";

      return NextResponse.json(
        {
          success: false,
          error:
            openAIError,
        },
        {
          status:
            response.status,
        },
      );
    }

    const outputText =
      extractOutputText(
        data,
      );

    if (!outputText) {
      return NextResponse.json(
        {
          success: false,
          error:
            "OpenAI n'a retourné aucun contenu.",
        },
        {
          status: 500,
        },
      );
    }

    let generated:
      GeneratedTikTokContent;

    try {
      generated =
        parseJsonResponse(
          outputText,
        );
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "La réponse IA n'a pas pu être interprétée.",
          raw:
            outputText,
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,
      content:
        generated,
    });
  } catch (error) {
    console.error(
      "KLARYS TIKTOK AI ERROR",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Impossible de générer le contenu.",
      },
      {
        status: 500,
      },
    );
  }
}