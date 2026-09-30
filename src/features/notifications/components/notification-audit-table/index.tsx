'use client';

import * as React from 'react';
import {
  Search,
  Eye,
  FileCheck2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import { NotificationStatusBadge } from '../notification-status-badge';
import { NotificationMobileCard } from './_components/notification-mobile-card';
import { NotificationDetailModal } from './_components/notification-detail-modal';
import type { NotificationLog, NotificationChannel } from '../../types';

interface NotificationAuditTableProps {
  logs: NotificationLog[];
  onOpenWhatsAppModal: (report: {
    id: string;
    reportNumber: string;
    shareToken?: string;
    patient?: { name?: string; phone?: string };
  }) => void;
}

export function NotificationAuditTable({
  logs,
  onOpenWhatsAppModal,
}: NotificationAuditTableProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedChannel, setSelectedChannel] = React.useState<'ALL' | NotificationChannel>('ALL');
  const [selectedStatus, setSelectedStatus] = React.useState<'ALL' | 'DELIVERED_OR_READ' | 'SENT' | 'FAILED'>('ALL');
  const [activeLogForDetail, setActiveLogForDetail] = React.useState<NotificationLog | null>(null);

  // Filter pipeline
  const filteredLogs = React.useMemo(() => {
    return logs.filter((log) => {
      // 1. Channel
      if (selectedChannel !== 'ALL' && log.channel !== selectedChannel) {
        return false;
      }

      // 2. Status Group
      if (selectedStatus === 'DELIVERED_OR_READ') {
        if (log.status !== 'DELIVERED' && log.status !== 'READ') return false;
      } else if (selectedStatus === 'SENT') {
        if (log.status !== 'SENT') return false;
      } else if (selectedStatus === 'FAILED') {
        if (log.status !== 'FAILED') return false;
      }

      // 3. Search query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = log.recipientName.toLowerCase().includes(q);
        const destMatch = log.destination.toLowerCase().includes(q);
        const reportNum = (log.payload?.reportNumber as string | undefined)?.toLowerCase();
        const reportMatch = reportNum ? reportNum.includes(q) : false;

        if (!nameMatch && !destMatch && !reportMatch) return false;
      }

      return true;
    });
  }, [logs, selectedChannel, selectedStatus, searchQuery]);

  const handleOpenWhatsAppFromLog = (log: NotificationLog) => {
    const reportId = (log.payload?.reportId as string | undefined) || log.id;
    const reportNumber = (log.payload?.reportNumber as string | undefined) || `R-${log.id.slice(-4)}`;
    const shareToken = (log.payload?.shareToken as string | undefined) || `tok-${reportId}`;

    onOpenWhatsAppModal({
      id: reportId,
      reportNumber,
      shareToken,
      patient: {
        name: log.recipientName,
        phone: log.destination,
      },
    });
  };

  return (
    <div className="space-y-3">
      {/* Controls Bar */}
      <div className="p-3 rounded-xl bg-card border border-border shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient, phone (+91...), or barcode #..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-muted/50 border border-input rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Channel & Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {/* Channel Filters */}
          <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5">
            <button
              onClick={() => setSelectedChannel('ALL')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                selectedChannel === 'ALL'
                  ? 'bg-card text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedChannel('WHATSAPP')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
                selectedChannel === 'WHATSAPP'
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <WhatsAppIcon className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={() => setSelectedChannel('SMS')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                selectedChannel === 'SMS'
                  ? 'bg-card text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              SMS
            </button>
          </div>

          {/* Status Filters */}
          <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5">
            <button
              onClick={() => setSelectedStatus('ALL')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                selectedStatus === 'ALL'
                  ? 'bg-card text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setSelectedStatus('DELIVERED_OR_READ')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                selectedStatus === 'DELIVERED_OR_READ'
                  ? 'bg-card text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Delivered
            </button>
            <button
              onClick={() => setSelectedStatus('FAILED')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                selectedStatus === 'FAILED'
                  ? 'bg-red-600 text-white shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Failed
            </button>
          </div>
        </div>
      </div>

      {/* Desktop High-Density Table */}
      <div className="hidden sm:block rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 text-muted-foreground border-b border-border font-medium text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3.5">Recipient & Destination</th>
                <th className="py-2.5 px-3">Channel / Provider</th>
                <th className="py-2.5 px-3">Accession Report</th>
                <th className="py-2.5 px-3">Timestamps</th>
                <th className="py-2.5 px-3">Delivery Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No communication logs found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const reportNumber = log.payload?.reportNumber as string | undefined;
                  const isFailed = log.status === 'FAILED';

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-muted/40 transition-colors group"
                    >
                      <td className="py-2.5 px-3.5">
                        <div className="font-semibold text-foreground">
                          {log.recipientName}
                        </div>
                        <div className="text-[11px] font-mono text-muted-foreground">
                          {log.destination} • {log.recipientType}
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-medium text-foreground flex items-center gap-1">
                          {log.channel === 'WHATSAPP' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          )}
                          <span>{log.channel}</span>
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground">
                          {log.provider}
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        {reportNumber ? (
                          <div className="inline-flex items-center gap-1 font-mono font-bold text-foreground px-2 py-0.5 rounded bg-muted">
                            <FileCheck2 className="w-3 h-3 text-primary" />
                            <span>{reportNumber}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 font-mono text-[11px] text-muted-foreground">
                        <div>
                          Sent:{' '}
                          {log.sentAt
                            ? new Date(log.sentAt).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '—'}
                        </div>
                        {log.deliveredAt && (
                          <div className="text-emerald-600 dark:text-emerald-400 text-[10px]">
                            Delivered:{' '}
                            {new Date(log.deliveredAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        )}
                      </td>

                      <td className="py-2.5 px-3">
                        <NotificationStatusBadge
                          status={log.status}
                          deliveredAt={log.deliveredAt}
                        />
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveLogForDetail(log)}
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                            title="Inspect communication audit payload"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenWhatsAppFromLog(log)}
                            className="h-7 px-2 text-xs gap-1 text-[#25D366] hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border-emerald-500/30 font-medium"
                            title="Open WhatsApp Web to send or retry"
                          >
                            <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                            <span className="hidden md:inline">
                              {isFailed ? 'Retry' : 'WhatsApp'}
                            </span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Touch Cards View */}
      <div className="sm:hidden space-y-2.5">
        {filteredLogs.length === 0 ? (
          <div className="p-8 rounded-xl border border-border bg-card text-center text-xs text-muted-foreground">
            No communication logs found matching your filter criteria.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <NotificationMobileCard
              key={log.id}
              log={log}
              onSelect={setActiveLogForDetail}
              onOpenWhatsApp={handleOpenWhatsAppFromLog}
            />
          ))
        )}
      </div>

      {/* Audit Detail Modal */}
      <NotificationDetailModal
        log={activeLogForDetail}
        isOpen={Boolean(activeLogForDetail)}
        onClose={() => setActiveLogForDetail(null)}
        onOpenWhatsApp={handleOpenWhatsAppFromLog}
      />
    </div>
  );
}
