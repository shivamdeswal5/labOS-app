'use client';

import * as React from 'react';
import { Lock, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AccessionLockBannerProps {
  onUpgradeClick: () => void;
}

export function AccessionLockBanner({ onUpgradeClick }: AccessionLockBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive shrink-0 mt-0.5 sm:mt-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-destructive">
                Subscription Expired — Accession Intake Locked
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-destructive/10 text-destructive border border-destructive/20">
                Action Required
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
              New patient registrations are currently locked. In adherence with laboratory safety standards, your existing worklists, test result entry, and report printing remain 100% accessible. Upgrade your plan to resume intake immediately.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80 pt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Instant activation via UPI & NetBanking • GST Invoice generated</span>
            </div>
          </div>
        </div>

        <Button
          type="button"
          onClick={onUpgradeClick}
          className="shrink-0 h-9 px-4 text-xs font-semibold gap-1.5 shadow-sm bg-primary hover:bg-primary/90"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Renew & Unlock Intake</span>
        </Button>
      </div>
    </div>
  );
}
