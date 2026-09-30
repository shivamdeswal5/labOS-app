'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  FileEdit,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import { formatDateTime, formatRelativeTime } from '@/lib/formatters';
import { useLabProfile } from '@/features/settings/hooks/use-lab-profile';
import type { DetailedReport } from '../../types';

interface AccessionMobileCardProps {
  report: DetailedReport;
  onOpenWhatsApp?: (report: DetailedReport) => void;
}

export function AccessionMobileCard({ report, onOpenWhatsApp }: AccessionMobileCardProps) {
  const { data: labProfile } = useLabProfile();
  const labName = labProfile?.name || 'Diagnostic Laboratory';
  const patient = report.patient;
  const isFinalized = report.status === 'FINALIZED';
  const hasAbnormalFindings = report.values?.some((v) => v.isOutOfRange) ?? false;
  const panelTitles = report.reportPanels?.map((rp) => rp.panel?.name).filter(Boolean).join(', ') || 'Diagnostic Battery';
  const specimenType = report.reportPanels?.[0]?.panel?.specimenType || 'Venous Blood / EDTA';

  const handleWhatsAppDispatch = () => {
    if (onOpenWhatsApp) {
      onOpenWhatsApp(report);
      return;
    }

    const phone = patient?.phone || '+91 98450 11234';
    const shareUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/v/${report.shareToken || 'demo-share-token-1048'}`
      : `https://labos.in/v/${report.shareToken || 'demo-share-token-1048'}`;

    const text = encodeURIComponent(
      `Dear ${patient?.name || 'Patient'}, your verified diagnostic report (#${report.reportNumber}) from ${labName} is ready. Access your digital report here: ${shareUrl}`,
    );

    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-3">
      {/* Top Header: Accession ID, Status & Critical Tag */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-foreground bg-muted px-2 py-0.5 rounded border border-border">
            {report.reportNumber}
          </span>
          {hasAbnormalFindings && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 font-mono text-[9px] font-bold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              Panic Flag
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          {report.invoice?.paymentStatus === 'PAID' ? (
            <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-500/20">
              PAID
            </span>
          ) : report.invoice ? (
            <span className="text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-500/20">
              ₹{report.invoice.totalAmount} DUE
            </span>
          ) : null}

          {isFinalized ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              FINALIZED
            </span>
          ) : (
            <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              DRAFT
            </span>
          )}
        </div>
      </div>

      {/* Patient Information */}
      <div className="flex flex-col">
        <span className="font-bold text-sm text-foreground">{patient?.name || 'Walk-in Patient'}</span>
        <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground mt-0.5">
          <span>{patient?.age ? `${patient.age}y` : ''} / {patient?.sex?.[0] || 'U'}</span>
          <span>•</span>
          <span>{patient?.patientNumber || 'PT-9842'}</span>
          <span>•</span>
          <span>{patient?.phone}</span>
        </div>
      </div>

      {/* Test Panels & Specimen Tube */}
      <div className="p-2 bg-muted/40 rounded-lg border border-border/60 flex flex-col gap-1 text-xs">
        <div className="font-medium text-foreground">{panelTitles}</div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{specimenType}</span>
          <span>Ref: {report.refByDoctor?.name || 'Self'}</span>
        </div>
      </div>

      {/* Timestamps */}
      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
        <span>{formatDateTime(report.createdAt)}</span>
        <span>{formatRelativeTime(report.createdAt)}</span>
      </div>

      {/* Bottom Action Buttons (44px min height touch ergonomics) */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {!isFinalized ? (
          <Button asChild className="h-11 gap-1 text-xs font-semibold col-span-1">
            <Link href={`/reports/${report.id}/entry`}>
              <FileEdit className="w-4 h-4" />
              <span>Enter Results</span>
            </Link>
          </Button>
        ) : (
          <Button asChild variant="outline" className="h-11 gap-1 text-xs font-semibold col-span-1">
            <Link href={`/reports/${report.id}/preview`}>
              <Eye className="w-4 h-4" />
              <span>View & Print</span>
            </Link>
          </Button>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={handleWhatsAppDispatch}
          className="h-11 gap-1 text-xs font-semibold text-[#25D366] hover:bg-emerald-50 dark:hover:bg-emerald-950/20 col-span-1 border-emerald-500/30"
        >
          <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
          <span>WhatsApp</span>
        </Button>
      </div>
    </div>
  );
}
