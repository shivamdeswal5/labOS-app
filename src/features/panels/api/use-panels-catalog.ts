'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { MasterPanel, MasterParameter, CreatePanelDto, UpdatePanelDto } from '../types';

export const PANELS_CATALOG_QUERY_KEY = ['panels-catalog'] as const;

export const DEMO_MASTER_PANELS: MasterPanel[] = [
  {
    id: 'panel-cpath-04',
    code: 'CPATH-04',
    name: 'Urine Routine & Microscopic Examination',
    category: 'Clinical Pathology',
    price: 350,
    specimenType: 'Urine (Clean Catch) 15 mL',
    tatMinutes: 120,
    tatText: '2.0 hrs',
    loincCode: '24356-8',
    snomedCode: '27171005',
    sortOrder: 1,
    lastRevisedAt: 'Today, 11:42 AM',
    revisedBy: 'Dr. R. Sharma',
    sections: [
      {
        id: 'sec-urine-01',
        name: 'I. Physical & Chemical Examination',
        sortOrder: 1,
        parameters: [
          {
            id: 'param-col-01',
            code: 'PHYS-COL-01',
            name: 'Colour',
            unit: null,
            inputType: 'DROPDOWN',
            options: ['Pale Yellow', 'Yellow', 'Straw', 'Amber', 'Reddish', 'Turbid'],
            referenceText: 'Pale Yellow',
            sortOrder: 1,
          },
          {
            id: 'param-app-02',
            code: 'PHYS-APP-02',
            name: 'Appearance',
            unit: null,
            inputType: 'DROPDOWN',
            options: ['Clear', 'Hazy', 'Slightly Turbid', 'Turbid', 'Smoky'],
            referenceText: 'Clear',
            sortOrder: 2,
          },
          {
            id: 'param-sg-03',
            code: 'PHYS-SG-03',
            name: 'Specific Gravity',
            unit: null,
            inputType: 'NUMBER',
            referenceText: '1.005 - 1.030',
            normalRange: { type: 'numeric', min: 1.005, max: 1.03 },
            sortOrder: 3,
          },
          {
            id: 'param-ph-04',
            code: 'CHEM-PH-04',
            name: 'Reaction (pH)',
            unit: 'pH Units',
            inputType: 'NUMBER',
            referenceText: '4.5 - 8.0',
            normalRange: { type: 'numeric', min: 4.5, max: 8.0 },
            sortOrder: 4,
          },
          {
            id: 'param-glu-05',
            code: 'CHEM-GLU-05',
            name: 'Urine Sugar (Glucose)',
            unit: 'mg/dL',
            inputType: 'SCALE',
            options: ['Nil / Negative', 'Trace', '+ (0.5%)', '++ (1.0%)', '+++ (2.0%)', '++++ (5.0%)'],
            referenceText: 'Nil / Negative',
            sortOrder: 5,
          },
          {
            id: 'param-alb-06',
            code: 'CHEM-ALB-06',
            name: 'Urine Protein (Albumin)',
            unit: 'mg/dL',
            inputType: 'SCALE',
            options: ['Nil / Negative', 'Trace', '+ (30 mg/dL)', '++ (100 mg/dL)', '+++ (300 mg/dL)', '++++ (1000 mg/dL)'],
            referenceText: 'Nil / Trace',
            sortOrder: 6,
          },
        ],
      },
      {
        id: 'sec-urine-02',
        name: 'II. Microscopic Examination (Centrifuged Sediment)',
        sortOrder: 2,
        parameters: [
          {
            id: 'param-pus-07',
            code: 'MIC-PUS-07',
            name: 'Pus Cells (Leukocytes)',
            unit: '/ hpf',
            inputType: 'NUMBER',
            referenceText: '0 - 5 / hpf',
            normalRange: { type: 'numeric', min: 0, max: 5 },
            sortOrder: 1,
          },
          {
            id: 'param-rbc-08',
            code: 'MIC-RBC-08',
            name: 'Red Blood Cells (RBCs)',
            unit: '/ hpf',
            inputType: 'NUMBER',
            referenceText: '0 - 2 / hpf',
            normalRange: { type: 'numeric', min: 0, max: 2 },
            sortOrder: 2,
          },
          {
            id: 'param-epi-09',
            code: 'MIC-EPI-09',
            name: 'Epithelial Cells',
            unit: '/ hpf',
            inputType: 'NUMBER',
            referenceText: '2 - 8 / hpf',
            normalRange: { type: 'numeric', min: 2, max: 8 },
            sortOrder: 3,
          },
          {
            id: 'param-cst-10',
            code: 'MIC-CST-10',
            name: 'Casts',
            unit: null,
            inputType: 'QUALITATIVE',
            options: ['Absent / Nil', 'Hyaline (Rare)', 'Granular', 'Cellular'],
            referenceText: 'Absent / Nil',
            sortOrder: 4,
          },
          {
            id: 'param-cry-11',
            code: 'MIC-CRY-11',
            name: 'Crystals',
            unit: null,
            inputType: 'QUALITATIVE',
            options: ['Absent / Rare', 'Calcium Oxalate', 'Uric Acid', 'Triple Phosphate'],
            referenceText: 'Absent / Rare',
            sortOrder: 5,
          },
          {
            id: 'param-bac-12',
            code: 'MIC-BAC-12',
            name: 'Bacteria / Microorganisms',
            unit: null,
            inputType: 'QUALITATIVE',
            options: ['Absent', 'Few', 'Moderate', 'Plenty'],
            referenceText: 'Absent',
            sortOrder: 6,
          },
        ],
      },
    ],
  },
  {
    id: 'panel-hem-01',
    code: 'HEM-01',
    name: 'Complete Blood Count (CBC)',
    category: 'Hematology',
    price: 300,
    specimenType: 'Venous Blood / EDTA 3 mL',
    tatMinutes: 90,
    tatText: '1.5 hrs',
    loincCode: '58410-2',
    snomedCode: '43789009',
    sortOrder: 2,
    lastRevisedAt: 'Yesterday, 4:15 PM',
    revisedBy: 'Dr. Sunita Nair',
    sections: [
      {
        id: 'sec-cbc-01',
        name: 'I. Primary Hemogram & Cellular Indices',
        sortOrder: 1,
        parameters: [
          {
            id: 'param-hb-01',
            code: 'HEM-HB-01',
            name: 'Hemoglobin (Hb)',
            unit: 'g/dL',
            inputType: 'NUMBER',
            referenceText: '13.0 - 17.0 (M) / 12.0 - 15.5 (F)',
            normalRange: { type: 'numeric', min: 12.0, max: 17.0, panicLow: 7.0, panicHigh: 20.0 },
            sortOrder: 1,
          },
          {
            id: 'param-rbc-02',
            code: 'HEM-RBC-02',
            name: 'Total RBC Count',
            unit: 'mill/cumm',
            inputType: 'NUMBER',
            referenceText: '4.50 - 5.50',
            normalRange: { type: 'numeric', min: 4.5, max: 5.5 },
            sortOrder: 2,
          },
          {
            id: 'param-tlc-03',
            code: 'HEM-TLC-03',
            name: 'Total Leukocyte Count (TLC)',
            unit: '/cumm',
            inputType: 'NUMBER',
            referenceText: '4,000 - 11,000',
            normalRange: { type: 'numeric', min: 4000, max: 11000, panicLow: 2000, panicHigh: 30000 },
            sortOrder: 3,
          },
          {
            id: 'param-plt-04',
            code: 'HEM-PLT-04',
            name: 'Platelet Count',
            unit: 'lakh/cumm',
            inputType: 'NUMBER',
            referenceText: '1.50 - 4.50',
            normalRange: { type: 'numeric', min: 1.5, max: 4.5, panicLow: 0.5, panicHigh: 10.0 },
            sortOrder: 4,
          },
          {
            id: 'param-pcv-05',
            code: 'HEM-PCV-05',
            name: 'Packed Cell Volume (PCV)',
            unit: '%',
            inputType: 'NUMBER',
            referenceText: '40.0 - 50.0',
            normalRange: { type: 'numeric', min: 40.0, max: 50.0 },
            sortOrder: 5,
          },
        ],
      },
      {
        id: 'sec-cbc-02',
        name: 'II. Differential Leukocyte Count (DLC)',
        sortOrder: 2,
        parameters: [
          {
            id: 'param-neut-06',
            code: 'DLC-NEU-06',
            name: 'Polymorphs (Neutrophils)',
            unit: '%',
            inputType: 'NUMBER',
            referenceText: '40 - 70',
            normalRange: { type: 'numeric', min: 40, max: 70 },
            sortOrder: 1,
          },
          {
            id: 'param-lymph-07',
            code: 'DLC-LYM-07',
            name: 'Lymphocytes',
            unit: '%',
            inputType: 'NUMBER',
            referenceText: '20 - 45',
            normalRange: { type: 'numeric', min: 20, max: 45 },
            sortOrder: 2,
          },
          {
            id: 'param-eos-08',
            code: 'DLC-EOS-08',
            name: 'Eosinophils',
            unit: '%',
            inputType: 'NUMBER',
            referenceText: '1 - 6',
            normalRange: { type: 'numeric', min: 1, max: 6 },
            sortOrder: 3,
          },
          {
            id: 'param-mono-09',
            code: 'DLC-MON-09',
            name: 'Monocytes',
            unit: '%',
            inputType: 'NUMBER',
            referenceText: '2 - 10',
            normalRange: { type: 'numeric', min: 2, max: 10 },
            sortOrder: 4,
          },
          {
            id: 'param-baso-10',
            code: 'DLC-BAS-10',
            name: 'Basophils',
            unit: '%',
            inputType: 'NUMBER',
            referenceText: '0 - 1',
            normalRange: { type: 'numeric', min: 0, max: 1 },
            sortOrder: 5,
          },
        ],
      },
    ],
  },
  {
    id: 'panel-cpath-08',
    code: 'CPATH-08',
    name: 'Semen Analysis & Morphology',
    category: 'Clinical Pathology',
    price: 550,
    specimenType: 'Seminal Fluid 2 mL',
    tatMinutes: 210,
    tatText: '3.5 hrs',
    loincCode: '10582-5',
    snomedCode: '168341006',
    sortOrder: 3,
    lastRevisedAt: '3 days ago',
    revisedBy: 'Dr. R. Sharma',
    sections: [
      {
        id: 'sec-semen-01',
        name: 'Physical & Liquefaction Examination',
        sortOrder: 1,
        parameters: [
          {
            id: 'param-sem-vol',
            code: 'SEM-VOL-01',
            name: 'Total Volume',
            unit: 'mL',
            inputType: 'NUMBER',
            referenceText: '1.5 - 5.0 mL',
            sortOrder: 1,
          },
          {
            id: 'param-sem-liq',
            code: 'SEM-LIQ-02',
            name: 'Liquefaction Time',
            unit: 'mins',
            inputType: 'NUMBER',
            referenceText: '< 30 minutes',
            sortOrder: 2,
          },
        ],
      },
      {
        id: 'sec-semen-02',
        name: 'Microscopic Sperm Count & Motility',
        sortOrder: 2,
        parameters: [
          {
            id: 'param-sem-cnt',
            code: 'SEM-CNT-03',
            name: 'Sperm Concentration',
            unit: 'million/mL',
            inputType: 'NUMBER',
            referenceText: '>= 15 million/mL',
            sortOrder: 1,
          },
          {
            id: 'param-sem-mot',
            code: 'SEM-MOT-04',
            name: 'Rapid Progressive Motility (Grade A)',
            unit: '%',
            inputType: 'NUMBER',
            referenceText: '>= 32 %',
            sortOrder: 2,
          },
        ],
      },
    ],
  },
  {
    id: 'panel-ser-02',
    code: 'SER-02',
    name: 'Widal Agglutination Slide & Tube',
    category: 'Microbiology',
    price: 280,
    specimenType: 'Serum Plain Tube 3 mL',
    tatMinutes: 240,
    tatText: '4.0 hrs',
    loincCode: '22573-0',
    snomedCode: '27171005',
    sortOrder: 4,
    lastRevisedAt: '5 days ago',
    revisedBy: 'Dr. Sunita Nair',
    sections: [
      {
        id: 'sec-widal-01',
        name: 'Salmonella Antibody Titres',
        sortOrder: 1,
        parameters: [
          {
            id: 'param-wid-to',
            code: 'WID-TO-01',
            name: 'S. typhi "O" Titre',
            unit: 'Titre',
            inputType: 'DROPDOWN',
            options: ['< 1:80', '1:80', '1:160', '1:320'],
            referenceText: '< 1:80 (Negative)',
            sortOrder: 1,
          },
          {
            id: 'param-wid-th',
            code: 'WID-TH-02',
            name: 'S. typhi "H" Titre',
            unit: 'Titre',
            inputType: 'DROPDOWN',
            options: ['< 1:80', '1:80', '1:160', '1:320'],
            referenceText: '< 1:80 (Negative)',
            sortOrder: 2,
          },
        ],
      },
    ],
  },
  {
    id: 'panel-bio-03',
    code: 'BIO-03',
    name: 'Liver Function Test (LFT)',
    category: 'Biochemistry',
    price: 650,
    specimenType: 'Serum Plain Tube 5 mL',
    tatMinutes: 120,
    tatText: '2.0 hrs',
    loincCode: '24325-3',
    snomedCode: '27171005',
    sortOrder: 5,
    lastRevisedAt: '1 week ago',
    revisedBy: 'Dr. R. Sharma',
    sections: [
      {
        id: 'sec-lft-01',
        name: 'Bilirubin Fractions & Hepatic Enzymes',
        sortOrder: 1,
        parameters: [
          {
            id: 'param-tbili-01',
            code: 'LFT-TBIL-01',
            name: 'Total Bilirubin',
            unit: 'mg/dL',
            inputType: 'NUMBER',
            referenceText: '0.2 - 1.2',
            normalRange: { type: 'numeric', min: 0.2, max: 1.2 },
            sortOrder: 1,
          },
          {
            id: 'param-sgot-02',
            code: 'LFT-SGOT-02',
            name: 'SGOT / AST',
            unit: 'U/L',
            inputType: 'NUMBER',
            referenceText: '5 - 40',
            normalRange: { type: 'numeric', min: 5, max: 40 },
            sortOrder: 2,
          },
          {
            id: 'param-sgpt-03',
            code: 'LFT-SGPT-03',
            name: 'SGPT / ALT',
            unit: 'U/L',
            inputType: 'NUMBER',
            referenceText: '7 - 56',
            normalRange: { type: 'numeric', min: 7, max: 56 },
            sortOrder: 3,
          },
          {
            id: 'param-alp-04',
            code: 'LFT-ALP-04',
            name: 'Alkaline Phosphatase (ALP)',
            unit: 'U/L',
            inputType: 'NUMBER',
            referenceText: '44 - 147',
            normalRange: { type: 'numeric', min: 44, max: 147 },
            sortOrder: 4,
          },
        ],
      },
    ],
  },
  {
    id: 'panel-bio-07',
    code: 'BIO-07',
    name: 'Lipid Profile Extended',
    category: 'Biochemistry',
    price: 500,
    specimenType: 'Fasting Venous Serum 4 mL',
    tatMinutes: 120,
    tatText: '2.0 hrs',
    loincCode: '57698-3',
    snomedCode: '166832000',
    sortOrder: 6,
    lastRevisedAt: '2 weeks ago',
    revisedBy: 'Dr. Sunita Nair',
    sections: [
      {
        id: 'sec-lipid-01',
        name: 'Serum Lipids & Cardiovascular Risk Markers',
        sortOrder: 1,
        parameters: [
          {
            id: 'param-chol-01',
            code: 'LIP-CHOL-01',
            name: 'Total Cholesterol',
            unit: 'mg/dL',
            inputType: 'NUMBER',
            referenceText: '< 200 mg/dL Desirable',
            normalRange: { type: 'numeric', min: 120, max: 200 },
            sortOrder: 1,
          },
          {
            id: 'param-trig-02',
            code: 'LIP-TRIG-02',
            name: 'Triglycerides',
            unit: 'mg/dL',
            inputType: 'NUMBER',
            referenceText: '< 150 mg/dL Normal',
            normalRange: { type: 'numeric', min: 50, max: 150 },
            sortOrder: 2,
          },
          {
            id: 'param-hdl-03',
            code: 'LIP-HDL-03',
            name: 'HDL Cholesterol (Good)',
            unit: 'mg/dL',
            inputType: 'NUMBER',
            referenceText: '> 40 mg/dL',
            normalRange: { type: 'numeric', min: 40, max: 60 },
            sortOrder: 3,
          },
          {
            id: 'param-ldl-04',
            code: 'LIP-LDL-04',
            name: 'LDL Cholesterol (Calculated)',
            unit: 'mg/dL',
            inputType: 'NUMBER',
            referenceText: '< 100 mg/dL Optimal',
            normalRange: { type: 'numeric', min: 50, max: 100 },
            sortOrder: 4,
          },
        ],
      },
    ],
  },
];

