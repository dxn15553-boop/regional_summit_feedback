
export type UserRole = 'Admin' | 'Viewer';

export interface GuestInfo {
  name: string;
  designation: string;
  country: string;
  email: string;
}

export interface FeedbackData {
  id: string;
  timestamp: string;
  guestInfo: GuestInfo;

  // Section B — 7 Core Evaluation Categories (each has multiple rated aspects)
  overallSummitExperience: Record<string, number>;
  technicalSessions: Record<string, number>;
  factoryVisits: Record<string, number>;
  hospitality: Record<string, number>;
  transportation: Record<string, number>;
  foodRefreshments: Record<string, number>;
  eventAdministration: Record<string, number>;

  // Section C — Qualitative open-ended questions
  mostValuableAspect: string;
  mostImpactfulSession: string;
  suggestionsForImprovement: string;
  futureTopics: string;

  // Overall
  overallExperience: number;
  recommendToOthers: boolean;

  // AI / admin metadata
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
  aiSummary?: string;
  isReviewed?: boolean;
}

export interface DashboardStats {
  totalResponses: number;
  averageRating: number;
  countriesParticipated: number;
  overallSatisfaction: number;
  sentimentDistribution: { label: string; value: number }[];
  categoryPerformance: { category: string; rating: number }[];
}
