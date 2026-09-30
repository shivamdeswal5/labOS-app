'use client';

import * as React from 'react';
import { FlaskConical, Truck, Lightbulb } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import type { TestProfitabilityMetric } from '@/features/billing/types';

interface UnitMarginMobileCardProps {
  item: TestProfitabilityMetric;
}

export function UnitMarginMobileCard({ item }: UnitMarginMobileCardProps) {
  const isInHouse = item.executionType === 'IN_HOUSE';
  const isHighMargin = item.marginPercentage >= 65;
  const isLowMargin = item.marginPercentage < 50;

  return (
    <div className="bg-card border border-border/80 rounded-xl p-3.5 flex flex-col gap-3 shadow-2xs">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {item.panelCode && (
            <span className="font-mono text-[10px] font-bold text-foreground bg-muted px-2 py-0.5 rounded border border-border">
              {item.panelCode}
            </span>
          )}
          <span className="text-[11px] text-muted-foreground">{item.category}</span>
        </div>

        {/* Execution Type Pill */}
        {isInHouse ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-900/60 font-mono">
            <FlaskConical className="w-3 h-3 text-blue-600" />
            In-House
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 rounded-full border border-violet-200 dark:border-violet-900/60 font-mono">
            <Truck className="w-3 h-3 text-violet-600" />
            Outsourced
          </span>
        )}
      </div>

      {/* Investigation Name */}
      <div className="text-xs font-bold text-foreground">
        {item.panelName}
      </div>

      {/* Pricing & Unit Margin Breakdown */}
      <div className="grid grid-cols-3 gap-2 p-2.5 bg-muted/40 rounded-lg border border-border/60 text-center font-mono">
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground">Retail Fee</span>
          <span className="text-xs font-bold text-foreground">
            {formatCurrency(item.retailPrice)}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground">
            {isInHouse ? 'Reagent Cost' : 'B2B Fee'}
          </span>
          <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
            {formatCurrency(item.directCost)}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground">Unit Margin</span>
          <span
            className={`text-xs font-bold ${
              isHighMargin
                ? 'text-emerald-700 dark:text-emerald-400'
                : isLowMargin
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-foreground'
            }`}
          >
            {formatCurrency(item.netMargin)} ({item.marginPercentage}%)
          </span>
        </div>
      </div>

      {/* Progress Bar Visual Margin Meter */}
      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isHighMargin ? 'bg-emerald-500' : isLowMargin ? 'bg-amber-500' : 'bg-blue-500'
          }`}
          style={{ width: `${Math.min(100, Math.max(10, item.marginPercentage))}%` }}
        />
      </div>

      {/* Volume & Monthly Profit */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60 font-mono">
        <span className="text-muted-foreground text-[11px]">
          Volume: <strong className="text-foreground">{item.volumeMTD} tests/mo</strong>
        </span>
        <span className="font-bold text-emerald-700 dark:text-emerald-400">
          Profit: +{formatCurrency(item.totalProfitMTD)}
        </span>
      </div>

      {/* Strategic Recommendation */}
      {item.recommendationReason && (
        <div className="flex items-start gap-1.5 p-2 bg-background rounded border border-border/80 text-[11px] text-muted-foreground">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          <span>{item.recommendationReason}</span>
        </div>
      )}
    </div>
  );
}
