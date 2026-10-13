'use client';

import { BillingCycle } from '@/features/subscription/types';

interface BillingToggleProps {
  cycle: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
}

export function BillingToggle({ cycle, onChange }: BillingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-3 my-4">
      <div className="inline-flex p-1 bg-muted/80 rounded-xl border border-border">
        <button
          type="button"
          onClick={() => onChange('MONTHLY')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            cycle === 'MONTHLY'
              ? 'bg-card text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Monthly Billing
        </button>
        <button
          type="button"
          onClick={() => onChange('YEARLY')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
            cycle === 'YEARLY'
              ? 'bg-card text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>Yearly Billing</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            2 Months Free
          </span>
        </button>
      </div>
    </div>
  );
}
