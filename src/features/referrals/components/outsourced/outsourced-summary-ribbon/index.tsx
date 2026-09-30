'use client';

import * as React from 'react';
import { Truck, Clock, CheckCircle2, Receipt, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import type { OutsourcedSummaryStats } from '@/features/referrals/types';

interface OutsourcedSummaryRibbonProps {
  stats: OutsourcedSummaryStats;
}

export function OutsourcedSummaryRibbon({ stats }: OutsourcedSummaryRibbonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
      {/* Card 1: Active Send-Outs */}
      <div className="bg-card border border-border/70 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider font-mono">
            Active Send-Outs
          </span>
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono text-foreground">
            {stats.activeCount}
          </span>
          <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900/60 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            External Custody
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          Samples dispatched or awaiting pickup
        </p>
      </div>

      {/* Card 2: Awaiting Pickup */}
      <div className="bg-card border border-border/70 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider font-mono">
            Awaiting Pickup
          </span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono text-foreground">
            {stats.pendingCount}
          </span>
          <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/60">
            Needs Packing
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          Centrifuged tubes queued for hub runner
        </p>
      </div>

      {/* Card 3: Results Received MTD */}
      <div className="bg-card border border-border/70 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider font-mono">
            Results Merged MTD
          </span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono text-foreground">
            {stats.receivedMTD}
          </span>
          <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" />
            TAT Met
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          Merged into patient letterhead reports
        </p>
      </div>

      {/* Card 4: Reference Lab B2B Payables */}
      <div className="bg-card border border-border/70 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider font-mono">
            Ref Lab B2B Bill (MTD)
          </span>
          <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <Receipt className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono text-foreground">
            {formatCurrency(stats.totalPayableB2B)}
          </span>
          <span className="text-[10px] font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 rounded-md border border-violet-200 dark:border-violet-900/60">
            Wholesale Cost
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          Owed to Dr. Lal, SRL, Thyrocare &amp; hubs
        </p>
      </div>
    </div>
  );
}
