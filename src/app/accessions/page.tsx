'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  FilePlus2,
  RefreshCw,
  AlertCircle,
  Loader2,
  ClipboardList,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { WorklistToolbar } from '@/features/reports/components/worklist/worklist-toolbar';
import { AccessionTable } from '@/features/reports/components/worklist/accession-table';
import { AccessionMobileCard } from '@/features/reports/components/worklist/accession-mobile-card';
import {
  NotificationAuditTab,
  SendWhatsAppModal,
  useNotificationLogs,
  computeNotificationStats,
} from '@/features/notifications';
import { useReports } from '@/features/reports/api/use-reports';
import type { ReportStatus, DetailedReport } from '@/features/reports/types';

export default function AccessionsWorklistPage() {
  const { data: reports = [], isLoading, isError, error, refetch, isFetching } = useReports();
  const { data: notifLogs = [] } = useNotificationLogs();

  const [activeTab, setActiveTab] = React.useState<'worklist' | 'audit'>('worklist');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [selectedStatus, setSelectedStatus] = React.useState<'ALL' | ReportStatus>('ALL');
  const [panicOnly, setPanicOnly] = React.useState<boolean>(false);
  const [whatsAppModalReport, setWhatsAppModalReport] = React.useState<DetailedReport | null>(null);

  // Compute live metrics across all fetched reports
  const totalCount = reports.length;
  const draftCount = React.useMemo(() => reports.filter((r) => r.status === 'DRAFT').length, [reports]);
  const finalizedCount = React.useMemo(() => reports.filter((r) => r.status === 'FINALIZED').length, [reports]);
  const panicCount = React.useMemo(() => reports.filter((r) => r.values?.some((v) => v.isOutOfRange)).length, [reports]);
  const notifStats = React.useMemo(() => computeNotificationStats(notifLogs), [notifLogs]);

  // Apply search, status, and panic filtering
  const filteredReports = React.useMemo(() => {
    return reports.filter((report) => {
      if (selectedStatus !== 'ALL' && report.status !== selectedStatus) return false;
      if (panicOnly && !report.values?.some((v) => v.isOutOfRange)) return false;

      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const numMatch = report.reportNumber.toLowerCase().includes(q);
        const nameMatch = report.patient?.name?.toLowerCase().includes(q);
        const phoneMatch = report.patient?.phone?.toLowerCase().includes(q);
        const mrnMatch = report.patient?.patientNumber?.toLowerCase().includes(q);
        const panelMatch = report.reportPanels?.some((rp) => rp.panel?.name?.toLowerCase().includes(q));

        if (!numMatch && !nameMatch && !phoneMatch && !mrnMatch && !panelMatch) return false;
      }
      return true;
    });
  }, [reports, selectedStatus, panicOnly, searchQuery]);

  return (
    <AppShell variant="full-bleed">
      <div className="flex flex-col gap-5 pb-16">
        {/* Standardized Clinical Page Header */}
        <PageHeader
          title={activeTab === 'worklist' ? 'Sample Worklist' : 'WhatsApp & Dispatch Audit'}
          subtitle={
            activeTab === 'worklist'
              ? `Showing ${filteredReports.length} of ${totalCount} samples registered today`
              : 'End-to-end communication log, WhatsApp dispatch status, and delivery audit trail'
          }
          icon={activeTab === 'worklist' ? <ClipboardList className="w-4 h-4" /> : <WhatsAppIcon className="w-4 h-4 text-emerald-600" />}
          breadcrumbs={[{ label: 'Sample Worklist' }]}
          badge={
            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE FEED
            </span>
          }
          actions={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="h-9 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                title="Force register refetch"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>

              {activeTab === 'worklist' && (
                <Button asChild size="sm" className="h-9 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground shadow-xs">
                  <Link href="/reports/new">
                    <FilePlus2 className="w-3.5 h-3.5" />
                    <span>New Accession</span>
                  </Link>
                </Button>
              )}
            </>
          }
        />

        {/* Dual-Workstation Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('worklist')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'worklist'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Sample Worklist</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10">
              {totalCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            <WhatsAppIcon className="w-4 h-4 text-emerald-100" />
            <span>WhatsApp & Dispatch Log</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10">
              {notifLogs.length}
            </span>
            {notifStats.failedCount > 0 && (
              <span
                className="w-2 h-2 rounded-full bg-red-400 animate-pulse"
                title={`${notifStats.failedCount} phone numbers require verification`}
              />
            )}
          </button>
        </div>

        {/* Tab 1: Accession Worklist Presentation */}
        {activeTab === 'worklist' && (
          <div className="space-y-4">
            <WorklistToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              panicOnly={panicOnly}
              onPanicToggle={() => setPanicOnly((prev) => !prev)}
              totalCount={totalCount}
              draftCount={draftCount}
              finalizedCount={finalizedCount}
              panicCount={panicCount}
              onResetFilters={() => {
                setSearchQuery('');
                setSelectedStatus('ALL');
                setPanicOnly(false);
              }}
            />

            {isLoading && (
              <div className="flex flex-col items-center justify-center p-16 gap-3 bg-card rounded-xl border border-border">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-xs text-muted-foreground font-mono">
                  Loading active accessions from laboratory register...
                </p>
              </div>
            )}

            {isError && (
              <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-semibold text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Failed to load laboratory register</span>
                </div>
                <p className="text-xs text-red-600 dark:text-red-300">
                  {error instanceof Error ? error.message : 'Unknown network error occurred.'}
                </p>
                <Button size="sm" variant="outline" onClick={() => refetch()} className="gap-1.5 text-xs">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </Button>
              </div>
            )}

            {!isLoading && (
              <>
                <div className="hidden sm:block">
                  <AccessionTable
                    reports={filteredReports}
                    onOpenWhatsApp={(rep) => setWhatsAppModalReport(rep)}
                  />
                </div>

                <div className="sm:hidden flex flex-col gap-3">
                  {filteredReports.length === 0 ? (
                    <div className="p-8 bg-card rounded-xl border border-border text-center text-xs text-muted-foreground">
                      No accession records match your filter criteria.
                    </div>
                  ) : (
                    filteredReports.map((report) => (
                      <AccessionMobileCard
                        key={report.id}
                        report={report}
                        onOpenWhatsApp={(rep) => setWhatsAppModalReport(rep)}
                      />
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 2: WhatsApp & Dispatch Audit Presentation */}
        {activeTab === 'audit' && (
          <NotificationAuditTab
            onOpenWhatsAppModal={(rep) => setWhatsAppModalReport(rep as DetailedReport)}
          />
        )}
      </div>

      {/* Free Direct WhatsApp Dispatch Modal */}
      {whatsAppModalReport && (
        <SendWhatsAppModal
          isOpen={Boolean(whatsAppModalReport)}
          onClose={() => setWhatsAppModalReport(null)}
          report={whatsAppModalReport}
        />
      )}
    </AppShell>
  );
}
