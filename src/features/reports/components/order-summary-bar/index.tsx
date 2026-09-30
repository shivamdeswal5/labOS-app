'use client';

import * as React from 'react';
import {
  ArrowRight,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  UserPlus,
  CreditCard,
  QrCode,
  Banknote,
  Receipt,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatters';

export type PaymentMode = 'PAID' | 'PAY_LATER';
export type ActivePaymentMethod = 'UPI' | 'CASH' | 'CARD';

interface OrderSummaryBarProps {
  selectedCount: number;
  totalPrice: number;
  discount: number;
  onDiscountChange: (discount: number) => void;
  paymentMode: PaymentMode;
  onPaymentModeChange: (mode: PaymentMode) => void;
  paymentMethod: ActivePaymentMethod;
  onPaymentMethodChange: (method: ActivePaymentMethod) => void;
  isSubmitting: boolean;
  isValid: boolean;
  isRegistered?: boolean;
  onRegisterNext?: () => void;
  onSubmit: () => void;
}

export function OrderSummaryBar({
  selectedCount,
  totalPrice,
  discount,
  onDiscountChange,
  paymentMode,
  onPaymentModeChange,
  paymentMethod,
  onPaymentMethodChange,
  isSubmitting,
  isValid,
  isRegistered = false,
  onRegisterNext,
  onSubmit,
}: OrderSummaryBarProps) {
  const netTotal = Math.max(0, totalPrice - (Number(discount) || 0));

  return (
    <div className="sticky bottom-0 z-30 bg-card border-t border-border p-3.5 sm:p-4 shadow-xl print:hidden transition-all">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        {/* Top Tier: Price Breakdown & Payment Mode Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-border/60">
          {/* Left: Investigation & Financial Breakdown */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs">
            <div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Panels
              </span>
              <span className="font-bold text-foreground">
                {selectedCount} {selectedCount === 1 ? 'Test' : 'Tests'}
              </span>
            </div>

            <div className="h-6 w-px bg-border hidden sm:block" />

            <div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Catalog Subtotal
              </span>
              <span className="font-mono font-medium text-muted-foreground">
                {formatCurrency(totalPrice)}
              </span>
            </div>

            {/* Quick Discount Input */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Discount (₹):
              </span>
              <input
                type="number"
                min="0"
                max={totalPrice}
                value={discount === 0 ? '' : discount}
                onChange={(e) => {
                  const val = Math.max(0, Number(e.target.value) || 0);
                  onDiscountChange(Math.min(val, totalPrice));
                }}
                placeholder="0"
                disabled={isRegistered || selectedCount === 0}
                className="w-16 h-7 px-2 text-xs font-mono font-semibold bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-right"
              />
            </div>

            <div className="h-6 w-px bg-border hidden sm:block" />

            {/* Net Amount to Collect */}
            <div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Net Investigation Fee
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {formatCurrency(netTotal)}
              </span>
            </div>
          </div>

          {/* Right: Payment Mode & Upfront Settlement Controls */}
          {!isRegistered && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/40 text-xs">
                <button
                  type="button"
                  onClick={() => onPaymentModeChange('PAID')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1 ${
                    paymentMode === 'PAID'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Paid Upfront</span>
                </button>
                <button
                  type="button"
                  onClick={() => onPaymentModeChange('PAY_LATER')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    paymentMode === 'PAY_LATER'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Pay Later
                </button>
              </div>

              {/* Payment Method Selector when Paid Upfront */}
              {paymentMode === 'PAID' && (
                <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/40 text-xs">
                  <button
                    type="button"
                    onClick={() => onPaymentMethodChange('UPI')}
                    className={`px-2 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
                      paymentMethod === 'UPI'
                        ? 'bg-background text-foreground shadow-xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    title="Unified Payments Interface (PhonePe / GPay / QR)"
                  >
                    <QrCode className="w-3 h-3 text-primary" />
                    <span>UPI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onPaymentMethodChange('CASH')}
                    className={`px-2 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
                      paymentMethod === 'CASH'
                        ? 'bg-background text-foreground shadow-xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Banknote className="w-3 h-3 text-emerald-600" />
                    <span>Cash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onPaymentMethodChange('CARD')}
                    className={`px-2 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
                      paymentMethod === 'CARD'
                        ? 'bg-background text-foreground shadow-xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <CreditCard className="w-3 h-3 text-blue-500" />
                    <span>Card</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Tier: Audit Assurance & Primary Action */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>
              {paymentMode === 'PAID'
                ? `Auto-generates verified Tax Invoice & ${paymentMethod} payment record`
                : 'Auto-generates Unpaid Tax Invoice in Billing Master Ledger'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isRegistered ? (
              <Button
                type="button"
                variant="default"
                size="default"
                onClick={onRegisterNext}
                className="w-full sm:w-auto h-9 px-5 text-xs font-semibold gap-1.5 bg-primary"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register Next Patient</span>
              </Button>
            ) : (
              <Button
                type="button"
                size="default"
                disabled={!isValid || isSubmitting}
                onClick={onSubmit}
                className="w-full sm:w-auto h-9 px-6 font-semibold text-xs gap-2 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering & Invoicing...</span>
                  </>
                ) : (
                  <>
                    <Receipt className="w-4 h-4" />
                    <span>
                      {paymentMode === 'PAID'
                        ? `Register & Issue Bill (${formatCurrency(netTotal)})`
                        : `Register Sample (Pay Later)`}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