function normalizeCategory(category: string): string {
  if (!category) return 'General';
  if (/haematology/i.test(category)) return 'Hematology';
  if (/biochemistry/i.test(category)) return 'Biochemistry';
  if (/clinical pathology/i.test(category)) return 'Clinical Pathology';
  if (/serology/i.test(category)) return 'Serology';
  if (/endocrinology/i.test(category)) return 'Endocrinology';
  return category;
}

function derivePanelCode(name: string, category: string, index: number): string {
  const norm = name.toUpperCase();
  if (norm.includes('CBC') || norm.includes('COMPLETE BLOOD')) return 'HEM-01';
  if (norm.includes('ESR')) return 'HEM-02';
  if (norm.includes('BLOOD GROUP')) return 'HEM-03';
  if (norm.includes('PROTHROMBIN') || norm.includes('PT / INR')) return 'HEM-04';
  if (norm.includes('LIVER') || norm.includes('LFT')) return 'BIO-01';
  if (norm.includes('KIDNEY') || norm.includes('KFT') || norm.includes('RFT')) return 'BIO-02';
  if (norm.includes('LIPID')) return 'BIO-03';
  if (norm.includes('GLUCOSE') || norm.includes('SUGAR')) return 'BIO-04';
  if (norm.includes('HBA1C') || norm.includes('GLYCATED')) return 'BIO-05';
  if (norm.includes('CALCIUM')) return 'BIO-06';
  if (norm.includes('AMYLASE')) return 'BIO-07';
  if (norm.includes('URINE')) return 'CPATH-01';
  if (norm.includes('STOOL')) return 'CPATH-02';
  if (norm.includes('SEMEN')) return 'CPATH-03';
  if (norm.includes('WIDAL')) return 'SER-01';
  if (norm.includes('DENGUE')) return 'SER-02';
  if (norm.includes('MALARIA')) return 'SER-03';
  if (norm.includes('CRP') || norm.includes('C-REACTIVE')) return 'SER-04';
  if (norm.includes('RA') || norm.includes('RHEUMATOID')) return 'SER-05';
  if (norm.includes('VIRAL') || norm.includes('HIV') || norm.includes('HBSAG')) return 'SER-06';
  if (norm.includes('THYROID') || norm.includes('TSH')) return 'ENDO-01';
  if (norm.includes('VITAMIN D')) return 'ENDO-02';
  if (norm.includes('VITAMIN B12')) return 'ENDO-03';

  const prefix = (category || 'PAN').slice(0, 3).toUpperCase();
  return `${prefix}-${String(index + 1).padStart(2, '0')}`;
}

