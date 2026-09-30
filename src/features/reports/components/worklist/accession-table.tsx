'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  FileEdit,
  Eye,
  Download,
  CheckCircle2,
  FlaskConical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import { formatDateTime, formatRelativeTime } from '@/lib/formatters';
import { EmptyState, EllipsisCell, TablePagination } from '@/components/shared';
import { downloadReportPdf } from '../../api/use-report-pdf';
import { useLabProfile } from '@/features/settings/hooks/use-lab-profile';
import type { DetailedReport } from '../../types';

interface AccessionTableProps {
  reports: DetailedReport[];
  onOpenWhatsApp?: (report: DetailedReport) => void;
}

export function AccessionTable({ reports, onOpenWhatsApp }: AccessionTableProps) {
  const { data: labProfile } = useLabProfile();
  const labName = labProfile?.name || 'Diagnostic Laboratory';
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);

  const handleDownloadPdf = async (report: DetailedReport) => {
    setDownloadingId(report.id);
    try {
      await downloadReportPdf(report.id, report.reportNumber);
    } catch {
      window.open(`/reports/${report.id}/preview`, '_blank');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleWhatsAppDispatch = (report: DetailedReport) => {
    if (onOpenWhatsApp) {
      onOpenWhatsApp(report);
      return;
    }

    const phone = report.patient?.phone || '+91 98450 11234';
    const shareUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/v/${report.shareToken || 'demo-share-token-1048'}`
      : `https://labos.in/v/${report.shareToken || 'demo-share-token-1048'}`;

    const text = encodeURIComponent(
      `Dear ${report.patient?.name || 'Patient'}, your verified diagnostic report (#${report.reportNumber}) from ${labName} is ready. Access your digital report here: ${shareUrl}`,
    );

    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  if (reports.length === 0) {
    return (
      <EmptyState
        icon={FlaskConical}
        title="No Accession Records Found"
        description="No diagnostic accessions matched your filter criteria. Try adjusting your search query or status filter."
      />
    );
  }

  return (
    <div className="w-full bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/60 text-muted-foreground font-mono text-[11px] uppercase tracking-wider border-b border-border">
              <th className="py-3 px-4">Accession Barcode</th>
              <th className="py-3 px-4">Patient Demographics</th>
              <th className="py-3 px-4">Diagnostic Panels</th>
              <th className="py-3 px-4">Referring Clinician</th>
              <th className="py-3 px-4">Accession Time</th>
              <th className="py-3 px-4">Telemetry Flag</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs">
            {reports.map((report) => {
              const patient = report.patient;
              const isFinalized = report.status === 'FINALIZED';
              const hasAbnormalFindings = report.values?.some((v) => v.isOutOfRange) ?? false;
              const panelTitles = report.reportPanels?.map((rp) => rp.panel?.name).filter(Boolean).join(', ') || 'Diagnostic Battery';
              const specimenType = report.reportPanels?.[0]?.panel?.specimenType || 'Venous Blood / EDTA';

              return (
                <tr
                  key={report.id}
                  className={`hover:bg-muted/30 transition-colors group ${
                    hasAbnormalFindings ? 'border-l-4 border-l-destructive bg-destructive/[0.03]' : ''
                  }`}
                >
                  {/* Accession Barcode & Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-xs font-bold text-foreground bg-muted px-2 py-0.5 rounded border border-border w-fit">
                        {report.reportNumber}
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                        {isFinalized ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            FINALIZED
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            DRAFT IN ENTRY
                          </span>
                        )}

                        {report.invoice?.paymentStatus === 'PAID' ? (
                          <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-500/20">
                            PAID • {report.invoice.paymentMethod || 'UPI'}
                          </span>
                        ) : report.invoice ? (
                          <span className="text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-500/20">
                            ₹{report.invoice.totalAmount} UNPAID
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </td>

                  {/* Patient Demographics & MRN */}
                  <td className="py-3 px-4 min-w-[180px]">
                    <div className="flex flex-col">
                      <EllipsisCell
                        value={patient?.name || 'Walk-in Patient'}
                        className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors"
                      />
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground mt-0.5">
                        <span>{patient?.age ? `${patient.age}y` : ''} / {patient?.sex?.[0] || 'U'}</span>
                        <span>•</span>
                        <span>{patient?.patientNumber || 'PT-9842'}</span>
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {patient?.phone || 'No phone recorded'}
                      </span>
                    </div>
                  </td>

                  {/* Diagnostic Panels & Specimen Tube */}
                  <td className="py-3 px-4 min-w-[200px]">
                    <div className="flex flex-col">
                      <EllipsisCell
                        value={panelTitles}
                        className="font-medium text-foreground max-w-xs"
                      />
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                        <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">
                          {report.reportPanels?.[0]?.panel?.category || 'Clinical Pathology'}
                        </span>
                        <span className="truncate">{specimenType}</span>
                      </div>
                    </div>
                  </td>

                  {/* Referring Clinician */}
                  <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">
                    <div className="flex flex-col">
                      <EllipsisCell
                        value={report.refByDoctor?.name || 'Direct Walk-in'}
                        className="font-medium text-foreground"
                      />
                      <span className="text-[11px] text-muted-foreground">
                        {report.refByDoctor?.clinic || 'Self / Patient'}
                      </span>
                    </div>
                  </td>

                  {/* Accession Timestamp */}
                  <td className="py-3 px-4 whitespace-nowrap text-muted-foreground font-mono text-[11px]">
                    <div>{formatDateTime(report.createdAt)}</div>
                    <div className="text-[10px] text-muted-foreground/80">{formatRelativeTime(report.createdAt)}</div>
                  </td>

                  {/* Telemetry Critical Flag */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {hasAbnormalFindings ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 font-mono text-[10px] font-bold uppercase border border-red-200 dark:border-red-900">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                        Critical Flag
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Normal</span>
                      </span>
                    )}
                  </td>

                  {/* Inline Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {!isFinalized ? (
                        <Button asChild size="sm" className="h-8 gap-1 text-xs font-semibold">
                          <Link href={`/reports/${report.id}/entry`}>
                            <FileEdit className="w-3.5 h-3.5" />
                            <span>Enter Results</span>
                          </Link>
                        </Button>
                      ) : (
                        <Button asChild size="sm" variant="outline" className="h-8 gap-1 text-xs font-medium">
                          <Link href={`/reports/${report.id}/preview`}>
                            <Eye className="w-3.5 h-3.5" />
                            <span>View / Print</span>
                          </Link>
                        </Button>
                      )}

                      {/* WhatsApp Trigger */}
                      <button
                        type="button"
                        onClick={() => handleWhatsAppDispatch(report)}
                        className="p-1.5 text-muted-foreground hover:text-[#25D366] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded transition-colors"
                        title="Dispatch via WhatsApp (Free Web/App)"
                      >
                        <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                      </button>

                      {/* PDF Download Trigger */}
                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(report)}
                        disabled={downloadingId === report.id}
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors disabled:opacity-50"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* URL-Synchronized Table Pagination */}
      <TablePagination totalCount={reports.length} />
    </div>
  );
}
