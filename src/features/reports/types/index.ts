/**
 * Diagnostic Reports, Patients & Panels Domain Types
 * 1:1 Parity with backend entities and DTOs
 */

export type SexEnum = 'MALE' | 'FEMALE' | 'OTHER';

export interface Patient {
  id: string;
  patientNumber: string;
  name: string;
  age?: string | null;
  dateOfBirth?: string | null;
  sex?: SexEnum;
  phone?: string | null;
  address?: string | null;
  bloodGroup?: string | null;
  reportsCount?: number;
  lastVisitTest?: string | null;
  lastVisitDate?: string | null;
  hasAbnormal?: boolean;
  primaryClinician?: string | null;
  createdAt: string;
}

export interface CreatePatientDto {
  patientNumber?: string;
  name: string;
  age?: string | null;
  dateOfBirth?: string | null;
  sex?: SexEnum;
  phone?: string | null;
  address?: string | null;
}

export interface TestPanel {
  id: string;
  name: string;
  category: string;
  price: number;
  sortOrder: number;
  specimenType?: string;
  tatMinutes?: number;
}

export interface ReferringDoctor {
  id: string;
  name: string;
  clinic?: string | null;
  phone?: string | null;
  email?: string | null;
}

import type { Invoice, PaymentMethod, InvoicePaymentStatus } from '@/features/billing/types';

export interface CreateReportBillingDto {
  discount?: number;
  paymentMethod?: PaymentMethod;
  paymentStatus?: InvoicePaymentStatus;
  paidAmount?: number;
  notes?: string;
}

export interface CreateReportDto {
  patientId: string;
  reportNumber?: string;
  refByDoctorId?: string | null;
  panelIds: string[];
  remarks?: string | null;
  billing?: CreateReportBillingDto;
}

export type ReportStatus = 'DRAFT' | 'FINALIZED';
export type SampleStatus = 'COLLECTED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';

export type NormalRangeType = 'numeric' | 'text' | 'gender_specific';

export interface GenderRange {
  min: number;
  max: number;
}

export interface StructuredNormalRange {
  type: NormalRangeType;
  min?: number;
  max?: number;
  male?: GenderRange;
  female?: GenderRange;
  text?: string;
  panicLow?: number;
  panicHigh?: number;
}

export type ParameterInputType = 'TEXT' | 'NUMBER' | 'DROPDOWN' | 'GRID';

export interface PanelParameter {
  id: string;
  sectionId?: string;
  name: string;
  nameLocal?: string | null;
  unit?: string | null;
  inputType: ParameterInputType;
  options?: string[] | null;
  method?: string | null;
  normalRange?: StructuredNormalRange | null;
  sortOrder: number;
}

export interface PanelSection {
  id: string;
  panelId?: string;
  name: string;
  sortOrder: number;
  parameters: PanelParameter[];
}

export interface DetailedPanel {
  id: string;
  name: string;
  category: string;
  price?: number;
  specimenType?: string;
  tatMinutes?: number;
  sortOrder: number;
  sections: PanelSection[];
}

export interface ReportPanelItem {
  id?: string;
  reportId: string;
  panelId: string;
  panel: DetailedPanel;
}

export interface ReportValueItem {
  id?: string;
  reportId?: string;
  parameterId: string;
  value: string;
  isOutOfRange?: boolean;
  remarks?: string | null;
  parameter?: PanelParameter;
}

export interface Report {
  id: string;
  reportNumber: string;
  labId: string;
  patientId: string;
  patient?: Patient;
  refByDoctorId?: string | null;
  refByDoctor?: ReferringDoctor;
  status: ReportStatus;
  sampleStatus: SampleStatus;
  remarks?: string | null;
  shareToken?: string;
  invoice?: Invoice | null;
  createdAt: string;
  updatedAt: string;
}

export interface DetailedReport extends Report {
  sampleCollectedAt?: string | null;
  resultsEnteredAt?: string | null;
  finalizedAt?: string | null;
  deliveredAt?: string | null;
  reportPanels: ReportPanelItem[];
  values: ReportValueItem[];
}

export interface ResultValueDto {
  parameterId: string;
  value: string;
  remarks?: string | null;
}

export interface EnterResultsDto {
  values: ResultValueDto[];
  remarks?: string | null;
}

