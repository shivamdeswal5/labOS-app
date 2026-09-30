'use client';

import * as React from 'react';
import {
  useTestProfitability,
  useDiagnosticPnL,
  useProfitabilitySummary,
} from '@/features/billing/api/use-profitability';
import { ProfitabilityKpiRibbon } from '../profitability-kpi-ribbon';
import { BreakevenAdvisorCard } from '../breakeven-advisor-card';
import { UnitMarginsTable } from '../unit-margins-table';
import { PnLStatementSheet } from '../pnl-statement-sheet';
import { TableSkeleton } from '@/components/shared/table-skeleton';

export function ProfitabilityTabContent() {
  const { data: metrics = [], isLoading: isMetricsLoading } = useTestProfitability();
  const { data: pnl, isLoading: isPnLLoading } = useDiagnosticPnL();
  const summary = useProfitabilitySummary();

  if (isMetricsLoading || isPnLLoading || !pnl) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-card rounded-xl border border-border/70 p-3.5 animate-pulse" />
          ))}
        </div>
        <div className="h-40 bg-card rounded-2xl border border-border/70 p-4 animate-pulse" />
        <TableSkeleton rows={8} columns={7} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 4 Clinical Profitability KPI Cards */}
      <ProfitabilityKpiRibbon summary={summary} />

      {/* In-House vs Outsourced Breakeven Advisor */}
      <BreakevenAdvisorCard metrics={metrics} />

      {/* High-density investigation catalog unit margins grid */}
      <UnitMarginsTable metrics={metrics} />

      {/* Formal Diagnostic Profit & Loss Statement */}
      <PnLStatementSheet pnl={pnl} />
    </div>
  );
}
