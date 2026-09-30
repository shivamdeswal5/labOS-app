'use client';

import * as React from 'react';
import {
  Printer,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useLabProfile } from '@/features/settings/api/use-settings';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import type { Invoice } from '../types';

interface InvoiceReceiptModalProps {
  isOpen: boolean;
  invoice: Invoice | null;
  onClose: () => void;
}

export function InvoiceReceiptModal({
  isOpen,
  invoice,
  onClose,
}: InvoiceReceiptModalProps) {
  const { data: labProfile } = useLabProfile();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !invoice) return null;

  const accentColor = labProfile?.accentColor || '#0f766e';
  const labName = labProfile?.name || 'Deswal Diagnostic Laboratory';
  const labAddress = labProfile?.address || 'Barara, Haryana';
  const labPhones = labProfile?.phoneNumbers?.join(' • ') || '';
  const nablId = labProfile?.nablId || 'NABL Accredited';

  const handlePrint = () => {
    window.print();
  };

  const isPaid = invoice.paymentStatus === 'PAID';
  const pendingAmount = Math.max(0, invoice.totalAmount - (invoice.paidAmount || 0));

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs printable-modal-backdrop"
      data-printable-area="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-card text-card-foreground border border-border rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150 printable-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Control Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/40 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-foreground">
              {invoice.invoiceNumber}
            </span>
            <span className="text-xs text-muted-foreground">• Diagnostic Receipt Voucher</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="h-8 px-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Sheet */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-card text-card-foreground text-xs print:p-0 print:m-0 print:overflow-visible">
          {/* Diagnostic Center Letterhead */}
          <div
            className="border-b-2 pb-4 text-center space-y-1"
            style={{ borderColor: accentColor }}
          >
            <div className="flex items-center justify-center gap-2">
              <span
                className="font-bold text-base tracking-tight uppercase"
                style={{ color: accentColor }}
              >
                {labName}
              </span>
              <span
                className="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold"
                style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
              >
                {nablId}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {labProfile?.tagline || 'NABL Accredited Pathology Laboratory • ISO 15189:2022 Compliant'}
            </p>
            <p className="text-[10px] text-muted-foreground font-mono">
              {labAddress} {labPhones ? `• Phone: ${labPhones}` : ''}
            </p>
            <div className="pt-2">
              <span className="inline-block px-3 py-0.5 rounded bg-muted font-bold tracking-wider text-[11px] uppercase border border-border">
                Diagnostic Pathology Cash Receipt / Invoice
              </span>
            </div>
          </div>

          {/* Tax SAC Exemption Notice */}
          <div className="px-3 py-1.5 rounded bg-muted/40 border border-border text-[10px] text-muted-foreground flex items-center justify-between font-mono">
            <span>Service Accounting Code: SAC 999316</span>
            <span>Healthcare Services — Exempt from GST (Notification 12/2017)</span>
          </div>

          {/* Patient & Voucher Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 py-2 border-b border-border text-xs">
            <div className="space-y-1">
              <div>
                <span className="text-muted-foreground">Patient Name: </span>
                <span className="font-bold text-foreground">{invoice.patientName || 'Outpatient'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">MRN: </span>
                <span className="font-mono font-semibold text-foreground">{invoice.patientMrn || 'P-WALKIN'}</span>
              </div>
              {invoice.patientPhone && (
                <div>
                  <span className="text-muted-foreground">Contact: </span>
                  <span className="font-mono text-foreground">{invoice.patientPhone}</span>
                </div>
              )}
            </div>

            <div className="space-y-1 text-right">
              <div>
                <span className="text-muted-foreground">Invoice No: </span>
                <span className="font-mono font-bold text-foreground">{invoice.invoiceNumber}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Bill Date: </span>
                <span className="font-mono text-foreground">{formatDateTime(invoice.createdAt)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Payment Status: </span>
                <span
                  className={`font-semibold font-mono ${
                    isPaid ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {isPaid ? 'PAID IN FULL' : 'PAYMENT PENDING'}
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Investigations Table */}
          <div className="border border-border rounded-md overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/60 border-b border-border font-semibold text-[11px] text-muted-foreground uppercase tracking-wide">
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Investigation Description</th>
                  <th className="py-2 px-3 text-center">SAC Code</th>
                  <th className="py-2 px-3 text-center">Qty</th>
                  <th className="py-2 px-3 text-right">Rate</th>
                  <th className="py-2 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="py-2 px-3 font-mono text-muted-foreground">{idx + 1}</td>
                      <td className="py-2 px-3 font-medium text-foreground">{item.description}</td>
                      <td className="py-2 px-3 text-center font-mono text-[10px] text-muted-foreground">
                        999316
                      </td>
                      <td className="py-2 px-3 text-center font-mono">{item.quantity}</td>
                      <td className="py-2 px-3 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-2 px-3 text-right font-mono font-semibold">
                        {formatCurrency(item.total || item.unitPrice * item.quantity)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-2 px-3 font-mono text-muted-foreground">1</td>
                    <td className="py-2 px-3 font-medium text-foreground">{invoice.testsBilled}</td>
                    <td className="py-2 px-3 text-center font-mono text-[10px] text-muted-foreground">
                      999316
                    </td>
                    <td className="py-2 px-3 text-center font-mono">1</td>
                    <td className="py-2 px-3 text-right font-mono">{formatCurrency(invoice.totalAmount)}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold">
                      {formatCurrency(invoice.totalAmount)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pricing Totals Grid */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            {/* Payment Mode & Stamp */}
            <div className="space-y-3">
              <div className="p-2.5 rounded bg-muted/30 border border-border space-y-1">
                <div className="text-[11px] font-semibold text-foreground">Payment Summary</div>
                <div className="text-muted-foreground">
                  Mode:{' '}
                  <span className="font-semibold text-foreground">
                    {invoice.paymentMethod || 'Cash'}
                  </span>
                </div>
                {invoice.notes && (
                  <div className="text-[11px] text-muted-foreground">
                    Remarks: {invoice.notes}
                  </div>
                )}
              </div>

              {/* Paid Seal Watermark */}
              {isPaid && (
                <div className="inline-flex items-center gap-2 p-2 border-2 border-dashed border-emerald-500/50 rounded-lg text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <div>
                    <div className="font-bold text-[11px] uppercase tracking-wider">
                      Paid & Verified
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground">
                      {labName} Cashier Desk
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Financial Ledger Calculation */}
            <div className="space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-muted-foreground">
                <span>Gross Subtotal:</span>
                <span className="font-mono font-medium text-foreground">
                  {formatCurrency(invoice.subtotal || invoice.totalAmount)}
                </span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-mono">
                  <span>Concession / Discount:</span>
                  <span>- {formatCurrency(invoice.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground pt-1 border-t border-border">
                <span className="font-bold text-foreground">Net Invoice Total:</span>
                <span className="font-mono font-bold text-sm text-foreground">
                  {formatCurrency(invoice.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Amount Paid:</span>
                <span className="font-mono font-semibold text-emerald-600">
                  {formatCurrency(invoice.paidAmount)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground pt-1 border-t border-border">
                <span className="font-semibold text-foreground">Balance Due:</span>
                <span
                  className={`font-mono font-bold ${
                    pendingAmount > 0 ? 'text-amber-600' : 'text-foreground'
                  }`}
                >
                  {formatCurrency(pendingAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Receipt Footer */}
          <div className="pt-4 border-t border-border text-center space-y-1 text-[10px] text-muted-foreground">
            <p>
              This is a computer-generated tax receipt voucher for medical diagnostic investigations.
            </p>
            <p className="font-mono">
              Patients can view official digitally signed reports online at labos.in/v with their accession barcode.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
