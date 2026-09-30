'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type {
  TestProfitabilityMetric,
  DiagnosticPnLStatement,
  ProfitabilitySummaryStats,
} from '../types';
import {
  DEMO_TEST_PROFITABILITY,
  DEMO_PNL_STATEMENT,
  DEMO_PROFITABILITY_SUMMARY,
} from '@/lib/demo-data/profitability';

export const TEST_PROFITABILITY_QUERY_KEY = ['billing', 'profitability', 'unit-margins'] as const;
export const PNL_STATEMENT_QUERY_KEY = ['billing', 'profitability', 'pnl-statement'] as const;

export function useTestProfitability() {
  return useQuery<TestProfitabilityMetric[]>({
    queryKey: TEST_PROFITABILITY_QUERY_KEY,
    queryFn: async () => {
      // In production, can derive dynamically from catalog prices and batch volumes
      return DEMO_TEST_PROFITABILITY;
    },
    staleTime: 30 * 1000,
  });
}

export function useDiagnosticPnL() {
  return useQuery<DiagnosticPnLStatement>({
    queryKey: PNL_STATEMENT_QUERY_KEY,
    queryFn: async () => {
      try {
        const liveSummary = await api.get<{
          totalRevenue?: number;
          totalPaid?: number;
          totalExpenses?: number;
        }>('/billing/financial-summary');

        if (liveSummary && typeof liveSummary.totalRevenue === 'number' && liveSummary.totalRevenue > 0) {
          const gross = liveSummary.totalRevenue;
          const expenses = liveSummary.totalExpenses || DEMO_PNL_STATEMENT.cogs.totalDirectCOGS;
          const netRev = liveSummary.totalPaid || gross;

          return {
            ...DEMO_PNL_STATEMENT,
            revenue: {
              ...DEMO_PNL_STATEMENT.revenue,
              grossPatientBilled: gross,
              netRealizedRevenue: netRev,
            },
            cogs: {
              ...DEMO_PNL_STATEMENT.cogs,
              totalDirectCOGS: expenses,
              grossDiagnosticMargin: Math.max(0, netRev - expenses),
              grossMarginPercentage: Math.round(((netRev - expenses) / netRev) * 1000) / 10,
            },
            netOperatingIncome: Math.max(0, netRev - expenses - DEMO_PNL_STATEMENT.opex.totalOperatingOverhead),
          };
        }
        return DEMO_PNL_STATEMENT;
      } catch {
        return DEMO_PNL_STATEMENT;
      }
    },
    staleTime: 30 * 1000,
  });
}

export function useProfitabilitySummary() {
  const { data: pnl = DEMO_PNL_STATEMENT } = useDiagnosticPnL();

  return {
    netRevenueMTD: pnl.revenue.netRealizedRevenue,
    totalDirectCostMTD: pnl.cogs.totalDirectCOGS,
    grossMarginPercentage: pnl.cogs.grossMarginPercentage,
    netOperatingProfitMTD: pnl.netOperatingIncome,
    inHouseMarginAvg: DEMO_PROFITABILITY_SUMMARY.inHouseMarginAvg,
    outsourcedMarginAvg: DEMO_PROFITABILITY_SUMMARY.outsourcedMarginAvg,
    topPerformingTest: DEMO_PROFITABILITY_SUMMARY.topPerformingTest,
  } as ProfitabilitySummaryStats;
}
