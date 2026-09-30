'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type {
  CollectionRequest,
  CreateCollectionDto,
  AssignPhlebotomistDto,
  UpdateCollectionStatusDto,
  CancelCollectionDto,
  CollectionFilter,
  CollectionsKpiSummary,
} from '../types';
import { DEMO_PHLEBOTOMISTS, DEMO_COLLECTIONS } from '@/lib/demo-data';

export { DEMO_PHLEBOTOMISTS, DEMO_COLLECTIONS };

export function useCollections(filter?: CollectionFilter) {
  return useQuery({
    queryKey: ['collections', filter],
    queryFn: async () => {
      try {
        const params: Record<string, string | undefined> = {};
        if (filter?.status && filter.status !== 'ALL') params.status = filter.status;
        if (filter?.phlebotomistId) params.phlebotomistId = filter.phlebotomistId;
        if (filter?.preferredDate) params.preferredDate = filter.preferredDate;

        const data = await api.get<CollectionRequest[]>('/collections', { params });
        if (Array.isArray(data)) {
          return data;
        }
        return [];
      } catch {
        console.warn('[useCollections] Backend unreachable, falling back to demo collections.');
        return DEMO_COLLECTIONS;
      }
    },
    staleTime: 1000 * 15,
  });
}

export function useCollection(id: string) {
  return useQuery({
    queryKey: ['collections', id],
    queryFn: async () => {
      try {
        const data = await api.get<CollectionRequest>(`/collections/${id}`);
        if (data) return data;
      } catch {
        // Fallback
      }
      return DEMO_COLLECTIONS.find((c) => c.id === id) || DEMO_COLLECTIONS[0];
    },
    enabled: !!id,
  });
}

export function usePhlebotomists() {
  return useQuery({
    queryKey: ['collections', 'phlebotomists'],
    queryFn: async () => {
      try {
        const staff = await api.get<{ id: string; fullName: string; role: string }[]>('/labs/members');
        const phlebs = staff?.filter((s) => s.role === 'PHLEBOTOMIST');
        if (phlebs && phlebs.length > 0) {
          return phlebs.map((p, idx) => ({
            id: p.id,
            name: p.fullName,
            phone: '+91 94160 55412',
            currentZone: 'Barara / Saha',
            vehicleNumber: `HR-01-AB-${1000 + idx}`,
            activeAssignmentsCount: 0,
            status: 'ON_DUTY' as const,
            coldBoxId: `COLD-BOX-0${idx + 1}`,
            coldBoxTemp: '4.0°C',
            lastPing: 'Active now',
          }));
        }
      } catch {
        // Fallback to pilot staff
      }
      return DEMO_PHLEBOTOMISTS;
    },
    staleTime: 1000 * 60,
  });
}

export function useCollectionsKpiSummary(liveCollections?: CollectionRequest[]) {
  return useQuery<CollectionsKpiSummary>({
    queryKey: ['collections', 'kpi-summary', liveCollections?.length],
    queryFn: async () => {
      const items = liveCollections ?? DEMO_COLLECTIONS;
      return {
        totalBookingsToday: items.length,
        fastingCount: items.filter((c) => c.isFastingRequired).length,
        activeRunnersCount: DEMO_PHLEBOTOMISTS.filter((p) => p.status === 'ON_DUTY').length,
        inTransitSamplesCount: items.filter(
          (c) => c.status === 'IN_TRANSIT' || c.status === 'SAMPLE_COLLECTED',
        ).length,
        deliveredToLabCount: items.filter((c) => c.status === 'DELIVERED_TO_LAB').length,
        avgTurnaroundMinutes: 34,
      };
    },
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateCollectionDto): Promise<CollectionRequest> => {
      try {
        const res = await api.post<CollectionRequest>('/collections', dto);
        return res;
      } catch {
        const newReq: CollectionRequest = {
          id: `col-req-${Date.now()}`,
          labId: '6aaabed8-3df0-4569-8b9f-6fcc85ecc783',
          requestNumber: `HC-2026-0${Math.floor(88 + Math.random() * 20)}`,
          patientName: dto.patientName,
          patientPhone: dto.patientPhone,
          patientAge: dto.patientAge || '45 Y',
          patientSex: dto.patientSex || 'MALE',
          address: dto.address,
          locality: 'Barara',
          preferredDate: dto.preferredDate,
          timeSlot: dto.timeSlot,
          status: dto.assignedPhlebotomistId ? 'ASSIGNED' : 'REQUESTED',
          assignedPhlebotomistId: dto.assignedPhlebotomistId || null,
          assignedPhlebotomistName: dto.assignedPhlebotomistName || null,
          isFastingRequired: !!dto.isFastingRequired,
          testNames: dto.testNames || ['Routine Checkup'],
          specialInstructions: dto.specialInstructions || null,
          samples: [],
          collectedAt: null,
          deliveredToLabAt: null,
          reportId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        DEMO_COLLECTIONS.unshift(newReq);
        return newReq;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['reports', 'dashboard-stats'] });
    },
  });
}

export function useAssignPhlebotomist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: AssignPhlebotomistDto }) => {
      try {
        return await api.patch(`/collections/${id}/assign`, dto);
      } catch {
        const found = DEMO_COLLECTIONS.find((c) => c.id === id);
        if (found) {
          found.assignedPhlebotomistId = dto.phlebotomistId;
          found.assignedPhlebotomistName = dto.phlebotomistName;
          if (found.status === 'REQUESTED') {
            found.status = 'ASSIGNED';
          }
        }
        return found;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}

export function useUpdateCollectionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateCollectionStatusDto }) => {
      try {
        return await api.patch(`/collections/${id}/status`, dto);
      } catch {
        const found = DEMO_COLLECTIONS.find((c) => c.id === id);
        if (found) {
          found.status = dto.status;
          if (dto.status === 'SAMPLE_COLLECTED') {
            found.collectedAt = new Date().toISOString();
          }
          if (dto.status === 'DELIVERED_TO_LAB') {
            found.deliveredToLabAt = new Date().toISOString();
          }
          if (dto.samples && dto.samples.length > 0) {
            found.samples = dto.samples.map((s, idx) => ({
              id: `samp-${Date.now()}-${idx}`,
              collectionRequestId: id,
              tubeType: s.tubeType,
              barcode: s.barcode,
              notes: s.notes || null,
              createdAt: new Date().toISOString(),
            }));
          }
        }
        return found;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports', 'dashboard-stats'] });
    },
  });
}

export function useCancelCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: CancelCollectionDto }) => {
      try {
        return await api.post(`/collections/${id}/cancel`, dto);
      } catch {
        const found = DEMO_COLLECTIONS.find((c) => c.id === id);
        if (found) {
          found.status = 'CANCELLED';
          found.cancellationReason = dto.cancellationReason;
        }
        return found;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}
