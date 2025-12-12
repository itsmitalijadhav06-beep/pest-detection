export interface Prediction {
  id: string;
  pestName: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  imageUrl: string;
}
export interface PredictionResponse {
  pest: string;
  confidence: number;
}

export type RiskLevel = 'safe' | 'warning' | 'danger';

export interface DashboardStats {
  totalDetections: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  lastUpdated: Date;
}
