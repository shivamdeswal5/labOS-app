'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { REPORT_QUERY_KEY } from './use-report';
import type { DetailedReport } from '../types';

export function useFinalizeReport(reportId: string) {
  const queryClient = useQueryClient();

  return useMutation<DetailedReport, Error, void>({
    mutationFn: async () => {
      // Direct POST /reports/:id/finalize with 100% backend slice parity
      return api.post<DetailedReport>(`/reports/${reportId}/finalize`, {});
    },
    onSuccess: (finalizedReport) => {
      queryClient.setQueryData(REPORT_QUERY_KEY(reportId), finalizedReport);
      queryClient.invalidateQueries({ queryKey: REPORT_QUERY_KEY(reportId) });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports', 'dashboard-stats'] });
    },
  });
}
