import {
  NextRequest,
  NextResponse,
} from "next/server";

export const dynamic =
  "force-dynamic";

const OPENAI_RESPONSES_URL =
  "https://api.openai.com/v1/responses";

type GeneratedScene = {
  role: string;
  voiceText: string;
  screenText: string;
  visualPrompt: string;
};

type GeneratedContent = {
  title: string;
  hook: string;
  script: string;
  screenText: string[];
  caption: string;
  hashtags: string[];
  visualIdea: string;
  scenes: GeneratedScene[];
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

  const rawScenes =
    Array.isArray(
      record.scenes,
    )
      ? record.scenes
      : [];

  const scenes: GeneratedScene[] =
    rawScenes
      .filter(
        (item): item is Record<string, unknown> =>
          Boolean(item) &&
          typeof item === "object" &&
          !Array.isArray(item),
      )
      .map((item, index) => ({
        role:
          typeof item.role === "string"
            ? item.role.trim()
            : ["Accroche", "Développement", "Message central", "Conclusion"][index] ?? `Scène ${index + 1}`,
        voiceText:
          typeof item.voiceText === "string"
            ? item.voiceText.trim()
            : "",
        screenText:
          typeof item.screenText === "string"
            ? item.screenText.trim()
            : "",
        visualPrompt:
          typeof item.visualPrompt === "string"
            ? item.visualPrompt.trim()
            : "",
      }))
      .slice(0, 4);

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

    scenes,

    duration:
      typeof record.duration ===
      "string"
        ? record.duration.trim()
        : "20 secondes",
  };
}


