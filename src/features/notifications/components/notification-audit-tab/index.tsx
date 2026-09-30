'use client';

import * as React from 'react';
import { RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationKpiRibbon } from '../notification-kpi-ribbon';
import { NotificationAuditTable } from '../notification-audit-table';
import { useNotificationLogs, computeNotificationStats } from '../../api/use-notifications';

interface NotificationAuditTabProps {
  onOpenWhatsAppModal: (report: {
    id: string;
    reportNumber: string;
    shareToken?: string;
    patient?: { name?: string; phone?: string };
  }) => void;
}

export function NotificationAuditTab({ onOpenWhatsAppModal }: NotificationAuditTabProps) {
  const { data: logs = [], isLoading, isError, error, refetch } = useNotificationLogs();

  const stats = React.useMemo(() => computeNotificationStats(logs), [logs]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 gap-3 bg-card rounded-xl border border-border">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground font-mono">
          Loading communication and dispatch logs...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl space-y-3">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-semibold text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Failed to load communication audit logs</span>
        </div>
        <p className="text-xs text-red-600 dark:text-red-300">
          {error instanceof Error ? error.message : 'Unknown network error occurred.'}
        </p>
        <Button size="sm" variant="outline" onClick={() => refetch()} className="gap-1.5 text-xs">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 4-Card Telemetry Ribbon */}
      <NotificationKpiRibbon stats={stats} />

      {/* High-Density Audit Table */}
      <NotificationAuditTable
        logs={logs}
        onOpenWhatsAppModal={onOpenWhatsAppModal}
      />
    </div>
  );
}
