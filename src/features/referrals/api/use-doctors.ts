'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { ReferringDoctor } from '../types';
import { DEMO_DOCTORS } from '@/lib/demo-data';

export { DEMO_DOCTORS };

export const DOCTORS_QUERY_KEY = (search?: string) => ['referrals', 'doctors', { search }] as const;

export function useDoctors(search?: string) {
  return useQuery<ReferringDoctor[]>({
    queryKey: DOCTORS_QUERY_KEY(search),
    queryFn: async () => {
      try {
        const queryParam = search ? `?search=${encodeURIComponent(search)}` : '';
        const data = await api.get<ReferringDoctor[]>(`/referrals/doctors${queryParam}`);

        if (Array.isArray(data)) {
          return data.map((d) => ({
            ...d,
            commissionValue: Number(d.commissionValue) || 0,
            pendingAmount: Number(d.pendingAmount) || 0,
            settledAmount: Number(d.settledAmount) || 0,
            activeCasesCount: Number(d.activeCasesCount) || 0,
          }));
        }

        return DEMO_DOCTORS;
      } catch {
        console.warn('[useDoctors] Failed to fetch /referrals/doctors, falling back to demo cohort.');
        if (search && search.trim().length > 0) {
          const q = search.toLowerCase().trim();
          return DEMO_DOCTORS.filter(
            (d) =>
              d.name.toLowerCase().includes(q) ||
              d.clinic?.toLowerCase().includes(q) ||
              d.specialty?.toLowerCase().includes(q) ||
              d.registrationNumber?.toLowerCase().includes(q) ||
              d.phone?.toLowerCase().includes(q),
          );
        }
        return DEMO_DOCTORS;
      }
    },
    staleTime: 30 * 1000,
  });
}
