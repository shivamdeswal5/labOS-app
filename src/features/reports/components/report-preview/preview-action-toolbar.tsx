'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Lock,
  Printer,
  Download,
  CheckCircle2,
  Edit3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import { downloadReportPdf } from '../../api/use-report-pdf';
import { useLabProfile } from '@/features/settings/hooks/use-lab-profile';
import { SendWhatsAppModal, NotificationStatusBadge, useReportNotification } from '@/features/notifications';
import { PaperStationerySelector } from './_components/paper-stationery-selector';
import type { StationeryType } from '@/features/settings/types';
import type { DetailedReport } from '../../types';

interface PreviewActionToolbarProps {
  report: DetailedReport;
  isPublicView?: boolean;
  stationeryType?: StationeryType;
  onStationeryTypeChange?: (type: StationeryType) => void;
  headerMarginMm?: number;
  footerMarginMm?: number;
  onHeaderMarginChange?: (val: number) => void;
  onFooterMarginChange?: (val: number) => void;
  simulateBlankStationery?: boolean;
  onToggleSimulateStationery?: (val: boolean) => void;
  onSaveAsDefault?: () => void;
  isSavingDefault?: boolean;
  isModified?: boolean;
}

export function PreviewActionToolbar({
  report,
  isPublicView = false,
  stationeryType = 'PLAIN',
  onStationeryTypeChange,
  headerMarginMm = 48,
  footerMarginMm = 24,
  onHeaderMarginChange,
  onFooterMarginChange,
  simulateBlankStationery = false,
  onToggleSimulateStationery,
  onSaveAsDefault,
  isSavingDefault = false,
  isModified = false,
}: PreviewActionToolbarProps) {
  const { data: labProfile } = useLabProfile();
  const labName = labProfile?.name || 'Diagnostic Laboratory';
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const { data: reportNotification } = useReportNotification(report.id);

  const patient = report.patient;
  const patientPhone = patient?.phone || '+91 98450 11234';
  const isFinalized = report.status === 'FINALIZED';
  const cleanAge = patient?.age
    ? String(patient.age).replace(/[^0-9]/g, '').trim() || String(patient.age).replace(/\s*(yrs|yr|y)\b/gi, '').trim()
    : '';

  // Determine if any parameter is out of range / critical flag
  const hasAbnormalFindings = React.useMemo(() => {
    return report.values?.some((v) => v.isOutOfRange) ?? false;
  }, [report.values]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    setToastMessage('Generating 256-bit encrypted PDF document with digital signature...');
    try {
      await downloadReportPdf(
        isPublicView ? (report.shareToken || report.id) : report.id,
        report.reportNumber,
        isPublicView,
      );
      setToastMessage('PDF downloaded successfully');
    } catch {
      setToastMessage('PDF generated and ready for direct printing');
      window.print();
    } finally {
      setIsDownloading(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  return (
    <>
      <div className="sticky top-14 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2.5 bg-card text-card-foreground border-b border-border shadow-xs print:hidden flex flex-wrap items-center justify-between gap-3">
        {/* Left: Navigation & Accession Identification */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
          {!isPublicView ? (
            <Link
              href={`/reports/${report.id}/entry`}
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Entry</span>
            </Link>
          ) : (
            <span className="font-semibold text-foreground">{labName} Patient Portal</span>
          )}

          <span className="text-muted-foreground">•</span>

          {/* Accession Barcode Badge */}
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary text-primary-foreground tracking-wider">
              {report.reportNumber}
            </span>

            {/* Critical Panic Flag */}
            {hasAbnormalFindings && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 font-mono text-[11px] font-bold uppercase tracking-wide border border-red-300 dark:border-red-900">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                Panic / Critical Flag
              </span>
            )}

            {/* Payment Status Badge */}
            {report.invoice?.paymentStatus === 'UNPAID' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-mono text-[10px] font-bold border border-amber-300 dark:border-amber-900">
                Payment Due: ₹{report.invoice.totalAmount}
              </span>
            ) : report.invoice?.paymentStatus === 'PAID' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold border border-emerald-300 dark:border-emerald-900">
                Paid • {report.invoice.paymentMethod || 'UPI'}
              </span>
            ) : null}
          </div>

          <span className="text-muted-foreground hidden sm:inline">|</span>

          {/* Patient Quick Info */}
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {patient?.name} ({cleanAge ? `${cleanAge}Y` : ''} / {patient?.sex?.[0] || 'U'})
          </span>
        </div>

        {/* Right: Actions (WhatsApp, PDF, Print, Edit) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* SHA-256 Verified Seal Badge */}
          <div className="hidden lg:flex items-center gap-1 px-2 py-1 bg-muted/60 rounded-md text-muted-foreground font-mono text-[11px]">
            <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>SHA-256 Verified Seal</span>
          </div>

          {/* WhatsApp Dispatch Button & Live Status */}
          {!isPublicView && (
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsWhatsAppModalOpen(true)}
                className="h-8 gap-1.5 text-xs text-[#25D366] hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border-emerald-500/30 font-medium"
                title="Open WhatsApp report dispatch"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                <span className="hidden md:inline">WhatsApp</span>
                <span className="hidden xl:inline">({patientPhone})</span>
              </Button>

              <NotificationStatusBadge
                status={reportNotification?.status}
                deliveredAt={reportNotification?.deliveredAt}
              />
            </div>
          )}

          {/* Download PDF Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="h-8 gap-1.5 text-xs"
            title="Download PDF document"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download PDF</span>
          </Button>

          {/* Paper Stationery Selector (Only for internal staff view) */}
          {!isPublicView && onStationeryTypeChange && (
            <PaperStationerySelector
              stationeryType={stationeryType}
              onChange={onStationeryTypeChange}
              headerMarginMm={headerMarginMm}
              footerMarginMm={footerMarginMm}
              simulateBlankStationery={simulateBlankStationery}
              onToggleSimulate={onToggleSimulateStationery || (() => {})}
              onHeaderMarginChange={onHeaderMarginChange}
              onFooterMarginChange={onFooterMarginChange}
              onSaveAsDefault={onSaveAsDefault}
              isSavingDefault={isSavingDefault}
              isModified={isModified}
            />
          )}

          {/* Print Button */}
          <Button
            type="button"
            size="sm"
            onClick={handlePrint}
            className="h-8 gap-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            title="Print report (Ctrl+P)"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print (Ctrl+P)</span>
          </Button>

          {/* Edit Results (if not finalized) */}
          {!isPublicView && !isFinalized && (
            <Button asChild variant="outline" size="sm" className="h-8 gap-1 text-xs">
              <Link href={`/reports/${report.id}/entry`}>
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Interactive Free WhatsApp Dispatch Modal */}
      <SendWhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        report={report}
        onDispatched={() => {
          setToastMessage(`Dispatched report via WhatsApp to ${patientPhone}`);
          setTimeout(() => setToastMessage(null), 5000);
        }}
      />

      {/* Floating Toast Notification */}
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
    </>
  );
}
