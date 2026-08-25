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
      "Le contenu IA retournÃ© est invalide.",
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
            : ["Accroche", "DÃ©veloppement", "Message central", "Conclusion"][index] ?? `ScÃ¨ne ${index + 1}`,
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

  const tarotReferencePattern =
    /\b(?:tarot|bateleur|oracle\s+cards?|divination|cards?|deck|spread)\b/i;

  function cleanNonTarotPrompt(
    prompt: string,
  ) {
    const sentences =
      prompt.match(
        /[^.!?]+[.!?]?/g,
      ) ?? [];

    const cleaned =
      sentences
        .map(
          (sentence) =>
            sentence.trim(),
        )
        .filter(Boolean)
        .filter(
          (sentence) =>
            !tarotReferencePattern.test(
              sentence,
            ),
        )
        .join(" ")
        .replace(
          /\s{2,}/g,
          " ",
        )
        .trim();

    const safePrompt =
      cleaned ||
      "Vertical 9:16 cinematic continuation with the same adult person, same clothing and consistent warm natural lighting. Show one clear realistic human action that directly illustrates the spoken message. Elegant modern setting, natural facial expression, realistic movement, cinematic depth of field, no readable text, no subtitles, no logo, no watermark.";

    return `${safePrompt}\n\n${forbiddenInstruction}`;
  }

  const cleanedScenes =
    content.scenes.map(
      (scene, index) => {
        if (index === 0) {
          return scene;
        }

        return {
          ...scene,

          visualPrompt:
            cleanNonTarotPrompt(
              scene.visualPrompt,
            ),
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
            "La clÃ© API OpenAI n'est pas configurÃ©e.",
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
Tu es le responsable Ã©ditorial TikTok de Klarys AI OS.

Tu es spÃ©cialisÃ© dans :
- TikTok France ;
- crÃ©ation de contenu court ;
- SEO TikTok ;
- recherche TikTok ;
- choix de hashtags ;
- voyance ;
- tarot ;
- spiritualitÃ© ;
- dÃ©veloppement personnel ;
- lithothÃ©rapie ;
- bien-Ãªtre ;
- commerce en ligne.

Tu dois crÃ©er un contenu TikTok franÃ§ais court, naturel, crÃ©dible et optimisÃ© pour la rÃ©tention.

TYPE DE CONTENU :
${type}

SUJET :
${subject || "Choisis un angle pertinent adaptÃ© au type de contenu."}

TON :
${tone}

OBJECTIF :
CrÃ©er une vidÃ©o verticale d'environ 20 secondes structurÃ©e en 4 scÃ¨nes de 5 secondes.

RÃˆGLES DE CONTENU :
- franÃ§ais naturel et fluide ;
- accroche forte dÃ¨s la premiÃ¨re seconde ;
- pas de promesse mensongÃ¨re ;
- pas de santÃ© ;
- pas de grossesse ;
- pas de contenu destinÃ© aux mineurs ;
- pas de formulation anxiogÃ¨ne ;
- Ã©viter les clichÃ©s excessivement mystiques ;
- le script voix doit pouvoir Ãªtre lu en environ 20 secondes ;
- la lÃ©gende doit complÃ©ter la vidÃ©o sans recopier mot pour mot le script ;
- les textes Ã©cran doivent Ãªtre courts et lisibles.

HASHTAGS â€” PRIORITÃ‰ Ã‰LEVÃ‰E :

Les hashtags ne doivent JAMAIS Ãªtre choisis comme une simple liste gÃ©nÃ©rique.

Avant de produire la rÃ©ponse finale, analyse prÃ©cisÃ©ment :
1. le type de contenu ;
2. le sujet exact de la vidÃ©o ;
3. l'intention probable de la personne qui regarde ou recherche ce contenu ;
4. le vocabulaire rÃ©ellement utilisÃ© autour de ce sujet ;
5. les recherches et tendances actuelles disponibles sur le web lorsqu'elles sont pertinentes.

Utilise la recherche web lorsque cela permet d'amÃ©liorer la sÃ©lection.

Tu dois sÃ©lectionner entre 6 et 8 hashtags.

Construis la sÃ©lection de cette maniÃ¨re :

CATÃ‰GORIE A â€” SUJET EXACT
Choisis 2 ou 3 hashtags directement liÃ©s au sujet prÃ©cis de cette vidÃ©o.

CATÃ‰GORIE B â€” NICHE
Choisis 2 ou 3 hashtags correspondant Ã  l'audience rÃ©ellement intÃ©ressÃ©e par ce type de contenu.

CATÃ‰GORIE C â€” DÃ‰COUVERTE
Choisis 1 ou 2 hashtags lÃ©gÃ¨rement plus larges, mais toujours cohÃ©rents avec le sujet.

Les hashtags doivent aider TikTok Ã  comprendre :
- de quoi parle la vidÃ©o ;
- Ã  quelle audience la montrer ;
- pour quelles recherches elle peut Ãªtre pertinente.

IMPORTANT :
La pertinence est plus importante que la taille du hashtag.

Un hashtag trÃ¨s ciblÃ© est prÃ©fÃ©rable Ã  un Ã©norme hashtag gÃ©nÃ©rique sans rapport prÃ©cis avec la vidÃ©o.

ADAPTATION AUTOMATIQUE :

Si le contenu concerne le tarot :
privilÃ©gie les hashtags rÃ©ellement liÃ©s au tarot, au tirage et au thÃ¨me prÃ©cis du tirage.

Si le contenu concerne la voyance :
privilÃ©gie les hashtags correspondant Ã  la voyance et au sujet traitÃ©.

Si le contenu concerne un tirage du jour :
utilise des hashtags liÃ©s au tirage du jour, mais adapte aussi plusieurs hashtags Ã  la carte, au message ou au thÃ¨me prÃ©cis.

Si le contenu concerne la spiritualitÃ© :
ne mets pas automatiquement des hashtags tarot ou voyance si le contenu n'en parle pas.

Si le contenu concerne la lithothÃ©rapie :
utilise des hashtags liÃ©s aux pierres et surtout Ã  la pierre ou au produit rÃ©ellement prÃ©sentÃ©.

Si le contenu concerne un produit ou la boutique :
utilise des hashtags correspondant au produit, Ã  son usage et Ã  l'intention d'achat.

VARIATION :

Ne gÃ©nÃ¨re pas systÃ©matiquement la mÃªme combinaison de hashtags d'une vidÃ©o Ã  l'autre.

Les hashtags doivent Ã©voluer selon :
- le sujet ;
- l'angle ;
- le message ;
- la carte de tarot Ã©ventuelle ;
- le produit Ã©ventuel ;
- l'intention de la vidÃ©o.

INTERDICTIONS :

- aucun hashtag hors sujet ;
- aucun doublon ;
- pas de remplissage ;
- pas de liste gÃ©nÃ©rique identique sur toutes les vidÃ©os ;
- pas automatiquement #fyp ;
- pas automatiquement #foryou ;
- pas automatiquement #pourtoi ;
- pas automatiquement #viral ;
- pas automatiquement #tiktok ;
- pas automatiquement #france ;
- pas #klarys sauf si la marque Klarys est rÃ©ellement le sujet ;
- pas #bienetre si le contenu ne concerne pas directement le bien-Ãªtre ;
- pas #energie si le mot est utilisÃ© uniquement comme terme gÃ©nÃ©rique ;
- pas #developpementpersonnel si le sujet n'est pas rÃ©ellement liÃ© au dÃ©veloppement personnel.

Ne choisis jamais un hashtag uniquement parce qu'il semble populaire.

Choisis-le parce qu'il correspond au contenu et Ã  l'audience recherchÃ©e.

EXEMPLE DE LOGIQUE :

Pour une vidÃ©o "Tirage du jour â€” Le Bateleur", ne te contente pas de :

#tiragedujour
#tarot
#intuitif
#developpementpersonnel
#bienetre
#energie

Analyse plutÃ´t :
- le tirage du jour ;
- le tarot ;
- la carte du Bateleur ;
- sa notion de commencement ;
- la confiance ;
- le passage Ã  l'action ;
- l'audience intÃ©ressÃ©e par les tirages tarot.

La combinaison finale doit Ãªtre spÃ©cifique Ã  CETTE vidÃ©o.

LÃ‰GENDE :

Le champ "caption" contient uniquement la lÃ©gende.

Ne mets aucun hashtag dans "caption".

Tous les hashtags doivent Ãªtre placÃ©s exclusivement dans le tableau "hashtags".

VISUEL â€” PRIORITÃ‰ Ã‰LEVÃ‰E :

Tu dois concevoir 4 scÃ¨nes qui RACONTENT rÃ©ellement le script ET qui restent immÃ©diatement reconnaissables comme appartenant au TYPE DE CONTENU choisi.

Avant d'Ã©crire les visualPrompt, identifie d'abord la famille visuelle Ã  partir de TYPE DE CONTENU et du SUJET.
La famille visuelle doit rester cohÃ©rente sur les 4 scÃ¨nes.

Chaque scÃ¨ne correspond Ã  environ 5 secondes et doit avoir :
- son propre morceau de voix dans voiceText ;
- son texte Ã©cran court ;
- une action visuelle concrÃ¨te et diffÃ©rente ;
- un visualPrompt autonome, directement exploitable par un gÃ©nÃ©rateur vidÃ©o ;
- un lien visuel clair avec le type de contenu et le sujet.

RÃˆGLES NARRATIVES :
- scÃ¨ne 1 = accroche visuelle immÃ©diate et identification claire du sujet ;
- scÃ¨ne 2 = dÃ©veloppement concret de l'idÃ©e ;
- scÃ¨ne 3 = message central, rÃ©vÃ©lation ou point fort ;
- scÃ¨ne 4 = conclusion visuelle et fermeture naturelle ;
- les 4 voiceText, lus Ã  la suite, doivent raconter le mÃªme message que le script global ;
- chaque scÃ¨ne doit illustrer le SENS de son voiceText sans perdre l'identitÃ© visuelle du type de contenu.

ADAPTATION VISUELLE OBLIGATOIRE SELON LE TYPE :

1. SI TYPE DE CONTENU = "Tirage du jour"

OBJECTIF VISUEL :
La vidÃ©o doit commencer comme un vrai tirage de tarot, puis transformer progressivement le message de la carte en scÃ¨nes humaines et concrÃ¨tes.

RÃˆGLE ABSOLUE :
UNE SEULE scÃ¨ne peut montrer une carte de tarot : la scÃ¨ne 1.

SCÃˆNE 1 â€” LE TIRAGE
- le spectateur doit comprendre immÃ©diatement qu'il regarde un tirage de tarot ;
- montrer une personne qui tire ou rÃ©vÃ¨le une seule carte ;
- si le sujet cite une carte prÃ©cise, cette carte est celle rÃ©vÃ©lÃ©e ;
- la carte peut Ãªtre clairement visible dans cette scÃ¨ne ;
- dÃ©cor lumineux, rÃ©aliste, Ã©lÃ©gant et crÃ©dible ;
- Ã©viter les accessoires mystiques inutiles ;
- cette scÃ¨ne introduit le message de la carte.

SCÃˆNE 2 â€” LE SENS DU MESSAGE
- NE PLUS MONTRER DE TAROT ;
- illustrer concrÃ¨tement la premiÃ¨re signification importante de la carte ;
- utiliser une situation humaine rÃ©aliste correspondant au voiceText ;
- conserver si possible la mÃªme personne que dans la scÃ¨ne 1 ;
- crÃ©er une vraie action, pas une simple pose ;
- le dÃ©cor peut changer logiquement pour raconter le message.

SCÃˆNE 3 â€” LA MISE EN SITUATION
- NE MONTRER AUCUNE CARTE ;
- NE MONTRER AUCUN JEU DE TAROT ;
- transformer le message central en action concrÃ¨te ;
- montrer la personne en train de vivre, dÃ©cider, commencer, choisir, avancer ou agir selon le sens exact du voiceText ;
- cette scÃ¨ne doit faire progresser l'histoire visuellement.

SCÃˆNE 4 â€” LA CONCLUSION
- NE PAS REVENIR AU TIRAGE ;
- NE MONTRER AUCUNE CARTE ;
- conclure le message par une action humaine claire ;
- la derniÃ¨re image doit donner visuellement le sentiment correspondant Ã  la conclusion du voiceText ;
- crÃ©er une vÃ©ritable fin de mini-histoire.

INTERDICTION ABSOLUE POUR LES SCÃˆNES 2, 3 ET 4 :
Chaque visualPrompt des scÃ¨nes 2, 3 et 4 doit obligatoirement contenir exactement cette instruction en anglais :

"No tarot cards. No tarot deck. No oracle cards. No divination objects. Do not show or recreate the tarot card from scene 1."

IMPORTANT :
- ne jamais demander de conserver la carte comme fil rouge aprÃ¨s la scÃ¨ne 1 ;
- ne jamais demander de remettre la carte au premier plan ;
- ne jamais revenir sur la table de tarot pour conclure ;
- la continuitÃ© entre les scÃ¨nes repose principalement sur la mÃªme personne, son apparence, sa tenue, la lumiÃ¨re et le style cinÃ©matographique ;
- les scÃ¨nes 2, 3 et 4 racontent LE MESSAGE de la carte et non la carte elle-mÃªme ;
- ne transforme cependant pas ces scÃ¨nes en images gÃ©nÃ©riques sans rapport avec le voiceText ;
- chaque action doit illustrer prÃ©cisÃ©ment ce qui est racontÃ©.

2. SI TYPE DE CONTENU = "Message du jour"
- l'univers peut Ãªtre lifestyle, symbolique ou contemplatif ;
- aucune carte de tarot n'est nÃ©cessaire sauf si le sujet en parle explicitement ;
- privilÃ©gie des situations humaines simples, lumineuses et modernes qui traduisent le message.

3. SI TYPE DE CONTENU = "Voyance"
- l'univers doit Ãªtre identifiable comme consultation ou pratique de voyance sans caricature ;
- cartes, oracle ou outils divinatoires peuvent Ãªtre prÃ©sents seulement s'ils correspondent au sujet ;
- conserver une esthÃ©tique professionnelle, chaleureuse et crÃ©dible ;
- ne pas transformer la scÃ¨ne en dÃ©cor occulte sombre ou excessivement mystique.

4. SI TYPE DE CONTENU = "Psycho-Ã©nergÃ©tique"
- privilÃ©gie des scÃ¨nes de dÃ©tente, respiration, Ã©coute, environnement calme, mouvement doux ou pratique Ã©nergÃ©tique sobre ;
- pas de tarot, oracle ou accessoires de voyance sauf si le sujet le demande explicitement ;
- esthÃ©tique lumineuse, rassurante et professionnelle.

5. SI TYPE DE CONTENU = "PrÃ©sentation d'une sÃ©ance"
- montrer concrÃ¨tement le dÃ©roulement, l'accueil, la prÃ©paration, l'installation ou l'ambiance d'une sÃ©ance ;
- donner une impression professionnelle, simple et rassurante ;
- les quatre scÃ¨nes doivent suivre une progression logique comme un mini parcours client.

6. SI TYPE DE CONTENU = "PrÃ©sentation Klarys"
- montrer une identitÃ© professionnelle cohÃ©rente et moderne ;
- faire apparaÃ®tre des Ã©lÃ©ments pertinents de l'activitÃ© selon le sujet sans mÃ©langer inutilement toutes les activitÃ©s dans chaque scÃ¨ne ;
- privilÃ©gier une narration humaine et crÃ©dible.

7. SI LE SUJET CONCERNE LA LITHOTHÃ‰RAPIE
- la pierre, le bracelet ou le bijou concernÃ© doit rester le sujet principal ;
- montrer matiÃ¨re, couleur, portÃ©, manipulation ou usage ;
- ne jamais remplacer le produit par une scÃ¨ne lifestyle gÃ©nÃ©rique.

8. SI LE SUJET CONCERNE UN PRODUIT OU LA BOUTIQUE
- le produit rÃ©el ou sa catÃ©gorie doit rester clairement identifiable dans chaque scÃ¨ne pertinente ;
- montrer successivement dÃ©couverte, dÃ©tail, utilisation ou bÃ©nÃ©fice visuel, puis conclusion ;
- ne pas inventer d'autres produits qui dÃ©tournent l'attention.

RÃˆGLES DE CONTINUITÃ‰ :
- les 4 scÃ¨nes doivent sembler appartenir Ã  la mÃªme vidÃ©o ;
- mÃªme personne, mÃªme apparence gÃ©nÃ©rale et mÃªme tenue si une personne rÃ©currente apparaÃ®t ;
- dÃ©cor cohÃ©rent ou transition logique entre dÃ©cors ;
- palette lumineuse et style cinÃ©matographique cohÃ©rents ;
- conserver l'objet principal ou le sujet comme fil rouge lorsqu'il est essentiel Ã  la comprÃ©hension ;
- chaque scÃ¨ne doit cependant avoir une action et un cadrage diffÃ©rents.

RÃˆGLES ANTI-RÃ‰PÃ‰TITION :
- ne montre pas quatre fois exactement les mÃªmes mains et le mÃªme cadrage ;
- ne montre pas quatre fois une carte statique sur une table ;
- ne montre pas quatre fois un gros plan identique ;
- varie plans serrÃ©s, plans moyens, angles et mouvements de camÃ©ra ;
- bougies, cristaux, fumÃ©e, tasse, pendule et accessoires mystiques ne doivent jamais Ãªtre ajoutÃ©s automatiquement ;
- les accessoires doivent servir le sujet, jamais simplement dÃ©corer ;
- Ã©vite les scÃ¨nes gÃ©nÃ©riques qui pourraient convenir Ã  n'importe quel thÃ¨me ;
- esthÃ©tique rÃ©aliste, Ã©lÃ©gante, lumineuse et cinÃ©matographique ;
- format vertical 9:16 ;
- aucun logo, sous-titre, texte lisible ou watermark dans l'image gÃ©nÃ©rÃ©e.

COHÃ‰RENCE SUJET / PROMPT :
- chaque visualPrompt doit Ãªtre compatible avec le type et le sujet ;
- n'ajoute jamais une interdiction qui contredit le sujet, par exemple "no tarot card visible" pour un tirage du jour sur une carte prÃ©cise ;
- n'ajoute jamais de carnet, laptop, cafÃ© ou bureau uniquement pour reprÃ©senter abstraitement "passer Ã  l'action" si cela fait perdre l'identitÃ© du contenu ;
- pour traduire une idÃ©e abstraite, trouve d'abord une action compatible avec l'univers visuel du contenu ;
- si le sujet contient un objet central prÃ©cis, conserve cet objet comme ancrage narratif.
- EXCEPTION PRIORITAIRE : pour "Tirage du jour", une carte de tarot Ã©ventuellement montrÃ©e en scÃ¨ne 1 ne doit JAMAIS Ãªtre conservÃ©e comme objet ou ancrage narratif dans les scÃ¨nes 2, 3 et 4 ;
- pour "Tirage du jour", la continuitÃ© narrative aprÃ¨s la scÃ¨ne 1 repose sur la personne, l'ambiance et surtout le sens du message, jamais sur la prÃ©sence de la carte ;

Le champ visualIdea dÃ©crit uniquement la direction artistique commune aux 4 scÃ¨nes.
Le tableau scenes contient les instructions narratives prÃ©cises.

IMPORTANT POUR visualPrompt :
- Ã©cris chaque visualPrompt en anglais pour optimiser l'interprÃ©tation du gÃ©nÃ©rateur vidÃ©o ;
- dÃ©cris le sujet, l'action, le dÃ©cor, le cadrage, le mouvement de camÃ©ra et l'ambiance ;
- indique explicitement la continuitÃ© utile avec la scÃ¨ne prÃ©cÃ©dente quand nÃ©cessaire ;
- indique clairement l'objet principal qui doit rester visible lorsqu'il est essentiel au sujet ;
- n'inclus aucun texte Ã  afficher dans l'image ;
- ne recopie pas simplement le script dans le prompt visuel ;
- Ã©vite les formulations contradictoires ;
- Ã©cris des prompts concrets et filmables en environ 5 secondes.

RÃ©ponds UNIQUEMENT avec un objet JSON valide, sans markdown, avec exactement cette structure :

{
  "title": "Titre court",
  "hook": "Accroche",
  "script": "Script voix complet d'environ 20 secondes",
  "screenText": [
    "Texte scÃ¨ne 1",
    "Texte scÃ¨ne 2",
    "Texte scÃ¨ne 3",
    "Texte scÃ¨ne 4"
  ],
  "caption": "LÃ©gende TikTok naturelle sans hashtag",
  "hashtags": [
    "#hashtag1",
    "#hashtag2",
    "#hashtag3",
    "#hashtag4",
    "#hashtag5",
    "#hashtag6"
  ],
  "visualIdea": "Direction artistique commune, concise et concrÃ¨te",
  "scenes": [
    {
      "role": "Accroche",
      "voiceText": "PremiÃ¨re partie du script",
      "screenText": "Texte Ã©cran scÃ¨ne 1",
      "visualPrompt": "English cinematic prompt for scene 1"
    },
    {
      "role": "DÃ©veloppement",
      "voiceText": "DeuxiÃ¨me partie du script",
      "screenText": "Texte Ã©cran scÃ¨ne 2",
      "visualPrompt": "English cinematic prompt for scene 2"
    },
    {
      "role": "Message central",
      "voiceText": "TroisiÃ¨me partie du script",
      "screenText": "Texte Ã©cran scÃ¨ne 3",
      "visualPrompt": "English cinematic prompt for scene 3"
    },
    {
      "role": "Conclusion",
      "voiceText": "DerniÃ¨re partie du script",
      "screenText": "Texte Ã©cran scÃ¨ne 4",
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
        "OpenAI a refusÃ© la gÃ©nÃ©ration du contenu TikTok.";

      return NextResponse.json(
        {
          success: false,

          status:
            response.status,

          error:
            `OpenAI HTTP ${response.status} â€” ${message}`,
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
            "OpenAI n'a retournÃ© aucun contenu exploitable.",
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
            "OpenAI a retournÃ© un format inattendu. RÃ©essaie la gÃ©nÃ©ration.",
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
            "Le contenu gÃ©nÃ©rÃ© est incomplet. RÃ©essaie la gÃ©nÃ©ration.",
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
            "L'IA n'a pas gÃ©nÃ©rÃ© suffisamment de hashtags pertinents. RÃ©essaie la gÃ©nÃ©ration.",
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
