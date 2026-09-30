/**
 * Dashboard & Lab Health Domain Types
 * 1:1 Parity with backend `DashboardStatsDto` and Report domain enums.
 */

export interface DashboardStatsDto {
  todayPatientsCount: number;
  todayReportsCount: number;
  pendingResultsCount: number;
  readyForReviewCount: number;
  finalizedTodayCount: number;
  overdueCount: number;
  todayRevenue: number;
  pendingCollectionsCount: number;
}

export type ReportStatus = 'DRAFT' | 'FINALIZED';
export type SampleStatus = 'COLLECTED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';

export interface PatientSummary {
  id: string;
  patientNumber: string;
  name: string;
  ageYears?: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone?: string;
}

export interface ReportSummary {
  id: string;
  reportNumber: string;
  patientId: string;
  patient?: PatientSummary;
  status: ReportStatus;
  sampleStatus: SampleStatus;
  isCritical?: boolean;
  createdAt: string;
}
