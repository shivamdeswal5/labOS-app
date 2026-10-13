'use client';

import { useState } from 'react';
import { AlertTriangle, Lock, ArrowRight } from 'lucide-react';
import { useTenantSubscriptionQuery } from '../../api/subscription.queries';
import { PlanUpgradeModal } from '../plan-upgrade-modal';
import { Button } from '@/components/ui/button';

export function GracePeriodBanner() {
  const { data: subscription } = useTenantSubscriptionQuery();
  const [modalOpen, setModalOpen] = useState(false);

  if (!subscription || (subscription.status !== 'GRACE_PERIOD' && subscription.status !== 'LOCKED')) {
    return null;
  }

  const isGrace = subscription.status === 'GRACE_PERIOD';

  return (
    <>
      <div
        className={`w-full px-4 py-2.5 border-b text-xs flex flex-wrap items-center justify-between gap-2 transition-all ${
          isGrace
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
            : 'bg-destructive/10 border-destructive/30 text-destructive'
        }`}
      >
        <div className="flex items-center gap-2">
          {isGrace ? (
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          ) : (
            <Lock className="w-4 h-4 text-destructive shrink-0" />
          )}
          <span>
            {isGrace ? (
              <>
                <strong>Subscription Renewal Due:</strong> 72-hour grace period active. Patient testing & report delivery remain fully unlocked. Please renew today to prevent workflow disruption.
              </>
            ) : (
              <>
                <strong>Subscription Expired:</strong> Accession intake of new patients is currently locked. Past records remain readable and printable.
              </>
            )}
          </span>
        </div>

        <Button
          size="sm"
          variant={isGrace ? 'outline' : 'default'}
          onClick={() => setModalOpen(true)}
          className="h-7 text-xs font-bold gap-1 cursor-pointer"
        >
          <span>{isGrace ? 'Renew Subscription' : 'Upgrade Plan Now'}</span>
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>

      <PlanUpgradeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultPlanSlug={subscription.planSlug}
      />
    </>
  );
}
