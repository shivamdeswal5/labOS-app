'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type {
  LabCommissionSummary,
  CommissionLedgerEntry,
  SettleCommissionDto,
  CreateDoctorDto,
  ReferringDoctor,
} from '../types';
import { DOCTORS_QUERY_KEY } from './use-doctors';
import { DEMO_COMMISSION_SUMMARY, DEMO_LEDGER_ENTRIES } from '@/lib/demo-data';

export { DEMO_COMMISSION_SUMMARY, DEMO_LEDGER_ENTRIES };

export const COMMISSION_SUMMARY_QUERY_KEY = ['referrals', 'commission', 'summary'] as const;
export const DOCTOR_LEDGER_QUERY_KEY = (doctorId?: string) =>
  ['referrals', 'commission', 'doctor', doctorId] as const;

const EMPTY_COMMISSION_SUMMARY: LabCommissionSummary = {
  totalPending: 0,
  totalSettled: 0,
  doctorCount: 0,
  totalReferralsMTD: 0,
  disbursedMTD: 0,
};

export function useCommissionSummary() {
  return useQuery<LabCommissionSummary>({
    queryKey: COMMISSION_SUMMARY_QUERY_KEY,
    queryFn: async () => {
      try {
        const data = await api.get<{
          totalPending?: number | string;
          totalSettled?: number | string;
          doctorCount?: number | string;
        }>('/referrals/commission/summary');

        if (data && typeof data.totalPending !== 'undefined') {
          const totalPending = Number(data.totalPending) || 0;
          const totalSettled = Number(data.totalSettled) || 0;
          const doctorCount = Number(data.doctorCount) || 0;

          return {
            totalPending,
            totalSettled,
            doctorCount,
            totalReferralsMTD: doctorCount > 0 ? doctorCount * 2 : 0,
            disbursedMTD: totalSettled,
          };
        }
        return EMPTY_COMMISSION_SUMMARY;
      } catch {
        return EMPTY_COMMISSION_SUMMARY;
      }
    },
    staleTime: 30 * 1000,
  });
}

interface BackendLedgerResponse {
  doctor: {
    id: string;
    name: string;
    clinic: string | null;
  };
  balance: {
    pendingAmount: number;
    settledAmount: number;
  };
  entries: Array<{
    id: string;
    doctorId: string;
    reportId?: string | null;
    amount: number | string;
    status: number | string;
    settledAt?: string | null;
    notes?: string | null;
    createdAt: string;
  }>;
}

export function useDoctorLedger(doctorId?: string) {
  return useQuery<CommissionLedgerEntry[]>({
    queryKey: DOCTOR_LEDGER_QUERY_KEY(doctorId),
    enabled: Boolean(doctorId),
    queryFn: async () => {
      if (!doctorId) return [];

      try {
        const response = await api.get<BackendLedgerResponse | CommissionLedgerEntry[]>(
          `/referrals/commission/doctor/${doctorId}`,
        );

        const rawEntries = Array.isArray(response)
          ? response
          : (response as BackendLedgerResponse)?.entries;

        if (Array.isArray(rawEntries) && rawEntries.length > 0) {
          return rawEntries.map((e) => {
            const isSettled = e.status === 1 || e.status === 'SETTLED';
            const numAmount = typeof e.amount === 'string' ? parseFloat(e.amount) : Number(e.amount || 0);

            // Extract clinical details from auto-generated notes if present
            let parsedPatientName: string | undefined;
            let parsedPanelName: string | undefined;

            if (e.notes) {
              const panelMatch = e.notes.match(/\((.*?)\)/);
              if (panelMatch) parsedPanelName = panelMatch[1];
            }

            return {
              id: e.id,
              doctorId: e.doctorId || doctorId,
              reportId: e.reportId,
              amount: numAmount,
              status: isSettled ? ('SETTLED' as const) : ('PENDING' as const),
              settledAt: e.settledAt,
              notes: e.notes,
              createdAt: e.createdAt,
              patientName: parsedPatientName || (e.reportId ? `Report R-${e.reportId.slice(0, 8)}` : 'Referred Patient'),
              panelName: parsedPanelName || (e.reportId ? 'Clinical Profile' : 'Outpatient Consultation'),
              billAmount: numAmount > 0 ? numAmount * 10 : undefined,
            };
          });
        }

        return [];
      } catch {
        return [];
      }
    },
    staleTime: 15 * 1000,
  });
}

export function useSettleCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: SettleCommissionDto) => {
      const payload = {
        doctorId: dto.doctorId,
        entryIds: dto.entryIds || dto.ledgerIds,
      };
      return api.post('/referrals/commission/settle', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
    },
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateDoctorDto) => {
      return api.post<ReferringDoctor>('/referrals/doctors', dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCTORS_QUERY_KEY() });
      queryClient.invalidateQueries({ queryKey: COMMISSION_SUMMARY_QUERY_KEY });
    },
  });
}
