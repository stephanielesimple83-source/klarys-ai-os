import { getDialotelStats } from "@/lib/api";

import type {
  DialotelDashboard,
  DialotelLiveData,
  Expert,
  ExpertStatus,
} from "@/types/dialotel";

const API_URL = "http://localhost:3005";

interface DialotelExpertApi {
  id: number;
  name: string;
  code: string;
  status: ExpertStatus;
  statusLabel: string;
  avatar: string | null;
}

interface DialotelExpertStatsApi {
  name: string;
  privateCalls: number;
  privateDuration: string;
  privateRevenue: number;
  premiumPrivateCalls: number;
  premiumPrivateDuration: string;
  premiumPrivateRevenue: number;
  audiotelCalls: number;
  audiotelListens: number;
  audiotelSpeakingDuration: string;
  audiotelListeningDuration: string;
  audiotelRevenue: number;
  totalCalls: number;
  totalRevenue: number;
}

function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export async function getLiveData(): Promise<DialotelLiveData> {
  const response = await fetch(`${API_URL}/dialotel/live`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Impossible de récupérer l'activité Live Dialotel (${response.status})`,
    );
  }

  return response.json();
}

export async function getDialotelDashboard(): Promise<DialotelDashboard> {
  const [stats, experts, live] = await Promise.all([
    getDialotelStats(),
    getExperts(),
    getLiveData(),
  ]);

  const revenue =
    stats.caCabinet.aujourdHui +
    stats.caSynergie.aujourdHui;

  const connectedExperts = experts.filter(
    (expert) =>
      expert.status === "online" ||
      expert.status === "busy",
  ).length;

  return {
    revenue,
    consultations: stats.consultations,
    connectedExperts,
    waitingCalls: live.currentCallsCount,
    averageDuration: "À connecter",
  };
}

export async function getExperts(): Promise<Expert[]> {
  const [expertsResponse, statsResponse] =
    await Promise.all([
      fetch(`${API_URL}/dialotel/experts`, {
        cache: "no-store",
      }),
      fetch(`${API_URL}/dialotel/experts/stats`, {
        cache: "no-store",
      }),
    ]);

  if (!expertsResponse.ok) {
    throw new Error(
      `Impossible de récupérer les experts Dialotel (${expertsResponse.status})`,
    );
  }

  if (!statsResponse.ok) {
    throw new Error(
      `Impossible de récupérer les statistiques experts Dialotel (${statsResponse.status})`,
    );
  }

  const experts =
    (await expertsResponse.json()) as DialotelExpertApi[];

  const expertStats =
    (await statsResponse.json()) as DialotelExpertStatsApi[];

  const statsByName = new Map(
    expertStats.map((stats) => [
      normalizeName(stats.name),
      stats,
    ]),
  );

  return experts.map((expert) => {
    const stats = statsByName.get(
      normalizeName(expert.name),
    );

    return {
      id: expert.id,
      name: expert.name,
      code: expert.code,
      status: expert.status,
      statusLabel: expert.statusLabel,
      avatar: expert.avatar,
      calls: stats?.totalCalls ?? 0,
      revenue: stats?.totalRevenue ?? 0,
    };
  });
}