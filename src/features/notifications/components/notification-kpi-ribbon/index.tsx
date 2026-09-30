'use client';

import * as React from 'react';
import {
  MessageSquare,
  CheckCheck,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import type { NotificationSummaryStats } from '../../types';

interface NotificationKpiRibbonProps {
  stats: NotificationSummaryStats;
}

export function NotificationKpiRibbon({ stats }: NotificationKpiRibbonProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. Total Dispatched MTD */}
      <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
            Total Dispatched MTD
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-foreground">
              {stats.totalDispatched}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              Patient reports
            </span>
          </div>
        </div>
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <MessageSquare className="w-4 h-4" />
        </div>
      </div>

      {/* 2. WhatsApp Direct Share */}
      <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
            WhatsApp Delivery
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {stats.whatsAppCount}
            </span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-mono font-medium">
              Free Web & App
            </span>
          </div>
        </div>
        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Zap className="w-4 h-4" />
        </div>
      </div>

      {/* 3. Delivery Success Rate */}
      <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
            Delivered & Read
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-sky-600 dark:text-sky-400">
              {stats.deliveryRatePercent}%
            </span>
            <span className="text-[10px] text-sky-700 dark:text-sky-300 font-mono">
              {stats.readCount} verified read
            </span>
          </div>
        </div>
        <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
          <CheckCheck className="w-4 h-4" />
        </div>
      </div>

      {/* 4. Action Required / Failed Numbers */}
      <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
            Needs Verification
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-xl font-bold font-mono ${
                stats.failedCount > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-muted-foreground'
              }`}
            >
              {stats.failedCount}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {stats.failedCount > 0 ? 'Invalid phone numbers' : 'All numbers verified'}
            </span>
          </div>
        </div>
        <div
          className={`p-2 rounded-lg ${
            stats.failedCount > 0
              ? 'bg-red-500/10 text-red-600 dark:text-red-400 animate-pulse'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
