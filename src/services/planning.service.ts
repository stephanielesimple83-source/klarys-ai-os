const API_URL = "http://localhost:3005";

export interface PlanningSlot {
  id: number;
  start: string;
  end: string;
}

export interface PlanningExpert {
  id: number;
  name: string;
  color: string;
  plannedMinutes: number;
  plannedHours: number;
  currentlyScheduled: boolean;
  slots: PlanningSlot[];
}

export interface PrivatePlanning {
  date: string;
  expertsScheduled: number;
  currentlyScheduled: number;
  totalPlannedMinutes: number;
  totalPlannedHours: number;
  experts: PlanningExpert[];
}

export async function getPrivatePlanning(
  date?: string,
): Promise<PrivatePlanning> {
  const query = date
    ? `?date=${encodeURIComponent(date)}`
    : "";

  const response = await fetch(
    `${API_URL}/dialotel/planning/prive${query}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Impossible de récupérer le planning privé Dialotel (${response.status})`,
    );
  }

  return response.json();
}