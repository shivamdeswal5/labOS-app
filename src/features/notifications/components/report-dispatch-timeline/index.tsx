'use client';

import * as React from 'react';
import {
  MessageSquare,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  AlertTriangle,
  Check,
  CheckCheck,
  Clock,
  User,
  Stethoscope,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import { Button } from '@/components/ui/button';
import type { NotificationLog, NotificationChannel, NotificationStatus } from '../../types';
import { DEMO_NOTIFICATION_LOGS } from '@/lib/demo-data/notifications';
import { notificationsService } from '../../api/notifications.service';
import { useResendNotification } from '../../api/use-notifications';

function formatIST(iso: string | null | undefined): string {
  if (!iso) return '\u2014';
  return new Date(iso).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function relativeTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
}

function ChannelIcon({ channel }: { channel: NotificationChannel }) {
  if (channel === 'WHATSAPP') return <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />;
  return <MessageSquare className="w-3.5 h-3.5 text-blue-500" />;
}

function RecipientIcon({ type }: { type: NotificationLog['recipientType'] }) {
  if (type === 'DOCTOR') return <Stethoscope className="w-3 h-3 text-sky-500" />;
  return <User className="w-3 h-3 text-zinc-400" />;
}

function StatusVisual({ status }: { status: NotificationStatus }) {
  switch (status) {
    case 'READ':
      return <CheckCheck className="w-3.5 h-3.5 text-sky-500" />;
    case 'DELIVERED':
      return <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />;
    case 'SENT':
      return <Check className="w-3.5 h-3.5 text-zinc-400" />;
    case 'PENDING':
      return <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />;
    case 'FAILED':
      return <AlertTriangle className="w-3.5 h-3.5 text-red-500" />;
    default:
      return null;
  }
}

const STATUS_LABEL: Record<NotificationStatus, string> = {
  READ: 'Read',
  DELIVERED: 'Delivered',
  SENT: 'Sent',
  PENDING: 'Queued',
  FAILED: 'Failed',
};

const STATUS_COLORS: Record<NotificationStatus, string> = {
  READ: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800',
  DELIVERED: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
  SENT: 'text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700',
  PENDING: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
  FAILED: 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
};

function TimelineEvent({ log, isLast }: { log: NotificationLog; isLast: boolean }) {
  const resend = useResendNotification();
  const [resendDone, setResendDone] = React.useState(false);

  const handleResend = async () => {
    await resend.mutateAsync({ id: log.id });
    setResendDone(true);
    setTimeout(() => setResendDone(false), 4000);
  };

  const sentLabel = formatIST(log.sentAt ?? log.createdAt);
  const deliveredLabel = log.deliveredAt ? formatIST(log.deliveredAt) : null;
  const age = relativeTime(log.sentAt ?? log.createdAt);

  return (
    <div className="relative flex gap-3">
      {!isLast && <div className="absolute left-[13px] top-7 bottom-0 w-px bg-border" />}

      <div className="relative z-10 flex-shrink-0 w-7 h-7 mt-0.5 rounded-full border-2 border-border bg-card flex items-center justify-center">
        <ChannelIcon channel={log.channel} />
      </div>

      <div className="flex-1 pb-5">
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-foreground">
            <RecipientIcon type={log.recipientType} />
            {log.recipientName}
          </span>
          <span className="text-muted-foreground/40 text-xs">·</span>
          <span className="font-mono text-[11px] text-muted-foreground">{log.destination}</span>
          <span className="text-muted-foreground/40 text-xs">·</span>
          <span className="text-[11px] text-muted-foreground" title={sentLabel}>{age}</span>
          <span className={`ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-mono font-bold ${STATUS_COLORS[log.status]}`}>
            <StatusVisual status={log.status} />
            {STATUS_LABEL[log.status]}
          </span>
        </div>

        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed mb-1.5">
          {log.messageContent}
        </p>

        <div className="flex flex-wrap gap-3 text-[10px] font-mono text-muted-foreground/70">
          <span>
            <span className="text-muted-foreground/50 uppercase tracking-wide mr-1">Sent</span>
            {sentLabel}
          </span>
          {deliveredLabel && (
            <span>
              <span className="text-muted-foreground/50 uppercase tracking-wide mr-1">Delivered</span>
              {deliveredLabel}
            </span>
          )}
          <span className="ml-auto">
            <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground/60 text-[10px] uppercase tracking-wide font-mono">
              {log.notificationType.replace(/_/g, ' ')}
            </span>
          </span>
        </div>

        {log.status === 'FAILED' && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {log.failureReason ?? 'Dispatch failed — verify phone number.'}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void handleResend()}
              disabled={resend.isPending || resendDone}
              className="h-6 text-[11px] gap-1 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              {resend.isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : resendDone ? (
                <Check className="w-3 h-3" />
              ) : (
                <RotateCcw className="w-3 h-3" />
              )}
              {resendDone ? 'Resent' : 'Retry'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface ReportDispatchTimelineProps {
  reportId: string;
  defaultOpen?: boolean;
}

export function ReportDispatchTimeline({ reportId, defaultOpen = false }: ReportDispatchTimelineProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const [logs, setLogs] = React.useState<NotificationLog[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasFetched, setHasFetched] = React.useState(false);

  const loadLogs = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await notificationsService.list({ reportId, limit: 50 });
      if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
        setLogs(response.data);
      } else {
        setLogs(DEMO_NOTIFICATION_LOGS.filter((l) => l.payload?.reportId === reportId));
      }
    } catch {
      setLogs(DEMO_NOTIFICATION_LOGS.filter((l) => l.payload?.reportId === reportId));
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  }, [reportId]);

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next && !hasFetched) void loadLogs();
  };

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasFetched(false);
    void loadLogs();
  };

  // Eagerly fetch when defaultOpen=true on mount, without triggering
  // "setState synchronously in effect" lint rule — the async boundary ensures
  // state updates happen asynchronously after the effect body returns.
  const didMountFetch = React.useRef(false);
  React.useEffect(() => {
    if (defaultOpen && !didMountFetch.current) {
      didMountFetch.current = true;
      void loadLogs();
    }
  // loadLogs is stable (useCallback with [reportId]), defaultOpen is a prop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const failedCount = logs.filter((l) => l.status === 'FAILED').length;
  const readCount = logs.filter((l) => l.status === 'READ').length;

  return (
    <div className="print:hidden rounded-xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
      >
        <WhatsAppIcon className="w-4 h-4 text-[#25D366] shrink-0" />
        <span className="text-sm font-semibold text-foreground">Dispatch &amp; Delivery Timeline</span>

        {!isOpen && logs.length > 0 && (
          <div className="flex items-center gap-1.5 ml-1">
            <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[11px] font-mono">
              {logs.length} dispatch{logs.length !== 1 ? 'es' : ''}
            </span>
            {readCount > 0 && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 text-[11px] font-mono border border-sky-200 dark:border-sky-800">
                <CheckCheck className="w-3 h-3" /> {readCount} read
              </span>
            )}
            {failedCount > 0 && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-[11px] font-mono border border-red-200 dark:border-red-800">
                <AlertTriangle className="w-3 h-3" /> {failedCount} failed
              </span>
            )}
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          {isOpen && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleRefresh}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRefresh(e as unknown as React.MouseEvent); }}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-border px-4 pt-4 pb-1">
          {isLoading && (
            <div className="flex items-center gap-2 py-8 justify-center text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading notification history...
            </div>
          )}

          {!isLoading && logs.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <WhatsAppIcon className="w-5 h-5 text-[#25D366]/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No dispatches yet</p>
              <p className="text-xs text-muted-foreground/60 max-w-xs">
                Use the WhatsApp button above to send this report to the patient or referring doctor.
              </p>
            </div>
          )}

          {!isLoading && logs.length > 0 && (
            <div>
              {logs.map((log, idx) => (
                <TimelineEvent key={log.id} log={log} isLast={idx === logs.length - 1} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
