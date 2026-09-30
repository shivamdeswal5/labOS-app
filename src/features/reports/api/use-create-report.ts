'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { CreatePatientDto, CreateReportDto, Patient, Report } from '../types';
import { DASHBOARD_STATS_QUERY_KEY } from '@/features/dashboard/api/use-dashboard-stats';

export interface CreateReportSubmission {
  existingPatientId?: string;
  newPatient?: CreatePatientDto;
  reportNumber?: string;
  refByDoctorId?: string | null;
  panelIds: string[];
  remarks?: string | null;
  billing?: CreateReportDto['billing'];
}

export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation<Report, Error, CreateReportSubmission>({
    mutationFn: async (payload: CreateReportSubmission) => {
      let patientId = payload.existingPatientId;

      // 1. If this is a new patient, register them first
      if (!patientId && payload.newPatient) {
        const createdPatient = await api.post<Patient>('/patients', payload.newPatient);
        patientId = createdPatient.id;
      }

      if (!patientId) {
        throw new Error('Patient ID is required to generate a diagnostic report.');
      }

      // 2. Create the diagnostic report accession with atomic Order-to-Cash invoicing
      const reportDto: CreateReportDto = {
        patientId,
        reportNumber: payload.reportNumber || undefined,
        refByDoctorId: payload.refByDoctorId || null,
        panelIds: payload.panelIds,
        remarks: payload.remarks || null,
        billing: payload.billing,
      };

      return api.post<Report>('/reports', reportDto);
    },
    onSuccess: () => {
      // Invalidate relevant caches
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_STATS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}
