'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { TestPanel } from '../types';
import { DEMO_TEST_PANELS } from '@/lib/demo-data';

export { DEMO_TEST_PANELS };

export const PANELS_QUERY_KEY = ['panels'] as const;

interface RawBackendTestPanel {
  id: string;
  name: string;
  category?: string;
  price?: number | string;
  specimenType?: string;
  tatMinutes?: number;
  sortOrder?: number;
}

function normalizePanel(p: RawBackendTestPanel): TestPanel {
  const normCat = /haematology/i.test(p.category || '') ? 'Hematology' : (p.category || 'General');
  let specimenType = p.specimenType;
  if (!specimenType) {
    const name = (p.name || '').toUpperCase();
    if (name.includes('CBC') || name.includes('HBA1C') || name.includes('BLOOD GROUP') || name.includes('MALARIA')) {
      specimenType = '2.0 mL EDTA (Purple Top)';
    } else if (name.includes('GLUCOSE') || name.includes('SUGAR')) {
      specimenType = '2.0 mL Fluoride (Grey Top)';
    } else if (name.includes('PROTHROMBIN') || name.includes('PT / INR')) {
      specimenType = '2.0 mL Sodium Citrate (Blue Top)';
    } else if (name.includes('ESR')) {
      specimenType = '1.6 mL Sodium Citrate (Black Top)';
    } else if (name.includes('URINE')) {
      specimenType = '15 mL Sterile Urine Container';
    } else if (name.includes('STOOL')) {
      specimenType = 'Sterile Stool Container';
    } else if (name.includes('SEMEN')) {
      specimenType = 'Sterile Semen Container';
    } else if (name.includes('VITAMIN D')) {
      specimenType = '3.0 mL Serum SST (Protected from Light)';
    } else {
      specimenType = '3.0 mL Serum SST (Yellow Top)';
    }
  }

  return {
    ...p,
    category: normCat,
    price: Number(p.price || 0),
    specimenType,
    tatMinutes: p.tatMinutes || 45,
    sortOrder: p.sortOrder ?? 0,
  };
}

export function usePanels(category?: string) {
  return useQuery<TestPanel[]>({
    queryKey: [...PANELS_QUERY_KEY, category].filter(Boolean),
    queryFn: async () => {
      try {
        const url = category && category !== 'All'
          ? `/panels?category=${encodeURIComponent(category === 'Hematology' ? 'Hematology' : category)}`
          : '/panels';
        const data = await api.get<TestPanel[]>(url);
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(normalizePanel);
          if (category && category !== 'All') {
            return mapped.filter((p) => p.category.toLowerCase() === category.toLowerCase());
          }
          return mapped;
        }
        if (category && category !== 'All') {
          return DEMO_TEST_PANELS.filter((p) => p.category.toLowerCase() === category.toLowerCase());
        }
        return DEMO_TEST_PANELS;
      } catch {
        if (category && category !== 'All') {
          return DEMO_TEST_PANELS.filter((p) => p.category.toLowerCase() === category.toLowerCase());
        }
        return DEMO_TEST_PANELS;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}
