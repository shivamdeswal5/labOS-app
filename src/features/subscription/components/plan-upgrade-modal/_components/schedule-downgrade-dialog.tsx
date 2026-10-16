import { useState } from 'react';
import { Clock, ShieldAlert, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { PlatformPlan, BillingCycle, TenantSubscription } from '@/features/subscription/types';
import { useScheduleDowngradeMutation } from '@/features/subscription/api/subscription.mutations';

interface ScheduleDowngradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetPlan: PlatformPlan;
  cycle: BillingCycle;
  subscription: TenantSubscription | null;
  onSuccess: () => void;
}

export function ScheduleDowngradeDialog({
  isOpen,
  onClose,
  targetPlan,
  cycle,
  subscription,
  onSuccess,
}: ScheduleDowngradeDialogProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scheduleMutation = useScheduleDowngradeMutation();

  const renewalDateFormatted = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'your next renewal date';

  const handleConfirm = async () => {
    setErrorMessage(null);
    try {
      await scheduleMutation.mutateAsync({
        planSlug: targetPlan.slug,
        billingCycle: cycle,
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to schedule downgrade';
      setErrorMessage(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <Clock className="w-5 h-5" />
          <span className="text-base font-bold text-foreground">Schedule Plan Change</span>
        </div>
      }
      description={`Schedule a transition to ${targetPlan.name} at the end of your billing cycle.`}
    >
      <div className="space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            {errorMessage}
          </div>
        )}

        {/* Clinical Protection Guarantee Box */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Zero Shift Interruption Guarantee</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your laboratory will retain all <strong>{subscription?.planName || 'current'}</strong>{' '}
            features, technician seats, and accession quotas until{' '}
            <strong>{renewalDateFormatted}</strong>. No staff logins or sample deliveries will be
            interrupted mid-shift.
          </p>
        </div>

        {/* Change Comparison */}
        <div className="p-3.5 rounded-xl border border-border bg-muted/30 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Current Active Plan:</span>
            <span className="font-bold text-foreground">{subscription?.planName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Scheduled Tier:</span>
            <span className="font-bold text-foreground">
              {targetPlan.name} ({cycle.toLowerCase()})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Effective Date:</span>
            <span className="font-semibold text-foreground">{renewalDateFormatted}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border font-bold">
            <span className="text-foreground">Charged Today:</span>
            <span className="text-emerald-600 dark:text-emerald-400">₹0.00</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 text-xs h-9"
          >
            Keep Current Plan
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={scheduleMutation.isPending}
            className="flex-1 text-xs h-9 font-bold bg-amber-600 hover:bg-amber-700 text-white"
          >
            {scheduleMutation.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                <span>Scheduling...</span>
              </>
            ) : (
              'Confirm Downgrade'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
