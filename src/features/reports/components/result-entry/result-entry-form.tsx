'use client';

import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import {
  Save,
  CheckCheck,
  FileCheck2,
  Keyboard,
  Lock,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { evaluateNormalRange } from '../../utils/range-checker';
import { useRBAC } from '@/features/auth/hooks/use-rbac';
import { useGenerateAiImpression } from '../../api/use-ai-assistant';
import type { DetailedReport } from '../../types';

interface ResultEntryFormProps {
  report: DetailedReport;
  values: Record<string, string>;
  remarks: string;
  onValueChange: (parameterId: string, value: string) => void;
  onRemarksChange: (remarks: string) => void;
  onSaveDraft: () => Promise<void>;
  onFinalize: () => void;
  isSaving: boolean;
  isFinalizing: boolean;
}

export function ResultEntryForm({
  report,
  values,
  remarks,
  onValueChange,
  onRemarksChange,
  onSaveDraft,
  onFinalize,
  isSaving,
  isFinalizing,
}: ResultEntryFormProps) {
  const isFinalized = report.status === 'FINALIZED';
  const patientSex = report.patient?.sex;

  // Input refs array for high-speed arrow / Enter navigation
  const inputRefs = useRef<(HTMLInputElement | HTMLSelectElement | null)[]>([]);

  // Count total and entered parameters for clinical validation and progress feedback
  const totalParameters = useMemo(() => {
    return (
      report.reportPanels?.reduce((sum, rp) => {
        return (
          sum +
          (rp.panel?.sections?.reduce((sSum, sec) => sSum + (sec.parameters?.length || 0), 0) || 0)
        );
      }, 0) || 0
    );
  }, [report.reportPanels]);

  const enteredCount = useMemo(() => {
    return Object.values(values).filter((v) => typeof v === 'string' && v.trim().length > 0).length;
  }, [values]);

  const hasAnyResults = enteredCount > 0 || Boolean(report.values && report.values.length > 0);

  const { can } = useRBAC();
  const canFinalize = can('REPORTS:FINALIZE');

  const aiImpressionMutation = useGenerateAiImpression(report.id);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAiSuggestRemarks = async () => {
    try {
      setAiError(null);
      const draftValues: Array<{ parameterId: string; value: string; isOutOfRange?: boolean }> = [];
      for (const rp of report.reportPanels || []) {
        for (const sec of rp.panel?.sections || []) {
          for (const param of sec.parameters || []) {
            const val = values[param.id];
            if (val && val.trim().length > 0) {
              const evalResult = evaluateNormalRange(param.normalRange, val, patientSex);
              draftValues.push({
                parameterId: param.id,
                value: val.trim(),
                isOutOfRange: evalResult.isOutOfRange,
              });
            }
          }
        }
      }

      const response = await aiImpressionMutation.mutateAsync({ draftValues });
      if (response?.impression) {
        onRemarksChange(response.impression);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate impression';
      setAiError(msg);
    }
  };

  // Global document-level keyboard shortcuts with capture: true
  // Prevents browser native shortcuts like "Save Page As..." (Ctrl+S) from downloading HTML
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Global Save shortcut: Ctrl+S / Cmd+S
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        e.stopPropagation();
        if (!isFinalized && !isSaving && enteredCount > 0) {
          void onSaveDraft();
        }
      }

      // Global Finalize shortcut: Ctrl+Enter / Cmd+Enter
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        if (!isFinalized && !isFinalizing && hasAnyResults && canFinalize) {
          onFinalize();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, { capture: true });
  }, [isFinalized, isSaving, isFinalizing, enteredCount, hasAnyResults, canFinalize, onSaveDraft, onFinalize]);

  // Enter key advances to next parameter field
  const handleInputKeyDown = (e: ReactKeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
        if ('select' in nextInput) {
          nextInput.select();
        }
      }
    }
  };

  // Keep track of parameter index
  let globalParamIndex = 0;

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Console Header */}
      <div className="p-3.5 bg-muted/40 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-sm text-foreground">Clinical Test Results Entry</h2>
          <span className="text-[11px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            Manual Input Mode
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <Keyboard className="w-3.5 h-3.5 hidden sm:inline" />
          <span className="hidden sm:inline">Enter/Tab: Next Field</span>
        </div>
      </div>

      {/* Parameter Entry Body */}
      <div className="p-4 space-y-6 overflow-y-auto flex-1">
        {report.reportPanels?.map((rp, pIdx) => (
          <div key={rp.panelId || rp.panel?.id || `panel-${pIdx}`} className="space-y-4">
            {/* Panel Title */}
            <div className="flex items-center justify-between pb-1.5 border-b border-border/80">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {rp.panel?.name}
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                {rp.panel?.category}
              </span>
            </div>

            {/* Sections */}
            {rp.panel?.sections?.map((section) => (
              <div key={section.id} className="space-y-2">
                <div className="flex items-center justify-between px-2.5 py-1 bg-muted/60 rounded-md">
                  <span className="text-xs font-semibold uppercase tracking-wide text-foreground">
                    {section.name}
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    Section {section.sortOrder}
                  </span>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 px-2.5 py-1 text-[11px] font-mono uppercase text-muted-foreground">
                  <div className="col-span-5 sm:col-span-4">Parameter</div>
                  <div className="col-span-4 sm:col-span-4">Value</div>
                  <div className="col-span-1 sm:col-span-2 text-center">Unit</div>
                  <div className="col-span-2 text-right">Reference Range</div>
                </div>

                {/* Parameter Rows */}
                <div className="space-y-1">
                  {section.parameters?.map((param) => {
                    const currentIndex = globalParamIndex++;
                    const currentValue = values[param.id] ?? '';
                    const evaluation = evaluateNormalRange(param.normalRange, currentValue, patientSex);
                    const isAbnormal = evaluation.isOutOfRange;
                    const isPanic = evaluation.status === 'PANIC';

                    return (
                      <div
                        key={param.id}
                        className={`grid grid-cols-12 gap-2 items-center px-2.5 py-1.5 rounded-lg border transition-colors ${
                          isPanic
                            ? 'bg-red-100/70 dark:bg-red-950/40 border-red-400 dark:border-red-800'
                            : isAbnormal
                              ? 'bg-red-50/70 dark:bg-red-950/20 border-red-200 dark:border-red-900/40'
                              : 'bg-card hover:bg-muted/30 border-transparent'
                        }`}
                      >
                        {/* Parameter Name */}
                        <div className="col-span-5 sm:col-span-4 min-w-0 pr-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-xs truncate ${
                                isAbnormal
                                  ? 'font-bold text-red-700 dark:text-red-400'
                                  : 'font-medium text-foreground'
                              }`}
                              title={param.name}
                            >
                              {param.name}
                            </span>
                            {isAbnormal && (
                              <span
                                className={`font-mono text-[9px] font-extrabold uppercase px-1 py-0.2 rounded shrink-0 ${
                                  isPanic
                                    ? 'bg-red-600 text-white animate-pulse'
                                    : 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}
                              >
                                {evaluation.badgeLabel}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Result Value Input */}
                        <div className="col-span-4 sm:col-span-4">
                          {param.inputType === 'DROPDOWN' && param.options && param.options.length > 0 ? (
                            <select
                              ref={(el) => {
                                inputRefs.current[currentIndex] = el;
                              }}
                              value={currentValue}
                              disabled={isFinalized}
                              onChange={(e) => onValueChange(param.id, e.target.value)}
                              onKeyDown={(e) => handleInputKeyDown(e, currentIndex)}
                              className={`w-full h-8 px-2 text-xs rounded border transition-colors focus:outline-none focus:ring-1 ${
                                isAbnormal
                                  ? 'border-red-400 text-red-700 dark:text-red-400 font-bold focus:ring-red-500 bg-background'
                                  : 'border-border text-foreground font-medium focus:border-primary focus:ring-primary bg-background'
                              } disabled:opacity-60 disabled:cursor-not-allowed`}
                            >
                              <option value="">Select...</option>
                              {param.options.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              ref={(el) => {
                                inputRefs.current[currentIndex] = el;
                              }}
                              type="text"
                              value={currentValue}
                              disabled={isFinalized}
                              placeholder="-"
                              onChange={(e) => onValueChange(param.id, e.target.value)}
                              onKeyDown={(e) => handleInputKeyDown(e, currentIndex)}
                              className={`w-full h-8 px-2.5 text-xs font-mono rounded border transition-colors focus:outline-none focus:ring-1 ${
                                isAbnormal
                                  ? 'border-red-500/80 text-red-700 dark:text-red-400 font-bold focus:ring-red-500 bg-background shadow-inner'
                                  : 'border-input text-foreground font-medium focus:border-primary focus:ring-primary bg-background'
                              } disabled:opacity-60 disabled:cursor-not-allowed`}
                            />
                          )}
                        </div>

                        {/* Unit */}
                        <div className="col-span-1 sm:col-span-2 text-center text-xs font-mono text-muted-foreground truncate">
                          {param.unit || '-'}
                        </div>

                        {/* Reference Range */}
                        <div className="col-span-2 text-right text-xs font-mono text-muted-foreground truncate">
                          {evaluation.formattedRange}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Doctor / Lab Clinical Remarks */}
        <div className="p-3 bg-muted/40 rounded-lg border border-border space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="clinicalRemarks" className="text-xs font-semibold uppercase tracking-wide text-foreground">
              Doctor / Pathologist Remarks
            </label>
            {!isFinalized && (
              <button
                type="button"
                onClick={handleAiSuggestRemarks}
                disabled={aiImpressionMutation.isPending || enteredCount === 0}
                title={enteredCount === 0 ? 'Enter test values first to generate clinical impression' : 'Generate ISO 15189 compliant clinical impression with AI'}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-200 dark:border-purple-800 rounded-md transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {aiImpressionMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 text-purple-600 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                )}
                <span>{aiImpressionMutation.isPending ? 'Analyzing Indices...' : '✨ AI Suggest Impression'}</span>
              </button>
            )}
          </div>

          <textarea
            id="clinicalRemarks"
            value={remarks}
            disabled={isFinalized}
            onChange={(e) => onRemarksChange(e.target.value)}
            rows={2}
            placeholder="Enter clinical interpretation, microscopy notes, or correlation remarks..."
            className="w-full text-xs p-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none disabled:opacity-60"
          />

          {aiError && (
            <div className="text-[11px] text-amber-600 dark:text-amber-400">
              Note: {aiError}. Standard clinical remarks will apply.
            </div>
          )}
        </div>
      </div>

      {/* Action Dock: Save as Draft & Finalize Report */}
      <div className="p-3.5 bg-card border-t border-border flex flex-wrap items-center justify-between gap-3 mt-auto">
        <div className="flex items-center gap-2">
          {!isFinalized && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSaveDraft}
              disabled={isSaving || isFinalizing || enteredCount === 0}
              title={enteredCount === 0 ? 'Enter at least one parameter result to save draft' : undefined}
              className="h-9 gap-1.5 text-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving Draft...' : 'Save Draft (Ctrl+S)'}</span>
            </Button>
          )}

          {isFinalized && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-mono">
              <CheckCheck className="w-4 h-4" />
              <span>Report Signed Off & Finalized</span>
            </div>
          )}
        </div>

        {/* Center Progress Counter */}
        <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
          <span>Results:</span>
          <span
            className={`font-semibold px-1.5 py-0.5 rounded text-[11px] ${
              enteredCount > 0
                ? 'bg-primary/10 text-primary'
                : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
            }`}
          >
            {enteredCount} / {totalParameters}
          </span>
          {enteredCount === 0 && !isFinalized && (
            <span className="hidden sm:inline text-[11px] text-amber-600 dark:text-amber-400">
              (Results required to sign off)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isFinalized && canFinalize && (
            <Button
              type="button"
              size="sm"
              onClick={onFinalize}
              disabled={isSaving || isFinalizing || !hasAnyResults}
              title={
                !hasAnyResults
                  ? 'Enter at least one test result before finalizing'
                  : undefined
              }
              className={`h-9 gap-1.5 text-xs font-semibold px-4 shadow-sm transition-all ${
                !hasAnyResults
                  ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>{isFinalizing ? 'Finalizing...' : 'Finalize & Sign (Ctrl+Enter)'}</span>
            </Button>
          )}

          {!isFinalized && !canFinalize && (
            <div
              title="Pathologist sign-off required under NABL ISO 15189. Technicians can enter results and save drafts."
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-muted text-muted-foreground border border-border text-xs font-mono select-none"
            >
              <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Pathologist Sign-off Required</span>
            </div>
          )}

          {isFinalized && (
            <a
              href={`/reports/${report.id}/preview`}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium rounded-md border border-input bg-background hover:bg-muted text-foreground transition-colors"
            >
              <span>View Print Sheet</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
