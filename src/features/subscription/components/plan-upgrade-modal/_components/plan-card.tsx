'use client';

import * as React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { PlatformPlan, BillingCycle } from '@/features/subscription/types';
import { Button } from '@/components/ui/button';

interface PlanCardProps {
  plan: PlatformPlan;
  cycle: BillingCycle;
  isCurrent: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onCheckout: () => void;
  isLoading: boolean;
}

export function PlanCard({
  plan,
  cycle,
  isCurrent,
  isSelected,
  onSelect,
  onCheckout,
  isLoading,
}: PlanCardProps) {
  const isGrowth = plan.slug === 'GROWTH';
  const price = cycle === 'YEARLY' ? plan.yearlyPriceInr : plan.monthlyPriceInr;
  const priceLabel = cycle === 'YEARLY' ? '₹' + price.toLocaleString('en-IN') + '/yr' : '₹' + price.toLocaleString('en-IN') + '/mo';

  const features = React.useMemo(() => {
    if (plan.slug === 'STARTER') {
      return [
        'Up to 2 Staff Logins (DMLT/Owner)',
        'Up to 500 Patient Samples/Month',
        'Thermal Barcode Labels (50×25mm)',
        'A4 Pre-printed Letterhead Calibration',
        'WhatsApp PDF Report Sharing',
        'Doctor Referral Commission Ledger',
      ];
    }
    if (plan.slug === 'GROWTH') {
      return [
        'Up to 6 Staff Logins (Techs + Pathologists)',
        'Up to 2,000 Patient Samples/Month',
        'All Starter Capabilities',
        'NABL 5.8 Reference Lab Send-Outs',
        'USB/Bluetooth Barcode Scanner Sync',
        'Diagnostic Unit P&L & Profit Margins',
        'Dual Verification Digital Signatures',
      ];
    }
    return [
      'Up to 20 Staff Accounts',
      'Up to 10,000 Samples/Month',
      'All Growth Capabilities',
      'Home Collection GPS Dispatch & Workstation',
      'Multi-Counter Cash & UPI Day Book',
      'Priority 1-Hour WhatsApp SLA Support',
    ];
  }, [plan.slug]);

  return (
    <div
      onClick={onSelect}
      className={`relative rounded-2xl p-5 border transition-all flex flex-col justify-between cursor-pointer ${
        isSelected
          ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-md'
          : 'border-border bg-card hover:border-border/80 hover:bg-muted/30'
      } ${isGrowth && !isSelected ? 'border-primary/40' : ''}`}
    >
      {/* Featured Badge */}
      {isGrowth && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-sm">
          <Sparkles className="w-3 h-3" />
          <span>Most Popular</span>
        </div>
      )}

      <div>
        {/* Plan Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-foreground">{plan.name}</h3>
          {isCurrent && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
              Current Plan
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{plan.description}</p>

        {/* Price Display */}
        <div className="my-4">
          <div className="text-2xl font-black text-foreground tracking-tight">{priceLabel}</div>
          <div className="text-[11px] text-muted-foreground">
            {cycle === 'YEARLY' ? 'Billed annually (Includes 2 free months)' : 'Billed monthly, cancel anytime'}
          </div>
        </div>

        {/* Feature List */}
        <div className="space-y-2 border-t border-border/60 pt-4">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Included Capabilities
          </div>
          <ul className="space-y-1.5">
            {features.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-foreground/90">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-6 pt-4 border-t border-border/40">
        <Button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCheckout();
          }}
          disabled={isLoading || isCurrent}
          variant={isSelected ? 'default' : 'outline'}
          className="w-full text-xs font-bold h-9"
        >
          {isLoading && isSelected ? (
            'Preparing Checkout...'
          ) : isCurrent ? (
            'Current Plan'
          ) : (
            `Upgrade to ${plan.slug}`
          )}
        </Button>
      </div>
    </div>
  );
}
