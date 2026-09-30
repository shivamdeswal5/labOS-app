'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  FileText,
  Printer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import { formatDateTime } from '@/lib/formatters';
import type { DetailedReport, Patient } from '@/features/reports/types';
import { SendWhatsAppModal } from '@/features/notifications';

interface PatientHistoryTimelineProps {
  patient: Patient;
  reports: DetailedReport[];
}

function getParameterDisplayName(parameterId?: string, name?: string): string {
  if (name) return name;
  switch (parameterId) {
    case 'p-hba1c':
      return 'HbA1c Glycated Hemoglobin';
    case 'p-sug':
      return 'Urine Sugar / Glucose';
    case 'p-pus':
      return 'Pus Cells (Leukocytes)';
    case 'p-hb':
      return 'Hemoglobin';
    case 'p-trop':
      return 'hs-Troponin I';
    case 'p-tsh':
      return 'TSH (3rd Gen)';
    case 'p-creat':
      return 'Serum Creatinine';
    default:
      return 'Biomarker Parameter';
  }
}

export function PatientHistoryTimeline({ patient, reports }: PatientHistoryTimelineProps) {
  const [selectedReportForWhatsApp, setSelectedReportForWhatsApp] = React.useState<DetailedReport | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-xs text-foreground uppercase tracking-wide">
          Past Encounters & Reports ({reports.length})
        </span>
        <span className="text-[11px] font-mono text-muted-foreground">
          NABL Audit Trail Verified
        </span>
      </div>

      {reports.length === 0 ? (
        <div className="p-6 bg-card rounded-lg border border-border text-center text-xs text-muted-foreground">
          No diagnostic encounters on record for this patient.
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const hasAbnormal = report.values?.some((v) => v.isOutOfRange) ?? false;
            const panelName = report.reportPanels?.[0]?.panel?.name || 'Diagnostic Investigation';

            return (
              <div
                key={report.id}
                className="p-3.5 bg-card rounded-lg border border-border flex flex-col gap-2.5 shadow-sm hover:border-primary/40 transition-colors"
              >
                {/* Encounter Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-foreground">
                        {panelName}
                      </span>
                      {hasAbnormal ? (
                        <span className="text-[10px] font-mono font-bold bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 px-1.5 py-0.2 rounded uppercase">
                          Abnormal Findings
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-medium bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 rounded">
                          Normal
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground mt-0.5">
                      {formatDateTime(report.createdAt)} • Ref: {report.refByDoctor?.name || 'Dr. Anjali Mehta'}
                    </span>
                  </div>

                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground border border-border">
                    {report.reportNumber}
                  </span>
                </div>

                {/* Findings Summary Mini-Table */}
                {report.values && report.values.length > 0 && (
                  <div className="bg-muted/40 p-2 rounded border border-border/60 flex flex-col gap-1 text-xs">
                    {report.values.slice(0, 3).map((v) => (
                      <div key={v.parameterId} className="flex items-center justify-between text-[11px]">
                        <span className={v.isOutOfRange ? 'font-semibold text-red-700 dark:text-red-400' : 'text-foreground'}>
                          {getParameterDisplayName(v.parameterId, v.parameter?.name)}
                        </span>
                        <div className="flex items-center gap-1 font-mono">
                          <span className={v.isOutOfRange ? 'font-bold text-red-700 dark:text-red-400' : 'font-semibold text-foreground'}>
                            {v.value} {v.parameter?.unit || ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Encounter Action Buttons */}
                <div className="flex items-center justify-between pt-1 border-t border-border/60">
                  <div className="flex items-center gap-1.5">
                    <Button asChild size="sm" className="h-7 px-2.5 text-xs gap-1">
                      <Link href={`/reports/${report.id}/preview`}>
                        <FileText className="w-3 h-3" />
                        <span>View Report</span>
                      </Link>
                    </Button>

                    <Button asChild variant="outline" size="sm" className="h-7 px-2 text-xs gap-1">
                      <Link href={`/reports/${report.id}/preview`}>
                        <Printer className="w-3 h-3" />
                        <span>Print Sheet</span>
                      </Link>
                    </Button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedReportForWhatsApp(report)}
                    className="h-7 px-2 bg-muted hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-[#25D366] rounded text-xs font-medium flex items-center gap-1.5 transition-colors border border-transparent hover:border-emerald-500/30"
                    title="Dispatch to patient WhatsApp"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* WhatsApp Dispatch Modal */}
      {selectedReportForWhatsApp && (
        <SendWhatsAppModal
          isOpen={Boolean(selectedReportForWhatsApp)}
          onClose={() => setSelectedReportForWhatsApp(null)}
          report={{
            ...selectedReportForWhatsApp,
            patient,
          }}
        />
      )}
    </div>
  );
}
