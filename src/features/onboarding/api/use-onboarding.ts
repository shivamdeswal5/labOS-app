'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { api, ApiError } from '@/lib/api-client';
import type { LabProfileStepData, PathologistStepData } from '../types';
import { supabaseBrowser } from '@/lib/supabase-browser';

/**
 * Onboarding API Hooks
 *
 * Synchronized strictly with NestJS DDD bounded contexts:
 * - PUT /labs/current (UpdateLabController in labs bounded context)
 * - PUT /labs/me (UpdateProfileController in labs bounded context)
 * - GET /panels/templates/all (ListTemplatesController in panels bounded context)
 * - POST /panels/templates/seed (SeedTemplatesController in panels bounded context)
 * - Storage: Supabase Storage bucket 'lab-assets' with fallback
 */

export interface PanelTemplateItem {
  id: string;
  name: string;
  category: string;
  description: string | null;
  defaultPrice: number;
  templateData?: {
    sections: Array<{
      name: string;
      sortOrder: number;
      parameters: Array<{
        name: string;
        nameLocal?: string;
        unit?: string;
        inputType: string;
        sortOrder: number;
      }>;
    }>;
  };
}

export function useUpdateLab() {
  return useMutation({
    mutationFn: async (data: Partial<LabProfileStepData>) => {
      const { data: authData } = await supabaseBrowser.auth.getUser();
      const ownerFullName =
        authData?.user?.user_metadata?.full_name ||
        authData?.user?.email?.split('@')[0] ||
        (data.name ? `${data.name} Admin` : 'Lab Administrator');

      const payload = {
        name: data.name || 'Laboratory',
        address: data.address || 'Lab Facility Address',
        phoneNumbers: data.phoneNumber ? [data.phoneNumber] : ['+91 98765 43210'],
        accentColor: data.accentColor || '#0f172a',
        tagline: data.tagline || null,
        footerNote: data.footerNote || null,
        reportLanguage: data.reportLanguage || 'en',
      };

      // 1. Check if user already has an active lab
      try {
        const profile = await api.get<{ labId?: string | null }>('/labs/me');
        if (profile?.labId) {
          return await api.put('/labs/current', payload);
        }
      } catch {
        // User has no lab profile yet; create new lab below
      }

      // 2. User has no lab — create initial lab and owner profile via POST /labs
      try {
        return await api.post('/labs', {
          ...payload,
          ownerFullName,
        });
      } catch (err: unknown) {
        // In case of conflict (e.g., lab was already created), update instead
        if (err instanceof ApiError && (err.statusCode === 409 || err.statusCode === 400)) {
          return await api.put('/labs/current', payload);
        }
        throw err;
      }
    },
  });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (data: Partial<PathologistStepData>) =>
      api.put('/labs/me', {
        fullName: data.fullName,
        qualification: data.qualification,
        signatureUrl: data.signatureUrl || null,
        councilRegistrationNumber: data.councilRegistrationNumber || null,
      }),
  });
}

/**
 * useTemplatesCatalog — queries all NABL standard panel templates seeded in the database.
 */
export function useTemplatesCatalog() {
  return useQuery({
    queryKey: ['panel-templates'],
    queryFn: () => api.get<PanelTemplateItem[]>('/panels/templates/all'),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * useSeedTemplates — batch seeds selected panel templates into the tenant lab.
 */
export function useSeedTemplates() {
  return useMutation({
    mutationFn: (templateIds: string[]) =>
      api.post('/panels/templates/seed', { templateIds }),
  });
}

/**
 * useUploadSignature — uploads a pathologist signature image to Supabase Storage.
 * If Supabase Storage is not configured or offline, safely falls back to a base64 Data URL.
 */
export function useUploadSignature() {
  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      try {
        const bucket =
          process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'lab-assets';
        const path = `signatures/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

        const { error } = await supabaseBrowser.storage
          .from(bucket)
          .upload(path, file, { upsert: true });

        if (error) {
          throw error;
        }

        const { data } = supabaseBrowser.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
      } catch {
        // Fallback to in-memory Data URL for local demo / offline mode
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }
    },
  });
}
