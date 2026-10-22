import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export interface ParameterOverridePayload {
  parameterId: string;
  value: string;
  isOutOfRange?: boolean;
}

export interface GenerateClinicalRemarksPayload {
  draftValues?: ParameterOverridePayload[];
}

export interface PatientSmartSummaryParam {
  parameterName: string;
  value: string;
  unit: string | null;
  status: 'OPTIMAL' | 'ATTENTION_NEEDED';
  explanationEn: string;
  explanationHi: string;
  lifestyleTipEn?: string | null;
  lifestyleTipHi?: string | null;
}

export interface PatientSmartSummaryData {
  overviewTextEn: string;
  overviewTextHi: string;
  testedCount: number;
  abnormalCount: number;
  highlightedParameters: PatientSmartSummaryParam[];
  consultationRecommendationEn: string;
  consultationRecommendationHi: string;
}

/**
 * Mutation hook for generating AI clinical impression remarks for the pathologist console.
 */
export function useGenerateAiImpression(reportId: string) {
  return useMutation({
    mutationFn: async (payload: GenerateClinicalRemarksPayload) => {
      return api.post<{ impression: string }>(`/reports/${reportId}/ai-impression`, payload);
    },
  });
}

/**
 * Query hook for retrieving patient-friendly bilingual smart summary for public QR view.
 */
export function usePatientSmartSummary(token: string, enabled = true) {
  return useQuery({
    queryKey: ['reports', 'share', token, 'ai-summary'],
    queryFn: async () => {
      return api.get<PatientSmartSummaryData>(`/reports/share/${token}/ai-summary`);
    },
    enabled: Boolean(token) && enabled,
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
}
