'use client';

import * as React from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  RealtimeChannelEnum,
  type RealtimeConnectionStatus,
  type EventMessage,
  type RealtimeToastAlert,
  type ICriticalAlertPayload,
  type IReportFinalizedPayload,
  type ICollectionStatusUpdatedPayload,
  type IPaymentRecordedPayload,
} from '@/features/realtime/types';
import { AlertOctagon, CheckCircle2, Truck, Receipt, X } from 'lucide-react';

interface RealtimeContextType {
  status: RealtimeConnectionStatus;
  lastMessage: EventMessage | null;
  events: EventMessage[];
  toasts: RealtimeToastAlert[];
  dismissToast: (id: string) => void;
  clearEvents: () => void;
  simulateEvent: (event: RealtimeChannelEnum, customPayload?: unknown) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  unreadCount: number;
}

const RealtimeContext = React.createContext<RealtimeContextType | undefined>(undefined);

interface RealtimeProviderProps {
  children: React.ReactNode;
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const queryClient = useQueryClient();
  const [status, setStatus] = React.useState<RealtimeConnectionStatus>('CONNECTING');
  const [lastMessage, setLastMessage] = React.useState<EventMessage | null>(null);
  const [events, setEvents] = React.useState<EventMessage[]>([]);
  const [toasts, setToasts] = React.useState<RealtimeToastAlert[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const socketRef = React.useRef<Socket | null>(null);

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearEvents = React.useCallback(() => {
    setEvents([]);
    setUnreadCount(0);
  }, []);

  // Process incoming CloudEvent
  const handleIncomingMessage = React.useCallback(
    (message: EventMessage) => {
      setLastMessage(message);
      setEvents((prev) => [message, ...prev.slice(0, 49)]); // Keep last 50
      setUnreadCount((prev) => prev + 1);

      // Invalidate relevant TanStack Query caches
      switch (message.event) {
        case RealtimeChannelEnum.REPORT_CREATED:
        case RealtimeChannelEnum.REPORT_FINALIZED:
        case RealtimeChannelEnum.REPORT_AMENDED:
          queryClient.invalidateQueries({ queryKey: ['reports'] });
          queryClient.invalidateQueries({ queryKey: ['reports', 'dashboard-stats'] });
          break;

        case RealtimeChannelEnum.COLLECTION_CREATED:
        case RealtimeChannelEnum.COLLECTION_ASSIGNED:
        case RealtimeChannelEnum.COLLECTION_STATUS_UPDATED:
          queryClient.invalidateQueries({ queryKey: ['collections'] });
          queryClient.invalidateQueries({ queryKey: ['reports', 'dashboard-stats'] });
          break;

        case RealtimeChannelEnum.ALERT_CRITICAL_VALUE:
          queryClient.invalidateQueries({ queryKey: ['reports'] });
          break;

        case RealtimeChannelEnum.BILLING_PAYMENT_RECORDED:
          queryClient.invalidateQueries({ queryKey: ['billing'] });
          queryClient.invalidateQueries({ queryKey: ['invoices'] });
          queryClient.invalidateQueries({ queryKey: ['reports', 'dashboard-stats'] });
          break;
      }

      // Generate Toast Alerts for high-priority clinical signals
      if (message.event === RealtimeChannelEnum.ALERT_CRITICAL_VALUE) {
        const payload = message.payload as ICriticalAlertPayload;
        const newToast: RealtimeToastAlert = {
          id: `toast-${Date.now()}-${Math.random()}`,
          type: 'PANIC',
          title: 'CRITICAL PANIC VALUE DETECTED',
          message: `${payload.parameterName}: ${payload.value} (Patient: ${payload.patientName})`,
          timestamp: new Date().toLocaleTimeString(),
          traceId: message.traceId,
          link: `/reports/${payload.reportId}/entry`,
        };
        setToasts((prev) => [newToast, ...prev]);
      } else if (message.event === RealtimeChannelEnum.REPORT_FINALIZED) {
        const payload = message.payload as IReportFinalizedPayload;
        const newToast: RealtimeToastAlert = {
          id: `toast-${Date.now()}-${Math.random()}`,
          type: 'SUCCESS',
          title: 'Report Finalized & Signed',
          message: `Report #${payload.reportNumber} released for verification (${payload.patientName || 'Patient'}).`,
          timestamp: new Date().toLocaleTimeString(),
          traceId: message.traceId,
          link: `/reports/${payload.reportId}/preview`,
        };
        setToasts((prev) => [newToast, ...prev]);
        setTimeout(() => dismissToast(newToast.id), 6000);
      } else if (message.event === RealtimeChannelEnum.COLLECTION_STATUS_UPDATED) {
        const payload = message.payload as ICollectionStatusUpdatedPayload;
        const newToast: RealtimeToastAlert = {
          id: `toast-${Date.now()}-${Math.random()}`,
          type: 'INFO',
          title: 'Phlebotomy Cold-Chain Update',
          message: `Booking #${payload.requestNumber} transitioned: ${payload.previousStatus} → ${payload.newStatus}`,
          timestamp: new Date().toLocaleTimeString(),
          traceId: message.traceId,
          link: '/collections',
        };
        setToasts((prev) => [newToast, ...prev]);
        setTimeout(() => dismissToast(newToast.id), 5000);
      }
    },
    [queryClient, dismissToast],
  );

  // Simulation engine for pitch demos & offline testing
  const simulateEvent = React.useCallback(
    (event: RealtimeChannelEnum, customPayload?: unknown) => {
      const traceId = `sim-trace-${Date.now().toString(36)}`;
      const timestamp = new Date().toISOString();

      let payload = customPayload;
      if (!payload) {
        switch (event) {
          case RealtimeChannelEnum.ALERT_CRITICAL_VALUE:
            payload = {
              reportId: 'demo-01',
              labId: 'lab-apex-01',
              patientName: 'Sunita Rao',
              parameterName: 'High Sensitivity Troponin-I',
              value: '142.8 ng/L [PANIC HIGH]',
              criticalHigh: 14.0,
            } as ICriticalAlertPayload;
            break;

          case RealtimeChannelEnum.REPORT_FINALIZED:
            payload = {
              reportId: 'demo-01',
              labId: 'lab-apex-01',
              patientId: 'pt-10488',
              patientName: 'Sunita Rao',
              reportNumber: 'R-1048',
              totalPrice: 450,
              finalizedAt: timestamp,
            } as IReportFinalizedPayload;
            break;

          case RealtimeChannelEnum.COLLECTION_STATUS_UPDATED:
            payload = {
              collectionId: 'col-req-01',
              labId: 'lab-apex-01',
              requestNumber: 'COL-2026-081',
              previousStatus: 'IN_TRANSIT',
              newStatus: 'SAMPLE_COLLECTED',
            } as ICollectionStatusUpdatedPayload;
            break;

          case RealtimeChannelEnum.BILLING_PAYMENT_RECORDED:
            payload = {
              invoiceId: 'inv-01',
              labId: 'lab-apex-01',
              invoiceNumber: 'INV-2024-8842',
              amount: 350,
              paymentMethod: 'UPI',
              paymentStatus: 'PAID',
              paidAt: timestamp,
            } as IPaymentRecordedPayload;
            break;

          default:
            payload = { simulated: true, timestamp };
        }
      }

      const msg: EventMessage = {
        channels: ['lab:lab-apex-01'],
        event,
        timestamp,
        traceId,
        payload,
      };

      handleIncomingMessage(msg);
    },
    [handleIncomingMessage],
  );

  // Initialize Socket.IO connection
  React.useEffect(() => {
    let isMounted = true;
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080';

    async function initSocket() {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token || 'demo-jwt-token';

        if (!isMounted) return;

        const socket = io(wsUrl, {
          auth: { token: `Bearer ${token}` },
          transports: ['websocket', 'polling'],
          reconnectionAttempts: 5,
          reconnectionDelay: 2000,
          timeout: 5000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          if (!isMounted) return;
          setStatus('CONNECTED');
        });

        socket.on('disconnect', () => {
          if (!isMounted) return;
          setStatus('DISCONNECTED');
        });

        socket.on('connect_error', () => {
          if (!isMounted) return;
          setStatus('DISCONNECTED');
        });

        socket.on('reconnect_attempt', () => {
          if (!isMounted) return;
          setStatus('RECONNECTING');
        });

        // Listen to all standardized CloudEvents channels
        Object.values(RealtimeChannelEnum).forEach((channelName) => {
          socket.on(channelName, (message: EventMessage) => {
            if (!isMounted) return;
            handleIncomingMessage(message);
          });
        });
      } catch {
        if (isMounted) setStatus('DISCONNECTED');
      }
    }

    initSocket();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [handleIncomingMessage]);

  const value = React.useMemo(
    () => ({
      status,
      lastMessage,
      events,
      toasts,
      dismissToast,
      clearEvents,
      simulateEvent,
      isDrawerOpen,
      setIsDrawerOpen,
      unreadCount,
    }),
    [
      status,
      lastMessage,
      events,
      toasts,
      dismissToast,
      clearEvents,
      simulateEvent,
      isDrawerOpen,
      unreadCount,
    ],
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}

      {/* Floating Clinical Toast Alerts Stack */}
      <div className="fixed top-16 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const isPanic = toast.type === 'PANIC';
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-lg border shadow-lg transition-all animate-in slide-in-from-top-2 duration-200 ${
                isPanic
                  ? 'bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-900 text-red-900 dark:text-red-100 ring-2 ring-red-500/20'
                  : toast.type === 'SUCCESS'
                  ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-900 text-emerald-900 dark:text-emerald-100'
                  : 'bg-card border-border text-foreground'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  {isPanic ? (
                    <AlertOctagon className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5 animate-bounce" />
                  ) : toast.type === 'SUCCESS' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : toast.type === 'INFO' ? (
                    <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  ) : (
                    <Receipt className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  )}

                  <div>
                    <h4 className="font-bold text-xs sm:text-sm tracking-tight">{toast.title}</h4>
                    <p className="text-xs mt-0.5 opacity-90 leading-snug">{toast.message}</p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] font-mono opacity-70">
                      <span>{toast.timestamp}</span>
                      <span>•</span>
                      <span>Trace: {toast.traceId.slice(0, 8)}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </RealtimeContext.Provider>
  );
}

const FALLBACK_REALTIME_CONTEXT: RealtimeContextType = {
  status: 'DISCONNECTED',
  lastMessage: null,
  events: [],
  toasts: [],
  dismissToast: () => {},
  clearEvents: () => {},
  simulateEvent: () => {},
  isDrawerOpen: false,
  setIsDrawerOpen: () => {},
  unreadCount: 0,
};

export function useRealtime() {
  const context = React.useContext(RealtimeContext);
  if (!context) {
    return FALLBACK_REALTIME_CONTEXT;
  }
  return context;
}