function enforceTarotSceneRules(
  content: GeneratedContent,
  type: string,
) {
  if (
    type.trim().toLowerCase() !==
    "tirage du jour"
  ) {
    return content;
  }

  const forbiddenInstruction =
    "No tarot cards. No tarot deck. No oracle cards. No divination objects. Do not show or recreate the tarot card from scene 1.";

  const cleanedScenes =
    content.scenes.map(
      (scene, index) => {
        if (index === 0) {
          return scene;
        }

        let visualPrompt =
          scene.visualPrompt;

        /*
         * On retire les formulations les plus fréquentes
         * qui demandent explicitement de conserver ou
         * recréer une carte dans les scènes 2 à 4.
         */
        visualPrompt =
          visualPrompt
            .replace(
              /same\s+(?:tarot\s+)?card[^.]*\.?/gi,
              "",
            )
            .replace(
              /same\s+bateleur\s+card[^.]*\.?/gi,
              "",
            )
            .replace(
              /the\s+bateleur\s+card[^.]*\.?/gi,
              "",
            )
            .replace(
              /bateleur\s+card[^.]*\.?/gi,
              "",
            )
            .replace(
              /tarot\s+card[^.]*\.?/gi,
              "",
            )
            .replace(
              /tarot\s+deck[^.]*\.?/gi,
              "",
            )
            .replace(
              /two-card\s+spread[^.]*\.?/gi,
              "",
            )
            .replace(
              /second\s+card[^.]*\.?/gi,
              "",
            )
            .replace(
              /cards?\s+(?:remain|remains|visible|foreground|background)[^.]*\.?/gi,
              "",
            )
            .replace(
              /\s{2,}/g,
              " ",
            )
            .trim();

        if (
          !visualPrompt
            .toLowerCase()
            .includes(
              "no tarot cards",
            )
        ) {
          visualPrompt =
            `${visualPrompt}\n\n${forbiddenInstruction}`.trim();
        }

        return {
          ...scene,
          visualPrompt,
        };
      },
    );

  return {
    ...content,
    scenes:
      cleanedScenes,
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

Tu es spécialisé dans :
- TikTok France ;
- création de contenu court ;
- SEO TikTok ;
- recherche TikTok ;
- choix de hashtags ;
- voyance ;
- tarot ;
- spiritualité ;
- développement personnel ;
- lithothérapie ;
- bien-être ;
- commerce en ligne.

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
- pas de santé ;
- pas de grossesse ;
- pas de contenu destiné aux mineurs ;
- pas de formulation anxiogène ;
- éviter les clichés excessivement mystiques ;
- le script voix doit pouvoir être lu en environ 20 secondes ;
- la légende doit compléter la vidéo sans recopier mot pour mot le script ;
- les textes écran doivent être courts et lisibles.

HASHTAGS — PRIORITÉ ÉLEVÉE :

Les hashtags ne doivent JAMAIS être choisis comme une simple liste générique.

Avant de produire la réponse finale, analyse précisément :
1. le type de contenu ;
2. le sujet exact de la vidéo ;
3. l'intention probable de la personne qui regarde ou recherche ce contenu ;
4. le vocabulaire réellement utilisé autour de ce sujet ;
5. les recherches et tendances actuelles disponibles sur le web lorsqu'elles sont pertinentes.

Utilise la recherche web lorsque cela permet d'améliorer la sélection.

Tu dois sélectionner entre 6 et 8 hashtags.

Construis la sélection de cette manière :

CATÉGORIE A — SUJET EXACT
Choisis 2 ou 3 hashtags directement liés au sujet précis de cette vidéo.

CATÉGORIE B — NICHE
Choisis 2 ou 3 hashtags correspondant à l'audience réellement intéressée par ce type de contenu.

CATÉGORIE C — DÉCOUVERTE
Choisis 1 ou 2 hashtags légèrement plus larges, mais toujours cohérents avec le sujet.

Les hashtags doivent aider TikTok à comprendre :
- de quoi parle la vidéo ;
- à quelle audience la montrer ;
- pour quelles recherches elle peut être pertinente.

IMPORTANT :
La pertinence est plus importante que la taille du hashtag.

Un hashtag très ciblé est préférable à un énorme hashtag générique sans rapport précis avec la vidéo.

ADAPTATION AUTOMATIQUE :

Si le contenu concerne le tarot :
privilégie les hashtags réellement liés au tarot, au tirage et au thème précis du tirage.

Si le contenu concerne la voyance :
privilégie les hashtags correspondant à la voyance et au sujet traité.

Si le contenu concerne un tirage du jour :
utilise des hashtags liés au tirage du jour, mais adapte aussi plusieurs hashtags à la carte, au message ou au thème précis.

Si le contenu concerne la spiritualité :
ne mets pas automatiquement des hashtags tarot ou voyance si le contenu n'en parle pas.

Si le contenu concerne la lithothérapie :
utilise des hashtags liés aux pierres et surtout à la pierre ou au produit réellement présenté.

Si le contenu concerne un produit ou la boutique :
utilise des hashtags correspondant au produit, à son usage et à l'intention d'achat.

VARIATION :

Ne génère pas systématiquement la même combinaison de hashtags d'une vidéo à l'autre.

Les hashtags doivent évoluer selon :
- le sujet ;
- l'angle ;
- le message ;
- la carte de tarot éventuelle ;
- le produit éventuel ;
- l'intention de la vidéo.

INTERDICTIONS :

- aucun hashtag hors sujet ;
- aucun doublon ;
- pas de remplissage ;
- pas de liste générique identique sur toutes les vidéos ;
- pas automatiquement #fyp ;
- pas automatiquement #foryou ;
- pas automatiquement #pourtoi ;
- pas automatiquement #viral ;
- pas automatiquement #tiktok ;
- pas automatiquement #france ;
- pas #klarys sauf si la marque Klarys est réellement le sujet ;
- pas #bienetre si le contenu ne concerne pas directement le bien-être ;
- pas #energie si le mot est utilisé uniquement comme terme générique ;
- pas #developpementpersonnel si le sujet n'est pas réellement lié au développement personnel.

Ne choisis jamais un hashtag uniquement parce qu'il semble populaire.

Choisis-le parce qu'il correspond au contenu et à l'audience recherchée.

EXEMPLE DE LOGIQUE :

Pour une vidéo "Tirage du jour — Le Bateleur", ne te contente pas de :

#tiragedujour
#tarot
#intuitif
#developpementpersonnel
#bienetre
#energie

Analyse plutôt :
- le tirage du jour ;
- le tarot ;
- la carte du Bateleur ;
- sa notion de commencement ;
- la confiance ;
- le passage à l'action ;
- l'audience intéressée par les tirages tarot.

La combinaison finale doit être spécifique à CETTE vidéo.

LÉGENDE :

Le champ "caption" contient uniquement la légende.

Ne mets aucun hashtag dans "caption".

Tous les hashtags doivent être placés exclusivement dans le tableau "hashtags".

VISUEL — PRIORITÉ ÉLEVÉE :

Tu dois concevoir 4 scènes qui RACONTENT réellement le script ET qui restent immédiatement reconnaissables comme appartenant au TYPE DE CONTENU choisi.

Avant d'écrire les visualPrompt, identifie d'abord la famille visuelle à partir de TYPE DE CONTENU et du SUJET.
La famille visuelle doit rester cohérente sur les 4 scènes.

Chaque scène correspond à environ 5 secondes et doit avoir :
- son propre morceau de voix dans voiceText ;
- son texte écran court ;
- une action visuelle concrète et différente ;
- un visualPrompt autonome, directement exploitable par un générateur vidéo ;
- un lien visuel clair avec le type de contenu et le sujet.

RÈGLES NARRATIVES :
- scène 1 = accroche visuelle immédiate et identification claire du sujet ;
- scène 2 = développement concret de l'idée ;
- scène 3 = message central, révélation ou point fort ;
- scène 4 = conclusion visuelle et fermeture naturelle ;
- les 4 voiceText, lus à la suite, doivent raconter le même message que le script global ;
- chaque scène doit illustrer le SENS de son voiceText sans perdre l'identité visuelle du type de contenu.

ADAPTATION VISUELLE OBLIGATOIRE SELON LE TYPE :

1. SI TYPE DE CONTENU = "Tirage du jour"

OBJECTIF VISUEL :
La vidéo doit commencer comme un vrai tirage de tarot, puis transformer progressivement le message de la carte en scènes humaines et concrètes.

RÈGLE ABSOLUE :
UNE SEULE scène peut montrer une carte de tarot : la scène 1.

SCÈNE 1 — LE TIRAGE
- le spectateur doit comprendre immédiatement qu'il regarde un tirage de tarot ;
- montrer une personne qui tire ou révèle une seule carte ;
- si le sujet cite une carte précise, cette carte est celle révélée ;
- la carte peut être clairement visible dans cette scène ;
- décor lumineux, réaliste, élégant et crédible ;
- éviter les accessoires mystiques inutiles ;
- cette scène introduit le message de la carte.

SCÈNE 2 — LE SENS DU MESSAGE
- NE PLUS MONTRER DE TAROT ;
- illustrer concrètement la première signification importante de la carte ;
- utiliser une situation humaine réaliste correspondant au voiceText ;
- conserver si possible la même personne que dans la scène 1 ;
- créer une vraie action, pas une simple pose ;
- le décor peut changer logiquement pour raconter le message.

SCÈNE 3 — LA MISE EN SITUATION
- NE MONTRER AUCUNE CARTE ;
- NE MONTRER AUCUN JEU DE TAROT ;
- transformer le message central en action concrète ;
- montrer la personne en train de vivre, décider, commencer, choisir, avancer ou agir selon le sens exact du voiceText ;
- cette scène doit faire progresser l'histoire visuellement.

SCÈNE 4 — LA CONCLUSION
- NE PAS REVENIR AU TIRAGE ;
- NE MONTRER AUCUNE CARTE ;
- conclure le message par une action humaine claire ;
- la dernière image doit donner visuellement le sentiment correspondant à la conclusion du voiceText ;
- créer une véritable fin de mini-histoire.

INTERDICTION ABSOLUE POUR LES SCÈNES 2, 3 ET 4 :
Chaque visualPrompt des scènes 2, 3 et 4 doit obligatoirement contenir exactement cette instruction en anglais :

"No tarot cards. No tarot deck. No oracle cards. No divination objects. Do not show or recreate the tarot card from scene 1."

IMPORTANT :
- ne jamais demander de conserver la carte comme fil rouge après la scène 1 ;
- ne jamais demander de remettre la carte au premier plan ;
- ne jamais revenir sur la table de tarot pour conclure ;
- la continuité entre les scènes repose principalement sur la même personne, son apparence, sa tenue, la lumière et le style cinématographique ;
- les scènes 2, 3 et 4 racontent LE MESSAGE de la carte et non la carte elle-même ;
- ne transforme cependant pas ces scènes en images génériques sans rapport avec le voiceText ;
- chaque action doit illustrer précisément ce qui est raconté.

2. SI TYPE DE CONTENU = "Message du jour"
- l'univers peut être lifestyle, symbolique ou contemplatif ;
- aucune carte de tarot n'est nécessaire sauf si le sujet en parle explicitement ;
- privilégie des situations humaines simples, lumineuses et modernes qui traduisent le message.

3. SI TYPE DE CONTENU = "Voyance"
- l'univers doit être identifiable comme consultation ou pratique de voyance sans caricature ;
- cartes, oracle ou outils divinatoires peuvent être présents seulement s'ils correspondent au sujet ;
- conserver une esthétique professionnelle, chaleureuse et crédible ;
- ne pas transformer la scène en décor occulte sombre ou excessivement mystique.

4. SI TYPE DE CONTENU = "Psycho-énergétique"
- privilégie des scènes de détente, respiration, écoute, environnement calme, mouvement doux ou pratique énergétique sobre ;
- pas de tarot, oracle ou accessoires de voyance sauf si le sujet le demande explicitement ;
- esthétique lumineuse, rassurante et professionnelle.

5. SI TYPE DE CONTENU = "Présentation d'une séance"
- montrer concrètement le déroulement, l'accueil, la préparation, l'installation ou l'ambiance d'une séance ;
- donner une impression professionnelle, simple et rassurante ;
- les quatre scènes doivent suivre une progression logique comme un mini parcours client.

6. SI TYPE DE CONTENU = "Présentation Klarys"
- montrer une identité professionnelle cohérente et moderne ;
- faire apparaître des éléments pertinents de l'activité selon le sujet sans mélanger inutilement toutes les activités dans chaque scène ;
- privilégier une narration humaine et crédible.

7. SI LE SUJET CONCERNE LA LITHOTHÉRAPIE
- la pierre, le bracelet ou le bijou concerné doit rester le sujet principal ;
- montrer matière, couleur, porté, manipulation ou usage ;
- ne jamais remplacer le produit par une scène lifestyle générique.

8. SI LE SUJET CONCERNE UN PRODUIT OU LA BOUTIQUE
- le produit réel ou sa catégorie doit rester clairement identifiable dans chaque scène pertinente ;
- montrer successivement découverte, détail, utilisation ou bénéfice visuel, puis conclusion ;
- ne pas inventer d'autres produits qui détournent l'attention.

RÈGLES DE CONTINUITÉ :
- les 4 scènes doivent sembler appartenir à la même vidéo ;
- même personne, même apparence générale et même tenue si une personne récurrente apparaît ;
- décor cohérent ou transition logique entre décors ;
- palette lumineuse et style cinématographique cohérents ;
- conserver l'objet principal ou le sujet comme fil rouge lorsqu'il est essentiel à la compréhension ;
- chaque scène doit cependant avoir une action et un cadrage différents.

RÈGLES ANTI-RÉPÉTITION :
- ne montre pas quatre fois exactement les mêmes mains et le même cadrage ;
- ne montre pas quatre fois une carte statique sur une table ;
- ne montre pas quatre fois un gros plan identique ;
- varie plans serrés, plans moyens, angles et mouvements de caméra ;
- bougies, cristaux, fumée, tasse, pendule et accessoires mystiques ne doivent jamais être ajoutés automatiquement ;
- les accessoires doivent servir le sujet, jamais simplement décorer ;
- évite les scènes génériques qui pourraient convenir à n'importe quel thème ;
- esthétique réaliste, élégante, lumineuse et cinématographique ;
- format vertical 9:16 ;
- aucun logo, sous-titre, texte lisible ou watermark dans l'image générée.

COHÉRENCE SUJET / PROMPT :
- chaque visualPrompt doit être compatible avec le type et le sujet ;
- n'ajoute jamais une interdiction qui contredit le sujet, par exemple "no tarot card visible" pour un tirage du jour sur une carte précise ;
- n'ajoute jamais de carnet, laptop, café ou bureau uniquement pour représenter abstraitement "passer à l'action" si cela fait perdre l'identité du contenu ;
- pour traduire une idée abstraite, trouve d'abord une action compatible avec l'univers visuel du contenu ;
- si le sujet contient un objet central précis, conserve cet objet comme ancrage narratif.
- EXCEPTION PRIORITAIRE : pour "Tirage du jour", une carte de tarot éventuellement montrée en scène 1 ne doit JAMAIS être conservée comme objet ou ancrage narratif dans les scènes 2, 3 et 4 ;
- pour "Tirage du jour", la continuité narrative après la scène 1 repose sur la personne, l'ambiance et surtout le sens du message, jamais sur la présence de la carte ;

Le champ visualIdea décrit uniquement la direction artistique commune aux 4 scènes.
Le tableau scenes contient les instructions narratives précises.

IMPORTANT POUR visualPrompt :
- écris chaque visualPrompt en anglais pour optimiser l'interprétation du générateur vidéo ;
- décris le sujet, l'action, le décor, le cadrage, le mouvement de caméra et l'ambiance ;
- indique explicitement la continuité utile avec la scène précédente quand nécessaire ;
- indique clairement l'objet principal qui doit rester visible lorsqu'il est essentiel au sujet ;
- n'inclus aucun texte à afficher dans l'image ;
- ne recopie pas simplement le script dans le prompt visuel ;
- évite les formulations contradictoires ;
- écris des prompts concrets et filmables en environ 5 secondes.

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, avec exactement cette structure :

{
  "title": "Titre court",
  "hook": "Accroche",
  "script": "Script voix complet d'environ 20 secondes",
  "screenText": [
    "Texte scène 1",
    "Texte scène 2",
    "Texte scène 3",
    "Texte scène 4"
  ],
  "caption": "Légende TikTok naturelle sans hashtag",
  "hashtags": [
    "#hashtag1",
    "#hashtag2",
    "#hashtag3",
    "#hashtag4",
    "#hashtag5",
    "#hashtag6"
  ],
  "visualIdea": "Direction artistique commune, concise et concrète",
  "scenes": [
    {
      "role": "Accroche",
      "voiceText": "Première partie du script",
      "screenText": "Texte écran scène 1",
      "visualPrompt": "English cinematic prompt for scene 1"
    },
    {
      "role": "Développement",
      "voiceText": "Deuxième partie du script",
      "screenText": "Texte écran scène 2",
      "visualPrompt": "English cinematic prompt for scene 2"
    },
    {
      "role": "Message central",
      "voiceText": "Troisième partie du script",
      "screenText": "Texte écran scène 3",
      "visualPrompt": "English cinematic prompt for scene 3"
    },
    {
      "role": "Conclusion",
      "voiceText": "Dernière partie du script",
      "screenText": "Texte écran scène 4",
      "visualPrompt": "English cinematic prompt for scene 4"
    }
  ],
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
                3200,
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

    const normalizedContent =
      normalizeContent(
        parsed,
      );

    const content =
      enforceTarotSceneRules(
        normalizedContent,
        type,
      );

    if (
      !content.title ||
      !content.hook ||
      !content.script ||
      !content.caption ||
      content.screenText.length <
        4 ||
      content.scenes.length < 4 ||
      content.scenes.some(
        (scene) =>
          !scene.voiceText ||
          !scene.screenText ||
          !scene.visualPrompt,
      )
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

    if (
      content.hashtags.length <
      6
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "L'IA n'a pas généré suffisamment de hashtags pertinents. Réessaie la génération.",
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