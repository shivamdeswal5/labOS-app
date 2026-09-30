'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Patient } from '@/features/reports/types';

export const PATIENTS_SEARCH_QUERY_KEY = ['patients', 'search'] as const;

export function usePatientSearch(searchTerm: string) {
  const trimmed = searchTerm.trim();

  return useQuery<Patient[]>({
    queryKey: [...PATIENTS_SEARCH_QUERY_KEY, trimmed],
    queryFn: async () => {
      if (!trimmed || trimmed.length < 2) return [];
      return api.get<Patient[]>(`/patients?search=${encodeURIComponent(trimmed)}`);
    },
    enabled: trimmed.length >= 2,
    staleTime: 30 * 1000,
  });
}