function deriveSpecimenType(name: string): string {
  const norm = name.toUpperCase();
  if (norm.includes('CBC') || norm.includes('HBA1C') || norm.includes('BLOOD GROUP') || norm.includes('MALARIA')) {
    return '2.0 mL EDTA Whole Blood (Purple Top)';
  }
  if (norm.includes('GLUCOSE') || norm.includes('SUGAR')) {
    return '2.0 mL Sodium Fluoride Plasma (Grey Top)';
  }
  if (norm.includes('PROTHROMBIN') || norm.includes('PT / INR')) {
    return '2.0 mL Sodium Citrate (Blue Top)';
  }
  if (norm.includes('ESR')) {
    return '1.6 mL Sodium Citrate (Black Top)';
  }
  if (norm.includes('URINE')) {
    return '15 mL Sterile Urine Container';
  }
  if (norm.includes('STOOL')) {
    return 'Sterile Stool Container';
  }
  if (norm.includes('SEMEN')) {
    return 'Seminal Fluid in Sterile Container';
  }
  if (norm.includes('VITAMIN D')) {
    return '3.0 mL Serum SST (Protected from Light)';
  }
  return '3.0 mL Plain Serum (Yellow / Red Top)';
}

function deriveTatMinutes(name: string): number {
  const norm = name.toUpperCase();
  if (norm.includes('URINE') || norm.includes('GLUCOSE') || norm.includes('MALARIA') || norm.includes('BLOOD GROUP')) return 30;
  if (norm.includes('CBC') || norm.includes('HBA1C') || norm.includes('ESR') || norm.includes('WIDAL') || norm.includes('DENGUE') || norm.includes('CRP')) return 45;
  if (norm.includes('LFT') || norm.includes('KFT') || norm.includes('LIPID') || norm.includes('PT / INR') || norm.includes('VIRAL')) return 60;
  if (norm.includes('THYROID') || norm.includes('SEMEN')) return 90;
  if (norm.includes('VITAMIN')) return 1440; // 24 hrs
  return 60;
}

