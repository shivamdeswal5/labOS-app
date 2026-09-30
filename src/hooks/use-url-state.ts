'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import * as React from 'react';

/**
 * useURLState
 * Canonical URL query state synchronization hook benchmarking residency-frontend.
 * Provides type-safe getters and updates for page, limit, filters, and search terms.
 */
export function useURLState() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace, push } = useRouter();

  const getParam = React.useCallback(
    (key: string, defaultValue = ''): string => {
      return searchParams?.get(key) ?? defaultValue;
    },
    [searchParams],
  );

  const getNumberParam = React.useCallback(
    (key: string, defaultValue = 0): number => {
      const val = searchParams?.get(key);
      if (val === null || val === undefined) return defaultValue;
      const parsed = Number(val);
      return Number.isNaN(parsed) ? defaultValue : parsed;
    },
    [searchParams],
  );

  const setParams = React.useCallback(
    (
      paramsToSet: Record<string, string | number | boolean | null | undefined>,
      options?: { scroll?: boolean },
    ) => {
      const params = new URLSearchParams(searchParams?.toString() || '');

      Object.entries(paramsToSet).forEach(([key, val]) => {
        if (val === null || val === undefined || val === '') {
          params.delete(key);
        } else {
          params.set(key, String(val));
        }
      });

      const queryString = params.toString();
      const target = queryString ? `${pathname}?${queryString}` : pathname;
      replace(target, { scroll: options?.scroll ?? false });
    },
    [searchParams, pathname, replace],
  );

  return {
    searchParams,
    pathname,
    replace,
    push,
    getParam,
    getNumberParam,
    setParams,
  };
}
