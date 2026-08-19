const API_URL = "http://localhost:3005";

export type CrmSegment =
  | "VIP"
  | "PREMIUM"
  | "REGULIER"
  | "OCCASIONNEL"
  | "INACTIF";

export interface DialotelClientConsultation {
  id: number;
  date: string | null;
  time: string | null;
  cabinet: string | null;
  expert: string | null;
  duration: string | null;
  services: string[];
  amount: number;
  status: string | null;
  promoCode: string | null;
  detailUrl: string | null;
}

export interface DialotelClientReferrer {
  referrer: string | null;
  source: string | null;
  medium: string | null;
  campaign: string | null;
  identifier: string | null;
}

export interface DialotelClientDetail {
  id: number;

  pseudo: string | null;
  fullName: string | null;

  birthDate: string | null;
  age: number | null;

  email: string | null;
  phone: string | null;

  commercialOffers: boolean | null;

  segment: string | null;
  comment: string | null;

  totalSpent: number;

  referrer: DialotelClientReferrer;

  consultations: DialotelClientConsultation[];

  consultationsCount: number;
  consultationsAmount: number;

  favoriteExpert: string | null;
  lastConsultationDate: string | null;

  crmSegment: CrmSegment;
  crmScore: number;
  crmReason: string[];
}

export async function getDialotelClientDetail(
  id: number,
): Promise<DialotelClientDetail> {
  const response = await fetch(
    `${API_URL}/dialotel/clients/${id}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Impossible de récupérer le client Dialotel ${id} (${response.status})`,
    );
  }

  return response.json();
}