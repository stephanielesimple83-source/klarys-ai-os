const API_URL =
  "http://localhost:3005";

export type CampaignChannel =
  | "SMS"
  | "EMAIL";

export type CampaignStatus =
  | "BROUILLON"
  | "PRETE"
  | "ENVOYEE";

export type CampaignPromotionCode =
  | "NONE"
  | "RETOUR5"
  | "RETOUR10"
  | "VIP26"
  | "RECONQUETE";

export interface CampaignRecipient {
  clientId: number;

  name: string;

  phone:
    | string
    | null;

  email:
    | string
    | null;

  crmSegment:
    | string
    | null;

  crmScore:
    | number
    | null;

  totalSpent: number;

  consultationsCount:
    number;

  averageSpentPerConsultation:
    number;

  lastConsultationDate:
    | string
    | null;

  daysSinceLastConsultation:
    | number
    | null;

  favoriteExpert:
    | string
    | null;

  message: string;

  promotionCode:
    CampaignPromotionCode;

  promotionPercent:
    number;

  promotionReason:
    | string
    | null;

  smsCount: number;

  messageLength: number;
}

export interface DialotelCampaign {
  id: string;

  name: string;

  channel:
    CampaignChannel;

  status:
    CampaignStatus;

  createdAt: string;

  updatedAt: string;

  clientIds:
    number[];

  recipientsCount:
    number;

  historicalValue:
    number;

  recipients?:
    CampaignRecipient[];
}

export interface CreateCampaignInput {
  name: string;

  channel:
    CampaignChannel;

  status?:
    CampaignStatus;

  clientIds:
    number[];

  recipientsCount:
    number;

  historicalValue:
    number;

  recipients?:
    CampaignRecipient[];
}

export interface UpdateCampaignInput {
  name?:
    string;

  channel?:
    CampaignChannel;

  status?:
    CampaignStatus;

  clientIds?:
    number[];

  recipientsCount?:
    number;

  historicalValue?:
    number;

  recipients?:
    CampaignRecipient[];
}

/*
 * =========================================
 * APERÇU DIALOTEL
 * =========================================
 */

export interface DialotelPreviewItem {
  clientId: number;

  name: string;

  phone: string;

  crmSegment:
    | string
    | null;

  favoriteExpert:
    | string
    | null;

  promotionCode:
    CampaignPromotionCode;

  promotionPercent:
    number;

  promotionReason:
    | string
    | null;

  originalMessage:
    string;

  dialotelMessage:
    string;

  dialotelCharacterUnits:
    number;

  estimatedSmsCount:
    number;

  oneSms:
    boolean;
}

export interface DialotelCampaignPreview {
  campaignId: string;

  campaignName: string;

  channel:
    CampaignChannel;

  status:
    CampaignStatus;

  sender: string;

  recipientsCount:
    number;

  historicalValue:
    number;

  /*
   * Doit toujours être true
   * sur la route d'aperçu.
   */
  safePreview:
    boolean;

  /*
   * Doit toujours être false
   * sur la route d'aperçu.
   */
  sendsSms:
    boolean;

  items:
    DialotelPreviewItem[];
}

/*
 * =========================================
 * RÉSULTAT PUBLICATION DIALOTEL
 * =========================================
 */

export interface DialotelPublishResultItem {
  clientId: number;

  name: string;

  phone: string;

  dialotelCampaignName:
    string;

  success: boolean;

  statusCode:
    | number
    | null;

  redirect:
    | string
    | null;

  error:
    | string
    | null;
}

export interface DialotelPublishResult {
  campaignId: string;

  campaignName: string;

  sender: string;

  published:
    number;

  failed:
    number;

  allSucceeded:
    boolean;

  results:
    DialotelPublishResultItem[];
}

/*
 * =========================================
 * GESTION DES ERREURS API
 * =========================================
 */

async function readErrorMessage(
  response:
    Response,

  fallback:
    string,
): Promise<string> {
  const body =
    await response
      .json()
      .catch(
        () =>
          null,
      );

  if (
    body &&
    Array.isArray(
      body.message,
    )
  ) {
    return body.message.join(
      " ",
    );
  }

  return (
    body?.message ??
    fallback
  );
}

/*
 * =========================================
 * LISTE DES CAMPAGNES
 * =========================================
 */

export async function getCampaigns(): Promise<{
  count: number;

  campaigns:
    DialotelCampaign[];
}> {
  const response =
    await fetch(
      `${API_URL}/dialotel/campaigns`,
      {
        cache:
          "no-store",
      },
    );

  if (
    !response.ok
  ) {
    throw new Error(
      await readErrorMessage(
        response,
        `Impossible de récupérer les campagnes (${response.status})`,
      ),
    );
  }

  return response.json();
}

/*
 * =========================================
 * UNE CAMPAGNE
 * =========================================
 */

export async function getCampaign(
  id: string,
): Promise<DialotelCampaign> {
  const response =
    await fetch(
      `${API_URL}/dialotel/campaigns/${encodeURIComponent(
        id,
      )}`,
      {
        cache:
          "no-store",
      },
    );

  if (
    !response.ok
  ) {
    throw new Error(
      await readErrorMessage(
        response,
        `Impossible de récupérer la campagne (${response.status})`,
      ),
    );
  }

  return response.json();
}

