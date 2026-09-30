'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import type { OutsourcedTest, OutsourcedTestStatus } from '@/features/referrals/types';
import { OutsourcedMobileCard } from '../_components/outsourced-mobile-card';

interface OutsourcedTableProps {
  tests: OutsourcedTest[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: 'ALL' | OutsourcedTestStatus;
  onStatusFilterChange: (status: 'ALL' | OutsourcedTestStatus) => void;
  onOpenReceiveModal: (test: OutsourcedTest) => void;
  onMarkDispatched: (test: OutsourcedTest) => void;
  onOpenNewSendOutModal: () => void;
}

export function OutsourcedTable({
  tests,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onOpenReceiveModal,
  onMarkDispatched,
  onOpenNewSendOutModal,
}: OutsourcedTableProps) {
  // Client-side search filtering across multiple fields
  const filteredTests = React.useMemo(() => {
    return tests.filter((t) => {
      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
      if (!matchesStatus) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.testName.toLowerCase().includes(q) ||
        t.referenceLabName.toLowerCase().includes(q) ||
        (t.patientName && t.patientName.toLowerCase().includes(q)) ||
        (t.reportNumber && t.reportNumber.toLowerCase().includes(q)) ||
        (t.courierTrackingNumber && t.courierTrackingNumber.toLowerCase().includes(q))
      );
    });
  }, [tests, statusFilter, searchQuery]);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search patient, accession R-XXXX, test, or waybill..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {(
            [
              { key: 'ALL', label: 'All Send-Outs' },
              { key: 'PENDING', label: 'Pending Pickup' },
              { key: 'SENT', label: 'In Transit' },
              { key: 'RECEIVED', label: 'Results Merged' },
            ] as const
          ).map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onStatusFilterChange(tab.key)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap text-xs ${
                  isActive
                    ? 'bg-foreground text-background shadow-2xs font-semibold'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 font-mono uppercase text-[10px] text-muted-foreground tracking-wider">
                <th className="py-2.5 px-3">Accession / Patient</th>
                <th className="py-2.5 px-3">Investigation</th>
                <th className="py-2.5 px-3">Reference Laboratory</th>
                <th className="py-2.5 px-3">Dispatch &amp; Tracking</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Wholesale Cost</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredTests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <Truck className="w-8 h-8 text-muted-foreground/60" />
                      <p className="text-sm font-semibold text-foreground">
                        No outsourced investigations found
                      </p>
                      <p className="text-xs text-muted-foreground">
                        No send-out tests match your current filter. Initiate a new dispatch manifest below.
                      </p>
                      <button
                        type="button"
                        onClick={onOpenNewSendOutModal}
                        className="mt-2 h-8 px-3 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        + New Send-Out Manifest
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTests.map((test) => {
                  const isPending = test.status === 'PENDING';
                  const isSent = test.status === 'SENT';
                  const isReceived = test.status === 'RECEIVED';
                  const margin = test.patientFee && test.cost ? test.patientFee - test.cost : 0;

                  return (
                    <tr
                      key={test.id}
                      className="hover:bg-muted/40 transition-colors group"
                    >
                      {/* Accession & Patient */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono font-semibold text-foreground">
                            {test.reportNumber || 'R-XXXX'}
                          </span>
                          <span className="text-foreground font-medium text-xs">
                            {test.patientName || 'Diagnostic Patient'}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {test.patientAge} • {test.patientSex}
                          </span>
                        </div>
                      </td>

                      {/* Investigation */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-0.5 max-w-[220px]">
                          <span className="font-semibold text-foreground truncate" title={test.testName}>
                            {test.testName}
                          </span>
                          {test.resultSummary && (
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-mono truncate" title={test.resultSummary}>
                              {test.resultSummary}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Reference Lab */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <Truck className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="truncate max-w-[180px]" title={test.referenceLabName}>
                            {test.referenceLabName}
                          </span>
                        </div>
                      </td>

                      {/* Dispatch & Courier */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-0.5 font-mono text-[11px]">
                          {test.courierTrackingNumber ? (
                            <span className="text-foreground font-semibold">
                              {test.courierTrackingNumber}
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic">Pending Waybill</span>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            {test.sentAt ? formatDateTime(test.sentAt) : 'Not dispatched yet'}
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3 text-center">
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
                      </td>

                      {/* Wholesale Cost & Margin */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex flex-col items-end font-mono">
                          <span className="font-bold text-foreground">
                            {formatCurrency(test.cost)}
                          </span>
                          {margin > 0 && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              Margin: +{formatCurrency(margin)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <button
                              type="button"
                              onClick={() => onMarkDispatched(test)}
                              className="h-7 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                              title="Mark as Dispatched via Courier"
                            >
                              <Truck className="w-3 h-3" />
                              <span>Dispatch</span>
                            </button>
                          )}

                          {(isPending || isSent) && (
                            <button
                              type="button"
                              onClick={() => onOpenReceiveModal(test)}
                              className="h-7 px-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                              title="Receive Reference Lab Results"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Receive</span>
                            </button>
                          )}

                          <Link
                            href={`/reports/${test.reportId}/preview`}
                            className="h-7 w-7 flex items-center justify-center bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded border border-border transition-colors"
                            title="Open Patient Report"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List View */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {filteredTests.length === 0 ? (
          <div className="p-8 text-center bg-card rounded-xl border border-border text-muted-foreground">
            No outsourced tests match this filter.
          </div>
        ) : (
          filteredTests.map((test) => (
            <OutsourcedMobileCard
              key={test.id}
              test={test}
              onOpenReceiveModal={onOpenReceiveModal}
              onMarkDispatched={onMarkDispatched}
            />
          ))
        )}
      </div>
    </div>
  );
}
