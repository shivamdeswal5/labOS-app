'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { DetailedReport, ReportStatus } from '../types';

export const REPORTS_QUERY_KEY = (status?: ReportStatus, patientId?: string) =>
  ['reports', { status, patientId }] as const;

export const DEMO_ACCESSIONS: DetailedReport[] = [
  {
    id: 'demo',
    reportNumber: 'R-1048',
    labId: 'lab-apex-01',
    patientId: 'patient-01',
    status: 'DRAFT',
    sampleStatus: 'PROCESSING',
    remarks: 'Microscopic pyuria and glycosuria noted. Advised blood sugar correlation.',
    shareToken: 'demo-share-token-1048',
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(), // 35m ago
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    patient: {
      id: 'patient-01',
      patientNumber: 'PT-10488',
      name: 'Sunita Rao',
      age: '48',
      sex: 'FEMALE',
      phone: '+91 98450 11234',
      address: 'Civil Lines, Delhi',
      createdAt: new Date().toISOString(),
    },
    refByDoctor: {
      id: 'doc-01',
      name: 'Dr. A. K. Mehra',
      clinic: 'Mehra Medicare',
      phone: '+91 98112 34567',
    },
    reportPanels: [
      {
        id: 'rp-01',
        reportId: 'demo',
        panelId: 'panel-urine',
        panel: {
          id: 'panel-urine',
          name: 'Urine Routine & Microscopic',
          category: 'Clinical Pathology',
          price: 350,
          specimenType: 'Spot Urine Midstream',
          tatMinutes: 45,
          sortOrder: 1,
          sections: [],
        },
      },
    ],
    values: [
      { parameterId: 'p-sug', value: '+++', isOutOfRange: true },
      { parameterId: 'p-pus', value: '20-25', isOutOfRange: true },
    ],
  },
  {
    id: 'demo-02',
    reportNumber: 'R-1047',
    labId: 'lab-apex-01',
    patientId: 'patient-02',
    status: 'FINALIZED',
    sampleStatus: 'COMPLETED',
    remarks: 'Severe uncontrolled diabetes mellitus. High risk for microvascular complications.',
    shareToken: 'demo-share-token-1047',
    finalizedAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    patient: {
      id: 'patient-02',
      patientNumber: 'PT-10492',
      name: 'Ramesh V. Gupta',
      age: '58',
      sex: 'MALE',
      phone: '+91 98765 43210',
      address: 'Rajendra Nagar, Delhi',
      createdAt: new Date().toISOString(),
    },
    refByDoctor: {
      id: 'doc-02',
      name: 'Dr. Anjali Mehta',
      clinic: 'Apex Endocrinology Center',
      phone: '+91 98220 54321',
    },
    reportPanels: [
      {
        id: 'rp-02',
        reportId: 'demo-02',
        panelId: 'panel-hba1c',
        panel: {
          id: 'panel-hba1c',
          name: 'HbA1c & Fasting Plasma Glucose',
          category: 'Biochemistry',
          price: 650,
          specimenType: 'Fluoride / EDTA Whole Blood',
          tatMinutes: 60,
          sortOrder: 1,
          sections: [],
        },
      },
    ],
    values: [
      { parameterId: 'p-hba1c', value: '11.2', isOutOfRange: true },
    ],
  },
  {
    id: 'demo-03',
    reportNumber: 'R-1046',
    labId: 'lab-apex-01',
    patientId: 'patient-03',
    status: 'FINALIZED',
    sampleStatus: 'COMPLETED',
    remarks: 'Normocytic normochromic red cell indices. Normal leukocyte count and distribution.',
    shareToken: 'demo-share-token-1046',
    finalizedAt: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
    patient: {
      id: 'patient-03',
      patientNumber: 'PT-10475',
      name: 'Priya Sharma',
      age: '28',
      sex: 'FEMALE',
      phone: '+91 98111 88776',
      address: 'Vasant Kunj, Delhi',
      createdAt: new Date().toISOString(),
    },
    refByDoctor: {
      id: 'doc-03',
      name: 'Dr. Vikram Malhotra',
      clinic: 'Care Well Clinic',
      phone: '+91 98333 11223',
    },
    reportPanels: [
      {
        id: 'rp-03',
        reportId: 'demo-03',
        panelId: 'panel-cbc',
        panel: {
          id: 'panel-cbc',
          name: 'Complete Blood Count (CBC) with ESR',
          category: 'Hematology',
          price: 400,
          specimenType: 'EDTA Purple Top',
          tatMinutes: 45,
          sortOrder: 1,
          sections: [],
        },
      },
    ],
    values: [
      { parameterId: 'p-hb', value: '13.8', isOutOfRange: false },
    ],
  },
  {
    id: 'demo-04',
    reportNumber: 'R-1045',
    labId: 'lab-apex-01',
    patientId: 'patient-04',
    status: 'DRAFT',
    sampleStatus: 'COLLECTED',
    remarks: 'Sample in centrifugation. Serum separated without hemolysis.',
    shareToken: 'demo-share-token-1045',
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    patient: {
      id: 'patient-04',
      patientNumber: 'PT-10460',
      name: 'Mohammad Farooq',
      age: '64',
      sex: 'MALE',
      phone: '+91 98990 12345',
      address: 'Daryaganj, Delhi',
      createdAt: new Date().toISOString(),
    },
    refByDoctor: {
      id: 'doc-04',
      name: 'Dr. S. K. Sen',
      clinic: 'City Gastro Care',
      phone: '+91 98440 99887',
    },
    reportPanels: [
      {
        id: 'rp-04',
        reportId: 'demo-04',
        panelId: 'panel-lft',
        panel: {
          id: 'panel-lft',
          name: 'Liver Function Test (LFT Profile)',
          category: 'Biochemistry',
          price: 750,
          specimenType: 'SST Gel Yellow Top',
          tatMinutes: 90,
          sortOrder: 1,
          sections: [],
        },
      },
    ],
    values: [],
  },
  {
    id: 'demo-05',
    reportNumber: 'R-1044',
    labId: 'lab-apex-01',
    patientId: 'patient-05',
    status: 'FINALIZED',
    sampleStatus: 'COMPLETED',
    remarks: 'Euthyroid state confirmed. TSH within reference limits.',
    shareToken: 'demo-share-token-1044',
    finalizedAt: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 300 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    patient: {
      id: 'patient-05',
      patientNumber: 'PT-10451',
      name: 'Anita Desai',
      age: '35',
      sex: 'FEMALE',
      phone: '+91 97110 55443',
      address: 'Saket, Delhi',
      createdAt: new Date().toISOString(),
    },
    refByDoctor: {
      id: 'doc-01',
      name: 'Dr. A. K. Mehra',
      clinic: 'Mehra Medicare',
      phone: '+91 98112 34567',
    },
    reportPanels: [
      {
        id: 'rp-05',
        reportId: 'demo-05',
        panelId: 'panel-tsh',
        panel: {
          id: 'panel-tsh',
          name: 'Thyroid Stimulating Hormone (TSH 3rd Gen)',
          category: 'Immunology',
          price: 380,
          specimenType: 'Clot Activator Red Top',
          tatMinutes: 60,
          sortOrder: 1,
          sections: [],
        },
      },
    ],
    values: [
      { parameterId: 'p-tsh', value: '2.45', isOutOfRange: false },
    ],
  },
  {
    id: 'demo-06',
    reportNumber: 'R-1043',
    labId: 'lab-apex-01',
    patientId: 'patient-06',
    status: 'DRAFT',
    sampleStatus: 'PROCESSING',
    remarks: 'Cardiac marker elevated. Urgent clinical communication initiated to treating physician.',
    shareToken: 'demo-share-token-1043',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15m ago
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    patient: {
      id: 'patient-06',
      patientNumber: 'PT-10444',
      name: 'Balwant Singh',
      age: '72',
      sex: 'MALE',
      phone: '+91 98100 44332',
      address: 'Model Town, Delhi',
      createdAt: new Date().toISOString(),
    },
    refByDoctor: {
      id: 'doc-02',
      name: 'Dr. Anjali Mehta',
      clinic: 'Apex Cardiology Unit',
      phone: '+91 98220 54321',
    },
    reportPanels: [
      {
        id: 'rp-06',
        reportId: 'demo-06',
        panelId: 'panel-trop',
        panel: {
          id: 'panel-trop',
          name: 'High Sensitivity Troponin-I (hs-cTnI)',
          category: 'Biochemistry',
          price: 1200,
          specimenType: 'Heparin Green Top',
          tatMinutes: 30,
          sortOrder: 1,
          sections: [],
        },
      },
    ],
    values: [
      { parameterId: 'p-trop', value: '0.14', isOutOfRange: true },
    ],
  },
  {
    id: 'demo-07',
    reportNumber: 'R-1021',
    labId: 'lab-apex-01',
    patientId: 'patient-02',
    status: 'FINALIZED',
    sampleStatus: 'COMPLETED',
    remarks: 'Elevated glycation index. Regimen adjustment recommended by consultant.',
    shareToken: 'demo-share-token-1021',
    finalizedAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(),
    patient: {
      id: 'patient-02',
      patientNumber: 'PT-10492',
      name: 'Ramesh V. Gupta',
      age: '58',
      sex: 'MALE',
      phone: '+91 98765 43210',
      address: 'Rajendra Nagar, Delhi',
      createdAt: new Date().toISOString(),
    },
    refByDoctor: {
      id: 'doc-02',
      name: 'Dr. Anjali Mehta',
      clinic: 'Apex Endocrinology Center',
      phone: '+91 98220 54321',
    },
    reportPanels: [
      {
        id: 'rp-07',
        reportId: 'demo-07',
        panelId: 'panel-hba1c',
        panel: {
          id: 'panel-hba1c',
          name: 'HbA1c & Fasting Glucose',
          category: 'Biochemistry',
          price: 650,
          specimenType: 'Fluoride / EDTA Whole Blood',
          tatMinutes: 60,
          sortOrder: 1,
          sections: [],
        },
      },
    ],
    values: [
      { parameterId: 'p-hba1c', value: '8.9', isOutOfRange: true },
    ],
  },
  {
    id: 'demo-08',
    reportNumber: 'R-0988',
    labId: 'lab-apex-01',
    patientId: 'patient-02',
    status: 'FINALIZED',
    sampleStatus: 'COMPLETED',
    remarks: 'Baseline monitoring of diabetic status.',
    shareToken: 'demo-share-token-0988',
    finalizedAt: new Date(Date.now() - 280 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 280 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 280 * 24 * 60 * 60 * 1000).toISOString(),
    patient: {
      id: 'patient-02',
      patientNumber: 'PT-10492',
      name: 'Ramesh V. Gupta',
      age: '58',
      sex: 'MALE',
      phone: '+91 98765 43210',
      address: 'Rajendra Nagar, Delhi',
      createdAt: new Date().toISOString(),
    },
    refByDoctor: {
      id: 'doc-02',
      name: 'Dr. Anjali Mehta',
      clinic: 'Apex Endocrinology Center',
      phone: '+91 98220 54321',
    },
    reportPanels: [
      {
        id: 'rp-08',
        reportId: 'demo-08',
        panelId: 'panel-hba1c',
        panel: {
          id: 'panel-hba1c',
          name: 'HbA1c & Glycemic Panel',
          category: 'Biochemistry',
          price: 650,
          specimenType: 'Fluoride / EDTA Whole Blood',
          tatMinutes: 60,
          sortOrder: 1,
          sections: [],
        },
      },
    ],
    values: [
      { parameterId: 'p-hba1c', value: '7.2', isOutOfRange: true },
    ],
  },
  {
    id: 'demo-09',
    reportNumber: 'R-1012',
    labId: 'lab-apex-01',
    patientId: 'patient-01',
    status: 'FINALIZED',
    sampleStatus: 'COMPLETED',
    remarks: 'Routine urinalysis unremarkable.',
    shareToken: 'demo-share-token-1012',
    finalizedAt: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000).toISOString(),
    patient: {
      id: 'patient-01',
      patientNumber: 'PT-10488',
      name: 'Sunita Rao',
      age: '48',
      sex: 'FEMALE',
      phone: '+91 98450 11234',
      address: 'Civil Lines, Delhi',
      createdAt: new Date().toISOString(),
    },
    refByDoctor: {
      id: 'doc-01',
      name: 'Dr. A. K. Mehra',
      clinic: 'Mehra Medicare',
      phone: '+91 98112 34567',
    },
    reportPanels: [
      {
        id: 'rp-09',
        reportId: 'demo-09',
        panelId: 'panel-urine',
        panel: {
          id: 'panel-urine',
          name: 'Urine Routine & Microscopic',
          category: 'Clinical Pathology',
          price: 350,
          specimenType: 'Spot Urine Midstream',
          tatMinutes: 45,
          sortOrder: 1,
          sections: [],
        },
      },
    ],
    values: [
      { parameterId: 'p-pus', value: '3-4', isOutOfRange: false },
    ],
  },
];

export function useReports(status?: ReportStatus, patientId?: string) {
  return useQuery<DetailedReport[]>({
    queryKey: REPORTS_QUERY_KEY(status, patientId),
    queryFn: async () => {
      try {
        const queryParams = new URLSearchParams();
        if (status) queryParams.append('status', status);
        if (patientId) queryParams.append('patientId', patientId);

        const url = `/reports${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const data = await api.get<DetailedReport[]>(url);

        if (Array.isArray(data)) {
          return data;
        }

        return [];
      } catch {
        console.warn('[useReports] Failed to fetch /reports, falling back to demo accessions.');
        return DEMO_ACCESSIONS.filter((item) => {
          if (status && item.status !== status) return false;
          if (patientId && item.patientId !== patientId) return false;
          return true;
        });
      }
    },
    staleTime: 15 * 1000, // 15s cache
    refetchInterval: 30 * 1000, // Poll every 30s for live lab register feeds
  });
}
