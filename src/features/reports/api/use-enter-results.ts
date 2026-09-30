'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { REPORT_QUERY_KEY } from './use-report';
import type { DetailedReport, EnterResultsDto } from '../types';

export function useEnterResults(reportId: string) {
  const queryClient = useQueryClient();

  return useMutation<DetailedReport, Error, EnterResultsDto>({
    mutationFn: async (dto: EnterResultsDto) => {
      // Direct PUT /reports/:id/results with 100% backend slice parity
      return api.put<DetailedReport>(`/reports/${reportId}/results`, dto);
    },
    onSuccess: (updatedReport) => {
      queryClient.setQueryData(REPORT_QUERY_KEY(reportId), updatedReport);
      queryClient.invalidateQueries({ queryKey: REPORT_QUERY_KEY(reportId) });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports', 'dashboard-stats'] });
    },
  });
}
