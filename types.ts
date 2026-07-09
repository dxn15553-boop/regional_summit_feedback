
export type UserRole = 'Admin' | 'Viewer';

export interface GuestInfo {
  name: string;
  country: string;
  designation: string;
}

export interface FeedbackData {
  id: string;
  timestamp: string;
  guestInfo: GuestInfo;
  registrationReception: Record<string, number>;
  accommodation: Record<string, number>;
  galaDinner: Record<string, number>;
  culturalProgram: Record<string, number>;
  eventManagement: Record<string, number>;
  factoryVisit: Record<string, number>;
  venue: Record<string, number>;
  transportation: Record<string, number>;
  HouseKeeping: Record<string, number>;
  Food: Record<string, number>;
  roomNo: Record<string, number>;
  products: Record<string, number>;
  overallExperience: number;
  suggestions: string;
  recommendToOthers: boolean;
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
