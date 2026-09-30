'use client';

import * as React from 'react';
import Link from 'next/link';
import { Truck, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import type { OutsourcedTest } from '@/features/referrals/types';

interface OutsourcedMobileCardProps {
  test: OutsourcedTest;
  onOpenReceiveModal: (test: OutsourcedTest) => void;
  onMarkDispatched: (test: OutsourcedTest) => void;
}

export function OutsourcedMobileCard({
  test,
  onOpenReceiveModal,
  onMarkDispatched,
}: OutsourcedMobileCardProps) {
  const isPending = test.status === 'PENDING';
  const isSent = test.status === 'SENT';
  const isReceived = test.status === 'RECEIVED';
  const margin = test.patientFee && test.cost ? test.patientFee - test.cost : 0;

  return (
    <div className="bg-card border border-border/80 rounded-xl p-3.5 flex flex-col gap-3 shadow-2xs">
      {/* Top Header: Accession & Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-foreground bg-muted px-2 py-0.5 rounded border border-border">
            {test.reportNumber || 'R-XXXX'}
          </span>
          <span className="text-xs font-semibold text-foreground truncate max-w-[150px]">
            {test.patientName}
          </span>
        </div>

        {/* Status Pill */}
        {isPending && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/60">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending Pickup
          </span>
        )}
        {isSent && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-900/60">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            In Transit
          </span>
        )}
        {isReceived && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/60">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Merged
          </span>
        )}
      </div>

      {/* Test & Reference Lab */}
      <div className="flex flex-col gap-1 text-xs">
        <span className="font-semibold text-foreground text-sm">
          {test.testName}
        </span>
        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
          <Truck className="w-3.5 h-3.5 shrink-0 text-primary" />
          <span className="font-medium text-foreground">{test.referenceLabName}</span>
        </div>
        {test.courierTrackingNumber && (
          <span className="font-mono text-[11px] text-muted-foreground">
            Waybill: {test.courierTrackingNumber} {test.courierPartner ? `(${test.courierPartner})` : ''}
          </span>
        )}
        {test.resultSummary && (
          <div className="mt-1 p-2 bg-emerald-50/50 dark:bg-emerald-950/20 rounded border border-emerald-200/60 dark:border-emerald-900/40 text-[11px] text-emerald-900 dark:text-emerald-200 font-mono">
            {test.resultSummary}
          </div>
        )}
      </div>

      {/* Cost & Margins */}
      <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
        <div className="flex items-baseline gap-2">
          <span className="text-muted-foreground text-[11px]">Wholesale:</span>
          <span className="font-mono font-bold text-foreground">
            {formatCurrency(test.cost)}
          </span>
        </div>
        {margin > 0 && (
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
            Margin: +{formatCurrency(margin)}
          </span>
        )}
      </div>

      {/* Action Buttons (min 44px tap target) */}
      <div className="flex items-center gap-2 pt-1 print:hidden">
        {isPending && (
          <button
            type="button"
            onClick={() => onMarkDispatched(test)}
            className="flex-1 min-h-[44px] px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          >
            <Truck className="w-4 h-4" />
            <span>Mark Dispatched</span>
          </button>
        )}

        {(isPending || isSent) && (
          <button
            type="button"
            onClick={() => onOpenReceiveModal(test)}
            className="flex-1 min-h-[44px] px-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Receive &amp; Merge</span>
          </button>
        )}

        <Link
          href={`/reports/${test.reportId}/preview`}
          className="min-h-[44px] px-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-xs font-medium flex items-center justify-center gap-1 border border-border transition-colors"
          title="View Master Report"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="sr-only">Report</span>
        </Link>
      </div>
    </div>
  );
}
