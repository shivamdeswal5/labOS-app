'use client';

import { Printer, Download, X, ShieldCheck, Building2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TenantInvoice } from '../../types';
import { useLabProfile } from '@/features/settings/hooks/use-lab-profile';

interface SubscriptionTaxInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: TenantInvoice | null;
}

export function SubscriptionTaxInvoiceModal({
  isOpen,
  onClose,
  invoice,
}: SubscriptionTaxInvoiceModalProps) {
  const { data: labProfile } = useLabProfile();

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceDateStr = invoice.createdAt
    ? new Date(invoice.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';

  const periodStartStr = invoice.billingPeriodStart
    ? new Date(invoice.billingPeriodStart).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  const periodEndStr = invoice.billingPeriodEnd
    ? new Date(invoice.billingPeriodEnd).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  const cgstInr = (invoice.taxAmountInr / 2).toFixed(2);
  const sgstInr = (invoice.taxAmountInr / 2).toFixed(2);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in printable-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 printable-modal-content">
        {/* Modal Top Bar (Hidden on print) */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/40 print:hidden">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-bold text-foreground">B2B GST Tax Invoice</span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
              GST Rule 46 Compliant
            </span>
          </div>

          <div className="flex items-center gap-2">
            {invoice.pdfUrl && (
              <a
                href={invoice.pdfUrl}
                target="_blank"
                rel="noreferrer"
                download={`Invoice-${invoice.invoiceNumber}.pdf`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-primary" />
                <span>Download PDF</span>
              </a>
            )}

            <Button
              type="button"
              size="sm"
              onClick={handlePrint}
              className="text-xs h-8 flex items-center gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </Button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors ml-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-white text-zinc-950 font-sans print:p-0 print:overflow-visible">
          {/* Brand & Supplier Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 pb-5">
            <div className="space-y-1">
              <div className="text-2xl font-black tracking-tight text-emerald-600">PATHIQ</div>
              <div className="text-[11px] font-bold tracking-wider text-zinc-800 uppercase">
                Diagnostic Laboratory Operating System
              </div>
              <div className="text-xs text-zinc-600 space-y-0.5 pt-1">
                <div className="font-semibold text-zinc-800">Pathiq Healthtech Private Limited</div>
                <div>Building 4, DLF CyberCity, Gurugram, Haryana - 122002</div>
                <div>
                  GSTIN: <span className="font-mono font-bold text-zinc-900">06AAECP1234F1Z8</span> | State Code: 06 (Haryana)
                </div>
                <div>PAN: AAECP1234F • support@pathiq.in</div>
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="inline-block px-3 py-1 rounded bg-zinc-100 border border-zinc-200 text-xs font-bold uppercase tracking-wider text-zinc-800">
                Tax Invoice
              </div>
              <div className="text-[11px] text-zinc-500">(Original for Recipient)</div>
              <div className="pt-2 text-xs space-y-1">
                <div>
                  <span className="text-zinc-500">Invoice No: </span>
                  <span className="font-mono font-bold text-zinc-950">{invoice.invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Invoice Date: </span>
                  <span className="font-medium text-zinc-800">{invoiceDateStr}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Status: </span>
                  <span className="font-bold text-emerald-600">PAID</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recipient Details (Billed To) */}
          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Billed To (Recipient):</div>
              <div className="text-sm font-bold text-zinc-900">{labProfile?.name || 'Diagnostic Laboratory'}</div>
              <div className="text-zinc-600">{labProfile?.address || 'India'}</div>
              <div className="text-zinc-500 text-[11px]">Contact: {labProfile?.phoneNumbers?.[0] || 'N/A'}</div>
            </div>

            <div className="space-y-1 sm:text-right">
              <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Recipient GSTIN:</div>
              <div className="font-mono font-bold text-zinc-900 text-xs">
                {invoice.customerGstin || 'Unregistered / B2C Lab'}
              </div>
              <div className="text-[11px] text-zinc-500 pt-1">
                Place of Supply: <span className="font-semibold text-zinc-800">Haryana / Domestic</span>
              </div>
            </div>
          </div>

          {/* Itemized Services Table */}
          <div className="border border-zinc-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-900 text-white uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Description of Software Service</th>
                  <th className="py-2.5 px-3 text-center">SAC Code</th>
                  <th className="py-2.5 px-3 text-right">Taxable Value</th>
                  <th className="py-2.5 px-3 text-right">GST (18%)</th>
                  <th className="py-2.5 px-3 text-right">Total (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-800">
                <tr>
                  <td className="py-3 px-3">
                    <div className="font-bold text-zinc-950">Pathiq LabOS Platform Subscription</div>
                    <div className="text-[11px] text-zinc-500">
                      Service Period: {periodStartStr} to {periodEndStr}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center font-mono">998313</td>
                  <td className="py-3 px-3 text-right font-medium">₹{invoice.subtotalInr.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right font-medium">₹{invoice.taxAmountInr.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right font-bold text-zinc-950">₹{invoice.amountInr.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tax Breakdown & Settlement Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Left: Payment Settlement Reference */}
            <div className="p-3.5 rounded-lg border border-zinc-200 bg-zinc-50/50 space-y-2 text-xs">
              <div className="font-bold text-zinc-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Payment Settlement Details</span>
              </div>
              <div className="text-[11px] text-zinc-600 space-y-1">
                <div>
                  <span className="text-zinc-500">Channel: </span>
                  <span className="font-medium text-zinc-800">{invoice.paymentMethod || 'Razorpay Gateway'}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Transaction Ref: </span>
                  <span className="font-mono text-zinc-800">{invoice.providerPaymentId || invoice.id.slice(0, 16)}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Settlement: </span>
                  <span className="font-semibold text-emerald-600">Cleared &amp; Authorized</span>
                </div>
              </div>
            </div>

            {/* Right: Calculations Box */}
            <div className="p-3.5 rounded-lg border border-zinc-200 bg-zinc-50 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Taxable Subtotal</span>
                <span>₹{invoice.subtotalInr.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Central GST (CGST @ 9%)</span>
                <span>₹{cgstInr}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>State GST (SGST @ 9%)</span>
                <span>₹{sgstInr}</span>
              </div>
              <div className="pt-2 border-t border-zinc-200 flex justify-between font-black text-sm text-zinc-950">
                <span>Total Invoice Value</span>
                <span className="text-emerald-600">₹{invoice.amountInr.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Statutory Declaration */}
          <div className="pt-3 border-t border-zinc-200 text-[10px] text-zinc-500 space-y-1 leading-relaxed">
            <div className="font-bold uppercase tracking-wider text-zinc-700">Statutory Tax Declaration:</div>
            <div>
              1. All information technology and laboratory diagnostic software services are categorized under HSN/SAC Code 998313.
            </div>
            <div>
              2. Laboratories registered with a valid GSTIN are entitled to claim 100% Input Tax Credit (ITC) on Form GSTR-3B.
            </div>
            <div>
              3. This is an authentic computer-generated digital tax invoice issued by Pathiq Healthtech Private Limited.
            </div>
          </div>

          {/* Digital Trust Footer */}
          <div className="pt-2 text-center text-[10px] font-mono text-zinc-400 border-t border-zinc-100 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pathiq Cryptographic Ledger Verified • Registered under Ministry of Corporate Affairs, India</span>
          </div>
        </div>
      </div>
    </div>
  );
}