interface BackendParameter {
  id?: string;
  name: string;
  nameLocal?: string | null;
  unit?: string | null;
  inputType?: number | string;
  options?: string[] | null;
  method?: string | null;
  normalRange?: MasterParameter['normalRange'];
  referenceText?: string;
  sortOrder?: number;
}

interface BackendSection {
  id?: string;
  name: string;
  sortOrder?: number;
  parameters?: BackendParameter[];
}

interface BackendPanel {
  id: string;
  name: string;
  category?: string;
  code?: string;
  price?: number | string;
  specimenType?: string;
  tatMinutes?: number;
  tatText?: string;
  loincCode?: string | null;
  snomedCode?: string | null;
  sortOrder?: number;
  updatedAt?: string;
  sections?: BackendSection[];
}

function adaptBackendPanelToMasterPanel(panel: BackendPanel, index: number): MasterPanel {
  const category = normalizeCategory(panel.category || 'General');
  const tat = panel.tatMinutes ? Number(panel.tatMinutes) : deriveTatMinutes(panel.name || '');
  const tatText = panel.tatText || (tat >= 60 ? `${(tat / 60).toFixed(1)} hrs` : `${tat} min`);

  return {
    id: panel.id,
    code: panel.code || derivePanelCode(panel.name || '', category, index),
    name: panel.name,
    category,
    price: Number(panel.price || 0),
    specimenType: panel.specimenType || deriveSpecimenType(panel.name || ''),
    tatMinutes: tat,
    tatText,
    loincCode: panel.loincCode || null,
    snomedCode: panel.snomedCode || null,
    sortOrder: panel.sortOrder || index + 1,
    lastRevisedAt: panel.updatedAt ? new Date(panel.updatedAt).toLocaleDateString('en-IN') : 'Standard Spec',
    revisedBy: 'Deswal Diagnostic Laboratory',
    sections: (panel.sections || []).map((sec: BackendSection, sIdx: number) => ({
      id: sec.id || `sec-${sIdx + 1}`,
      panelId: panel.id,
      name: sec.name || `Section ${sIdx + 1}`,
      sortOrder: sec.sortOrder || sIdx + 1,
      parameters: (sec.parameters || []).map((p: BackendParameter, pIdx: number) => {
        let referenceText = p.referenceText;
        if (!referenceText && p.normalRange) {
          if (p.normalRange.type === 'numeric' && p.normalRange.min !== undefined && p.normalRange.max !== undefined) {
            referenceText = `${p.normalRange.min} - ${p.normalRange.max} ${p.unit || ''}`;
          } else if (p.normalRange.type === 'gender_specific' && p.normalRange.male && p.normalRange.female) {
            referenceText = `M: ${p.normalRange.male.min}-${p.normalRange.male.max} / F: ${p.normalRange.female.min}-${p.normalRange.female.max} ${p.unit || ''}`;
          } else if (p.normalRange.type === 'text' && p.normalRange.text) {
            referenceText = p.normalRange.text;
          }
        }
        return {
          id: p.id || `param-${pIdx + 1}`,
          sectionId: sec.id,
          code: `PAR-${String(pIdx + 1).padStart(2, '0')}`,
          name: p.name,
          nameLocal: p.nameLocal ?? null,
          unit: p.unit ?? null,
          inputType: typeof p.inputType === 'string' ? (p.inputType as MasterParameter['inputType']) : (p.inputType === 2 ? 'TEXT' : p.inputType === 3 ? 'DROPDOWN' : 'NUMBER'),
          options: p.options ?? null,
          method: p.method ?? null,
          normalRange: p.normalRange ?? null,
          referenceText: referenceText || '-',
          sortOrder: p.sortOrder || pIdx + 1,
        };
      }),
    })),
  };
}

