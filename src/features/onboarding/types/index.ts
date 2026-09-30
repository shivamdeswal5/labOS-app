/**
 * Onboarding Feature — Domain Types
 *
 * These types represent the 4-step wizard data model.
 * Steps 1 and 2 mirror the NestJS labs bounded context DTOs (PATCH /labs, PATCH /profiles).
 * Step 3 mirrors the panels bounded context (POST /panels).
 */

export type OnboardingStep = 1 | 2 | 3 | 4;

// Step 1: Lab Profile
export interface LabProfileStepData {
  name: string;
  address: string;
  phoneNumber: string;
  nablRegistrationId?: string;
  accentColor: string;
  tagline?: string;
  footerNote?: string;
  reportLanguage: 'en' | 'hi';
}

// Step 2: Pathologist Signatures
export interface PathologistStepData {
  fullName: string;
  qualification: string;
  councilRegistrationNumber?: string;
  signatureUrl?: string; // Supabase Storage URL after upload
}

// Step 3: Test Panel Catalog Seeding
export interface PanelSeedEntry {
  code: string;
  name: string;
  department: string;
  defaultPrice: number;
  tatMinutes: number;
  selected: boolean;
  price: number; // Editable per-lab
}

export interface TestCatalogStepData {
  panels: PanelSeedEntry[];
}

// Wizard aggregate state
export interface OnboardingWizardState {
  step: OnboardingStep;
  labProfile: Partial<LabProfileStepData>;
  pathologist: Partial<PathologistStepData>;
  catalog: TestCatalogStepData;
}
