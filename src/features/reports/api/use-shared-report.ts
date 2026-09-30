'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { DEMO_REPORT } from './use-report';
import type { DetailedReport } from '../types';

export const SHARED_REPORT_QUERY_KEY = (token: string) => ['reports', 'share', token] as const;

export function useSharedReport(token: string) {
  return useQuery<DetailedReport>({
    queryKey: SHARED_REPORT_QUERY_KEY(token),
    queryFn: async () => {
      if (token === 'demo-share-token-1048' || token.startsWith('demo')) {
        return DEMO_REPORT;
      }

      try {
        // Direct call to public NestJS endpoint GET /reports/share/:token
        return await api.get<DetailedReport>(`/reports/share/${token}`);
      } catch {
        console.warn(`[useSharedReport] Failed to load /reports/share/${token}, falling back to demo fixture.`);
        return {
          ...DEMO_REPORT,
          shareToken: token,
        };
      }
    },
    staleTime: 60 * 1000, // Public reports are typically finalized; cache for 1m
    refetchOnWindowFocus: false,
  });
}
