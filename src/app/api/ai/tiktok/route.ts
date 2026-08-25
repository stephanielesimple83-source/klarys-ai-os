import {
  NextRequest,
  NextResponse,
} from "next/server";

export const dynamic =
  "force-dynamic";

const OPENAI_RESPONSES_URL =
  "https://api.openai.com/v1/responses";

type GeneratedContent = {
  title: string;
  hook: string;
  script: string;
  screenText: string[];
  caption: string;
  hashtags: string[];
  visualIdea: string;
  duration: string;
};

type OpenAIResponse = {
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;

  error?: {
    message?: string;
    code?: string;
  };
};

function extractOutputText(
  data: OpenAIResponse,
) {
  const texts: string[] = [];

  for (
    const item of
    data.output ?? []
  ) {
    for (
      const content of
      item.content ?? []
    ) {
      if (
        content.type ===
          "output_text" &&
        typeof content.text ===
          "string"
      ) {
        texts.push(
          content.text,
        );
      }
    }
  }

  return texts
    .join("\n")
    .trim();
}

function cleanJsonText(
  value: string,
) {
  return value
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
}

function normalizeHashtag(
  value: string,
) {
  const cleaned =
    value
      .trim()
      .replace(
        /\s+/g,
        "",
      )
      .replace(
        /^#+/,
        "",
      )
      .replace(
        /[^\p{L}\p{N}_]/gu,
        "",
      );

  return cleaned
    ? `#${cleaned}`
    : "";
}

