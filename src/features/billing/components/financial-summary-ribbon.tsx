'use client';

import * as React from 'react';
import { Wallet, CheckCircle2, TrendingDown, Activity, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import type { FinancialSummary } from '../types';

interface FinancialSummaryRibbonProps {
  summary: FinancialSummary;
  isLoading?: boolean;
}

export function FinancialSummaryRibbon({ summary, isLoading }: FinancialSummaryRibbonProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 bg-muted/40 rounded-lg border border-border animate-pulse h-28" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* 1. Net Billed */}
      <div className="p-4 bg-card rounded-lg border border-border flex flex-col justify-between shadow-xs hover:border-primary/30 transition-colors">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Net Billed (MTD)
          </span>
          <div className="w-7 h-7 rounded-md bg-muted/60 flex items-center justify-center text-foreground">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {formatCurrency(summary.totalRevenue)}
          </span>
          <span className="text-xs font-mono text-muted-foreground">
            {summary.invoicesCount} Invoices
          </span>
        </div>
      </div>

      {/* 2. Total Collected */}
      <div className="p-4 bg-card rounded-lg border border-border flex flex-col justify-between shadow-xs hover:border-emerald-500/30 transition-colors">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Total Collected
          </span>
          <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {formatCurrency(summary.totalPaid)}
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[11px] font-semibold font-mono inline-flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            {summary.realizedPercentage}% Realized
          </span>
        </div>
      </div>

      {/* 3. Total Lab Expenses */}
      <div className="p-4 bg-card rounded-lg border border-border flex flex-col justify-between shadow-xs hover:border-amber-500/30 transition-colors">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Total Lab Expenses
          </span>
          <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {formatCurrency(summary.totalExpenses)}
          </span>
          <span className="text-xs font-mono text-muted-foreground">
            {summary.expensesCount} Outflows
          </span>
        </div>
      </div>

      {/* 4. Operating Net Margin */}
      <div className="p-4 bg-card rounded-lg border border-border flex flex-col justify-between shadow-xs hover:border-primary/40 transition-colors">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Operating Net Margin
          </span>
          <div className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {formatCurrency(summary.netMargin)}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground font-mono">
            {summary.marginPercentage}% Margin
          </span>
        </div>
      </div>
    </div>
  );
}
