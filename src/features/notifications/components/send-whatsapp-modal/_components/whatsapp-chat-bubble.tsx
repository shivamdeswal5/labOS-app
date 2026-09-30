'use client';

import * as React from 'react';
import { ShieldCheck, FileText, ExternalLink, CheckCheck } from 'lucide-react';

interface WhatsAppChatBubbleProps {
  labName: string;
  patientName: string;
  reportNumber: string;
  testsSummary: string;
  shareUrl: string;
  timeString: string;
}

export function WhatsAppChatBubble({
  labName,
  patientName,
  reportNumber,
  testsSummary,
  shareUrl,
  timeString,
}: WhatsAppChatBubbleProps) {
  return (
    <div className="rounded-xl overflow-hidden border border-emerald-500/30 bg-[#efeae2] dark:bg-zinc-950 p-3 sm:p-4 shadow-inner">
      {/* WhatsApp Chat Header Mock */}
      <div className="flex items-center gap-2 pb-2 mb-3 border-b border-zinc-300 dark:border-zinc-800">
        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
          {labName[0] || 'L'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
              {labName}
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          </div>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Official Lab Dispatch</span>
        </div>
      </div>

      {/* WhatsApp Message Bubble */}
      <div className="max-w-[90%] sm:max-w-[85%] bg-[#d9fdd3] dark:bg-[#005c4b] text-zinc-900 dark:text-zinc-100 rounded-lg rounded-tl-none p-3 shadow-xs space-y-2 text-xs relative">
        <p className="leading-relaxed">
          Dear <strong>{patientName}</strong>,
        </p>

        <p className="leading-relaxed">
          Your diagnostic report (<strong>#{reportNumber}</strong>) from <strong>{labName}</strong> is verified and ready for download.
        </p>

        {testsSummary && (
          <div className="py-1 px-2 rounded bg-black/5 dark:bg-white/10 text-[11px] font-mono">
            📋 <strong>Investigation:</strong> {testsSummary}
          </div>
        )}

        {/* Embedded Public Link Card */}
        <div className="p-2.5 rounded-md bg-white dark:bg-zinc-900 border border-emerald-500/20 shadow-xs flex items-center justify-between gap-2 mt-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-[11px] truncate">Verified Medical Report.pdf</div>
              <div className="text-[10px] text-muted-foreground truncate">{shareUrl}</div>
            </div>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        </div>

        <p className="text-[10px] text-zinc-600 dark:text-zinc-300 italic pt-1">
          🔒 Digitally authenticated under NABL ISO 15189 guidelines.
        </p>

        {/* Timestamp & Double Blue Ticks */}
        <div className="flex items-center justify-end gap-1 text-[10px] text-zinc-500 dark:text-zinc-300 pt-0.5">
          <span>{timeString}</span>
          <CheckCheck className="w-3.5 h-3.5 text-sky-500" />
        </div>
      </div>
    </div>
  );
}
