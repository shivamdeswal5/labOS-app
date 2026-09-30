'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  FileEdit,
  UserPlus,
  ClipboardList,
  ArrowRight,
  Barcode,
  Check,
  Copy,
  Receipt,
  Printer,
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatters';
import { InvoiceReceiptModal } from '@/features/billing/components/invoice-receipt-modal';
import type { Invoice } from '@/features/billing/types';

export interface SampleSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  reportNumber: string;
  patientName: string;
  patientAge?: string;
  patientSex?: string;
  patientNumber?: string;
  selectedPanelNames?: string[];
  totalPrice?: number;
  discount?: number;
  netTotal?: number;
  invoice?: Invoice | null;
  onRegisterNext: () => void;
}

export function SampleSuccessModal({
  isOpen,
  onClose,
  reportId,
  reportNumber,
  patientName,
  patientAge,
  patientSex,
  patientNumber,
  selectedPanelNames = [],
  totalPrice = 0,
  discount = 0,
  netTotal,
  invoice,
  onRegisterNext,
}: SampleSuccessModalProps) {
  const [copied, setCopied] = React.useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = React.useState(false);

  const displayInvoice: Invoice = React.useMemo(() => {
    const finalNet = netTotal ?? Math.max(0, totalPrice - discount);
    if (!invoice) {
      return {
        id: `synth-${reportId}`,
        invoiceNumber: `INV-${new Date().getFullYear()}-${reportNumber.replace(/[^0-9]/g, '').slice(-4) || '1001'}`,
        patientId: patientNumber || 'P-WALKIN',
        patientName,
        patientMrn: patientNumber || 'P-WALKIN',
        testsBilled: selectedPanelNames.join(', '),
        subtotal: totalPrice,
        discount,
        totalAmount: finalNet,
        paidAmount: finalNet,
        paymentStatus: 'PAID',
        paymentMethod: 'UPI',
        createdAt: new Date().toISOString(),
        items: selectedPanelNames.map((name) => ({
          id: name,
          description: name,
          unitPrice: totalPrice / (selectedPanelNames.length || 1),
          quantity: 1,
          total: totalPrice / (selectedPanelNames.length || 1),
        })),
      };
    }

    return {
      ...invoice,
      patientName: invoice.patientName || patientName,
      patientMrn: invoice.patientMrn || patientNumber || 'P-WALKIN',
      testsBilled: invoice.testsBilled || selectedPanelNames.join(', '),
      items:
        invoice.items && invoice.items.length > 0
          ? invoice.items
          : selectedPanelNames.map((name) => ({
              id: name,
              description: name,
              unitPrice: totalPrice / (selectedPanelNames.length || 1),
              quantity: 1,
              total: totalPrice / (selectedPanelNames.length || 1),
            })),
    };
  }, [
    invoice,
    netTotal,
    totalPrice,
    discount,
    reportId,
    reportNumber,
    patientName,
    patientNumber,
    selectedPanelNames,
  ]);

  const handleCopyBarcode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(reportNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        className="p-0 border-border/80 overflow-hidden"
      >
        {/* Header Banner with Clinical Verified Badge */}
        <div className="p-6 bg-emerald-500/10 border-b border-emerald-500/20 text-center relative overflow-hidden">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mb-3 ring-8 ring-emerald-500/5">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-foreground tracking-tight">
            Sample Registered Successfully
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Accession created and tax invoice issued. Collect fee or hand receipt to patient.
          </p>
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-4">
          {/* Accession Barcode Strip */}
          <div className="p-3.5 rounded-xl bg-muted/50 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-background border border-border text-foreground">
                <Barcode className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Accession Barcode UID
                </div>
                <div className="text-base font-mono font-extrabold text-foreground tracking-wider">
                  {reportNumber}
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyBarcode}
              className="h-8 text-xs gap-1.5 self-start sm:self-auto"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Copy UID</span>
                </>
              )}
            </Button>
          </div>

          {/* Linked Tax Invoice & Payment Receipt Strip */}
          <div className="p-3.5 rounded-xl bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-foreground">
                    {displayInvoice.invoiceNumber}
                  </span>
                  {displayInvoice.paymentStatus === 'PAID' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                      PAID • {displayInvoice.paymentMethod || 'UPI'}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300">
                      UNPAID / PAY LATER
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                  Billed Amount: {formatCurrency(displayInvoice.totalAmount)}
                  {discount > 0 ? ` (Incl. ₹${discount} discount)` : ''}
                </div>
              </div>
            </div>

            <Button
              type="button"
              size="sm"
              onClick={() => setIsReceiptModalOpen(true)}
              className="h-8 text-xs font-semibold gap-1.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 shadow-xs self-start sm:self-auto"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Tax Receipt</span>
            </Button>
          </div>

        {/* Patient & Test Information Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-card border border-border space-y-1.5">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Patient Information
            </div>
            <div className="font-bold text-sm text-foreground">{patientName}</div>
            <div className="text-muted-foreground flex items-center gap-2 text-[11px] font-mono">
              <span>{patientAge && patientSex ? `${patientAge} / ${patientSex}` : 'Walk-in'}</span>
              {patientNumber && (
                <>
                  <span>•</span>
                  <span>{patientNumber}</span>
                </>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-card border border-border space-y-1.5">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Investigations ({selectedPanelNames.length})</span>
              <span className="font-mono font-bold text-foreground">{formatCurrency(totalPrice)}</span>
            </div>
            <div className="flex flex-wrap gap-1 pt-0.5">
              {selectedPanelNames.slice(0, 3).map((name) => (
                <span
                  key={name}
                  className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium"
                >
                  {name}
                </span>
              ))}
              {selectedPanelNames.length > 3 && (
                <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-mono">
                  +{selectedPanelNames.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions Suite */}
        <div className="space-y-2 pt-2">
          {/* Primary Action: Enter Results Now */}
          <Button
            asChild
            size="lg"
            className="w-full h-11 text-xs sm:text-sm font-semibold gap-2 shadow-xs bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Link href={`/reports/${reportId}/entry`}>
              <FileEdit className="w-4 h-4" />
              <span>Enter Clinical Results Now</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Link>
          </Button>

          {/* Secondary Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onRegisterNext}
              className="h-10 text-xs font-semibold gap-2"
            >
              <UserPlus className="w-4 h-4 text-muted-foreground" />
              <span>Register Next Patient</span>
            </Button>

            <Button
              asChild
              variant="ghost"
              className="h-10 text-xs font-semibold gap-2 border border-border hover:bg-muted"
            >
              <Link href="/accessions">
                <ClipboardList className="w-4 h-4 text-muted-foreground" />
                <span>Go to Sample Worklist</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Modal>

    {/* Instant Print Tax Invoice Receipt Modal */}
    <InvoiceReceiptModal
      isOpen={isReceiptModalOpen}
      invoice={displayInvoice}
      onClose={() => setIsReceiptModalOpen(false)}
    />
  </>
);
}
