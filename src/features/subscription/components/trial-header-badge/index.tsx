'use client';

import { useState } from 'react';
import { Clock, Sparkles, AlertTriangle, Lock } from 'lucide-react';
import { useTenantSubscriptionQuery } from '../../api/subscription.queries';
import { PlanUpgradeModal } from '../plan-upgrade-modal';

export function TrialHeaderBadge() {
  const { data: subscription } = useTenantSubscriptionQuery();
  const [modalOpen, setModalOpen] = useState(false);

  if (!subscription) {
    return null;
  }

  const { status, daysRemaining, planName } = subscription;

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer focus:outline-hidden"
        title="View Subscription Details & Upgrade"
      >
        {status === 'TRIALING' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition">
            <Clock className="w-3 h-3" />
            <span>Trial: {daysRemaining}d left</span>
            <span className="text-[10px] underline font-bold ml-0.5">Upgrade</span>
          </span>
        )}

        {status === 'ACTIVE' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            <span>{planName}</span>
          </span>
        )}

        {status === 'GRACE_PERIOD' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            <span>Payment Due (72h Grace)</span>
          </span>
        )}

        {status === 'LOCKED' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/15 text-destructive border border-destructive/30">
            <Lock className="w-3 h-3" />
            <span>Plan Expired</span>
          </span>
        )}
      </button>

      <PlanUpgradeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultPlanSlug={subscription.planSlug}
      />
    </>
  );
}
