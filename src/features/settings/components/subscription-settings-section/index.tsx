'use client';

import { useMemo, useState } from 'react';
import {
  CreditCard,
  Sparkles,
  Calendar,
  CheckCircle2,
  Building2,
  Clock,
  Shield,
} from 'lucide-react';
import {
  useTenantSubscriptionQuery,
} from '@/features/subscription/api/subscription.queries';
import { useCancelDowngradeMutation } from '@/features/subscription/api/subscription.mutations';
import { PlanUpgradeModal } from '@/features/subscription/components/plan-upgrade-modal';
import { BillingHistorySection } from '@/features/subscription/components/billing-history-section';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/formatters';

export function SubscriptionSettingsSection() {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const { data: subscription, isLoading: isSubLoading } = useTenantSubscriptionQuery();
  const cancelDowngradeMutation = useCancelDowngradeMutation();

  const formattedPeriodEnd = useMemo(() => {
    if (!subscription?.currentPeriodEnd && !subscription?.trialEnd) return null;
    const targetDate = subscription.currentPeriodEnd || subscription.trialEnd;
    return formatDateTime(targetDate);
  }, [subscription]);

  const statusBadge = useMemo(() => {
    if (!subscription) return null;
    switch (subscription.status) {
      case 'ACTIVE':
        return <Badge variant="success">Active Subscription</Badge>;
      case 'TRIALING':
        return <Badge variant="warning">14-Day Free Trial</Badge>;
      case 'GRACE_PERIOD':
        return <Badge variant="destructive">72-Hour Grace Period</Badge>;
      case 'LOCKED':
        return <Badge variant="destructive">Subscription Locked</Badge>;
      default:
        return <Badge variant="outline">{subscription.status}</Badge>;
    }
  }, [subscription]);

  const entitlementsList = useMemo(() => {
    if (!subscription?.effectiveEntitlements) return [];
    const e = subscription.effectiveEntitlements;
    const list: string[] = [];
    if (e.maxUsers) list.push(`Up to ${e.maxUsers} Staff & Technician Accounts`);
    if (e.maxMonthlySamples) {
      list.push(
        e.maxMonthlySamples >= 100000
          ? 'Unlimited Monthly Sample Accessions'
          : `Up to ${e.maxMonthlySamples.toLocaleString('en-IN')} Monthly Samples`,
      );
    }
    if (e.barcodePrinting) list.push('50×25mm Thermal Barcode Printing (Code-128)');
    if (e.letterheadAlignment) list.push('0.1mm Pre-Printed Letterhead Alignment Ruler');
    if (e.whatsappDelivery) list.push('1-Click WhatsApp PDF Delivery & Verified QR Tokens');
    if (e.referralDoctorLedger) list.push('Doctor Referral Commission Ledger (Section 194H TDS)');
    if (e.multiCounterLedger) list.push('Multi-Counter Cash Drawers & Reconciliation');
    if (e.slaSupport) list.push('Dedicated Priority Support Desk');
    return list;
  }, [subscription]);

  if (isSubLoading) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
        Loading subscription &amp; platform licensing details...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scheduled Downgrade Warning Banner */}
      {subscription?.scheduledPlanName && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              Downgrade to <strong>{subscription.scheduledPlanName}</strong> is scheduled for{' '}
              <strong>
                {formatDateTime(subscription.scheduledAt || subscription.currentPeriodEnd)}
              </strong>
              . All current {subscription.planName} features and limits remain active until renewal.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              id="btn-cancel-downgrade-banner"
              type="button"
              size="sm"
              variant="outline"
              onClick={() => cancelDowngradeMutation.mutate()}
              disabled={cancelDowngradeMutation.isPending}
              className="text-xs h-7 border-amber-500/40 hover:bg-amber-500/20 text-amber-800 dark:text-amber-200 font-bold"
            >
              {cancelDowngradeMutation.isPending ? 'Cancelling...' : 'Cancel Downgrade'}
            </Button>
            <Button
              id="btn-manage-transition"
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsUpgradeModalOpen(true)}
              className="text-xs h-7 bg-amber-500/20 border-amber-500/40 hover:bg-amber-500/30 text-amber-900 dark:text-amber-100 font-bold"
            >
              Manage
            </Button>
          </div>
        </div>
      )}

      {/* Overview Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">
                {subscription?.planName || 'Standard Laboratory'}
              </h3>
              {statusBadge}
            </div>
            <p className="text-xs text-muted-foreground">
              Direct access to LabOS clinical workstation engines, thermal printing, and WhatsApp report delivery.
            </p>
          </div>

          <Button
            id="btn-change-plan-upgrade"
            variant="default"
            size="sm"
            onClick={() => setIsUpgradeModalOpen(true)}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Change Plan / Upgrade</span>
          </Button>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-muted/40 border border-border space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>Days Remaining</span>
            </div>
            <div className="text-2xl font-extrabold text-foreground tabular-nums">
              {subscription?.daysRemaining ?? 0} Days
            </div>
            <div className="text-[11px] text-muted-foreground">
              {subscription?.status === 'TRIALING' ? 'Until trial conclusion' : 'Until next renewal'}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/40 border border-border space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>Renewal / Expiry Date</span>
            </div>
            <div className="text-sm font-bold text-foreground">
              {formattedPeriodEnd || 'Active'}
            </div>
            <div className="text-[11px] text-muted-foreground">
              Standard IST (Asia/Kolkata)
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/40 border border-border space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CreditCard className="w-3.5 h-3.5 text-primary" />
              <span>Payment Cycle</span>
            </div>
            <div className="text-sm font-bold text-foreground">
              {subscription?.billingCycle || 'MONTHLY'}
            </div>
            <div className="text-[11px] text-muted-foreground">
              Domestic UPI &amp; NetBanking
            </div>
          </div>
        </div>

        {/* Current Plan Capabilities */}
        {entitlementsList.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Included in Your Current Tier
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-foreground">
              {entitlementsList.map((feat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Admin Manual Activation & Corporate Bank Transfer Callout */}
      <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-foreground">
              Corporate Bank Transfer &amp; Admin Manual Activation
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              If your accounts department prefers paying via NEFT/RTGS or requires a B2B Tax Invoice with input credit before disbursement: our superadmin team can instantly credit your subscription against your payment UTR number via the central administrative console.
            </p>
            <div className="pt-2 flex items-center gap-4 text-[11px] font-mono text-muted-foreground">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span>Anti-Fraud UTR Uniqueness Guard Active</span>
              </span>
              <span>•</span>
              <span>Support Desk: +91 98765 43210</span>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Invoices & Billing Ledger */}
      <BillingHistorySection />

      {/* Upgrade Modal */}
      <PlanUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        defaultPlanSlug={subscription?.planSlug}
      />
    </div>
  );
}