export function usePanelsCatalog(category?: string) {
  return useQuery<MasterPanel[]>({
    queryKey: [...PANELS_CATALOG_QUERY_KEY, category].filter(Boolean),
    queryFn: async () => {
      try {
        const res = await api.get<BackendPanel[]>('/panels');
        if (Array.isArray(res) && res.length > 0) {
          const adapted = res.map((panel, idx) => adaptBackendPanelToMasterPanel(panel, idx));
          if (category && category !== 'All') {
            return adapted.filter((p) => p.category.toLowerCase() === category.toLowerCase());
          }
          return adapted;
        }
        return category && category !== 'All'
          ? DEMO_MASTER_PANELS.filter((p) => p.category.toLowerCase() === category.toLowerCase())
          : DEMO_MASTER_PANELS;
      } catch {
        return category && category !== 'All'
          ? DEMO_MASTER_PANELS.filter((p) => p.category.toLowerCase() === category.toLowerCase())
          : DEMO_MASTER_PANELS;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePanel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreatePanelDto) => {
      const newPanel: MasterPanel = {
        id: `panel-${Date.now().toString(36)}`,
        code: dto.code.toUpperCase(),
        name: dto.name,
        category: dto.category,
        price: dto.price,
        specimenType: dto.specimenType || 'Venous Blood / EDTA 3 mL',
        tatMinutes: dto.tatMinutes || 120,
        tatText: `${((dto.tatMinutes || 120) / 60).toFixed(1)} hrs`,
        sortOrder: DEMO_MASTER_PANELS.length + 1,
        lastRevisedAt: 'Just now',
        revisedBy: 'Current User',
        sections: (dto.sections || []).map((sec, sIdx) => ({
          id: `sec-${Date.now()}-${sIdx}`,
          name: sec.name,
          sortOrder: sec.sortOrder || sIdx + 1,
          parameters: (sec.parameters || []).map((p, pIdx) => ({
            id: `param-${Date.now()}-${pIdx}`,
            code: p.code || `PAR-${pIdx + 1}`,
            name: p.name,
            unit: p.unit || null,
            inputType: p.inputType || 'NUMBER',
            referenceText: p.referenceText || '-',
            sortOrder: p.sortOrder || pIdx + 1,
          })),
        })),
      };
      try {
        const res = await api.post<MasterPanel>('/panels', dto);
        return res || newPanel;
      } catch {
        return newPanel;
      }
    },
    onSuccess: (newPanel) => {
      queryClient.setQueryData<MasterPanel[]>(PANELS_CATALOG_QUERY_KEY, (old) => [
        ...(old || DEMO_MASTER_PANELS),
        newPanel,
      ]);
      queryClient.invalidateQueries({ queryKey: PANELS_CATALOG_QUERY_KEY });
    },
  });
}

export function useUpdatePanel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdatePanelDto }) => {
      try {
        return await api.put<MasterPanel>(`/panels/${id}`, dto);
      } catch {
        return { id, ...dto };
      }
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData<MasterPanel[]>(PANELS_CATALOG_QUERY_KEY, (old) => {
        if (!old) return DEMO_MASTER_PANELS;
        return old.map((p) => (p.id === variables.id ? { ...p, ...variables.dto } : p));
      });
      queryClient.invalidateQueries({ queryKey: PANELS_CATALOG_QUERY_KEY });
    },
  });
}
