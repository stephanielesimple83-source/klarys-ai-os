export type ExpertStatus =
  | "online"
  | "busy"
  | "offline"
  | "unknown";

export interface Expert {
  id: number;
  name: string;
  code: string;
  status: ExpertStatus;
  statusLabel: string;
  avatar: string | null;
  calls: number;
  revenue: number;
}

export interface DialotelDashboard {
  revenue: number;
  consultations: number;
  connectedExperts: number;
  waitingCalls: number;
  averageDuration: string;
}

export interface DialotelCurrentCall {
  id: string;
  type: string;
  date: string;
  time: string;
  status: string;
  expert: string;
  client: string;
  source: string;
  minutes: string;
  maxMinutes: string;
}

export interface DialotelLastCall {
  id: string;
  time: string;
  expert: string;
  client: string;
  duration: string;
  type: string;
  amount: number | null;
  amountLabel: string;
}

export interface DialotelMissedCall {
  id: string;
  time: string;
  expert: string;
  client: string;
  type: string;
  missedBy: string;
}

export interface DialotelLiveData {
  currentCalls: DialotelCurrentCall[];
  lastCalls: DialotelLastCall[];
  missedCalls: DialotelMissedCall[];
  currentCallsCount: number;
  missedCallsCount: number;
  serverTime: string | null;
}