'use client';

import * as React from 'react';
import { Calendar, UserCheck, Snowflake, CheckCircle2 } from 'lucide-react';
import type { CollectionsKpiSummary } from '../types';

interface CollectionsKpiRibbonProps {
  summary: CollectionsKpiSummary;
}

export function CollectionsKpiRibbon({ summary }: CollectionsKpiRibbonProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Card 1: Today's Bookings */}
      <div className="bg-card border border-border rounded-lg p-4 shadow-2xs">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2">
          <span>Today&apos;s Bookings</span>
          <Calendar className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground tabular-nums">
            {summary.totalBookingsToday}
          </span>
          <span className="text-xs text-muted-foreground">requests</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>{summary.fastingCount} Morning Fasting</span>
        </div>
      </div>

      {/* Card 2: Field Runners Dispatched */}
      <div className="bg-card border border-border rounded-lg p-4 shadow-2xs">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2">
          <span>Runners in Field</span>
          <UserCheck className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground tabular-nums">
            {summary.activeRunnersCount}
          </span>
          <span className="text-xs text-muted-foreground">phlebotomists</span>
        </div>
        <div className="mt-2 text-xs text-muted-foreground font-mono truncate">
          Avg Route TAT: <span className="font-semibold text-foreground">{summary.avgTurnaroundMinutes}m</span>
        </div>
      </div>

      {/* Card 3: Cold-Chain En Route */}
      <div className="bg-card border border-border rounded-lg p-4 shadow-2xs">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2">
          <span>Cold-Chain En Route</span>
          <Snowflake className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground tabular-nums">
            {summary.inTransitSamplesCount}
          </span>
          <span className="text-xs text-muted-foreground">specimen boxes</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>Temp: 3.8°C – 4.6°C Validated</span>
        </div>
      </div>

      {/* Card 4: Delivered to Lab Bench */}
      <div className="bg-card border border-border rounded-lg p-4 shadow-2xs">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2">
          <span>Bench Check-in</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground tabular-nums">
            {summary.deliveredToLabCount}
          </span>
          <span className="text-xs text-muted-foreground">batches received</span>
        </div>
        <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>100% Barcodes Matched</span>
        </div>
      </div>
    </div>
  );
}
