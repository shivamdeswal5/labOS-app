'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Loader2,
  RefreshCw,
  FlaskConical,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { PatientContextBar } from '@/features/reports/components/result-entry/patient-context-bar';
import { ResultEntryForm } from '@/features/reports/components/result-entry/result-entry-form';
import { ReportLetterheadPreview } from '@/features/reports/components/result-entry/report-letterhead-preview';
import { useReport } from '@/features/reports/api/use-report';
import { useEnterResults } from '@/features/reports/api/use-enter-results';
import { useFinalizeReport } from '@/features/reports/api/use-finalize-report';
import { ApiError } from '@/lib/api-client';
import { useRBAC } from '@/features/auth/hooks/use-rbac';
import type { DetailedReport } from '@/features/reports/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Inner Workspace Component initialized directly with loaded report data.
 * Avoids setting state in useEffect and provides instant render isolation.
 *
 * KEY INVARIANT: The `report` prop reflects the last fetched state from the server.
 * Form `values` state holds any unsaved in-progress entries typed by the pathologist.
 * The `getValidPayloadValues()` helper sanitizes these before any API call.
 */
function ResultEntryWorkspace({ report }: { report: DetailedReport }) {
  const router = useRouter();
  const enterResultsMutation = useEnterResults(report.id);
  const finalizeReportMutation = useFinalizeReport(report.id);

  // Initialize values directly from loaded report data (pre-populate previously saved values)
  const [values, setValues] = React.useState<Record<string, string>>(() => {
    const initialMap: Record<string, string> = {};
    report.values?.forEach((v) => {
      initialMap[v.parameterId] = v.value;
    });
    return initialMap;
  });

  const [remarks, setRemarks] = React.useState<string>(report.remarks || '');
  const [activeTab, setActiveTab] = React.useState<'form' | 'preview'>('form');
  const [toastMessage, setToastMessage] = React.useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);
  const [showFinalizeDialog, setShowFinalizeDialog] = React.useState(false);

  const showToast = (text: string, type: 'success' | 'error', durationMs = 4000) => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), durationMs);
  };

  const handleValueChange = (parameterId: string, value: string) => {
    setValues((prev) => ({ ...prev, [parameterId]: value }));
  };

  const handleRemarksChange = (newRemarks: string) => {
    setRemarks(newRemarks);
  };

  /**
   * Sanitizes form entries: removes blank/whitespace-only values.
   * This prevents sending empty strings to the backend which would fail
   * class-validator @IsNotEmpty() validation on ResultValueDto.value.
   */
  const getValidPayloadValues = React.useCallback(() => {
    return Object.entries(values)
      .filter(([, val]) => typeof val === 'string' && val.trim().length > 0)
      .map(([parameterId, val]) => ({
        parameterId,
        value: val.trim(),
      }));
  }, [values]);

  const handleSaveDraft = async () => {
    const payloadValues = getValidPayloadValues();
    if (payloadValues.length === 0) {
      showToast(
        'No results entered. Please enter at least one test parameter value before saving draft.',
        'error',
      );
      return;
    }

    try {
      await enterResultsMutation.mutateAsync({
        values: payloadValues,
        remarks: remarks.trim() || null,
      });
      showToast('Draft results saved successfully', 'success', 3000);
    } catch (err) {
      console.error('Failed to save draft results:', err);
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Failed to save results. Please check connection and try again.';
      showToast(msg, 'error', 5000);
    }
  };

  const { can } = useRBAC();

  /**
   * Step 1: Show the confirmation dialog.
   * Validates that the form has at least one result entered before opening the dialog.
   */
  const handleFinalizeRequest = () => {
    if (!can('REPORTS:FINALIZE')) {
      showToast(
        'Medical sign-off requires Pathologist or Lab Director credentials under NABL ISO 15189.',
        'error',
        5000,
      );
      return;
    }

    const payloadValues = getValidPayloadValues();
    // hasAnyResults: either the current form has entries OR the report already
    // has previously-saved values in the DB (from report.values snapshot).
    // We deliberately re-check payloadValues here (not stale report.values alone)
    // because that stale snapshot was the root cause of the previous bug.
    const hasNewEntries = payloadValues.length > 0;
    const hasPreviouslySavedResults = Boolean(report.values && report.values.length > 0);

    if (!hasNewEntries && !hasPreviouslySavedResults) {
      showToast(
        'Cannot finalize: no test results entered. Please fill in at least one parameter value before signing off.',
        'error',
        5000,
      );
      return;
    }

    setShowFinalizeDialog(true);
  };

  /**
   * Step 2: Confirmed by pathologist via modal — execute the finalization sequence.
   * The sequence is always:
   *   1. Save unsaved form entries (if any)
   *   2. Finalize the report
   *   3. Redirect to print preview
   *
   * This order guarantees the backend validation (`report.values.length > 0`) is
   * always satisfied before finalize is called — no race between empty form and
   * stale backend state.
   */
  const handleFinalizeConfirm = async () => {
    setShowFinalizeDialog(false);

    const payloadValues = getValidPayloadValues();

    try {
      // Always save current form entries first if any valid values are present.
      // Even if the report had prior saved values, we want the latest inputs persisted.
      if (payloadValues.length > 0) {
        await enterResultsMutation.mutateAsync({
          values: payloadValues,
          remarks: remarks.trim() || null,
        });
      }

      await finalizeReportMutation.mutateAsync();

      showToast(
        'Report finalized and signed off successfully! Redirecting to print preview...',
        'success',
        3000,
      );
      setTimeout(() => {
        router.push(`/reports/${report.id}/preview`);
      }, 1200);
    } catch (err) {
      console.error('Failed to finalize report:', err);
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Failed to finalize report. Please ensure all required parameters are entered.';
      showToast(msg, 'error', 6000);
    }
  };

  const isMutating = enterResultsMutation.isPending || finalizeReportMutation.isPending;

  return (
    <div className="space-y-4">
      {/* ── Finalization Confirmation Dialog ── */}
      <Modal
        isOpen={showFinalizeDialog}
        onClose={() => setShowFinalizeDialog(false)}
        size="sm"
        showCloseButton={false}
      >
        <div className="flex flex-col items-center gap-4 text-center py-2">
          <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7 text-amber-600 dark:text-amber-400" />
          </div>

          <div>
            <h3 className="text-base font-bold text-foreground mb-1">
              Finalize & Sign Off Report?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
              Once signed off, this report&apos;s results <strong>cannot be modified</strong> without
              a formal medical amendment. Please verify all parameters before proceeding.
            </p>
          </div>

          <div className="w-full px-2 py-3 bg-muted/60 rounded-lg border border-border text-left space-y-1">
            <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide">
              Patient
            </p>
            <p className="text-xs font-semibold text-foreground">
              {report.patient?.name || '—'}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              {report.reportNumber}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 h-9 text-xs"
              onClick={() => setShowFinalizeDialog(false)}
              disabled={isMutating}
            >
              Cancel — Review Results
            </Button>
            <Button
              type="button"
              size="sm"
              className="flex-1 h-9 text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleFinalizeConfirm}
              disabled={isMutating}
            >
              {isMutating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Signing...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Confirm & Sign Off</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Feedback Toast Banner ── */}
      {toastMessage && (
        <div
          className={`p-3 rounded-lg border text-xs font-medium flex items-center justify-between transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs opacity-70 hover:opacity-100 ml-2 shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Top Patient Context Bar ── */}
      <PatientContextBar report={report} />

      {/* ── Mobile / Tablet Segmented View Switch (<1024px) ── */}
      <div className="flex lg:hidden items-center justify-center p-1 bg-muted rounded-lg border border-border">
        <button
          type="button"
          onClick={() => setActiveTab('form')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'form'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Data Entry Form</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'preview'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Live A4 Preview</span>
        </button>
      </div>

      {/* ── Desktop Two-Column Layout / Mobile Tabbed ── */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Data Entry Form */}
        <div
          className={`col-span-12 lg:col-span-7 flex flex-col lg:overflow-y-auto lg:max-h-[calc(100vh-14rem)] pr-1 ${
            activeTab === 'preview' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <ResultEntryForm
            report={report}
            values={values}
            remarks={remarks}
            onValueChange={handleValueChange}
            onRemarksChange={handleRemarksChange}
            onSaveDraft={handleSaveDraft}
            onFinalize={handleFinalizeRequest}
            isSaving={enterResultsMutation.isPending}
            isFinalizing={finalizeReportMutation.isPending}
          />
        </div>

        {/* Right Column: Live A4 Print Preview */}
        <div
          className={`col-span-12 lg:col-span-5 flex flex-col lg:overflow-y-auto lg:max-h-[calc(100vh-14rem)] pl-1 ${
            activeTab === 'form' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <ReportLetterheadPreview
            report={report}
            values={values}
            remarks={remarks}
          />
        </div>
      </div>
    </div>
  );
}

export default function ReportResultEntryPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const reportId = resolvedParams.id;

  const { data: report, isLoading, isError, error, refetch } = useReport(reportId);

  return (
    <AppShell variant="full-bleed">
      <div className="flex flex-col gap-4 pb-12">
        <PageHeader
          title={`Pathologist Result Entry — ${report?.reportNumber || reportId}`}
          subtitle="Record biochemical parameters, verify reference intervals and sign off diagnostic findings"
          icon={<FlaskConical className="w-5 h-5" />}
          backHref="/accessions"
          breadcrumbs={[
            { label: 'Sample Worklist', href: '/accessions' },
            { label: `Report #${report?.reportNumber || reportId}` },
            { label: 'Result Entry' },
          ]}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-16 gap-3 bg-card rounded-xl border border-border">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground font-mono">Loading clinical accession and panels...</p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl space-y-3">
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

        {/* Loaded Console Workspace — key resets entire subtree if report ID changes */}
        {report && (
          <ResultEntryWorkspace
            key={report.id}
            report={report}
          />
        )}
      </div>
    </AppShell>
  );
}
