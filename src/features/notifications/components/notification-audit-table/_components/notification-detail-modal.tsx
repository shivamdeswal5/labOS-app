'use client';

import * as React from 'react';
import {
  FileText,
  Clock,
  Send,
  Copy,
  Check,
  AlertTriangle,
  Link2,
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { NotificationStatusBadge } from '../../notification-status-badge';
import type { NotificationLog } from '../../../types';

interface NotificationDetailModalProps {
  log: NotificationLog | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenWhatsApp: (log: NotificationLog) => void;
}

export function NotificationDetailModal({
  log,
  isOpen,
  onClose,
  onOpenWhatsApp,
}: NotificationDetailModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!log) return null;

  const handleCopyMessage = async () => {
    await navigator.clipboard.writeText(log.messageContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isFailed = log.status === 'FAILED';
  const reportUrl = log.payload?.reportUrl as string | undefined;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <span>Communication Audit Record</span>
        </div>
      }
      description={`Audit trail for ${log.channel} dispatch to ${log.recipientName}`}
    >
      <div className="space-y-4 py-1 text-xs">
        {/* Recipient & Status Overview */}
        <div className="p-3 rounded-xl bg-card border border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm text-foreground">
              {log.recipientName}
            </span>
            <NotificationStatusBadge
              status={log.status}
              deliveredAt={log.deliveredAt}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1 border-t border-border/60">
            <div>
              <span className="text-muted-foreground block text-[10px]">Destination:</span>
              <span className="font-bold text-foreground">{log.destination}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">Channel & Provider:</span>
              <span className="text-foreground">{log.channel} • {log.provider}</span>
            </div>
          </div>
        </div>

        {/* Failure reason if failed */}
        {isFailed && log.failureReason && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <span>Diagnostic Error Reason</span>
            </div>
            <p className="text-[11px] leading-relaxed">{log.failureReason}</p>
          </div>
        )}

        {/* Message Content Preview */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="font-medium text-[11px]">Rendered Message Content</span>
            <button
              onClick={handleCopyMessage}
              className="text-[10px] text-primary hover:underline flex items-center gap-1"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="p-3 rounded-lg bg-muted/60 border border-border font-mono text-[11px] leading-relaxed whitespace-pre-wrap select-all">
            {log.messageContent}
          </div>
        </div>

        {/* Delivery Timestamps */}
        <div className="p-3 rounded-xl bg-muted/30 border border-border space-y-1.5 text-[11px] font-mono">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Queued / Created:
            </span>
            <span>{new Date(log.createdAt).toLocaleString('en-IN')}</span>
          </div>

          {log.sentAt && (
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Dispatched via Web:</span>
              <span>{new Date(log.sentAt).toLocaleString('en-IN')}</span>
            </div>
          )}

          {log.deliveredAt && (
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
              <span>Device Delivered:</span>
              <span>{new Date(log.deliveredAt).toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
        {reportUrl ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.open(reportUrl, '_blank')}
            className="text-xs h-8 gap-1.5"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Open Public Report</span>
          </Button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs h-8"
          >
            Close
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => {
              onClose();
              onOpenWhatsApp(log);
            }}
            className="text-xs h-8 gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isFailed ? 'Retry Dispatch' : 'Open in WhatsApp'}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
