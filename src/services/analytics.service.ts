const API_URL = "http://localhost:3005";

export interface AnalyticsRevenuePoint {
  date: string;
  cabinet: number;
  synergy: number;
  total: number;
}

export interface AnalyticsExpert {
  id: number;
  name: string;
  status: string;
  statusLabel: string;
  calls: number;
  revenue: number;
  cabinetRevenue: number;
  synergyRevenue: number;
  averageRevenuePerCall: number;
}

export interface AnalyticsHourlyPoint {
  hour: string;
  consultations: number;
  revenue: number;
}

export interface DialotelAnalytics {
  revenue: {
    today: {
      cabinet: number;
      synergy: number;
      total: number;
    };

    month: {
      cabinet: number;
      synergy: number;
      total: number;
    };

    previousMonth: {
      cabinet: number;
      synergy: number;
      total: number;
    };

    history: AnalyticsRevenuePoint[];
  };

  distribution: {
    cabinetRevenue: number;
    synergyRevenue: number;
    totalRevenue: number;
    cabinetPercent: number;
    synergyPercent: number;
  };

  experts: AnalyticsExpert[];

  hourly: AnalyticsHourlyPoint[];

  live: {
    currentCalls: number;
    missedCalls: number;
    lastCallsCount: number;
  };

  planning: {
    date: string;
    expertsScheduled: number;
    currentlyScheduled: number;
    totalPlannedMinutes: number;
    totalPlannedHours: number;
  };
}

export async function getDialotelAnalytics(): Promise<DialotelAnalytics> {
  const response = await fetch(
    `${API_URL}/dialotel/analytics`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Impossible de récupérer les Analytics Dialotel (${response.status})`,
    );
  }

  return response.json();
}