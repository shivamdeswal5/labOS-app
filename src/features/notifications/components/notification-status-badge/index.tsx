'use client';

import * as React from 'react';
import { Clock, Check, CheckCheck, AlertCircle } from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import type { NotificationStatus } from '../../types';

interface NotificationStatusBadgeProps {
  status?: NotificationStatus | null;
  compact?: boolean;
  className?: string;
  deliveredAt?: string | null;
}

export function NotificationStatusBadge({
  status,
  compact = false,
  className = '',
  deliveredAt,
}: NotificationStatusBadgeProps) {
  if (!status) {
    if (compact) {
      return (
        <span
          className={`inline-flex items-center justify-center p-1 rounded-md text-muted-foreground/60 hover:text-emerald-600 transition-colors ${className}`}
          title="Not dispatched yet — click to send via WhatsApp"
        >
          <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-muted text-muted-foreground border border-border/60 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
        <span>Unsent</span>
      </span>
    );
  }

  const formattedTime = deliveredAt
    ? new Date(deliveredAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : null;

  switch (status) {
    case 'READ':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 ${className}`}
          title={`Read by patient${formattedTime ? ` at ${formattedTime}` : ''}`}
        >
          <CheckCheck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
          {!compact && <span>Read</span>}
        </span>
      );

    case 'DELIVERED':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 ${className}`}
          title={`Delivered to device${formattedTime ? ` at ${formattedTime}` : ''}`}
        >
          <CheckCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          {!compact && <span>Delivered</span>}
        </span>
      );

    case 'SENT':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 ${className}`}
          title="Dispatched from laboratory"
        >
          <Check className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          {!compact && <span>Sent</span>}
        </span>
      );

    case 'PENDING':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 ${className}`}
          title="Queued for dispatch"
        >
          <Clock className="w-3 h-3 text-amber-500 animate-spin shrink-0" />
          {!compact && <span>Queued</span>}
        </span>
      );

    case 'FAILED':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 ${className}`}
          title="Dispatch failed — click to verify phone number and retry"
        >
          <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
          {!compact && <span>Failed</span>}
        </span>
      );

    default:
      return null;
  }
}