function normalizeContent(
  value: unknown,
): GeneratedContent {
  if (
    !value ||
    typeof value !==
      "object"
  ) {
    throw new Error(
      "Le contenu IA retourné est invalide.",
    );
  }

  const record =
    value as Record<
      string,
      unknown
    >;

  const screenText =
    Array.isArray(
      record.screenText,
    )
      ? record.screenText
          .filter(
            (
              item,
            ): item is string =>
              typeof item ===
              "string",
          )
          .map(
            (item) =>
              item.trim(),
          )
          .filter(Boolean)
          .slice(0, 4)
      : [];

  const rawHashtags =
    Array.isArray(
      record.hashtags,
    )
      ? record.hashtags
          .filter(
            (
              item,
            ): item is string =>
              typeof item ===
              "string",
          )
      : [];

  const hashtags =
    Array.from(
      new Set(
        rawHashtags
          .map(
            normalizeHashtag,
          )
          .filter(Boolean),
      ),
    ).slice(0, 8);

  return {
    title:
      typeof record.title ===
      "string"
        ? record.title.trim()
        : "",

    hook:
      typeof record.hook ===
      "string"
        ? record.hook.trim()
        : "",

    script:
      typeof record.script ===
      "string"
        ? record.script.trim()
        : "",

    screenText,

    caption:
      typeof record.caption ===
      "string"
        ? record.caption.trim()
        : "",

    hashtags,

    visualIdea:
      typeof record.visualIdea ===
      "string"
        ? record.visualIdea.trim()
        : "",

    duration:
      typeof record.duration ===
      "string"
        ? record.duration.trim()
        : "20 secondes",
  };
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
            "La clé API OpenAI n'est pas configurée.",
        },
        {
          status: 500,
        },
      );
    }

    const body =
      await request.json();

    const type =
      typeof body?.type ===
      "string"
        ? body.type.trim()
        : "";

    const subject =
      typeof body?.subject ===
      "string"
        ? body.subject.trim()
        : "";

    const tone =
      typeof body?.tone ===
      "string"
        ? body.tone.trim()
        : "Naturel et chaleureux";

    if (!type) {
      return NextResponse.json(
        {
          success: false,

          error:
            "Le type de contenu est obligatoire.",
        },
        {
          status: 400,
        },
      );
    }

    const prompt = `
Tu es le responsable éditorial TikTok de Klarys AI OS.

Tu dois créer un contenu TikTok français court, naturel, crédible et optimisé pour la rétention.

TYPE DE CONTENU :
${type}

SUJET :
${subject || "Choisis un angle pertinent adapté au type de contenu."}

TON :
${tone}

OBJECTIF :
Créer une vidéo verticale d'environ 20 secondes structurée en 4 scènes de 5 secondes.

RÈGLES DE CONTENU :
- français naturel et fluide ;
- accroche forte dès la première seconde ;
- pas de promesse mensongère ;
- pas de santé, grossesse ou contenu destiné aux mineurs ;
- pas de formulation anxiogène ;
- éviter les clichés excessivement mystiques ;
- le script voix doit pouvoir être lu en environ 20 secondes ;
- la légende doit compléter la vidéo sans recopier mot pour mot le script ;
- les textes écran doivent être courts et lisibles.

HASHTAGS — TRÈS IMPORTANT :
Tu dois sélectionner les hashtags les plus pertinents pour CE sujet précis.
Utilise la recherche web si elle aide à identifier les usages actuels et pertinents.
Choisis 6 à 8 hashtags maximum.
Mélange intelligemment :
1. 2 à 3 hashtags très ciblés sur le sujet exact ;
2. 2 à 3 hashtags de niche réellement utilisés par l'audience concernée ;
3. 1 à 2 hashtags plus larges mais toujours directement pertinents.

Interdictions :
- ne mets PAS automatiquement #fyp, #foryou, #viral ou #tiktok ;
- ne mets PAS #klarys sauf si la marque est réellement le sujet de la vidéo ;
- ne mets PAS #bienetre si le contenu ne concerne pas directement le bien-être ;
- aucun hashtag hors sujet ;
- aucun doublon ;
- privilégie la pertinence et l'intention de recherche plutôt que le volume brut.

VISUEL :
Le champ visualIdea doit décrire un univers cinématographique concret qui pourra ensuite être découpé en quatre scènes Runway différentes.

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, avec exactement cette structure :

{
  "title": "Titre court",
  "hook": "Accroche",
  "script": "Script voix d'environ 20 secondes",
  "screenText": [
    "Texte scène 1",
    "Texte scène 2",
    "Texte scène 3",
    "Texte scène 4"
  ],
  "caption": "Légende TikTok naturelle",
  "hashtags": [
    "#hashtag1",
    "#hashtag2",
    "#hashtag3",
    "#hashtag4",
    "#hashtag5",
    "#hashtag6"
  ],
  "visualIdea": "Description visuelle détaillée",
  "duration": "20 secondes"
}
    `.trim();

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

              tools: [
                {
                  type:
                    "web_search",
                },
              ],

              tool_choice:
                "auto",

              max_output_tokens:
                1800,
            }),

          cache:
            "no-store",
        },
      );

    const data =
      (await response.json()) as
        OpenAIResponse;

    if (!response.ok) {
      const message =
        data?.error?.message ??
        "OpenAI a refusé la génération du contenu TikTok.";

      return NextResponse.json(
        {
          success: false,

          status:
            response.status,

          error:
            `OpenAI HTTP ${response.status} — ${message}`,
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
            "OpenAI n'a retourné aucun contenu exploitable.",
        },
        {
          status: 502,
        },
      );
    }

    let parsed:
      unknown;

    try {
      parsed =
        JSON.parse(
          cleanJsonText(
            outputText,
          ),
        );
    } catch {
      console.error(
        "OPENAI TIKTOK JSON PARSE ERROR",
        {
          outputText,
        },
      );

      return NextResponse.json(
        {
          success: false,

          error:
            "OpenAI a retourné un format inattendu. Réessaie la génération.",
        },
        {
          status: 502,
        },
      );
    }

    const content =
      normalizeContent(
        parsed,
      );

    if (
      !content.title ||
      !content.hook ||
      !content.script ||
      !content.caption ||
      content.screenText.length <
        4
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "Le contenu généré est incomplet. Réessaie la génération.",
        },
        {
          status: 502,
        },
      );
    }

    return NextResponse.json({
      success: true,

      content,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur inconnue.";

    console.error(
      "OPENAI TIKTOK CONTENT ERROR",
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