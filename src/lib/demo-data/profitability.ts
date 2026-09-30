import type {
  TestProfitabilityMetric,
  DiagnosticPnLStatement,
  ProfitabilitySummaryStats,
} from '@/features/billing/types';

export const DEMO_TEST_PROFITABILITY: TestProfitabilityMetric[] = [
  {
    panelId: 'panel-cbc',
    panelCode: 'HEM-01',
    panelName: 'Complete Blood Count (CBC / Hemogram)',
    category: 'Hematology',
    executionType: 'IN_HOUSE',
    retailPrice: 250,
    directCost: 48,
    directCostBreakdown: {
      reagents: 32, // Sysmex 3-part lyse, diluent, pack
      consumables: 12, // EDTA purple tube, safety needle, alcohol swab
      controlsCalibrators: 4,
    },
    referralCommissionAvg: 35,
    netMargin: 167,
    marginPercentage: 66.8,
    volumeMTD: 184,
    totalRevenueMTD: 46000,
    totalProfitMTD: 30728,
    strategicRecommendation: 'HIGH_MARGIN_PRIORITY',
    recommendationReason: 'Core cashflow driver. Run in high batches to minimize calibrator waste.',
  },
  {
    panelId: 'panel-lipid',
    panelCode: 'BIO-07',
    panelName: 'Lipid Profile Extended (Chol, Trig, HDL, LDL)',
    category: 'Biochemistry',
    executionType: 'IN_HOUSE',
    retailPrice: 550,
    directCost: 85,
    directCostBreakdown: {
      reagents: 65, // Enzymatic colorimetric kits (Transasia / Erba)
      consumables: 14, // SST gel yellow tube, needle
      controlsCalibrators: 6,
    },
    referralCommissionAvg: 80,
    netMargin: 385,
    marginPercentage: 70.0,
    volumeMTD: 76,
    totalRevenueMTD: 41800,
    totalProfitMTD: 29260,
    strategicRecommendation: 'HIGH_MARGIN_PRIORITY',
    recommendationReason: 'Excellent 70% in-house margin. Frequently co-prescribed with Fasting Sugar.',
  },
  {
    panelId: 'panel-lft',
    panelCode: 'BIO-03',
    panelName: 'Liver Function Test (LFT 11 Parameters)',
    category: 'Biochemistry',
    executionType: 'IN_HOUSE',
    retailPrice: 600,
    directCost: 90,
    directCostBreakdown: {
      reagents: 70, // Bilirubin, SGOT, SGPT, Alk Phos, Protein
      consumables: 14,
      controlsCalibrators: 6,
    },
    referralCommissionAvg: 90,
    netMargin: 420,
    marginPercentage: 70.0,
    volumeMTD: 62,
    totalRevenueMTD: 37200,
    totalProfitMTD: 26040,
    strategicRecommendation: 'RUN_IN_HOUSE',
    recommendationReason: 'Semi-automated Erba Chem 5x handles in 15 mins. Strong local practitioner demand.',
  },
  {
    panelId: 'panel-kft',
    panelCode: 'BIO-04',
    panelName: 'Kidney Function Test (KFT / RFT with Electrolytes)',
    category: 'Biochemistry',
    executionType: 'IN_HOUSE',
    retailPrice: 550,
    directCost: 75,
    directCostBreakdown: {
      reagents: 55, // Urea, BUN, Creatinine, Uric Acid
      consumables: 14,
      controlsCalibrators: 6,
    },
    referralCommissionAvg: 80,
    netMargin: 395,
    marginPercentage: 71.8,
    volumeMTD: 58,
    totalRevenueMTD: 31900,
    totalProfitMTD: 22910,
    strategicRecommendation: 'RUN_IN_HOUSE',
    recommendationReason: 'Top margin in routine biochemistry. High clinical utility.',
  },
  {
    panelId: 'panel-hba1c',
    panelCode: 'BIO-02',
    panelName: 'HbA1c Glycated Hemoglobin (HPLC / Micro-chromatography)',
    category: 'Biochemistry',
    executionType: 'IN_HOUSE',
    retailPrice: 450,
    directCost: 95,
    directCostBreakdown: {
      reagents: 80, // Cartridge unit cost
      consumables: 11,
      controlsCalibrators: 4,
    },
    referralCommissionAvg: 65,
    netMargin: 290,
    marginPercentage: 64.4,
    volumeMTD: 92,
    totalRevenueMTD: 41400,
    totalProfitMTD: 26680,
    strategicRecommendation: 'RUN_IN_HOUSE',
    recommendationReason: 'Quarterly chronic diabetic follow-ups provide predictable repeat volume.',
  },
  {
    panelId: 'panel-urine',
    panelCode: 'CPATH-04',
    panelName: 'Urine Routine & Microscopic Examination',
    category: 'Clinical Pathology',
    executionType: 'IN_HOUSE',
    retailPrice: 120,
    directCost: 15,
    directCostBreakdown: {
      reagents: 8, // 10-parameter urine test strip
      consumables: 7, // Sterile urine cup, centrifuge tube, glass slide
    },
    referralCommissionAvg: 0, // Zero doctor referral cut on basic urine
    netMargin: 105,
    marginPercentage: 87.5,
    volumeMTD: 140,
    totalRevenueMTD: 16800,
    totalProfitMTD: 14700,
    strategicRecommendation: 'HIGH_MARGIN_PRIORITY',
    recommendationReason: 'Highest percentage margin in the laboratory (87.5%). Negligible consumable cost.',
  },
  {
    panelId: 'panel-glucose',
    panelCode: 'BIO-01',
    panelName: 'Blood Glucose (Fasting / Post-Prandial)',
    category: 'Biochemistry',
    executionType: 'IN_HOUSE',
    retailPrice: 60,
    directCost: 14,
    directCostBreakdown: {
      reagents: 6, // GOD-POD glucose reagent
      consumables: 8, // Fluoride grey tube, lancet
    },
    referralCommissionAvg: 0,
    netMargin: 46,
    marginPercentage: 76.7,
    volumeMTD: 210,
    totalRevenueMTD: 12600,
    totalProfitMTD: 9660,
    strategicRecommendation: 'RUN_IN_HOUSE',
    recommendationReason: 'High volume footfall driver that introduces patients to wider preventive panels.',
  },
  {
    panelId: 'panel-vitd',
    panelCode: 'REF-01',
    panelName: '25-OH Vitamin D Total (CLIA)',
    category: 'Immunology / Reference',
    executionType: 'OUTSOURCED',
    retailPrice: 1200,
    directCost: 400,
    directCostBreakdown: {
      b2bFee: 400, // Dr. Lal PathLabs wholesale fee
      consumables: 15, // Centrifuge gel tube & packaging
    },
    referralCommissionAvg: 150,
    netMargin: 650,
    marginPercentage: 54.2,
    volumeMTD: 28,
    totalRevenueMTD: 33600,
    totalProfitMTD: 18200,
    strategicRecommendation: 'KEEP_OUTSOURCED',
    recommendationReason: 'Low monthly volume (28/mo). Outsourcing avoids ₹18 Lakhs CLIA chemiluminescence analyzer capex.',
  },
  {
    panelId: 'panel-thyroid',
    panelCode: 'REF-02',
    panelName: 'Thyroid Panel Extended (Total T3, Total T4, TSH)',
    category: 'Endocrinology / Reference',
    executionType: 'OUTSOURCED',
    retailPrice: 450,
    directCost: 180,
    directCostBreakdown: {
      b2bFee: 180, // Thyrocare Technologies B2B fee
      consumables: 12,
    },
    referralCommissionAvg: 65,
    netMargin: 205,
    marginPercentage: 45.6,
    volumeMTD: 54,
    totalRevenueMTD: 24300,
    totalProfitMTD: 11070,
    breakevenVolume: 40,
    strategicRecommendation: 'SWITCH_TO_IN_HOUSE',
    recommendationReason: 'Volume is 54 tests/mo (exceeds 40/mo breakeven). Switching in-house on ELISA/ECLIA bench would save ₹7,450/month in wholesale bills.',
  },
  {
    panelId: 'panel-biopsy',
    panelCode: 'REF-03',
    panelName: 'Histopathology — Skin Punch Biopsy (H&E Stain)',
    category: 'Histopathology / Reference',
    executionType: 'OUTSOURCED',
    retailPrice: 2000,
    directCost: 750,
    directCostBreakdown: {
      b2bFee: 750, // SRL Diagnostics Reference Lab
      consumables: 25, // Formalin jar & biopsy transport
    },
    referralCommissionAvg: 250,
    netMargin: 1000,
    marginPercentage: 50.0,
    volumeMTD: 8,
    totalRevenueMTD: 16000,
    totalProfitMTD: 8000,
    strategicRecommendation: 'KEEP_OUTSOURCED',
    recommendationReason: 'Highly specialized tissue microtome requirement. Keep outsourcing to accredited pathology centers.',
  },
];

