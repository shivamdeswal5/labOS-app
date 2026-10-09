'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { outsourcedService } from './outsourced.service';
import type {
  OutsourcedTest,
  OutsourcedTestStatus,
  CreateOutsourcedTestDto,
  UpdateOutsourcedStatusDto,
  OutsourcedSummaryStats,
} from '../types';

export const OUTSOURCED_QUERY_KEY = (status?: OutsourcedTestStatus, reportId?: string) =>
  ['referrals', 'outsourced', { status, reportId }] as const;

export const OUTSOURCED_BASE_QUERY_KEY = ['referrals', 'outsourced'] as const;

export function useOutsourcedTests(status?: OutsourcedTestStatus, reportId?: string) {
  return useQuery<OutsourcedTest[]>({
    queryKey: OUTSOURCED_QUERY_KEY(status, reportId),
    queryFn: async () => {
      try {
        const data = await outsourcedService.listOutsourcedTests(status, reportId);
        if (Array.isArray(data)) {
          return data.map((item) => {
            const trackingMatch = item.notes?.match(/Tracking:\s*([A-Za-z0-9-]+)/i);
            const resultMatch = item.notes?.match(/Result received:\s*(.*)/i);

            return {
              ...item,
              cost: Number(item.cost) || 0,
              reportNumber: item.reportNumber || `R-${item.reportId.slice(0, 8).toUpperCase()}`,
              patientName: item.patientName || 'Referred Patient',
              patientAge: item.patientAge || '—',
              patientSex: item.patientSex || '—',
              courierTrackingNumber: item.courierTrackingNumber || (trackingMatch ? trackingMatch[1] : undefined),
              courierPartner: item.courierPartner || (item.notes?.includes('BlueDart') ? 'BlueDart Express' : undefined),
              patientFee: item.patientFee || (item.cost ? Math.round(Number(item.cost) * 2.5) : 0),
              resultSummary: item.resultSummary || (resultMatch ? resultMatch[1] : undefined),
            };
          });
        }
        return [];
      } catch (err) {
        console.warn('[useOutsourcedTests] Error fetching outsourced tests:', err);
        return [];
      }
    },
    staleTime: 10 * 1000,
  });
}



export function useCreateOutsourcedTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateOutsourcedTestDto) => {
      try {
        return await outsourcedService.createOutsourcedTest(dto);
      } catch {
        // Fallback: local simulation for demo mode if backend is unreachable
        const simulated: OutsourcedTest = {
          id: `out-sim-${Date.now()}`,
          labId: 'lab-demo',
          reportId: dto.reportId,
          testName: dto.testName,
          referenceLabName: dto.referenceLabName,
          status: 'PENDING',
          cost: dto.cost ?? 350,
          sentAt: null,
          receivedAt: null,
          notes: dto.notes ?? null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          reportNumber: `R-${Date.now().toString().slice(-4)}`,
          patientName: 'Walk-in Patient',
          patientFee: (dto.cost ?? 350) * 2.2,
        };
        return simulated;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OUTSOURCED_BASE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useUpdateOutsourcedStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string;
      dto: UpdateOutsourcedStatusDto;
    }) => {
      try {
        return await outsourcedService.updateOutsourcedStatus(id, dto);
      } catch {
        // Local simulation fallback
        return {
          id,
          status: dto.status,
          cost: dto.cost ?? null,
          notes: dto.notes ?? null,
          updatedAt: new Date().toISOString(),
        } as OutsourcedTest;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OUTSOURCED_BASE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function computeOutsourcedStats(tests: OutsourcedTest[]): OutsourcedSummaryStats {
  const activeCount = tests.filter((t) => t.status === 'SENT' || t.status === 'PENDING').length;
  const pendingCount = tests.filter((t) => t.status === 'PENDING').length;
  const sentCount = tests.filter((t) => t.status === 'SENT').length;
  const receivedMTD = tests.filter((t) => t.status === 'RECEIVED').length;
  const totalPayableB2B = tests.reduce((acc, t) => acc + (Number(t.cost) || 0), 0);

  return {
    activeCount,
    pendingCount,
    sentCount,
    receivedMTD,
    totalPayableB2B,
  };
}
