/**
 * Master Test Catalog & Panel Configuration Domain Types
 * Matches NestJS `panels` bounded context 1:1 with Google Stitch panel manager specifications
 */

export type ParameterInputType = 
  | 'NUMBER'
  | 'TEXT'
  | 'DROPDOWN'
  | 'SCALE'
  | 'QUALITATIVE';

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

export interface MasterParameter {
  id: string;
  sectionId?: string;
  code: string;
  name: string;
  nameLocal?: string | null;
  unit?: string | null;
  inputType: ParameterInputType;
  options?: string[] | null;
  method?: string | null;
  normalRange?: StructuredNormalRange | null;
  referenceText?: string;
  sortOrder: number;
}

export interface MasterSection {
  id: string;
  panelId?: string;
  name: string;
  sortOrder: number;
  parameters: MasterParameter[];
}

export interface MasterPanel {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  specimenType: string;
  tatMinutes: number;
  tatText?: string;
  loincCode?: string | null;
  snomedCode?: string | null;
  sortOrder: number;
  sections: MasterSection[];
  lastRevisedAt?: string;
  revisedBy?: string;
}

export interface CreatePanelDto {
  name: string;
  code: string;
  category: string;
  price: number;
  specimenType?: string;
  tatMinutes?: number;
  sections?: {
    name: string;
    sortOrder?: number;
    parameters?: {
      name: string;
      code?: string;
      unit?: string | null;
      inputType?: ParameterInputType;
      referenceText?: string;
      sortOrder?: number;
    }[];
  }[];
}

export interface UpdatePanelDto {
  name?: string;
  category?: string;
  price?: number;
  specimenType?: string;
  tatMinutes?: number;
  sections?: MasterSection[];
}
