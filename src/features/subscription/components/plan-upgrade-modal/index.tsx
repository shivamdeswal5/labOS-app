'use client';

import { useMemo, useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { usePublicPlansQuery, useTenantSubscriptionQuery, useCreateSubscriptionOrderMutation } from '../../api/subscription.queries';
import { BillingToggle } from './_components/billing-toggle';
import { PlanCard } from './_components/plan-card';
import { loadRazorpayCheckoutScript } from './_components/razorpay-sdk';
import { BillingCycle, PlanSlug, RazorpayOptions } from '../../types';
import { AlertCircle, CheckCircle2, Shield } from 'lucide-react';

interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlanSlug?: PlanSlug;
}

export function PlanUpgradeModal({ isOpen, onClose, defaultPlanSlug }: PlanUpgradeModalProps) {
  const { data: plans = [], isLoading: plansLoading } = usePublicPlansQuery();
  const { data: subscription } = useTenantSubscriptionQuery();
  const createOrderMutation = useCreateSubscriptionOrderMutation();

  const [cycle, setCycle] = useState<BillingCycle>('MONTHLY');
  const [userSelectedPlanId, setUserSelectedPlanId] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const defaultPlan = useMemo(() => {
    if (plans.length === 0) return null;
    if (defaultPlanSlug) {
      return plans.find((p) => p.slug === defaultPlanSlug) || plans[0];
    }
    return plans.find((p) => p.slug === 'GROWTH') || plans[0];
  }, [plans, defaultPlanSlug]);

  const activePlanId = userSelectedPlanId ?? defaultPlan?.id ?? '';

  const handleCheckout = async (planId: string) => {
    setCheckoutError(null);
    try {
      // 1. Ensure Razorpay SDK script is ready
      const sdkReady = await loadRazorpayCheckoutScript();
      if (!sdkReady) {
        setCheckoutError('Payment gateway SDK could not be loaded. Please check your internet connection.');
        return;
      }

      // 2. Create order on backend API
      const order = await createOrderMutation.mutateAsync({
        planId,
        billingCycle: cycle,
      });

      // 3. Initialize Razorpay Modal
      const rzpOptions: RazorpayOptions = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Pathiq LabOS',
        description: `Upgrade to ${order.labName}`,
        order_id: order.orderId,
        theme: { color: '#4f46e5' },
        handler: () => {
          setIsSyncing(true);
          setTimeout(() => {
            setIsSyncing(false);
            onClose();
          }, 2500);
        },
        modal: {
          ondismiss: () => {
            setCheckoutError(null);
          },
        },
      };

      const RazorpayConstructor = (window as unknown as { Razorpay: new (opts: RazorpayOptions) => { open: () => void } }).Razorpay;
      if (RazorpayConstructor) {
        const rzp = new RazorpayConstructor(rzpOptions);
        rzp.open();
      } else {
        setCheckoutError('Razorpay checkout window failed to initialize.');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Checkout initiation failed. Please try again.';
      setCheckoutError(errorMsg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      title={
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <span>Select Your Laboratory Plan</span>
        </div>
      }
      description="Calibrated specifically for India's independent pathology centers. Instant UPI & NetBanking activation."
    >
      <div className="space-y-4">
        {/* Billing Cycle Toggle */}
        <BillingToggle cycle={cycle} onChange={setCycle} />

        {/* Syncing State */}
        {isSyncing && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Payment received! Synchronizing your account with our banking engine...</span>
          </div>
        )}

        {/* Error Alert */}
        {checkoutError && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{checkoutError}</span>
          </div>
        )}

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plansLoading ? (
            <div className="col-span-3 py-12 text-center text-sm text-muted-foreground">
              Loading pricing plans...
            </div>
          ) : (
            plans.map((p) => {
              const isCurrent = subscription?.status === 'ACTIVE' && subscription?.planId === p.id;
              const isSelected = activePlanId === p.id;
              return (
                <PlanCard
                  key={p.id}
                  plan={p}
                  cycle={cycle}
                  isCurrent={Boolean(isCurrent)}
                  isSelected={isSelected}
                  onSelect={() => setUserSelectedPlanId(p.id)}
                  onCheckout={() => handleCheckout(p.id)}
                  isLoading={createOrderMutation.isPending && isSelected}
                />
              );
            })
          )}
        </div>

        {/* Operational Guarantee Footer */}
        <div className="text-center pt-2 text-[11px] text-muted-foreground">
          🔒 Secure 256-bit encryption • GST invoice provided • 72-hour grace period ensures test delivery is never halted
        </div>
      </div>
    </Modal>
  );
}
