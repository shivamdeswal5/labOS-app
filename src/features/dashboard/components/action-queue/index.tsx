'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Truck,
  FlaskConical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DashboardStatsDto } from '../../types';

interface ActionQueueProps {
  stats?: DashboardStatsDto;
  isLoading?: boolean;
}

export function ActionQueue({ stats, isLoading }: ActionQueueProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card overflow-hidden elevation-flat animate-pulse">
        <div className="h-10 bg-muted/60 px-4 flex items-center">
          <div className="h-4 w-32 bg-muted rounded"></div>
        </div>
        <div className="p-4 space-y-3">
          <div className="h-12 bg-muted/40 rounded"></div>
          <div className="h-12 bg-muted/40 rounded"></div>
        </div>
      </div>
    );
  }

  const readyForReview = stats?.readyForReviewCount ?? 0;
  const overdueCount = stats?.overdueCount ?? 0;
  const pendingCollections = stats?.pendingCollectionsCount ?? 0;
  const pendingResults = stats?.pendingResultsCount ?? 0;

  const totalFlagged =
    (overdueCount > 0 ? 1 : 0) +
    (readyForReview > 0 ? 1 : 0) +
    (pendingCollections > 0 ? 1 : 0) +
    (pendingResults > 0 ? 1 : 0);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden elevation-flat">
      {/* Header */}
      <div className="px-4 py-2.5 bg-muted/50 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Clinical Action Queue
          </span>
          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-foreground text-background">
            {totalFlagged} {totalFlagged === 1 ? 'Item' : 'Items'} Flagged
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground hidden sm:inline">
          Prioritized by clinical severity under NABL ISO 15189
        </span>
      </div>

      {totalFlagged === 0 ? (
        <div className="py-8 px-4 text-center flex flex-col items-center justify-center gap-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          <p className="text-sm font-semibold text-foreground">
            All Clinical Queues Cleared
          </p>
          <p className="text-xs text-muted-foreground max-w-sm">
            No overdue accessions, pending doctor reviews, or dispatch delays at this station.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {/* 1. Overdue Turnaround Alert */}
          {overdueCount > 0 && (
            <div className="p-3.5 sm:p-4 bg-red-500/5 hover:bg-red-500/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="mt-1 relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive"></span>
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs sm:text-sm font-semibold text-foreground">
                      {overdueCount} {overdueCount === 1 ? 'report has' : 'reports have'} exceeded standard turnaround time (TAT)
                    </span>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-destructive/15 text-destructive border border-destructive/20">
                      CRITICAL TAT DELAY
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Immediate review required to meet NABL reporting SLAs. Check analyzer queue or reagent status.
                  </p>
                </div>
              </div>
              <Button asChild size="sm" variant="destructive" className="h-8 text-xs shrink-0 self-start sm:self-auto gap-1">
                <Link href="/reports?status=DRAFT">
                  <span>Expedite Queue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          )}

          {/* 2. Ready for Pathologist Review */}
          {readyForReview > 0 && (
            <div className="p-3.5 sm:p-4 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-medium text-foreground">
                      {readyForReview} {readyForReview === 1 ? 'report' : 'reports'} pending pathologist verification & sign-off
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      Awaiting Sign-off
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Test values keyed in. Delta checks and automated reference range validations cleared.
                  </p>
                </div>
              </div>
              <Button asChild size="sm" variant="ghost" className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground self-start sm:self-auto">
                <Link href="/reports">
                  <span>Review batch</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          )}

          {/* 3. Pending Phlebotomy Home Collections */}
          {pendingCollections > 0 && (
            <div className="p-3.5 sm:p-4 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <Truck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-medium text-foreground">
                      {pendingCollections} home collection {pendingCollections === 1 ? 'order' : 'orders'} pending technician dispatch
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                      Dispatch
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Phlebotomists awaiting sample tube barcode assignment and GPS pickup scheduling.
                  </p>
                </div>
              </div>
              <Button asChild size="sm" variant="outline" className="h-8 text-xs gap-1 self-start sm:self-auto">
                <Link href="/collections">
                  <span>Dispatch Phlebotomist</span>
                </Link>
              </Button>
            </div>
          )}

          {/* 4. In-Process Lab Tests */}
          {pendingResults > 0 && (
            <div className="p-3.5 sm:p-4 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <FlaskConical className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-medium text-foreground">
                      {pendingResults} {pendingResults === 1 ? 'sample is' : 'samples are'} currently undergoing diagnostic analysis
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Biochemistry, hematology, and serology batches in incubation.
                  </p>
                </div>
              </div>
              <Button asChild size="sm" variant="ghost" className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground self-start sm:self-auto">
                <Link href="/accessions">
                  <span>View Analyzer Worklist</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
