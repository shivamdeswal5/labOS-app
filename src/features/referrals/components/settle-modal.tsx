'use client';

import * as React from 'react';
import { X, CheckCircle2, Building, Smartphone, Banknote, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatters';
import { useSettleCommission } from '../api/use-commission';
import type { ReferringDoctor, CommissionLedgerEntry, PaymentMethod } from '../types';

interface SettleModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: ReferringDoctor | null;
  pendingEntries: CommissionLedgerEntry[];
}

export function SettleModal({
  isOpen,
  onClose,
  doctor,
  pendingEntries,
}: SettleModalProps) {
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>('BANK_TRANSFER');
  const [notes, setNotes] = React.useState('');
  const settleMutation = useSettleCommission();

  if (!isOpen || !doctor) return null;

  const totalAmount = pendingEntries.reduce((sum, e) => sum + e.amount, 0) || doctor.pendingAmount;

  const handleSettle = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await settleMutation.mutateAsync({
        doctorId: doctor.id,
        entryIds: pendingEntries.map((e) => e.id),
        ledgerIds: pendingEntries.map((e) => e.id),
        paymentMethod,
        notes: notes || `Settled via ${paymentMethod} on ${new Date().toLocaleDateString('en-IN')}`,
      });
      onClose();
    } catch (err) {
      console.error('Failed to settle commissions:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0">
      <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Settle Commission Payout</h2>
              <p className="text-[11px] text-muted-foreground font-mono">
                Direct NEFT / IMPS / UPI Disbursal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSettle} className="p-4 space-y-3.5 text-xs">
          {/* Summary Box */}
          <div className="p-3 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase text-muted-foreground">Payee Clinician</span>
              <span className="font-bold text-foreground text-sm">{doctor.name}</span>
              <span className="text-[11px] text-muted-foreground font-mono">
                {doctor.clinic?.split(',')[0]} • A/C: {doctor.bankAccount || '•••• 4920'}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-muted-foreground">Disbursal Sum</span>
              <span className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400 block">
                {formatCurrency(totalAmount)}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {pendingEntries.length || 'All'} cases
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-foreground mb-1.5">
              Settlement Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('BANK_TRANSFER')}
                className={`p-2.5 rounded-lg border flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'BANK_TRANSFER'
                    ? 'bg-card border-primary text-foreground font-semibold shadow-sm'
                    : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <Building className="w-4 h-4 text-primary" />
                <span className="text-[11px]">Bank NEFT</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-2.5 rounded-lg border flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'UPI'
                    ? 'bg-card border-primary text-foreground font-semibold shadow-sm'
                    : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <Smartphone className="w-4 h-4 text-primary" />
                <span className="text-[11px]">Direct UPI</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`p-2.5 rounded-lg border flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'CASH'
                    ? 'bg-card border-primary text-foreground font-semibold shadow-sm'
                    : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <Banknote className="w-4 h-4 text-primary" />
                <span className="text-[11px]">Cash Handover</span>
              </button>
            </div>
          </div>

          {/* Reference Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-foreground mb-1">
              Transaction Reference / Voucher Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. UTR #HDFC09218204 or Cash handed to clinic receptionist"
              className="w-full h-8 px-2.5 text-xs bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono"
            />
          </div>

          {/* Compliance Notice */}
          <div className="p-2 bg-muted/30 rounded border border-border/60 flex items-center gap-2 text-[11px] text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Generates an unmodifiable NABL/TDS compliant settlement audit voucher.</span>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={settleMutation.isPending}
              className="h-8 text-xs font-semibold gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{settleMutation.isPending ? 'Settling...' : 'Confirm Disbursal'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
