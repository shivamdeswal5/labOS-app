export type CommissionType = 'PERCENTAGE' | 'FLAT' | 'NONE';
export type CommissionStatus = 'PENDING' | 'SETTLED';
export type PaymentMethod = 'BANK_TRANSFER' | 'UPI' | 'CASH';

export interface ReferringDoctor {
  id: string;
  name: string;
  clinic?: string | null;
  phone?: string | null;
  email?: string | null;
  commissionType: CommissionType;
  commissionValue: number;
  registrationNumber?: string;
  specialty?: string;
  bankAccount?: string;
  ifsc?: string;
  pan?: string;
  activeCasesCount: number;
  pendingAmount: number;
  settledAmount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommissionLedgerEntry {
  id: string;
  doctorId: string;
  reportId?: string | null;
  amount: number;
  status: CommissionStatus;
  settledAt?: string | null;
  notes?: string | null;
  createdAt: string;
  patientName?: string;
  panelName?: string;
  billAmount?: number;
}

export interface LabCommissionSummary {
  totalPending: number;
  totalSettled: number;
  doctorCount: number;
  totalReferralsMTD: number;
  disbursedMTD: number;
}

export interface CreateDoctorDto {
  name: string;
  clinicName?: string;
  phone?: string;
  email?: string;
  commissionType: CommissionType;
  commissionValue?: number;
  specialty?: string;
  registrationNumber?: string;
  bankAccount?: string;
  ifsc?: string;
  pan?: string;
}

export interface SettleCommissionDto {
  doctorId?: string;
  entryIds?: string[];
  ledgerIds?: string[];
  paymentMethod?: PaymentMethod;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Outsourced Reference Lab Domain Types (PRD Section 2 Goal 3 & Section 6 P0)
// ---------------------------------------------------------------------------

export type OutsourcedTestStatus = 'PENDING' | 'SENT' | 'RECEIVED' | 'CANCELLED';

export interface OutsourcedTest {
  id: string;
  labId: string;
  reportId: string;
  testName: string;
  referenceLabName: string;
  status: OutsourcedTestStatus;
  cost: number | null;
  sentAt?: string | null;
  receivedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;

  // UI Enriched attributes
  reportNumber?: string;
  patientName?: string;
  patientAge?: string;
  patientSex?: string;
  courierTrackingNumber?: string;
  courierPartner?: string;
  patientFee?: number;
  resultSummary?: string;
}

export interface CreateOutsourcedTestDto {
  reportId: string;
  testName: string;
  referenceLabName: string;
  cost?: number;
  notes?: string;
}

export interface UpdateOutsourcedStatusDto {
  status: OutsourcedTestStatus;
  cost?: number;
  notes?: string;
}

export interface OutsourcedSummaryStats {
  activeCount: number;
  pendingCount: number;
  sentCount: number;
  receivedMTD: number;
  totalPayableB2B: number;
}

