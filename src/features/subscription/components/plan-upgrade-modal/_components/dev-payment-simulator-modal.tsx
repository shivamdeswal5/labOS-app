'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  QrCode,
  ShieldCheck,
  Building2,
  Smartphone,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useSimulatePaymentCaptureMutation } from '@/features/subscription/api/subscription.mutations';

interface DevPaymentSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  planName: string;
  amountInPaise: number;
  currency?: string;
  onPaymentSuccess: () => void;
}

export function DevPaymentSimulatorModal({
  isOpen,
  onClose,
  orderId,
  planName,
  amountInPaise,
  currency = 'INR',
  onPaymentSuccess,
}: DevPaymentSimulatorModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'netbanking'>('upi');
  const [simResult, setSimResult] = useState<{
    status: 'idle' | 'success' | 'declined' | 'timeout';
    message?: string;
  }>({ status: 'idle' });

  const simulateMutation = useSimulatePaymentCaptureMutation();

  const formattedAmount = (amountInPaise / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  });

  const handleSimulate = async (action: 'SUCCESS' | 'DECLINE' | 'TIMEOUT') => {
    setSimResult({ status: 'idle' });
    try {
      const res = await simulateMutation.mutateAsync({ orderId, action });
      if (action === 'SUCCESS') {
        setSimResult({ status: 'success', message: res.message });
        setTimeout(() => {
          onPaymentSuccess();
          onClose();
        }, 1200);
      } else if (action === 'DECLINE') {
        setSimResult({ status: 'declined', message: res.message });
      } else {
        setSimResult({ status: 'timeout', message: res.message });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Simulation failed';
      setSimResult({ status: 'declined', message: msg });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">Razorpay Sandbox Simulator</div>
            <div className="text-[10px] text-muted-foreground font-mono">Dev Test Environment</div>
          </div>
        </div>
      }
      description="Interactive gateway simulation for local testing. Simulates authentic UPI QR, NetBanking, and webhook capture."
    >
      <div className="space-y-4">
        {/* Order Summary Pill */}
        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-foreground">{planName} Subscription</div>
            <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
              Ref: {orderId.slice(0, 18)}...
            </div>
          </div>
          <div className="text-right">
            <div className="text-base font-extrabold text-foreground">{formattedAmount}</div>
            <div className="text-[10px] text-muted-foreground uppercase font-bold">18% GST Incl.</div>
          </div>
        </div>

        {/* Payment Channel Selector */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSelectedMethod('upi')}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              selectedMethod === 'upi'
                ? 'bg-primary/10 border-primary text-primary shadow-sm'
                : 'bg-background hover:bg-muted/50 border-border text-muted-foreground'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>UPI Apps & QR</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedMethod('netbanking')}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              selectedMethod === 'netbanking'
                ? 'bg-primary/10 border-primary text-primary shadow-sm'
                : 'bg-background hover:bg-muted/50 border-border text-muted-foreground'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Net Banking</span>
          </button>
        </div>

        {/* UPI Simulation Graphic */}
        {selectedMethod === 'upi' ? (
          <div className="p-4 rounded-xl border border-dashed border-border bg-background flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-28 h-28 rounded-lg bg-foreground/5 border border-border flex items-center justify-center relative group">
              <QrCode className="w-20 h-20 text-foreground/80 group-hover:scale-105 transition-transform" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-medium text-foreground">Scan with any UPI app</div>
              <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-medium">
                <span className="px-1.5 py-0.5 rounded bg-muted">PhonePe</span>
                <span className="px-1.5 py-0.5 rounded bg-muted">Google Pay</span>
                <span className="px-1.5 py-0.5 rounded bg-muted">Paytm</span>
                <span className="px-1.5 py-0.5 rounded bg-muted">BHIM</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl border border-border bg-background space-y-2">
            <div className="text-xs font-semibold text-muted-foreground">Select Test Bank</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((bank, i) => (
                <div
                  key={i}
                  className="p-2 rounded-lg border border-border/80 bg-muted/20 text-foreground font-medium flex items-center gap-2"
                >
                  <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{bank}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Result Alerts */}
        {simResult.status === 'success' && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{simResult.message || 'Payment authorized! Unlocking subscription...'}</span>
          </div>
        )}

        {simResult.status === 'declined' && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2 animate-in fade-in">
            <XCircle className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{simResult.message || 'Payment was declined by bank issuer.'}</span>
          </div>
        )}

        {simResult.status === 'timeout' && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2 animate-in fade-in">
            <Clock className="w-4 h-4 shrink-0" />
            <span>{simResult.message}</span>
          </div>
        )}

        {/* Simulation Action Triggers */}
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            <span>Simulate Gateway Responses</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Button
              type="button"
              onClick={() => handleSimulate('SUCCESS')}
              disabled={simulateMutation.isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9"
            >
              {simulateMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  <span>Authorizing...</span>
                </>
              ) : (
                '✅ Authorize Payment (Simulate Success)'
              )}
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSimulate('DECLINE')}
                disabled={simulateMutation.isPending}
                className="text-xs h-8 text-destructive hover:bg-destructive/10 border-destructive/30 font-medium"
              >
                ❌ Bank Decline
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSimulate('TIMEOUT')}
                disabled={simulateMutation.isPending}
                className="text-xs h-8 text-muted-foreground font-medium"
              >
                ⏱ Network Delay
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
