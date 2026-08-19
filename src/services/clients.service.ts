const API_URL =
  "http://localhost:3005";

export type CrmSegment =
  | "VIP"
  | "PREMIUM"
  | "REGULIER"
  | "OCCASIONNEL"
  | "INACTIF";

export interface DialotelClient {
  id: number;

  code: string | null;

  pseudo: string;

  name: string;

  status: string;

  comment: string | null;

  email: string | null;

  phone: string | null;

  registrationDate:
    | string
    | null;

  privateBalance:
    | string
    | null;

  audiotelBalance:
    | string
    | null;

  totalSpent: number;

  lastPromo:
    | string
    | null;

  detailUrl: string;

  crmSegment:
    | CrmSegment
    | null;

  crmScore:
    | number
    | null;

  favoriteExpert:
    | string
    | null;

  lastConsultationDate:
    | string
    | null;

  daysSinceLastConsultation:
    | number
    | null;

  consultationsCount:
    | number
    | null;

  crmCalculated: boolean;
}

export interface DialotelClientsResponse {
  totalClients: number;

  totalPages: number;

  crmCalculatedClients: number;

  crmRemainingClients: number;

  crmAnalysisRunning: boolean;

  clients:
    DialotelClient[];
}

/*
 * =========================================
 * OPPORTUNITÉS CA CABINET
 * =========================================
 */

export type CabinetOpportunityPriority =
  | "CRITIQUE"
  | "HAUTE"
  | "MOYENNE"
  | "FAIBLE";

export interface CabinetOpportunityClient {
  clientId: number;

  pseudo: string;

  name: string;

  phone:
    | string
    | null;

  email:
    | string
    | null;

  commercialOffers: boolean;

  crmSegment:
    | CrmSegment
    | null;

  crmScore:
    | number
    | null;

  totalSpent: number;

  consultationsCount: number;

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

  lastPromo:
    | string
    | null;

  priority:
    CabinetOpportunityPriority;

  opportunityScore: number;

  reasons: string[];

  explanation: string[];

  estimatedHistoricalValue:
    number;
}

export interface CabinetOpportunitySummary {
  generatedAt: string;

  totalClientsAnalyzed: number;

  eligibleClients: number;

  excludedClients: {
    noPhone: number;

    commercialOffersDisabled:
      number;

    noCommercialHistory:
      number;
  };

  priorities: {
    critical: number;

    high: number;

    medium: number;

    low: number;
  };

  potential: {
    totalHistoricalValue:
      number;

    averageHistoricalValuePerClient:
      number;

    averageSpentPerConsultation:
      number;
  };

  recommendedCampaignSize:
    number;

  clients:
    CabinetOpportunityClient[];
}

/*
 * =========================================
 * CALCUL DE LA RÉCENCE
 * =========================================
 */

function getDaysSince(
  value:
    | string
    | null,
): number | null {
  if (!value) {
    return null;
  }

  const trimmed =
    value.trim();

  const frenchMatch =
    trimmed.match(
      /^(\d{2})\/(\d{2})\/(\d{4})$/,
    );

  let date:
    Date;

  if (
    frenchMatch
  ) {
    const [
      ,
      day,
      month,
      year,
    ] =
      frenchMatch;

    date =
      new Date(
        Number(
          year,
        ),
        Number(
          month,
        ) - 1,
        Number(
          day,
        ),
      );
  } else if (
    /^\d{4}-\d{2}-\d{2}/.test(
      trimmed,
    )
  ) {
    date =
      new Date(
        trimmed,
      );
  } else {
    return null;
  }

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  const now =
    new Date();

  const difference =
    now.getTime() -
    date.getTime();

  return Math.max(
    0,
    Math.floor(
      difference /
        (
          1000 *
          60 *
          60 *
          24
        ),
    ),
  );
}

/*
 * =========================================
 * CLIENTS CRM
 * =========================================
 *
 * Cache 60 secondes :
 * évite de recharger les 400+ clients
 * à chaque aller-retour Dashboard/Dialotel.
 */

export async function getAllDialotelClients(): Promise<DialotelClientsResponse> {
  const response =
    await fetch(
      `${API_URL}/dialotel/clients/all-crm`,
      {
        next: {
          revalidate:
            60,
        },
      },
    );

  if (
    !response.ok
  ) {
    throw new Error(
      `Impossible de récupérer les clients Dialotel (${response.status})`,
    );
  }

  const data =
    await response.json() as Omit<
      DialotelClientsResponse,
      "clients"
    > & {
      clients:
        Array<
          Omit<
            DialotelClient,
            "daysSinceLastConsultation"
          > & {
            daysSinceLastConsultation?:
              number
              | null;
          }
        >;
    };

  const clients:
    DialotelClient[] =
    data.clients.map(
      (
        client,
      ) => ({
        ...client,

        daysSinceLastConsultation:
          client.daysSinceLastConsultation ??
          getDaysSince(
            client.lastConsultationDate,
          ),
      }),
    );

  return {
    ...data,

    clients,
  };
}

/*
 * =========================================
 * OPPORTUNITÉS CABINET
 * =========================================
 *
 * Ici on garde no-store pour toujours
 * récupérer les opportunités les plus fraîches.
 */

export async function getCabinetOpportunities(
  limit = 30,
): Promise<CabinetOpportunitySummary> {
  const safeLimit =
    Math.min(
      100,
      Math.max(
        1,
        Math.floor(
          limit,
        ),
      ),
    );

  const response =
    await fetch(
      `${API_URL}/dialotel/opportunities/today?limit=${safeLimit}`,
      {
        cache:
          "no-store",
      },
    );

  if (
    !response.ok
  ) {
    throw new Error(
      `Impossible de récupérer les opportunités CA Cabinet (${response.status})`,
    );
  }

  return response.json();
}

/*
 * =========================================
 * ACTUALISATION FORCÉE
 * =========================================
 */

export async function refreshCabinetOpportunities(
  limit = 30,
): Promise<CabinetOpportunitySummary> {
  const safeLimit =
    Math.min(
      100,
      Math.max(
        1,
        Math.floor(
          limit,
        ),
      ),
    );

  const response =
    await fetch(
      `${API_URL}/dialotel/opportunities/today?limit=${safeLimit}&refresh=true`,
      {
        cache:
          "no-store",
      },
    );

  if (
    !response.ok
  ) {
    throw new Error(
      `Impossible d'actualiser les opportunités CA Cabinet (${response.status})`,
    );
  }

  return response.json();
}