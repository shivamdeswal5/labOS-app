'use client';

import * as React from 'react';
import { X, CheckCircle, QrCode, Banknote, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import type { Invoice, PaymentMethod, RecordPaymentDto } from '../types';

interface SettleBillModalProps {
  isOpen: boolean;
  invoice: Invoice | null;
  onClose: () => void;
  onSettle: (invoiceId: string, dto: RecordPaymentDto) => Promise<void>;
}

export function SettleBillModal({ isOpen, invoice, onClose, onSettle }: SettleBillModalProps) {
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>('UPI');
  const [notes, setNotes] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!isOpen || !invoice) return null;

  const pendingBalance = Math.max(0, invoice.totalAmount - (invoice.paidAmount || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSettle(invoice.id, {
        amount: pendingBalance,
        paymentMethod,
        notes: notes.trim() || undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Settle Outstanding Bill</h2>
              <p className="text-[11px] text-muted-foreground font-mono">
                {invoice.invoiceNumber}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Patient Context Banner */}
          <div className="p-3 bg-muted/40 rounded-lg border border-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground text-sm">{invoice.patientName}</span>
              <span className="font-mono text-[11px] text-muted-foreground">MRN: {invoice.patientMrn}</span>
            </div>
            <div className="text-muted-foreground line-clamp-1">{invoice.testsBilled}</div>
          </div>

          {/* Pending Amount Display */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                Pending Balance Due
              </span>
              <div className="text-xl font-bold font-mono text-foreground mt-0.5">
                {formatCurrency(pendingBalance)}
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono text-xs font-semibold">
              Unsettled
            </span>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">
              Settlement Disbursal Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`py-2 px-2 rounded-md border text-xs font-medium inline-flex flex-col items-center justify-center gap-1 transition-colors ${
                  paymentMethod === 'UPI'
                    ? 'bg-primary text-primary-foreground border-primary font-semibold'
                    : 'bg-muted/40 border-border text-foreground hover:bg-muted'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>UPI (GPay/PhonePe)</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`py-2 px-2 rounded-md border text-xs font-medium inline-flex flex-col items-center justify-center gap-1 transition-colors ${
                  paymentMethod === 'CASH'
                    ? 'bg-primary text-primary-foreground border-primary font-semibold'
                    : 'bg-muted/40 border-border text-foreground hover:bg-muted'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Cash Handover</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`py-2 px-2 rounded-md border text-xs font-medium inline-flex flex-col items-center justify-center gap-1 transition-colors ${
                  paymentMethod === 'CARD'
                    ? 'bg-primary text-primary-foreground border-primary font-semibold'
                    : 'bg-muted/40 border-border text-foreground hover:bg-muted'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Card / POS</span>
              </button>
            </div>
          </div>

          {/* Reference Notes */}
          <div>
            <label className="block text-[11px] font-medium text-muted-foreground mb-1">
              Transaction Reference / Remarks (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. UTR #4829104810 or Corporate Receipt Voucher"
              className="w-full h-8 px-2.5 text-xs bg-muted/30 border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-3.5 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-8 px-4 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Settling...' : `Confirm Settlement (${formatCurrency(pendingBalance)})`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