/*
 * =========================================
 * CRÉATION CAMPAGNE INTERNE
 * =========================================
 *
 * IMPORTANT :
 * ceci n'envoie rien vers Dialotel.
 */

export async function createCampaign(
  input:
    CreateCampaignInput,
): Promise<DialotelCampaign> {
  const response =
    await fetch(
      `${API_URL}/dialotel/campaigns`,
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            input,
          ),

        cache:
          "no-store",
      },
    );

  if (
    !response.ok
  ) {
    throw new Error(
      await readErrorMessage(
        response,
        `Impossible de créer la campagne (${response.status})`,
      ),
    );
  }

  return response.json();
}

/*
 * =========================================
 * MODIFICATION CAMPAGNE INTERNE
 * =========================================
 */

export async function updateCampaign(
  id: string,

  input:
    UpdateCampaignInput,
): Promise<DialotelCampaign> {
  const response =
    await fetch(
      `${API_URL}/dialotel/campaigns/${encodeURIComponent(
        id,
      )}`,
      {
        method:
          "PATCH",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            input,
          ),

        cache:
          "no-store",
      },
    );

  if (
    !response.ok
  ) {
    throw new Error(
      await readErrorMessage(
        response,
        `Impossible de mettre à jour la campagne (${response.status})`,
      ),
    );
  }

  return response.json();
}

/*
 * =========================================
 * SUPPRESSION CAMPAGNE INTERNE
 * =========================================
 */

export async function deleteCampaign(
  id: string,
): Promise<{
  success: boolean;

  id: string;
}> {
  const response =
    await fetch(
      `${API_URL}/dialotel/campaigns/${encodeURIComponent(
        id,
      )}`,
      {
        method:
          "DELETE",

        cache:
          "no-store",
      },
    );

  if (
    !response.ok
  ) {
    throw new Error(
      await readErrorMessage(
        response,
        `Impossible de supprimer la campagne (${response.status})`,
      ),
    );
  }

  return response.json();
}

/*
 * =========================================
 * APERÇU DIALOTEL SÉCURISÉ
 * =========================================
 *
 * GET uniquement.
 *
 * Aucun POST vers Dialotel.
 * Aucun SMS envoyé.
 */

export async function getDialotelCampaignPreview(
  id: string,
): Promise<DialotelCampaignPreview> {
  const response =
    await fetch(
      `${API_URL}/dialotel/campaigns/${encodeURIComponent(
        id,
      )}/dialotel-preview`,
      {
        method:
          "GET",

        cache:
          "no-store",
      },
    );

  if (
    !response.ok
  ) {
    throw new Error(
      await readErrorMessage(
        response,
        `Impossible de préparer l'aperçu Dialotel (${response.status})`,
      ),
    );
  }

  const preview =
    await response.json() as
      DialotelCampaignPreview;

  /*
   * Sécurité supplémentaire côté frontend.
   *
   * Si le backend ne nous confirme pas
   * qu'il s'agit d'un aperçu sans envoi,
   * on bloque la suite.
   */

  if (
    preview.safePreview !==
      true ||
    preview.sendsSms !==
      false
  ) {
    throw new Error(
      "L'API n'a pas confirmé le mode aperçu sécurisé Dialotel.",
    );
  }

  return preview;
}

/*
 * =========================================
 * PUBLICATION RÉELLE DIALOTEL
 * =========================================
 *
 * ATTENTION :
 *
 * cette fonction peut créer réellement
 * les campagnes côté Dialotel.
 *
 * Elle exige donc DEUX confirmations.
 */

export async function publishCampaignToDialotel(
  id: string,

  options: {
    sender?: string;

    confirm:
      boolean;

    acknowledgeImmediateSend:
      boolean;
  },
): Promise<DialotelPublishResult> {
  /*
   * Première sécurité côté navigateur.
   */

  if (
    options.confirm !==
    true
  ) {
    throw new Error(
      "Publication Dialotel bloquée : confirmation absente.",
    );
  }

  /*
   * Deuxième sécurité côté navigateur.
   */

  if (
    options.acknowledgeImmediateSend !==
    true
  ) {
    throw new Error(
      "Publication Dialotel bloquée : confirmation d'envoi absente.",
    );
  }

  const response =
    await fetch(
      `${API_URL}/dialotel/campaigns/${encodeURIComponent(
        id,
      )}/publish-to-dialotel`,
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            /*
             * Confirmation 1
             */
            confirm:
              true,

            /*
             * Confirmation 2
             */
            acknowledgeImmediateSend:
              true,

            sender:
              options.sender ??
              "Klarys",
          }),

        cache:
          "no-store",
      },
    );

  if (
    !response.ok
  ) {
    throw new Error(
      await readErrorMessage(
        response,
        `Impossible de publier la campagne dans Dialotel (${response.status})`,
      ),
    );
  }

  return response.json();
}