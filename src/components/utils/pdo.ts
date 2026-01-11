// types/pdo.ts
export interface PDOIndicator {
  id: string;
  code: string;
  name: string;
  description: string;
  baseline: number;
  target: number;
  current: number;
  unit: string;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  dataSource: string;
  methodology: string;
  responsibleAgency: 'WRD' | 'DoA' | 'RDD' | 'FMISC';
  verificationMethod: string;
  status: 'on_track' | 'at_risk' | 'delayed' | 'achieved';
  progressPercentage: number;
}

export interface PDOProgress {
  id: string;
  indicatorId: string;
  period: string; // "2025-26", "2026-27"
  achievedValue: number;
  verified: boolean;
  verificationDate?: Date;
  verifiedBy?: string;
  supportingDocuments: string[];
  challenges: string[];
  remarks: string;
}

export interface PDOData {
  indicators: PDOIndicator[];
  progress: PDOProgress[];
  summary: {
    totalIndicators: number;
    indicatorsOnTrack: number;
    indicatorsAtRisk: number;
    overallProgress: number;
  };
}