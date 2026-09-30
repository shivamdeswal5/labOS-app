'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { DashboardStatsDto } from '../types';

export const DASHBOARD_STATS_QUERY_KEY = ['reports', 'dashboard-stats'] as const;

export function useDashboardStats() {
  return useQuery<DashboardStatsDto>({
    queryKey: DASHBOARD_STATS_QUERY_KEY,
    queryFn: async () => {
      return api.get<DashboardStatsDto>('/reports/dashboard-stats');
    },
    staleTime: 30 * 1000, // Fresh for 30s
    refetchInterval: 60 * 1000, // Background poll every minute
  });
}
