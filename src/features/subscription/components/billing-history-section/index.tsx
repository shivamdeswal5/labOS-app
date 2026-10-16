'use client';

import { useState } from 'react';
import {
  FileText,
  Download,
  Eye,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { useTenantInvoicesQuery } from '../../api/subscription.queries';
import { SubscriptionTaxInvoiceModal } from '../subscription-tax-invoice-modal';
import { TenantInvoice } from '../../types';
import { Button } from '@/components/ui/button';

export function BillingHistorySection() {
  const { data: invoices = [], isLoading } = useTenantInvoicesQuery();
  const [selectedInvoice, setSelectedInvoice] = useState<TenantInvoice | null>(null);

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <h3 className="text-base font-bold text-foreground">Billing History &amp; GST Tax Invoices</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Official B2B GST tax invoices (HSN 998313) with full input credit details for your laboratory&apos;s GSTR-3B filings.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>GST Rule 46 Compliant</span>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-xs text-muted-foreground animate-pulse">
          Loading billing statements &amp; tax invoices...
        </div>
      ) : invoices.length === 0 ? (
        <div className="py-8 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-muted/60 border border-border flex items-center justify-center mx-auto text-muted-foreground">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="text-xs font-semibold text-foreground">No Invoices Issued Yet</div>
          <div className="text-[11px] text-muted-foreground max-w-sm mx-auto">
            Your laboratory is currently operating under the 14-day evaluation period. Official tax invoices will appear here automatically upon plan activation.
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Invoice Number</th>
                <th className="py-2.5 px-3">Taxable Base</th>
                <th className="py-2.5 px-3">18% GST</th>
                <th className="py-2.5 px-3">Total Amount</th>
                <th className="py-2.5 px-3">Payment Channel</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((inv) => {
                const dateStr = inv.createdAt
                  ? new Date(inv.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '';

                return (
                  <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-3 text-foreground font-medium whitespace-nowrap">
                      {dateStr}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-foreground">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground font-mono">
                      ₹{inv.subtotalInr.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground font-mono">
                      ₹{inv.taxAmountInr.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 font-bold text-foreground font-mono">
                      ₹{inv.amountInr.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground text-[11px]">
                      {inv.paymentMethod || 'Razorpay Gateway'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>PAID</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {inv.pdfUrl && (
                          <a
                            href={inv.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            download={`Invoice-${inv.invoiceNumber}.pdf`}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors inline-flex items-center"
                            title="Download Official PDF"
                          >
                            <Download className="w-3.5 h-3.5 text-primary" />
                          </a>
                        )}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedInvoice(inv)}
                          className="text-[11px] h-7 px-2.5 flex items-center gap-1 font-semibold"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Invoice</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tax Invoice Modal */}
      {selectedInvoice && (
        <SubscriptionTaxInvoiceModal
          isOpen={Boolean(selectedInvoice)}
          onClose={() => setSelectedInvoice(null)}
          invoice={selectedInvoice}
        />
      )}
    </div>
  );
}
