'use client';

import * as React from 'react';
import { TrendingUp, Users, Clock, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import type { DashboardStatsDto } from '../../types';

interface KpiMetricsProps {
  stats?: DashboardStatsDto;
  isLoading?: boolean;
}

export function KpiMetrics({ stats, isLoading }: KpiMetricsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-lg border border-border bg-card elevation-flat space-y-3 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-muted rounded"></div>
              <div className="h-4 w-4 bg-muted rounded-full"></div>
            </div>
            <div className="h-7 w-28 bg-muted rounded"></div>
            <div className="h-3 w-36 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const revenue = stats?.todayRevenue ?? 0;
  const patients = stats?.todayPatientsCount ?? 0;
  const readyForReview = stats?.readyForReviewCount ?? 0;
  const finalized = stats?.finalizedTodayCount ?? 0;
  const pendingCollections = stats?.pendingCollectionsCount ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Today's Revenue */}
      <div className="p-4 rounded-lg border border-border bg-card elevation-flat space-y-2 hover:border-border/80 transition-colors">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="uppercase font-semibold tracking-wider text-[10px]">
            Today&apos;s Revenue
          </span>
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
        </div>
        <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
          {formatCurrency(revenue)}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
            Direct & Cash
          </span>
          <span>• Net collections today</span>
        </div>
      </div>

      {/* 2. Today's Patients */}
      <div className="p-4 rounded-lg border border-border bg-card elevation-flat space-y-2 hover:border-border/80 transition-colors">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="uppercase font-semibold tracking-wider text-[10px]">
            Patients Today
          </span>
          <Users className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
          {patients}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span>{pendingCollections} pending phlebotomy pickup</span>
        </div>
      </div>

      {/* 3. Reports Ready for Pathologist Review */}
      <div className="p-4 rounded-lg border border-border bg-card elevation-flat space-y-2 hover:border-border/80 transition-colors">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="uppercase font-semibold tracking-wider text-[10px]">
            Ready for Sign-off
          </span>
          <Clock className="w-3.5 h-3.5 text-amber-500" />
        </div>
        <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
          {readyForReview}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className={readyForReview > 0 ? 'text-amber-600 dark:text-amber-400 font-medium' : ''}>
            {readyForReview > 0 ? 'Awaiting verification' : 'Queue cleared'}
          </span>
        </div>
      </div>

      {/* 4. Finalized Reports */}
      <div className="p-4 rounded-lg border border-border bg-card elevation-flat space-y-2 hover:border-border/80 transition-colors">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="uppercase font-semibold tracking-wider text-[10px]">
            Finalized Today
          </span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        </div>
        <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
          {finalized}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span>NABL & ISO verified</span>
        </div>
      </div>
    </div>
  );
}
