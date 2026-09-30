'use client';

import * as React from 'react';
import { Clock, Phone, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import { NotificationStatusBadge } from '../../notification-status-badge';
import type { NotificationLog } from '../../../types';

interface NotificationMobileCardProps {
  log: NotificationLog;
  onSelect: (log: NotificationLog) => void;
  onOpenWhatsApp: (log: NotificationLog) => void;
}

export function NotificationMobileCard({
  log,
  onSelect,
  onOpenWhatsApp,
}: NotificationMobileCardProps) {
  const isFailed = log.status === 'FAILED';
  const reportNumber = log.payload?.reportNumber as string | undefined;

  return (
    <div
      onClick={() => onSelect(log)}
      className="p-3.5 rounded-xl border border-border bg-card shadow-xs space-y-2.5 active:bg-muted/40 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-xs text-foreground truncate">
              {log.recipientName}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
              {log.recipientType}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground mt-0.5">
            <Phone className="w-3 h-3" />
            <span>{log.destination}</span>
          </div>
        </div>

        <NotificationStatusBadge
          status={log.status}
          deliveredAt={log.deliveredAt}
        />
      </div>

      {reportNumber && (
        <div className="flex items-center justify-between text-[11px] font-mono py-1 px-2 rounded bg-muted/50 border border-border/60">
          <span className="text-muted-foreground">Accession:</span>
          <span className="font-bold text-foreground">{reportNumber}</span>
        </div>
      )}

      {isFailed && log.failureReason && (
        <div className="p-2 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-[10px] text-red-600 dark:text-red-300 flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
          <span>{log.failureReason}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-border/60 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(log.createdAt).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onOpenWhatsApp(log);
          }}
          className="h-7 text-[11px] gap-1 text-[#25D366] border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 font-medium"
        >
          <WhatsAppIcon className="w-3 h-3 text-[#25D366]" />
          <span>{isFailed ? 'Retry Dispatch' : 'WhatsApp'}</span>
        </Button>
      </div>
    </div>
  );
}
