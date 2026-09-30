export enum RealtimeChannelEnum {
  REPORT_CREATED = 'report:created',
  REPORT_FINALIZED = 'report:finalized',
  REPORT_AMENDED = 'report:amended',
  COLLECTION_CREATED = 'collection:created',
  COLLECTION_ASSIGNED = 'collection:assigned',
  COLLECTION_STATUS_UPDATED = 'collection:status_updated',
  ALERT_CRITICAL_VALUE = 'alert:critical_value',
  BILLING_PAYMENT_RECORDED = 'billing:payment_recorded',
}

export type RealtimeConnectionStatus =
  | 'CONNECTING'
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'RECONNECTING';

export interface EventMessage<T = unknown> {
  channels: string[];
  event: RealtimeChannelEnum;
  timestamp: string;
  traceId: string;
  payload: T;
}

export interface IReportFinalizedPayload {
  reportId: string;
  labId: string;
  patientId: string;
  patientName?: string;
  reportNumber: string;
  totalPrice: number;
  finalizedAt: string;
}

export interface ICriticalAlertPayload {
  reportId: string;
  labId: string;
  patientName: string;
  parameterName: string;
  value: string;
  criticalLow?: number;
  criticalHigh?: number;
}

export interface ICollectionCreatedPayload {
  collectionId: string;
  labId: string;
  requestNumber: string;
  patientName: string;
  preferredDate: string;
  timeSlot: string;
}

export interface ICollectionAssignedPayload {
  collectionId: string;
  labId: string;
  requestNumber: string;
  phlebotomistId: string;
  phlebotomistName: string;
}

export interface ICollectionStatusUpdatedPayload {
  collectionId: string;
  labId: string;
  requestNumber: string;
  previousStatus: string;
  newStatus: string;
}

export interface IPaymentRecordedPayload {
  invoiceId: string;
  labId: string;
  invoiceNumber: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  paidAt: string;
}

export interface RealtimeToastAlert {
  id: string;
  type: 'PANIC' | 'INFO' | 'SUCCESS' | 'WARNING';
  title: string;
  message: string;
  timestamp: string;
  traceId: string;
  link?: string;
}