export const DEMO_PNL_STATEMENT: DiagnosticPnLStatement = {
  reportingPeriod: 'September 2026 (MTD)',
  revenue: {
    grossPatientBilled: 482450,
    discountsConcessions: 12300,
    netRealizedRevenue: 470150,
  },
  cogs: {
    reagentsAndKits: 64800,
    collectionConsumables: 14200,
    outsourcedReferenceLabFees: 21500,
    doctorReferralCommissions: 38400,
    totalDirectCOGS: 138900,
    grossDiagnosticMargin: 331250,
    grossMarginPercentage: 70.5,
  },
  opex: {
    technicianSalaries: 45000, // 2 bench technicians
    facilityRent: 25000,
    powerAndUtilities: 14500, // Cold chain, centrifuges, backup inverter
    analyzerAMCAndMaintenance: 12000,
    bioMedicalWasteManagement: 3500, // Authorized color-coded bag disposal
    softwareAndLogistics: 3200,
    totalOperatingOverhead: 103200,
  },
  netOperatingIncome: 228050, // Real take-home operating cash
  netMarginPercentage: 48.5,
};

export const DEMO_PROFITABILITY_SUMMARY: ProfitabilitySummaryStats = {
  netRevenueMTD: 470150,
  totalDirectCostMTD: 138900,
  grossMarginPercentage: 70.5,
  netOperatingProfitMTD: 228050,
  inHouseMarginAvg: 72.4,
  outsourcedMarginAvg: 49.9,
  topPerformingTest: 'Urine Routine (87.5% Margin) & Lipid Profile (₹29,260 Profit)',
};
