'use client';

import * as React from 'react';
import { FlaskConical } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import type { LabCommissionSummary } from '../types';

interface KpiSummaryRibbonProps {
  summary: LabCommissionSummary;
  totalClinicians: number;
}

export function KpiSummaryRibbon({ summary, totalClinicians }: KpiSummaryRibbonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Card 1: Active Clinicians */}
      <div className="p-4 bg-card rounded-xl border border-border flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
            Active Clinicians
          </span>
          <span className="text-[10px] font-mono font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
            NABL LIMS
          </span>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
            {totalClinicians || summary.doctorCount}
          </span>
          <span className="text-xs text-muted-foreground">Affiliated MDs</span>
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground flex items-center gap-1">
          <span className="text-foreground font-semibold">{totalClinicians}</span> registered in network
        </div>
      </div>

      {/* Card 2: Patient Referrals (MTD) */}
      <div className="p-4 bg-card rounded-xl border border-border flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
            Patient Referrals (MTD)
          </span>
          <FlaskConical className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
            {summary.totalReferralsMTD || totalClinicians}
          </span>
          <span className="text-xs text-muted-foreground">Referred Cases</span>
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground flex items-center gap-1">
          <span>Active clinical network</span>
        </div>
      </div>

      {/* Card 3: Outstanding Commissions (Amber highlight) */}
      <div className="p-4 bg-card rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/10 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
            Outstanding Commissions
          </span>
          <span className="text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
            PAYOUT DUE
          </span>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold tracking-tight text-amber-700 dark:text-amber-400 font-mono">
            {formatCurrency(summary.totalPending)}
          </span>
          <span className="text-xs text-amber-800/80 dark:text-amber-400/80">
            {summary.doctorCount || totalClinicians} Clinicians
          </span>
        </div>
        <div className="mt-1 text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
          <span>Cycles pending closing approval</span>
        </div>
      </div>

      {/* Card 4: Disbursed Payouts (MTD) (Emerald highlight) */}
      <div className="p-4 bg-card rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/10 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            Disbursed Payouts (MTD)
          </span>
          <span className="text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
            CLEARED
          </span>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400 font-mono">
            {formatCurrency(summary.totalSettled)}
          </span>
          <span className="text-xs text-emerald-800/80 dark:text-emerald-400/80">Reconciled</span>
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground flex items-center gap-1">
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">100%</span> verified TDS vouchers
        </div>
      </div>
    </div>
  );
}
