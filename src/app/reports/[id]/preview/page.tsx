'use client';

import * as React from 'react';
import {
  AlertCircle,
  FileCheck,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { PreviewActionToolbar } from '@/features/reports/components/report-preview/preview-action-toolbar';
import { A4DocumentSheet } from '@/features/reports/components/report-preview/a4-document-sheet';
import { LetterheadCalibrationBar } from '@/features/reports/components/report-preview/_components/letterhead-calibration-bar';
import { useReport } from '@/features/reports/api/use-report';
import { useLabProfile, useUpdateLabProfile } from '@/features/settings/api/use-settings';
import { ReportDispatchTimeline } from '@/features/notifications';
import { CheckCircle2 } from 'lucide-react';
import type { StationeryType } from '@/features/settings/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ReportPreviewPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const reportId = resolvedParams.id;

  const { data: report, isLoading, isError, error, refetch } = useReport(reportId);
  const { data: labProfile } = useLabProfile();
  const updateProfileMutation = useUpdateLabProfile();

  // Saved profile defaults
  const savedStationery: StationeryType = labProfile?.printSettings?.stationeryType || 'PLAIN';
  const savedHeaderMargin: number = labProfile?.printSettings?.headerMarginMm ?? 48;
  const savedFooterMargin: number = labProfile?.printSettings?.footerMarginMm ?? 24;

  // Local interactive calibration state
  const [selectedStationery, setSelectedStationery] = React.useState<StationeryType | null>(null);
  const [customHeaderMargin, setCustomHeaderMargin] = React.useState<number | null>(null);
  const [customFooterMargin, setCustomFooterMargin] = React.useState<number | null>(null);
  const [simulateBlankStationery, setSimulateBlankStationery] = React.useState(true);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Derived effective values
  const activeStationery = selectedStationery ?? savedStationery;
  const effectiveHeaderMargin = customHeaderMargin ?? savedHeaderMargin;
  const effectiveFooterMargin = customFooterMargin ?? savedFooterMargin;

  const isPreprinted = activeStationery !== 'PLAIN';

  const isModified =
    (selectedStationery !== null && selectedStationery !== savedStationery) ||
    (customHeaderMargin !== null && customHeaderMargin !== savedHeaderMargin) ||
    (customFooterMargin !== null && customFooterMargin !== savedFooterMargin);

  const handleSaveAsDefault = () => {
    updateProfileMutation.mutate(
      {
        printSettings: {
          stationeryType: activeStationery,
          headerMarginMm: effectiveHeaderMargin,
          footerMarginMm: effectiveFooterMargin,
        },
      },
      {
        onSuccess: () => {
          setSelectedStationery(null);
          setCustomHeaderMargin(null);
          setCustomFooterMargin(null);
          setToastMessage(`Saved ${effectiveHeaderMargin}mm margin as Lab Default for all future reports!`);
          setTimeout(() => setToastMessage(null), 4000);
        },
      },
    );
  };

  const handleResetToDefault = () => {
    setSelectedStationery(null);
    setCustomHeaderMargin(null);
    setCustomFooterMargin(null);
  };

  return (
    <AppShell variant="contained">
      <div className="flex flex-col gap-4 pb-16">
        {/* Unified Page Header */}
        <div className="print:hidden">
          <PageHeader
            title={`Clinical Report Preview — ${report?.reportNumber || reportId}`}
            subtitle="Verified clinical findings formatted for A4 official letterhead and digital PDF dispatch"
            icon={<FileCheck className="w-5 h-5" />}
            backHref="/accessions"
            breadcrumbs={[
              { label: 'Sample Worklist', href: '/accessions' },
              { label: `Report #${report?.reportNumber || reportId}`, href: `/reports/${reportId}/entry` },
              { label: 'Print Sheet & Verification' },
            ]}
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-16 gap-3 bg-card rounded-xl border border-border">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground font-mono">
              Rendering digital verification document...
            </p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl space-y-3 print:hidden">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-semibold text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Failed to load report #{reportId}</span>
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

        {/* Loaded Document View */}
        {report && (
          <div className="flex flex-col gap-4">
            {/* Top Verification & Dispatch Toolbar */}
            <PreviewActionToolbar
              report={report}
              isPublicView={false}
              stationeryType={activeStationery}
              onStationeryTypeChange={setSelectedStationery}
              headerMarginMm={effectiveHeaderMargin}
              footerMarginMm={effectiveFooterMargin}
              onHeaderMarginChange={setCustomHeaderMargin}
              onFooterMarginChange={setCustomFooterMargin}
              simulateBlankStationery={simulateBlankStationery}
              onToggleSimulateStationery={setSimulateBlankStationery}
              onSaveAsDefault={handleSaveAsDefault}
              isSavingDefault={updateProfileMutation.isPending}
              isModified={isModified}
            />

            {/* Interactive Letterhead Calibration Bar (Active when in pre-printed stationery mode) */}
            {isPreprinted && (
              <LetterheadCalibrationBar
                stationeryType={activeStationery}
                headerMarginMm={effectiveHeaderMargin}
                footerMarginMm={effectiveFooterMargin}
                onHeaderMarginChange={setCustomHeaderMargin}
                onFooterMarginChange={setCustomFooterMargin}
                simulateBlankStationery={simulateBlankStationery}
                onToggleSimulate={setSimulateBlankStationery}
                onSaveAsDefault={handleSaveAsDefault}
                isSavingDefault={updateProfileMutation.isPending}
                isModified={isModified}
                savedHeaderMargin={savedHeaderMargin}
                savedFooterMargin={savedFooterMargin}
                onResetToDefault={handleResetToDefault}
              />
            )}

            {/* Document Canvas Presentation */}
            <div className="w-full bg-muted/40 py-6 sm:py-8 px-2 sm:px-4 flex justify-center rounded-xl border border-border/60 overflow-x-auto print:bg-white print:p-0 print:border-none">
              <A4DocumentSheet
                report={report}
                stationeryType={activeStationery}
                headerMarginMm={effectiveHeaderMargin}
                footerMarginMm={effectiveFooterMargin}
                simulateBlankStationery={simulateBlankStationery}
              />
            </div>

            {/* WhatsApp Dispatch & Delivery Timeline */}
            <ReportDispatchTimeline reportId={report.id} defaultOpen={false} />
          </div>
        )}

        {/* Success Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 p-3 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-lg shadow-xl text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-zinc-400 hover:text-white dark:hover:text-zinc-900 text-xs"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
