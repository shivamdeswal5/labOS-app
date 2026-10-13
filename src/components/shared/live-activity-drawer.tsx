'use client';

import { useEffect, useState } from 'react';
import {
  X,
  Trash2,
  Play,
  CheckCircle2,
  AlertOctagon,
  Truck,
  Receipt,
  Layers,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Bell,
  Code2,
  Radio,
} from 'lucide-react';
import { useRealtime } from '@/providers/realtime-provider';
import { RealtimeChannelEnum, type EventMessage } from '@/features/realtime/types';
import { Button } from '@/components/ui/button';

export function LiveActivityDrawer() {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    status,
    events,
    clearEvents,
    simulateEvent,
  } = useRealtime();

  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);
  const isDev = process.env.NODE_ENV !== 'production';

  // Handle Escape key to dismiss drawer
  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDrawerOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, setIsDrawerOpen]);

  if (!isDrawerOpen) return null;

  const toggleExpand = (traceId: string) => {
    setExpandedTraceId((prev) => (prev === traceId ? null : traceId));
  };

  const getEventBadge = (event: RealtimeChannelEnum) => {
    switch (event) {
      case RealtimeChannelEnum.ALERT_CRITICAL_VALUE:
        return {
          icon: <AlertOctagon className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />,
          title: 'Critical Panic Value',
          color: 'border-red-300 dark:border-red-900 bg-red-50/60 dark:bg-red-950/30',
        };
      case RealtimeChannelEnum.REPORT_FINALIZED:
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />,
          title: 'Report Finalized & Verified',
          color: 'border-emerald-300 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/30',
        };
      case RealtimeChannelEnum.REPORT_CREATED:
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />,
          title: 'New Patient Report Registered',
          color: 'border-border bg-card',
        };
      case RealtimeChannelEnum.COLLECTION_STATUS_UPDATED:
      case RealtimeChannelEnum.COLLECTION_CREATED:
      case RealtimeChannelEnum.COLLECTION_ASSIGNED:
        return {
          icon: <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />,
          title: 'Phlebotomy Cold-Chain Update',
          color: 'border-blue-300 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30',
        };
      case RealtimeChannelEnum.BILLING_PAYMENT_RECORDED:
        return {
          icon: <Receipt className="w-4 h-4 text-primary shrink-0" />,
          title: 'Counter Payment Recorded',
          color: 'border-border bg-card',
        };
      case RealtimeChannelEnum.SUBSCRIPTION_ACTIVATED:
        return {
          icon: <ShieldCheck className="w-4 h-4 text-primary shrink-0" />,
          title: 'Subscription Activated',
          color: 'border-primary/40 bg-primary/5',
        };
      default:
        return {
          icon: <Radio className="w-4 h-4 text-muted-foreground shrink-0" />,
          title: event,
          color: 'border-border bg-card',
        };
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsDrawerOpen(false);
      }}
    >
      <div className="w-full max-w-md bg-card border-l border-border h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-border bg-card flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">
                Clinical Alerts & Activity
              </h2>
              <div className="flex items-center gap-2 text-[11px] font-mono mt-0.5">
                <span
                  className={`inline-flex items-center gap-1 font-semibold ${
                    status === 'CONNECTED'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : status === 'RECONNECTING'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-muted-foreground'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      status === 'CONNECTED'
                        ? 'bg-emerald-500 animate-pulse'
                        : status === 'RECONNECTING'
                        ? 'bg-amber-500 animate-ping'
                        : 'bg-zinc-400'
                    }`}
                  />
                  {status === 'CONNECTED'
                    ? 'Live Telemetry Active'
                    : status === 'RECONNECTING'
                    ? 'Reconnecting Telemetry...'
                    : 'Offline Telemetry'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            aria-label="Close activity drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chronological Event Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold text-muted-foreground">
              Clinical Feed ({events.length})
            </span>
            {events.length > 0 && (
              <button
                type="button"
                onClick={clearEvents}
                className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear Feed</span>
              </button>
            )}
          </div>

          {events.length === 0 ? (
            <div className="text-center py-16 px-6 text-muted-foreground text-xs space-y-2">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2 text-muted-foreground/60">
                <Bell className="w-5 h-5" />
              </div>
              <p className="font-semibold text-foreground text-sm">No Unread Clinical Alerts</p>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                Real-time critical panic values, verified report dispatches, and phlebotomy cold-chain updates will appear here automatically.
              </p>
            </div>
          ) : (
            events.map((msg: EventMessage) => {
              const isExpanded = expandedTraceId === msg.traceId;
              const meta = getEventBadge(msg.event);

              return (
                <div
                  key={msg.traceId}
                  className={`p-3 rounded-lg border text-xs font-mono transition-colors ${meta.color}`}
                >
                  <div
                    onClick={() => toggleExpand(msg.traceId)}
                    className="flex items-start justify-between gap-2 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-2.5">
                      {meta.icon}
                      <div>
                        <div className="font-bold text-foreground">{meta.title}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          Trace: {msg.traceId.slice(0, 14)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground shrink-0">
                      <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </div>

                  {/* Expandable CloudEvents payload inspector */}
                  {isExpanded && (
                    <div className="mt-2.5 pt-2 border-t border-border/80">
                      <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide font-semibold">
                        Telemetry Payload:
                      </div>
                      <pre className="p-2 rounded bg-muted/60 text-[10px] text-foreground overflow-x-auto font-mono">
                        {JSON.stringify(msg.payload, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Developer Diagnostics & Simulation Sandbox (Gated to Non-Production) */}
        {isDev && (
          <details className="border-t border-border bg-muted/20 group">
            <summary className="px-4 py-2.5 text-xs font-mono text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-between select-none list-none transition-colors">
              <span className="flex items-center gap-1.5 font-semibold">
                <Code2 className="w-3.5 h-3.5 text-primary" />
                <span>Developer Diagnostics & Sandbox</span>
              </span>
              <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
            </summary>

            <div className="p-4 pt-1 space-y-3 border-t border-border/50">
              {/* Multi-Tenant Room Diagnostics */}
              <div className="p-2.5 rounded bg-card border border-border text-[11px] font-mono space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-primary" />
                    <span>Multi-Tenant Room:</span>
                  </span>
                  <span className="font-semibold text-foreground">lab:lab-apex-01</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3 h-3 text-primary" />
                    <span>Doctor Review Room:</span>
                  </span>
                  <span className="text-foreground">lab:lab-apex-01:doctors</span>
                </div>
              </div>

              {/* Simulation Sandbox Triggers */}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1 mb-1.5">
                  <Play className="w-2.5 h-2.5 text-primary fill-primary" />
                  <span>Dispatch Simulated CloudEvent</span>
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => simulateEvent(RealtimeChannelEnum.ALERT_CRITICAL_VALUE)}
                    className="h-7 text-[10px] font-semibold border-red-300 dark:border-red-900 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 justify-start"
                  >
                    <AlertOctagon className="w-3 h-3 mr-1 text-red-600" />
                    <span>Panic Troponin</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => simulateEvent(RealtimeChannelEnum.REPORT_FINALIZED)}
                    className="h-7 text-[10px] font-semibold border-emerald-300 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 justify-start"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                    <span>Finalize Report</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => simulateEvent(RealtimeChannelEnum.COLLECTION_STATUS_UPDATED)}
                    className="h-7 text-[10px] font-semibold border-blue-300 dark:border-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 justify-start"
                  >
                    <Truck className="w-3 h-3 mr-1 text-blue-600" />
                    <span>Phlebotomy Draw</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => simulateEvent(RealtimeChannelEnum.BILLING_PAYMENT_RECORDED)}
                    className="h-7 text-[10px] font-semibold border-border hover:bg-secondary justify-start"
                  >
                    <Receipt className="w-3 h-3 mr-1 text-primary" />
                    <span>Record Payment</span>
                  </Button>
                </div>
              </div>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
