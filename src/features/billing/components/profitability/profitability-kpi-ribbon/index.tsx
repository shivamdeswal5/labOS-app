'use client';

import * as React from 'react';
import { TrendingUp, DollarSign, Percent, Wallet, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import type { ProfitabilitySummaryStats } from '@/features/billing/types';

interface ProfitabilityKpiRibbonProps {
  summary: ProfitabilitySummaryStats;
}

export function ProfitabilityKpiRibbon({ summary }: ProfitabilityKpiRibbonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
      {/* Card 1: Net Realized Revenue */}
      <div className="bg-card border border-border/70 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider font-mono">
            Net Patient Revenue (MTD)
          </span>
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono text-foreground">
            {formatCurrency(summary.netRevenueMTD)}
          </span>
          <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/60">
            Realized Inflow
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          Gross billing minus patient concessions
        </p>
      </div>

      {/* Card 2: Direct Testing COGS */}
      <div className="bg-card border border-border/70 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider font-mono">
            Direct Testing COGS
          </span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono text-foreground">
            {formatCurrency(summary.totalDirectCostMTD)}
          </span>
          <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/60">
            29.5% of Revenue
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          Reagents + Outsourced B2B + Doctor Cuts
        </p>
      </div>

      {/* Card 3: Gross Diagnostic Margin */}
      <div className="bg-card border border-border/70 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider font-mono">
            Gross Diagnostic Margin
          </span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
            {summary.grossMarginPercentage}%
          </span>
          <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" />
            Healthy Bench
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          In-House: {summary.inHouseMarginAvg}% | Outsource: {summary.outsourcedMarginAvg}%
        </p>
      </div>

      {/* Card 4: Net Take-Home Cashflow */}
      <div className="bg-card border border-border/70 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider font-mono">
            Net Owner Take-Home (MTD)
          </span>
          <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono text-foreground">
            {formatCurrency(summary.netOperatingProfitMTD)}
          </span>
          <span className="text-[10px] font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 rounded-md border border-violet-200 dark:border-violet-900/60">
            Real Net Profit
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          After rent, bench salaries, AMC &amp; power
        </p>
      </div>
    </div>
  );
}
