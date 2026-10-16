'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  CreditCard,
  Building,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Shield,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  PlatformPlan,
  BillingCycle,
  TenantSubscription,
  GatewayOrderResponse,
  RazorpayOptions,
} from '@/features/subscription/types';
import {
  usePreviewTransitionQuery,
  SUBSCRIPTION_QUERY_KEYS,
} from '@/features/subscription/api/subscription.queries';
import {
  useCreateSubscriptionOrderMutation,
  useSubmitOfflinePaymentMutation,
} from '@/features/subscription/api/subscription.mutations';
import { useAuthContext } from '@/providers/auth-provider';
import { useLabProfile } from '@/features/settings/hooks/use-lab-profile';
import { DevPaymentSimulatorModal } from './dev-payment-simulator-modal';
import { loadRazorpayCheckoutScript } from './razorpay-sdk';

interface CheckoutReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PlatformPlan;
  cycle: BillingCycle;
  subscription: TenantSubscription | null;
  onSuccess: () => void;
}

export function CheckoutReviewDialog({
  isOpen,
  onClose,
  plan,
  cycle,
  subscription,
  onSuccess,
}: CheckoutReviewDialogProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const { data: labProfile } = useLabProfile();
  const [activeTab, setActiveTab] = useState<'online' | 'offline'>('online');
  const [labGstin, setLabGstin] = useState(subscription?.customerGstin || '');
  const [utrNumber, setUtrNumber] = useState('');
  const [bankNotes, setBankNotes] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [offlineSuccessMsg, setOfflineSuccessMsg] = useState<string | null>(null);

  // Dev simulator state
  const [devSimulatorOpen, setDevSimulatorOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<GatewayOrderResponse | null>(null);

  // Queries & Mutations
  const { data: preview, isLoading: isPreviewLoading } = usePreviewTransitionQuery(
    plan.slug,
    cycle,
    isOpen,
  );

  const createOrderMutation = useCreateSubscriptionOrderMutation();
  const submitOfflineMutation = useSubmitOfflinePaymentMutation();

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  // 1. Online Checkout Handler (Environment-Driven Gateway Switch)
  const handleOnlineCheckout = async () => {
    setErrorMessage(null);
    try {
      const order = await createOrderMutation.mutateAsync({
        planSlug: plan.slug,
        planId: plan.id,
        billingCycle: cycle,
      });

      if (order.alreadyFulfilled) {
        queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEYS.subscription });
        queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEYS.invoices });
        onSuccess();
        return;
      }

      setActiveOrder(order);

      const isRealRazorpayKey =
        order.keyId &&
        !order.keyId.includes('placeholder') &&
        !order.orderId.startsWith('order_sim_');

      if (isRealRazorpayKey) {
        // Real Gateway: Load and launch authentic Razorpay Checkout popup
        const sdkLoaded = await loadRazorpayCheckoutScript();
        if (!sdkLoaded) {
          setErrorMessage('Payment gateway SDK could not be loaded. Please check your connection.');
          return;
        }

        const contactPhone =
          labProfile?.phoneNumbers?.[0] ||
          process.env.NEXT_PUBLIC_PAYMENT_DEFAULT_PHONE ||
          '9876543210';

        const rzpOptions: RazorpayOptions = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'Pathiq LabOS',
          description: `Subscription: ${plan.name} (${cycle})`,
          order_id: order.orderId,
          prefill: {
            name: labProfile?.name || 'Laboratory Administrator',
            email: user?.email || 'admin@pathiq.in',
            contact: contactPhone,
          },
          theme: { color: '#059669' },
          handler: () => {
            queryClient.invalidateQueries({ queryKey: ['tenant-subscription'] });
            queryClient.invalidateQueries({ queryKey: ['tenant-invoices'] });
            onSuccess();
            onClose();
          },
          modal: {
            ondismiss: () => setErrorMessage(null),
          },
        };

        const RazorpayClass = (window as unknown as { Razorpay: new (opts: RazorpayOptions) => { open: () => void } }).Razorpay;
        if (RazorpayClass) {
          const rzp = new RazorpayClass(rzpOptions);
          rzp.open();
        }
      } else {
        // Dev Mode / Placeholder Key: Open interactive Dev Payment Simulator modal
        setDevSimulatorOpen(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Checkout initiation failed';
      setErrorMessage(msg);
    }
  };

  // 2. Offline UTR Submission Handler
  const handleOfflineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUtr = utrNumber.trim();
    if (!/^[0-9]{12}$/.test(cleanUtr)) {
      setErrorMessage('Please enter a valid 12-digit numeric UTR reference number.');
      return;
    }

    try {
      // Create pending order first if not already initialized
      const order =
        activeOrder ||
        (await createOrderMutation.mutateAsync({
          planSlug: plan.slug,
          planId: plan.id,
          billingCycle: cycle,
        }));

      const res = await submitOfflineMutation.mutateAsync({
        orderId: order.orderId,
        utrNumber: cleanUtr,
        bankName: 'Direct NEFT/RTGS/UPI',
        notes: bankNotes ? `${bankNotes} | GSTIN: ${labGstin}` : `GSTIN: ${labGstin}`,
      });

      setOfflineSuccessMsg(res.message);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'UTR submission failed';
      setErrorMessage(msg);
    }
  };

  const grossInr = preview ? preview.grossAmountInPaise / 100 : plan.monthlyPriceInr;
  const creditInr = preview ? preview.prorationCreditInPaise / 100 : 0;
  const taxInr = preview ? preview.taxGstInPaise / 100 : Math.round(grossInr * 0.18);
  const netInr = preview ? preview.netAmountInPaise / 100 : grossInr + taxInr;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        title={
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            <span className="text-base font-bold text-foreground">Order Review & Billing Summary</span>
          </div>
        }
        description="Verify your laboratory plan selection, tax itemization, and payment options."
      >
        <div className="space-y-4">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Itemized Order Breakdown */}
          <div className="p-4 rounded-xl bg-muted/40 border border-border/80 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div>
                <div className="text-sm font-bold text-foreground">{plan.name}</div>
                <div className="text-xs text-muted-foreground capitalize">
                  {cycle.toLowerCase()} Billing Cycle ({cycle === 'YEARLY' ? '12 Months' : '30 Days'})
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-foreground">
                  ₹{cycle === 'YEARLY' ? plan.yearlyPriceInr.toLocaleString('en-IN') : plan.monthlyPriceInr.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">HSN 998313</div>
              </div>
            </div>

            {/* Proration Credit Row */}
            {creditInr > 0 && (
              <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <div className="flex items-center gap-1.5">
                  <span>Proration Credit (Unused Days)</span>
                  <HelpCircle className="w-3 h-3 opacity-70" />
                </div>
                <div>-₹{creditInr.toFixed(2)}</div>
              </div>
            )}

            {/* Taxable Subtotal */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Taxable Base Value</span>
              <span>₹{grossInr.toFixed(2)}</span>
            </div>

            {/* 18% GST */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <span>18% GST (CGST 9% + SGST 9%)</span>
              </div>
              <span>₹{taxInr.toFixed(2)}</span>
            </div>

            {/* Total Payable Today */}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-foreground uppercase tracking-wider">Total Payable Today</div>
                <div className="text-[10px] text-muted-foreground">Includes all statutory taxes</div>
              </div>
              <div className="text-xl font-black text-foreground">
                ₹{netInr.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Optional Lab GSTIN Input */}
          <div className="p-3 rounded-xl border border-border bg-background space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Laboratory GSTIN (Optional)</span>
              <span className="text-[10px] font-normal text-muted-foreground">For 100% B2B Input Tax Credit</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. 07AAAAA0000A1Z5"
              value={labGstin}
              onChange={(e) => setLabGstin(e.target.value.toUpperCase())}
              className="text-xs h-8 uppercase font-mono tracking-wider"
              maxLength={15}
            />
          </div>

          {/* Payment Method Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('online')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'online'
                  ? 'bg-primary/10 border-primary text-primary shadow-sm'
                  : 'bg-background hover:bg-muted/50 border-border text-muted-foreground'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Instant Online Payment</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('offline')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'offline'
                  ? 'bg-primary/10 border-primary text-primary shadow-sm'
                  : 'bg-background hover:bg-muted/50 border-border text-muted-foreground'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Bank Transfer (NEFT/RTGS)</span>
            </button>
          </div>

          {/* TAB 1: Online Checkout */}
          {activeTab === 'online' && (
            <div className="space-y-3 pt-1">
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Instant automated activation via PhonePe, Google Pay, Paytm, UPI QR, or NetBanking.</span>
              </div>

              <Button
                type="button"
                onClick={handleOnlineCheckout}
                disabled={createOrderMutation.isPending || isPreviewLoading}
                className="w-full h-10 font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2"
              >
                {createOrderMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Preparing Secure Checkout...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Pay ₹{netInr.toFixed(2)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* TAB 2: Offline Bank Transfer (NEFT / RTGS) */}
          {activeTab === 'offline' && (
            <div className="space-y-3 pt-1">
              {offlineSuccessMsg ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 space-y-2 text-center animate-in fade-in">
                  <CheckCircle2 className="w-8 h-8 mx-auto" />
                  <div className="font-bold text-sm">UTR Receipt Submitted!</div>
                  <div className="text-xs text-muted-foreground">{offlineSuccessMsg}</div>
                </div>
              ) : (
                <form onSubmit={handleOfflineSubmit} className="space-y-3">
                  {/* Corporate Bank Details Box */}
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/80 text-xs space-y-2">
                    <div className="font-bold text-foreground">Official Corporate Current Account</div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-muted-foreground block">Beneficiary Name</span>
                        <span className="font-semibold text-foreground">Pathiq Healthtech Pvt Ltd</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Bank Name</span>
                        <span className="font-semibold text-foreground">HDFC Bank Ltd</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-muted-foreground block">Account Number</span>
                          <span className="font-mono font-bold text-foreground">50200084729104</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy('50200084729104', 'ac')}
                          className="p-1 rounded hover:bg-muted text-muted-foreground"
                        >
                          {copiedField === 'ac' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-muted-foreground block">IFSC Code</span>
                          <span className="font-mono font-bold text-foreground">HDFC0001234</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy('HDFC0001234', 'ifsc')}
                          className="p-1 rounded hover:bg-muted text-muted-foreground"
                        >
                          {copiedField === 'ifsc' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 12-digit UTR Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      12-Digit Bank UTR / Reference Number <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. 428910482910"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                      className="text-xs font-mono tracking-widest h-8"
                      required
                      maxLength={12}
                    />
                    <div className="text-[10px] text-muted-foreground">
                      Found in your bank transfer receipt (IMPS, NEFT, RTGS or UPI).
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Transfer Notes (Optional)</label>
                    <Input
                      type="text"
                      placeholder="e.g. Sent from Dr. Deswal SBI Current A/c"
                      value={bankNotes}
                      onChange={(e) => setBankNotes(e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitOfflineMutation.isPending || utrNumber.length !== 12}
                    className="w-full h-9 font-bold text-xs"
                  >
                    {submitOfflineMutation.isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        <span>Submitting UTR for Review...</span>
                      </>
                    ) : (
                      'Submit UTR for Verification'
                    )}
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Dev Mode Simulator Modal */}
      {devSimulatorOpen && activeOrder && (
        <DevPaymentSimulatorModal
          isOpen={devSimulatorOpen}
          onClose={() => setDevSimulatorOpen(false)}
          orderId={activeOrder.orderId}
          planName={plan.name}
          amountInPaise={activeOrder.amountInPaise ?? activeOrder.amount ?? preview?.netAmountInPaise ?? 0}
          currency={activeOrder.currency || 'INR'}
          onPaymentSuccess={() => {
            onSuccess();
            onClose();
          }}
        />
      )}
    </>
  );
}
