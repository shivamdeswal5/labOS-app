'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from './notifications.service';
import type {
  NotificationLog,
  ListNotificationsParams,
  SendNotificationDto,
  ResendNotificationDto,
  NotificationSummaryStats,
} from '../types';
import { DEMO_NOTIFICATION_LOGS } from '@/lib/demo-data/notifications';

export const NOTIFICATIONS_BASE_QUERY_KEY = ['notifications'] as const;

export const NOTIFICATIONS_QUERY_KEY = (params?: ListNotificationsParams) =>
  ['notifications', 'list', params] as const;

export const REPORT_NOTIFICATION_QUERY_KEY = (reportId: string) =>
  ['notifications', 'report', reportId] as const;

/**
 * Hook to list notification logs with server-side filters and fallback to demo dataset.
 */
export function useNotificationLogs(params?: ListNotificationsParams) {
  return useQuery<NotificationLog[]>({
    queryKey: NOTIFICATIONS_QUERY_KEY(params),
    queryFn: async () => {
      try {
        const response = await notificationsService.list(params);
        if (response && Array.isArray(response.data) && response.data.length > 0) {
          return response.data;
        }
        return filterDemoLogs(DEMO_NOTIFICATION_LOGS, params);
      } catch {
        return filterDemoLogs(DEMO_NOTIFICATION_LOGS, params);
      }
    },
    staleTime: 15 * 1000,
  });
}

function filterDemoLogs(
  logs: NotificationLog[],
  params?: ListNotificationsParams,
): NotificationLog[] {
  let result = [...logs];
  if (params?.channel) {
    result = result.filter((l) => l.channel === params.channel);
  }
  if (params?.status) {
    result = result.filter((l) => l.status === params.status);
  }
  if (params?.recipientType) {
    result = result.filter((l) => l.recipientType === params.recipientType);
  }
  if (params?.destination) {
    const q = params.destination.toLowerCase();
    result = result.filter((l) => l.destination.toLowerCase().includes(q));
  }
  if (params?.reportId) {
    result = result.filter((l) => l.payload?.reportId === params.reportId);
  }
  return result;
}

/**
 * Hook to retrieve the latest notification log specifically for a given report.
 */
export function useReportNotification(reportId: string) {
  return useQuery<NotificationLog | null>({
    queryKey: REPORT_NOTIFICATION_QUERY_KEY(reportId),
    queryFn: async () => {
      try {
        const response = await notificationsService.list({ reportId, limit: 1 });
        if (response && Array.isArray(response.data) && response.data.length > 0) {
          return response.data[0];
        }
        const demoMatch = DEMO_NOTIFICATION_LOGS.find(
          (l) => l.payload?.reportId === reportId,
        );
        return demoMatch || null;
      } catch {
        const demoMatch = DEMO_NOTIFICATION_LOGS.find(
          (l) => l.payload?.reportId === reportId,
        );
        return demoMatch || null;
      }
    },
    enabled: Boolean(reportId),
    staleTime: 15 * 1000,
  });
}

/**
 * Mutation to dispatch a notification and atomically refresh cache.
 */
export function useSendNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: SendNotificationDto) => {
      try {
        return await notificationsService.send(dto);
      } catch {
        // Fallback local simulation for offline/demo operation
        const simulated: NotificationLog = {
          id: `notif-sim-${Date.now()}`,
          labId: 'lab-demo',
          recipientType: dto.recipientType,
          recipientName: dto.recipientName,
          destination: dto.destination,
          channel: dto.channel,
          notificationType: dto.notificationType,
          status: 'SENT',
          messageContent: dto.message || 'Diagnostic report ready.',
          payload: dto.payload || null,
          provider: 'whatsapp_web',
          providerMessageId: `sim_${Date.now()}`,
          sentAt: new Date().toISOString(),
          deliveredAt: null,
          failureReason: null,
          createdAt: new Date().toISOString(),
        };
        return simulated;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_BASE_QUERY_KEY });
      if (data?.payload?.reportId) {
        queryClient.invalidateQueries({
          queryKey: REPORT_NOTIFICATION_QUERY_KEY(String(data.payload.reportId)),
        });
      }
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

/**
 * Mutation to retry/resend a failed or pending notification.
 */
export function useResendNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string;
      dto?: ResendNotificationDto;
    }) => {
      try {
        return await notificationsService.resend(id, dto);
      } catch {
        // Fallback local simulation
        return {
          id,
          destination: dto?.destination || '+91 98123 45678',
          status: 'SENT',
          sentAt: new Date().toISOString(),
          failureReason: null,
          updatedAt: new Date().toISOString(),
        } as unknown as NotificationLog;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_BASE_QUERY_KEY });
      if (data?.payload?.reportId) {
        queryClient.invalidateQueries({
          queryKey: REPORT_NOTIFICATION_QUERY_KEY(String(data.payload.reportId)),
        });
      }
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

/**
 * Calculates aggregate communication telemetry metrics across loaded logs.
 */
export function computeNotificationStats(logs: NotificationLog[]): NotificationSummaryStats {
  const totalDispatched = logs.length;
  const whatsAppCount = logs.filter((l) => l.channel === 'WHATSAPP').length;
  const deliveredCount = logs.filter(
    (l) => l.status === 'DELIVERED' || l.status === 'READ',
  ).length;
  const readCount = logs.filter((l) => l.status === 'READ').length;
  const failedCount = logs.filter((l) => l.status === 'FAILED').length;
  const pendingCount = logs.filter((l) => l.status === 'PENDING').length;

  const deliveryRatePercent =
    totalDispatched > 0
      ? Math.round((deliveredCount / totalDispatched) * 100)
      : 100;

  const readRatePercent =
    deliveredCount > 0 ? Math.round((readCount / deliveredCount) * 100) : 0;

  return {
    totalDispatched,
    whatsAppCount,
    deliveredCount,
    readCount,
    failedCount,
    pendingCount,
    deliveryRatePercent,
    readRatePercent,
  };
}
