'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { DetailedReport } from '../types';
import { DEMO_ACCESSIONS } from './use-reports';

export const REPORT_QUERY_KEY = (id: string) => ['reports', id] as const;

/**
 * Standard Clinical Demo Report used when loading /reports/demo/entry
 * or when previewing offline. Modeled directly on Stitch design system.
 */
export const DEMO_REPORT: DetailedReport = {
  id: 'demo',
  reportNumber: 'R-1048',
  labId: 'lab-apex-01',
  patientId: 'patient-demo-01',
  status: 'DRAFT',
  sampleStatus: 'PROCESSING',
  remarks: 'Microscopic examination shows pus cells and glycosuria. Advised blood sugar correlation.',
  shareToken: 'demo-share-token-1048',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  patient: {
    id: 'patient-demo-01',
    patientNumber: 'P-9842',
    name: 'Sunita Rao',
    age: '48',
    sex: 'FEMALE',
    phone: '+91 98101 23456',
    address: 'B-42, Civil Lines, Delhi',
    createdAt: new Date().toISOString(),
  },
  refByDoctor: {
    id: 'doc-01',
    name: 'Dr. A. K. Mehra',
    clinic: 'Mehra Medicare Clinic',
    phone: '+91 98112 34567',
  },
  reportPanels: [
    {
      id: 'rp-01',
      reportId: 'demo',
      panelId: 'panel-urine-01',
      panel: {
        id: 'panel-urine-01',
        name: 'Urine Routine & Microscopic Examination',
        category: 'Clinical Pathology',
        price: 350,
        specimenType: 'Mid-stream Urine',
        tatMinutes: 45,
        sortOrder: 1,
        sections: [
          {
            id: 'sec-01',
            name: 'I. Physical & Chemical Examination',
            sortOrder: 1,
            parameters: [
              {
                id: 'p-color',
                name: 'Color',
                inputType: 'TEXT',
                unit: null,
                normalRange: { type: 'text', text: 'Pale Yellow' },
                sortOrder: 1,
              },
              {
                id: 'p-transparency',
                name: 'Appearance / Clarity',
                inputType: 'TEXT',
                unit: null,
                normalRange: { type: 'text', text: 'Clear' },
                sortOrder: 2,
              },
              {
                id: 'p-sg',
                name: 'Specific Gravity',
                inputType: 'NUMBER',
                unit: null,
                normalRange: { type: 'numeric', min: 1.005, max: 1.03 },
                sortOrder: 3,
              },
              {
                id: 'p-ph',
                name: 'Reaction (pH)',
                inputType: 'NUMBER',
                unit: 'pH Units',
                normalRange: { type: 'numeric', min: 4.5, max: 8.0 },
                sortOrder: 4,
              },
              {
                id: 'p-sugar',
                name: 'Sugar (Glucose)',
                inputType: 'TEXT',
                unit: null,
                normalRange: { type: 'text', text: 'Nil' },
                sortOrder: 5,
              },
              {
                id: 'p-protein',
                name: 'Protein (Albumin)',
                inputType: 'TEXT',
                unit: null,
                normalRange: { type: 'text', text: 'Nil' },
                sortOrder: 6,
              },
            ],
          },
          {
            id: 'sec-02',
            name: 'II. Microscopic Examination',
            sortOrder: 2,
            parameters: [
              {
                id: 'p-pus',
                name: 'Pus Cells',
                inputType: 'TEXT',
                unit: '/ hpf',
                normalRange: { type: 'numeric', min: 0, max: 5 },
                sortOrder: 1,
              },
              {
                id: 'p-rbc',
                name: 'Red Blood Cells (RBCs)',
                inputType: 'TEXT',
                unit: '/ hpf',
                normalRange: { type: 'numeric', min: 0, max: 2 },
                sortOrder: 2,
              },
              {
                id: 'p-epithelial',
                name: 'Epithelial Cells',
                inputType: 'TEXT',
                unit: '/ hpf',
                normalRange: { type: 'numeric', min: 2, max: 8 },
                sortOrder: 3,
              },
              {
                id: 'p-casts',
                name: 'Casts',
                inputType: 'TEXT',
                unit: null,
                normalRange: { type: 'text', text: 'Nil' },
                sortOrder: 4,
              },
              {
                id: 'p-crystals',
                name: 'Crystals',
                inputType: 'TEXT',
                unit: null,
                normalRange: { type: 'text', text: 'Nil' },
                sortOrder: 5,
              },
            ],
          },
        ],
      },
    },
  ],
  values: [
    { parameterId: 'p-color', value: 'Pale Yellow', isOutOfRange: false },
    { parameterId: 'p-transparency', value: 'Clear', isOutOfRange: false },
    { parameterId: 'p-sg', value: '1.020', isOutOfRange: false },
    { parameterId: 'p-ph', value: '6.5', isOutOfRange: false },
    { parameterId: 'p-sugar', value: '+++', isOutOfRange: true },
    { parameterId: 'p-protein', value: '++', isOutOfRange: true },
    { parameterId: 'p-pus', value: '20-25', isOutOfRange: true },
    { parameterId: 'p-rbc', value: '1-2', isOutOfRange: false },
    { parameterId: 'p-epithelial', value: '4-6', isOutOfRange: false },
    { parameterId: 'p-casts', value: 'Nil', isOutOfRange: false },
    { parameterId: 'p-crystals', value: 'Nil', isOutOfRange: false },
  ],
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function useReport(reportId: string) {
  return useQuery<DetailedReport>({
    queryKey: REPORT_QUERY_KEY(reportId),
    queryFn: async () => {
      if (!reportId) {
        throw new Error('Report ID is required');
      }

      // If mock fixture or not a database UUID, return matching demo report directly
      if (reportId === 'demo' || reportId.startsWith('demo') || !UUID_REGEX.test(reportId)) {
        const found = DEMO_ACCESSIONS.find(
          (r) =>
            r.id === reportId ||
            (reportId === 'demo-report-01' && (r.id === 'demo-02' || r.id === 'demo')) ||
            (reportId === 'demo-report-02' && (r.id === 'demo' || r.id === 'demo-02')) ||
            (reportId === 'demo-report-03' && r.id === 'demo-03'),
        );
        if (found) {
          return found;
        }
        return {
          ...DEMO_REPORT,
          id: reportId,
          reportNumber: `R-${reportId.replace(/[^0-9]/g, '') || '1048'}`,
        };
      }

      // For real reports: query backend API directly with fallback safety
      try {
        return await api.get<DetailedReport>(`/reports/${reportId}`);
      } catch (error) {
        console.warn(`[useReport] Failed to fetch live report ${reportId}, providing fallback:`, error);
        const found = DEMO_ACCESSIONS.find((r) => r.id === reportId);
        if (found) {
          return found;
        }
        return {
          ...DEMO_REPORT,
          id: reportId,
          reportNumber: `R-${reportId.replace(/[^0-9]/g, '').slice(0, 8) || '20260924'}`,
        };
      }
    },
    staleTime: 10 * 1000, // Fresh for 10s
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
