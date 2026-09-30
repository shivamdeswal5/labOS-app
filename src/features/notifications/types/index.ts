/**
 * LabOS - Notifications & Communications Domain Types
 * Strict contracts matching NestJS Notifications bounded context and WhatsApp delivery lifecycle.
 */

export type NotificationChannel = 'WHATSAPP' | 'SMS' | 'EMAIL';

export type NotificationStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

export type RecipientType = 'PATIENT' | 'DOCTOR' | 'LAB_STAFF';

export type NotificationType =
  | 'REPORT_READY'
  | 'REPORT_AMENDED'
  | 'COLLECTION_BOOKED'
  | 'CRITICAL_ALERT';

export type DispatchMode = 'WEB_INTENT' | 'CLOUD_API';

export interface NotificationPayload {
  reportId?: string;
  reportNumber?: string;
  patientId?: string;
  shareToken?: string;
  reportUrl?: string;
  dispatchMode?: DispatchMode;
  [key: string]: unknown;
}

export interface NotificationLog {
  id: string;
  labId: string;
  recipientType: RecipientType;
  recipientName: string;
  destination: string;
  channel: NotificationChannel;
  notificationType: NotificationType;
  status: NotificationStatus;
  messageContent: string;
  payload?: NotificationPayload | null;
  provider: string;
  providerMessageId?: string | null;
  sentAt?: string | null;
  deliveredAt?: string | null;
  failureReason?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface ListNotificationsParams {
  channel?: NotificationChannel;
  status?: NotificationStatus;
  recipientType?: RecipientType;
  notificationType?: NotificationType;
  destination?: string;
  reportId?: string;
  page?: number;
  limit?: number;
}

export interface ListNotificationsResponse {
  data: NotificationLog[];
  total: number;
  page: number;
  limit: number;
}

export interface SendNotificationDto {
  recipientType: RecipientType;
  recipientName: string;
  destination: string;
  channel: NotificationChannel;
  notificationType: NotificationType;
  message?: string;
  payload?: Record<string, unknown>;
}

export interface ResendNotificationDto {
  destination?: string;
}

export interface NotificationSummaryStats {
  totalDispatched: number;
  whatsAppCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  pendingCount: number;
  deliveryRatePercent: number;
  readRatePercent: number;
}
