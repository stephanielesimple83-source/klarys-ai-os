export interface DialotelDashboard {
  revenue: number;
  consultations: number;
  connectedExperts: number;
  waitingCalls: number;
  averageDuration: string;
}

export interface Expert {
  id: number;
  name: string;
  status: "online" | "offline" | "busy";
  calls: number;
  revenue: number;
}