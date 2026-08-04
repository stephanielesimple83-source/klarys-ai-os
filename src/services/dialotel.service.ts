import type { DialotelDashboard, Expert } from "@/types/dialotel";

export async function getDialotelDashboard(): Promise<DialotelDashboard> {
  return {
    revenue: 286,
    consultations: 34,
    connectedExperts: 12,
    waitingCalls: 2,
    averageDuration: "18 min",
  };
}

export async function getExperts(): Promise<Expert[]> {
  return [
    {
      id: 1,
      name: "Klarys",
      status: "online",
      calls: 12,
      revenue: 142,
    },
    {
      id: 2,
      name: "Catarina",
      status: "busy",
      calls: 9,
      revenue: 98,
    },
    {
      id: 3,
      name: "Léa",
      status: "online",
      calls: 7,
      revenue: 46,
    },
  ];
}