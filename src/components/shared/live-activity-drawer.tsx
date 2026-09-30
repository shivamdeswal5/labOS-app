'use client';

import * as React from 'react';
import {
  X,
  Radio,
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

  const [expandedTraceId, setExpandedTraceId] = React.useState<string | null>(null);

  // Handle Escape key
  React.useEffect(() => {
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

  const getEventIcon = (event: RealtimeChannelEnum) => {
    switch (event) {
      case RealtimeChannelEnum.ALERT_CRITICAL_VALUE:
        return <AlertOctagon className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />;
      case RealtimeChannelEnum.REPORT_FINALIZED:
      case RealtimeChannelEnum.REPORT_CREATED:
      case RealtimeChannelEnum.REPORT_AMENDED:
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case RealtimeChannelEnum.COLLECTION_CREATED:
      case RealtimeChannelEnum.COLLECTION_ASSIGNED:
      case RealtimeChannelEnum.COLLECTION_STATUS_UPDATED:
        return <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />;
      case RealtimeChannelEnum.BILLING_PAYMENT_RECORDED:
        return <Receipt className="w-4 h-4 text-primary shrink-0" />;
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
            <div className="w-8 h-8 rounded-lg bg-primary/5 border border-border flex items-center justify-center text-primary">
              <Radio className="w-4 h-4 animate-pulse text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">
                Real-Time Clinical Telemetry
              </h2>
              <div className="flex items-center gap-2 text-[11px] font-mono mt-0.5">
                <span
                  className={`inline-flex items-center gap-1 font-semibold ${
                    status === 'CONNECTED'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : status === 'RECONNECTING'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      status === 'CONNECTED'
                        ? 'bg-emerald-500 animate-pulse'
                        : status === 'RECONNECTING'
                        ? 'bg-amber-500 animate-ping'
                        : 'bg-amber-500'
                    }`}
                  />
                  {status === 'DISCONNECTED' ? 'DEMO MODE' : status}
                </span>
                <span>•</span>
                <span className="text-muted-foreground">Socket.IO v4</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Room Isolation & Gateway Status */}
        <div className="px-4 sm:px-5 py-3 bg-secondary/40 border-b border-border text-xs font-mono space-y-1.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>Multi-Tenant Room:</span>
            </span>
            <span className="font-semibold text-foreground">lab:lab-apex-01</span>
          </div>

          <div className="flex items-center justify-between text-muted-foreground">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span>Doctor Review Room:</span>
            </span>
            <span className="text-foreground">lab:lab-apex-01:doctors</span>
          </div>
        </div>

        {/* Simulation Sandbox Dock */}
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold text-foreground flex items-center gap-1.5">
              <Play className="w-3 h-3 text-primary fill-primary" />
              <span>Event Simulation Sandbox</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <Button
              variant="outline"
              size="sm"
              onClick={() => simulateEvent(RealtimeChannelEnum.ALERT_CRITICAL_VALUE)}
              className="h-8 text-[11px] font-semibold border-red-300 dark:border-red-900 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 justify-start"
            >
              <AlertOctagon className="w-3.5 h-3.5 mr-1 text-red-600" />
              <span>Panic Troponin</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => simulateEvent(RealtimeChannelEnum.REPORT_FINALIZED)}
              className="h-8 text-[11px] font-semibold border-emerald-300 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 justify-start"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              <span>Finalize Report</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => simulateEvent(RealtimeChannelEnum.COLLECTION_STATUS_UPDATED)}
              className="h-8 text-[11px] font-semibold border-blue-300 dark:border-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 justify-start"
            >
              <Truck className="w-3.5 h-3.5 mr-1 text-blue-600" />
              <span>Phlebotomy Draw</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => simulateEvent(RealtimeChannelEnum.BILLING_PAYMENT_RECORDED)}
              className="h-8 text-[11px] font-semibold border-border hover:bg-secondary justify-start"
            >
              <Receipt className="w-3.5 h-3.5 mr-1 text-primary" />
              <span>Record Payment</span>
            </Button>
          </div>
        </div>

        {/* Chronological Event Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold text-muted-foreground">
              Event Audit Log ({events.length})
            </span>
            {events.length > 0 && (
              <button
                type="button"
                onClick={clearEvents}
                className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs">
              <Radio className="w-8 h-8 mx-auto mb-2 opacity-30 animate-pulse" />
              <p className="font-medium">Listening on WebSocket channels...</p>
              <p className="text-[11px] mt-1 opacity-70">
                Trigger an event from the sandbox or use the application to view live CloudEvents.
              </p>
            </div>
          ) : (
            events.map((msg: EventMessage) => {
              const isExpanded = expandedTraceId === msg.traceId;
              const isPanic = msg.event === RealtimeChannelEnum.ALERT_CRITICAL_VALUE;

              return (
                <div
                  key={msg.traceId}
                  className={`p-3 rounded-lg border text-xs font-mono transition-colors ${
                    isPanic
                      ? 'border-red-300 dark:border-red-900 bg-red-50/50 dark:bg-red-950/30'
                      : 'border-border bg-card'
                  }`}
                >
                  <div
                    onClick={() => toggleExpand(msg.traceId)}
                    className="flex items-start justify-between gap-2 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-2">
                      {getEventIcon(msg.event)}
                      <div>
                        <div className="font-bold text-foreground">{msg.event}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          Trace: {msg.traceId.slice(0, 12)}...
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

                  {/* Expandable JSON payload inspector */}
                  {isExpanded && (
                    <div className="mt-2.5 pt-2 border-t border-border/80">
                      <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide font-semibold">
                        CloudEvents Payload:
                      </div>
                      <pre className="p-2 rounded bg-muted/60 text-[10px] text-foreground overflow-x-auto">
                        {JSON.stringify(msg.payload, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
