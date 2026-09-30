'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Patient } from '@/features/reports/types';

export const PATIENTS_QUERY_KEY = (search?: string) => ['patients', { search }] as const;

export const DEMO_PATIENTS: Patient[] = [
  {
    id: 'patient-02',
    patientNumber: 'PT-10492',
    name: 'Ramesh V. Gupta',
    age: '58',
    sex: 'MALE',
    phone: '+91 98765 43210',
    address: 'Model Town, Near Water Tank, Delhi',
    bloodGroup: 'B+',
    reportsCount: 3,
    lastVisitTest: 'HbA1c 10.4% [High]',
    lastVisitDate: '24-Oct-2024',
    hasAbnormal: true,
    primaryClinician: 'Dr. Anjali Mehta (Endocrinology)',
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'patient-01',
    patientNumber: 'PT-10488',
    name: 'Sunita Rao',
    age: '48',
    sex: 'FEMALE',
    phone: '+91 98450 11234',
    address: 'Civil Lines, Delhi',
    bloodGroup: 'A+',
    reportsCount: 2,
    lastVisitTest: 'Urine Routine & Microscopic [Abnormal]',
    lastVisitDate: '24-Oct-2024',
    hasAbnormal: true,
    primaryClinician: 'Dr. A. K. Mehra (Internal Medicine)',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'patient-03',
    patientNumber: 'PT-10480',
    name: 'Ananya Priyadarshini',
    age: '29',
    sex: 'FEMALE',
    phone: '+91 88201 56341',
    address: 'Sector 14, Rohini, Delhi',
    bloodGroup: 'O+',
    reportsCount: 4,
    lastVisitTest: 'CBC with ESR [Normal]',
    lastVisitDate: '19-Oct-2024',
    hasAbnormal: false,
    primaryClinician: 'Dr. Vikram Malhotra (Hematology)',
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'patient-04',
    patientNumber: 'PT-10472',
    name: 'Farhan A. Mansoori',
    age: '44',
    sex: 'MALE',
    phone: '+91 97110 88204',
    address: 'Railway Road, Daryaganj, Delhi',
    bloodGroup: 'AB+',
    reportsCount: 3,
    lastVisitTest: 'Serum Creatinine 2.8 [High]',
    lastVisitDate: '16-Oct-2024',
    hasAbnormal: true,
    primaryClinician: 'Dr. Anjali Mehta (Nephrology)',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'patient-05',
    patientNumber: 'PT-10461',
    name: 'Meenakshi Sundaram',
    age: '63',
    sex: 'FEMALE',
    phone: '+91 94441 90281',
    address: 'Gandhi Nagar, Delhi',
    bloodGroup: 'B+',
    reportsCount: 5,
    lastVisitTest: 'Lipid Profile & Uric Acid [Borderline]',
    lastVisitDate: '08-Oct-2024',
    hasAbnormal: false,
    primaryClinician: 'Dr. V. Narayanan (Cardiology)',
    createdAt: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function usePatients(search?: string) {
  return useQuery<Patient[]>({
    queryKey: PATIENTS_QUERY_KEY(search),
    queryFn: async () => {
      try {
        const queryParam = search ? `?search=${encodeURIComponent(search)}` : '';
        const data = await api.get<Patient[]>(`/patients${queryParam}`);

        if (Array.isArray(data) && data.length > 0) {
          return data;
        }

        // Return filtered demo cohort
        if (search && search.trim().length > 0) {
          const q = search.toLowerCase().trim();
          return DEMO_PATIENTS.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.phone?.toLowerCase().includes(q) ||
              p.patientNumber.toLowerCase().includes(q),
          );
        }

        return DEMO_PATIENTS;
      } catch {
        console.warn('[usePatients] Failed to fetch /patients, falling back to demo seed cohort.');
        if (search && search.trim().length > 0) {
          const q = search.toLowerCase().trim();
          return DEMO_PATIENTS.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.phone?.toLowerCase().includes(q) ||
              p.patientNumber.toLowerCase().includes(q),
          );
        }
        return DEMO_PATIENTS;
      }
    },
    staleTime: 30 * 1000,
  });
}

/**
 * usePatient — Query hook to retrieve a single patient by ID.
 */
export function usePatient(id?: string | null) {
  return useQuery<Patient | null>({
    queryKey: ['patients', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const data = await api.get<Patient>(`/patients/${id}`);
        return data || DEMO_PATIENTS.find((p) => p.id === id) || null;
      } catch {
        return DEMO_PATIENTS.find((p) => p.id === id) || null;
      }
    },
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });
}

/**
 * useUpdatePatient — Mutation hook to update patient demographics (phone, age, etc.)
 * Automatically invalidates patient and report query caches.
 */
export function useUpdatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { phone?: string; name?: string; age?: string; address?: string } }) => {
      return api.patch<Patient>(`/patients/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
