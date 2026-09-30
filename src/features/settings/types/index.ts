/**
 * Settings & Lab Profile Domain Types & DTOs
 * Matches NestJS `labs` bounded context 1:1 with Stitch design specifications
 */

export type ReportLanguage = 'en' | 'hi' | 'ta' | 'te' | 'mr';

export type StaffRole = 
  | 'OWNER'
  | 'DIRECTOR'
  | 'PATHOLOGIST'
  | 'SR_TECHNICIAN'
  | 'TECHNICIAN'
  | 'PHLEBOTOMIST'
  | 'BILLING';

export type StationeryType = 'PLAIN' | 'PREPRINTED_HEADER' | 'PREPRINTED_HEADER_AND_FOOTER';

export interface LabPrintSettings {
  stationeryType: StationeryType;
  headerMarginMm: number; // default: 48mm
  footerMarginMm: number; // default: 24mm
}

export interface LabProfile {
  id: string;
  name: string;
  nablId: string;
  address: string;
  phoneNumbers: string[];
  officialEmail: string;
  whatsappNumber: string;
  logoUrl: string | null;
  accentColor: string;
  tagline: string | null;
  footerNote: string | null;
  reportLanguage: ReportLanguage;
  accreditedSince?: string;
  scopeNotes?: string;
  printSettings?: LabPrintSettings;
}

export interface StaffMember {
  id: string;
  labId: string;
  fullName: string;
  email: string;
  role: StaffRole;
  qualification: string | null;
  councilRegistration?: string | null;
  signOffScope?: string | null;
  signatureUrl: string | null;
  lastActive: string;
  isOnline: boolean;
  createdAt: string;
}

export interface UpdateLabDto {
  name?: string;
  nablId?: string;
  address?: string;
  phoneNumbers?: string[];
  officialEmail?: string;
  whatsappNumber?: string;
  logoUrl?: string | null;
  accentColor?: string;
  tagline?: string | null;
  footerNote?: string | null;
  reportLanguage?: ReportLanguage;
  printSettings?: Partial<LabPrintSettings>;
}

export interface UpdateProfileDto {
  fullName?: string;
  signatureUrl?: string | null;
  qualification?: string | null;
  councilRegistration?: string | null;
}

export interface InviteStaffDto {
  fullName: string;
  email: string;
  role: StaffRole;
  qualification?: string;
  councilRegistration?: string;
  signOffScope?: string;
}

export type SettingsTabId = 
  | 'profile'
  | 'branding'
  | 'signatures'
  | 'team'
  | 'analyzers';
