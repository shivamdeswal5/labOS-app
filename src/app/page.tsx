'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  Barcode,
  FilePlus2,
  RefreshCw,
  Users,
  UserCheck,
  Receipt,
  Truck,
  ArrowUpRight,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { useDashboardStats } from '@/features/dashboard/api/use-dashboard-stats';
import { useLabProfile } from '@/features/settings/hooks/use-lab-profile';
import { useTenantSubscriptionQuery } from '@/features/subscription/api/subscription.queries';
import { KpiMetrics } from '@/features/dashboard/components/kpi-metrics';
import { ActionQueue } from '@/features/dashboard/components/action-queue';
import { GettingStartedGuide } from '@/features/dashboard/components/getting-started-guide';

export default function DashboardPage() {
  const { data: stats, isLoading, isError, error, refetch, isFetching } = useDashboardStats();
  const { data: labProfile } = useLabProfile();
  const { data: subscription } = useTenantSubscriptionQuery();
  const labName = labProfile?.name || 'Diagnostic Center';

  const isTrial = subscription?.status === 'TRIALING';
  const subLabel = isTrial
    ? `14-Day Free Trial (${subscription?.daysRemaining ?? 14}d left)`
    : `${subscription?.planName || 'Active Plan'}`;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Workspace Title & Facility Identity Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {labName}
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE FEED
              </span>
              <span className="inline-flex items-center text-[11px] font-mono px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-semibold">
                {subLabel}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Station 01 • NABL ISO 15189 Aligned • Mission Control
            </p>
          </div>

          {/* Quick Actions & Refetch Trigger */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              title="Force Registry Refetch"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <Button asChild size="sm" variant="outline" className="h-8 text-xs gap-1.5">
              <Link href="/accessions">
                <Barcode className="w-3.5 h-3.5" />
                <span>Accession Register</span>
              </Link>
            </Button>

            <Button asChild size="sm" className="h-8 text-xs gap-1.5 font-semibold bg-primary text-primary-foreground shadow-xs">
              <Link href="/reports/new">
                <FilePlus2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Patient Report</span>
                <span className="sm:hidden">New Report</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* First-Time Getting Started Setup Guide (Collapsible/Dismissible) */}
        <GettingStartedGuide profile={labProfile} stats={stats} />

        {/* Error Fallback Banner */}
        {isError && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                Unable to sync real-time telemetry: {(error as Error)?.message || 'Service unreachable'}.
                Displaying cached station state.
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              className="h-7 text-xs border-destructive/30 text-destructive hover:bg-destructive/15 shrink-0 self-start sm:self-auto"
            >
              Retry Connection
            </Button>
          </div>
        )}

        {/* Priority Action Queue (Actionable Exceptions) */}
        <ActionQueue stats={stats} isLoading={isLoading} />

        {/* Primary KPI Metrics Row (4 Real KPIs) */}
        <KpiMetrics stats={stats} isLoading={isLoading} />

        {/* Secondary Operational Navigation Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Patients & History */}
          <Link
            href="/patients"
            className="p-4 rounded-lg border border-border bg-card elevation-flat hover:bg-muted/40 transition-colors group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <Users className="w-4 h-4 text-foreground group-hover:text-primary transition-colors" />
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <div className="text-xs font-semibold text-foreground">
                Patients & Medical History
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Search demographics, historical trends, and past visit reports.
              </p>
            </div>
          </Link>

          {/* Doctor Referrals & Ledger */}
          <Link
            href="/referrals"
            className="p-4 rounded-lg border border-border bg-card elevation-flat hover:bg-muted/40 transition-colors group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <UserCheck className="w-4 h-4 text-foreground group-hover:text-primary transition-colors" />
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <div className="text-xs font-semibold text-foreground">
                Doctor Referrals & Settlements
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Itemized commission ledger, doctor statements, and one-click settlements.
              </p>
            </div>
          </Link>

          {/* Billing & Expenses */}
          <Link
            href="/billing"
            className="p-4 rounded-lg border border-border bg-card elevation-flat hover:bg-muted/40 transition-colors group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <Receipt className="w-4 h-4 text-foreground group-hover:text-primary transition-colors" />
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <div className="text-xs font-semibold text-foreground">
                Billing, Cash & Expenses
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Invoice generation, operational lab expenses, and profit telemetry.
              </p>
            </div>
          </Link>

          {/* Home Phlebotomy Collections */}
          <Link
            href="/collections"
            className="p-4 rounded-lg border border-border bg-card elevation-flat hover:bg-muted/40 transition-colors group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <Truck className="w-4 h-4 text-foreground group-hover:text-primary transition-colors" />
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <div className="text-xs font-semibold text-foreground">
                Home Sample Collections
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Phlebotomist dispatch, tube barcode allocation, and pickup routing.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
