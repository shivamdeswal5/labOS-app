'use client';

import { useMemo, useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { usePublicPlansQuery, useTenantSubscriptionQuery } from '../../api/subscription.queries';
import { useCancelDowngradeMutation } from '../../api/subscription.mutations';
import { BillingToggle } from './_components/billing-toggle';
import { PlanCard } from './_components/plan-card';
import { CheckoutReviewDialog } from './_components/checkout-review-dialog';
import { ScheduleDowngradeDialog } from './_components/schedule-downgrade-dialog';
import { BillingCycle, PlanSlug, PlatformPlan } from '../../types';
import { CheckCircle2, Clock, Shield } from 'lucide-react';

interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlanSlug?: PlanSlug;
}

const PLAN_RANK: Record<PlanSlug, number> = {
  STARTER: 1,
  GROWTH: 2,
  SCALE: 3,
};

const CYCLE_RANK: Record<BillingCycle, number> = {
  MONTHLY: 1,
  YEARLY: 2,
};

export function PlanUpgradeModal({ isOpen, onClose, defaultPlanSlug }: PlanUpgradeModalProps) {
  const { data: plans = [], isLoading: plansLoading } = usePublicPlansQuery();
  const { data: subscription } = useTenantSubscriptionQuery();
  const cancelDowngradeMutation = useCancelDowngradeMutation();

  const [cycle, setCycle] = useState<BillingCycle>('MONTHLY');
  const [userSelectedPlanId, setUserSelectedPlanId] = useState<string | null>(null);
  const [reviewPlan, setReviewPlan] = useState<PlatformPlan | null>(null);
  const [downgradePlan, setDowngradePlan] = useState<PlatformPlan | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const defaultPlan = useMemo(() => {
    if (plans.length === 0) return null;
    if (defaultPlanSlug) {
      return plans.find((p) => p.slug === defaultPlanSlug) || plans[0];
    }
    return plans.find((p) => p.slug === 'GROWTH') || plans[0];
  }, [plans, defaultPlanSlug]);

  const activePlanId = userSelectedPlanId ?? defaultPlan?.id ?? '';

  const currentPlanSlug = subscription?.planSlug || 'STARTER';
  const currentPlanRank = PLAN_RANK[currentPlanSlug] || 1;
  const currentCycleRank = subscription?.billingCycle ? CYCLE_RANK[subscription.billingCycle] : 1;

  const handlePlanAction = (plan: PlatformPlan, actionType: 'UPGRADE' | 'DOWNGRADE' | 'CURRENT' | 'SCHEDULED') => {
    if (actionType === 'DOWNGRADE') {
      setDowngradePlan(plan);
    } else if (actionType === 'UPGRADE') {
      setReviewPlan(plan);
    }
  };

  const handleCancelDowngrade = async () => {
    try {
      const res = await cancelDowngradeMutation.mutateAsync();
      setSuccessBanner(res.message);
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch {
      // Ignored
    }
  };

  const scheduledDateFormatted = subscription?.scheduledAt
    ? new Date(subscription.scheduledAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <>
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
        description="Calibrated specifically for India's independent pathology centers. Transparent GST pricing and instant activation."
      >
        <div className="space-y-4">
          {/* Scheduled Downgrade Warning Banner */}
          {subscription?.scheduledPlanName && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  Downgrade to <strong>{subscription.scheduledPlanName}</strong> is scheduled for{' '}
                  <strong>{scheduledDateFormatted}</strong>. You retain all {subscription.planName} features
                  until your current billing period ends.
                </span>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleCancelDowngrade}
                disabled={cancelDowngradeMutation.isPending}
                className="text-xs h-7 border-amber-500/40 hover:bg-amber-500/20 text-amber-800 dark:text-amber-200 shrink-0 font-bold"
              >
                {cancelDowngradeMutation.isPending ? 'Cancelling...' : 'Cancel Downgrade'}
              </Button>
            </div>
          )}

          {/* Success Banner */}
          {successBanner && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successBanner}</span>
            </div>
          )}

          {/* Billing Cycle Toggle */}
          <BillingToggle cycle={cycle} onChange={setCycle} />

          {/* Plan Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plansLoading ? (
              <div className="col-span-3 py-12 text-center text-sm text-muted-foreground">
                Loading pricing plans...
              </div>
            ) : (
              plans.map((p) => {
                const isCurrentActive =
                  subscription?.status === 'ACTIVE' &&
                  subscription?.planId === p.id &&
                  subscription?.billingCycle === cycle;

                const isScheduled =
                  subscription?.scheduledPlanId === p.id &&
                  Boolean(subscription?.scheduledPlanName);

                const targetPlanRank = PLAN_RANK[p.slug] || 1;
                const targetCycleRank = CYCLE_RANK[cycle] || 1;

                let actionType: 'CURRENT' | 'UPGRADE' | 'DOWNGRADE' | 'SCHEDULED' = 'UPGRADE';

                if (isCurrentActive) {
                  actionType = 'CURRENT';
                } else if (isScheduled) {
                  actionType = 'SCHEDULED';
                } else if (subscription?.status === 'ACTIVE') {
                  const isTierDowngrade = targetPlanRank < currentPlanRank;
                  const isCycleDowngrade =
                    targetPlanRank === currentPlanRank && targetCycleRank < currentCycleRank;

                  if (isTierDowngrade || isCycleDowngrade) {
                    actionType = 'DOWNGRADE';
                  } else {
                    actionType = 'UPGRADE';
                  }
                }

                const isSelected = activePlanId === p.id;

                return (
                  <PlanCard
                    key={p.id}
                    plan={p}
                    cycle={cycle}
                    isCurrent={Boolean(isCurrentActive)}
                    isSelected={isSelected}
                    actionType={actionType}
                    onSelect={() => setUserSelectedPlanId(p.id)}
                    onCheckout={() => handlePlanAction(p, actionType)}
                    isLoading={false}
                  />
                );
              })
            )}
          </div>

          {/* Operational Guarantee Footer */}
          <div className="text-center pt-2 text-[11px] text-muted-foreground">
            🔒 256-bit SSL encryption • 18% GST tax invoice provided (HSN 998313) • 72-hour grace period ensures patient testing is never halted
          </div>
        </div>
      </Modal>

      {/* Review & Checkout Dialog (Step 2) */}
      {reviewPlan && (
        <CheckoutReviewDialog
          isOpen={Boolean(reviewPlan)}
          onClose={() => setReviewPlan(null)}
          plan={reviewPlan}
          cycle={cycle}
          subscription={subscription || null}
          onSuccess={() => {
            setReviewPlan(null);
            onClose();
          }}
        />
      )}

      {/* Scheduled Downgrade Confirmation Dialog */}
      {downgradePlan && (
        <ScheduleDowngradeDialog
          isOpen={Boolean(downgradePlan)}
          onClose={() => setDowngradePlan(null)}
          targetPlan={downgradePlan}
          cycle={cycle}
          subscription={subscription || null}
          onSuccess={() => {
            setDowngradePlan(null);
            onClose();
          }}
        />
      )}
    </>
  );
}
