export type CollectionStatus =
  | 'REQUESTED'
  | 'ASSIGNED'
  | 'IN_TRANSIT'
  | 'SAMPLE_COLLECTED'
  | 'DELIVERED_TO_LAB'
  | 'CANCELLED';

export type TubeType =
  | 'EDTA'
  | 'SERUM'
  | 'FLUORIDE'
  | 'CITRATE'
  | 'HEPARIN'
  | 'URINE'
  | 'OTHER';

export type PhlebotomistStatus = 'AVAILABLE' | 'ON_DUTY' | 'OFF_DUTY';

export interface CollectionSample {
  id: string;
  collectionRequestId: string;
  tubeType: TubeType;
  barcode: string;
  notes?: string | null;
  createdAt: string;
}

export interface CollectionRequest {
  id: string;
  labId: string;
  requestNumber: string; // e.g. "COL-2026-081"
  patientId?: string | null;
  patientName: string;
  patientPhone: string;
  patientAge?: string | null;
  patientSex: 'MALE' | 'FEMALE' | 'OTHER' | 'UNSPECIFIED';
  address: string;
  locality?: string;
  preferredDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "07:30 - 08:30 AM"
  status: CollectionStatus;
  assignedPhlebotomistId?: string | null;
  assignedPhlebotomistName?: string | null;
  isFastingRequired: boolean;
  testNames: string[];
  specialInstructions?: string | null;
  cancellationReason?: string | null;
  collectedAt?: string | null;
  deliveredToLabAt?: string | null;
  reportId?: string | null;
  samples: CollectionSample[];
  createdAt: string;
  updatedAt: string;
}

export interface Phlebotomist {
  id: string;
  name: string;
  phone: string;
  currentZone: string;
  vehicleNumber: string;
  activeAssignmentsCount: number;
  status: PhlebotomistStatus;
  coldBoxId: string;
  coldBoxTemp: string; // e.g. "4.2°C"
  lastPing: string;
}

export interface CollectionSampleItemDto {
  tubeType: TubeType;
  barcode: string;
  notes?: string;
}

export interface CreateCollectionDto {
  patientId?: string;
  patientName: string;
  patientPhone: string;
  patientAge?: string;
  patientSex?: 'MALE' | 'FEMALE' | 'OTHER' | 'UNSPECIFIED';
  address: string;
  preferredDate: string;
  timeSlot: string;
  isFastingRequired?: boolean;
  testNames?: string[];
  specialInstructions?: string;
  assignedPhlebotomistId?: string;
  assignedPhlebotomistName?: string;
}

export interface AssignPhlebotomistDto {
  phlebotomistId: string;
  phlebotomistName: string;
}

export interface UpdateCollectionStatusDto {
  status: CollectionStatus;
  samples?: CollectionSampleItemDto[];
  reportId?: string;
  notes?: string;
}

export interface CancelCollectionDto {
  cancellationReason: string;
}

export interface CollectionFilter {
  status?: CollectionStatus | 'ALL';
  phlebotomistId?: string;
  preferredDate?: string;
  search?: string;
  fastingOnly?: boolean;
}

export interface CollectionsKpiSummary {
  totalBookingsToday: number;
  fastingCount: number;
  activeRunnersCount: number;
  inTransitSamplesCount: number;
  deliveredToLabCount: number;
  avgTurnaroundMinutes: number;
}
