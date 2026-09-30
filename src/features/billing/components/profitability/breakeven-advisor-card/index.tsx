'use client';

import * as React from 'react';
import { Lightbulb, ArrowUpRight, ShieldCheck, Zap } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import type { TestProfitabilityMetric } from '@/features/billing/types';

interface BreakevenAdvisorCardProps {
  metrics: TestProfitabilityMetric[];
}

export function BreakevenAdvisorCard({ metrics }: BreakevenAdvisorCardProps) {
  // Identify key tests
  const switchCandidates = React.useMemo(
    () =>
      metrics.filter(
        (m) =>
          m.strategicRecommendation === 'SWITCH_TO_IN_HOUSE' ||
          (m.executionType === 'OUTSOURCED' && m.breakevenVolume && m.volumeMTD >= m.breakevenVolume)
      ),
    [metrics]
  );

  const outsourcedShields = React.useMemo(
    () => metrics.filter((m) => m.strategicRecommendation === 'KEEP_OUTSOURCED'),
    [metrics]
  );

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              In-House vs Outsourced Breakeven Advisor
              <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/60 font-mono">
                Smart Dispatch AI
              </span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Unit economics engine detecting analyzer payback thresholds & outsourced capex protection
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Card 1: Switch to In-house recommendation */}
        {switchCandidates.map((candidate) => (
          <div
            key={candidate.panelId}
            className="rounded-xl border border-amber-200 dark:border-amber-900/70 bg-linear-to-br from-amber-500/5 via-transparent to-amber-500/10 p-3.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded font-mono flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  Opportunity: Switch to Bench
                </span>
                <span className="text-xs font-mono font-bold text-amber-800 dark:text-amber-200">
                  {candidate.panelCode}
                </span>
              </div>

              <h4 className="text-sm font-bold text-foreground mt-2">{candidate.panelName}</h4>

              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {candidate.recommendationReason ||
                  'Current monthly volume surpasses economic threshold. Transitioning to an in-house bench yields immediate COGS savings.'}
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Volume MTD:</span>
                <span className="font-bold text-foreground">{candidate.volumeMTD} tests</span>
                {candidate.breakevenVolume && (
                  <span className="text-muted-foreground/80 text-[11px]">
                    (Breakeven: {candidate.breakevenVolume}/mo)
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  +₹7,450/mo Margin
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Card 2: Strategic Outsourcing Shield */}
        {outsourcedShields.slice(0, 1).map((shield) => (
          <div
            key={shield.panelId}
            className="rounded-xl border border-sky-200 dark:border-sky-900/70 bg-linear-to-br from-sky-500/5 via-transparent to-sky-500/10 p-3.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300 bg-sky-100 dark:bg-sky-900/50 px-2 py-0.5 rounded font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                  Capital Protection
                </span>
                <span className="text-xs font-mono font-bold text-sky-800 dark:text-sky-200">
                  {shield.panelCode}
                </span>
              </div>

              <h4 className="text-sm font-bold text-foreground mt-2">{shield.panelName}</h4>

              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {shield.recommendationReason ||
                  'Maintaining reference lab routing prevents unamortized capital lock-in and reagent shelf-life expiry waste.'}
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-sky-200/60 dark:border-sky-900/40 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Volume MTD:</span>
                <span className="font-bold text-foreground">{shield.volumeMTD} tests</span>
                <span className="text-muted-foreground/80 text-[11px]">
                  (Wholesale: {formatCurrency(shield.directCost)})
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-sky-700 dark:text-sky-300 font-semibold">
                  Saved ₹18L Capex
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
