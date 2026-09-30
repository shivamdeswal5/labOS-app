import { apiClient } from '@/lib/api-client';
import type {
  NotificationLog,
  ListNotificationsParams,
  ListNotificationsResponse,
  SendNotificationDto,
  ResendNotificationDto,
} from '../types';

/**
 * Pure API service layer for Notifications & Communication logs.
 * Strict DDD parity with NestJS notifications bounded context (`src/modules/notifications/`).
 * Contains zero React hooks or UI state.
 */
export const notificationsService = {
  /**
   * Lists communication logs with optional channel, status, destination, or reportId filters.
   */
  async list(params?: ListNotificationsParams): Promise<ListNotificationsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.channel) searchParams.append('channel', params.channel);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.recipientType) searchParams.append('recipientType', params.recipientType);
    if (params?.notificationType) searchParams.append('notificationType', params.notificationType);
    if (params?.destination) searchParams.append('destination', params.destination);
    if (params?.reportId) searchParams.append('reportId', params.reportId);
    if (params?.page) searchParams.append('page', String(params.page));
    if (params?.limit) searchParams.append('limit', String(params.limit));

    const queryString = searchParams.toString();
    const url = queryString ? `/notifications?${queryString}` : '/notifications';

    return apiClient.get<ListNotificationsResponse>(url) as unknown as Promise<ListNotificationsResponse>;
  },

  /**
   * Retrieves a single notification log by its UUID.
   */
  async getById(id: string): Promise<NotificationLog> {
    return apiClient.get<NotificationLog>(`/notifications/${id}`) as unknown as Promise<NotificationLog>;
  },

  /**
   * Dispatches a new notification to a patient, doctor, or staff member.
   */
  async send(dto: SendNotificationDto): Promise<NotificationLog> {
    return apiClient.post<NotificationLog>(
      '/notifications/send',
      dto,
    ) as unknown as Promise<NotificationLog>;
  },

  /**
   * Retries or resends a notification (optionally updating the destination phone number).
   */
  async resend(id: string, dto?: ResendNotificationDto): Promise<NotificationLog> {
    return apiClient.post<NotificationLog>(
      `/notifications/${id}/resend`,
      dto || {},
    ) as unknown as Promise<NotificationLog>;
  },
};
