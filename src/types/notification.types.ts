import type { BloodGroup, BloodComponentType, EmergencyPriority } from './blood.types';

export type NotificationChannel = 'SMS' | 'EMAIL' | 'PUSH' | 'IN_APP';

export type DeliveryStatus = 'DELIVERED' | 'QUEUED' | 'FAILED' | 'SIMULATED';

export interface SMSTransactionPayload {
  toPhone: string;
  templateId: 'DLT_OTP_AUTH' | 'DLT_EMERGENCY_BROADCAST' | 'DLT_DONOR_ACCEPTED' | 'DLT_REQUEST_FULFILLED';
  variables: Record<string, string>;
}

export interface EmailTransactionPayload {
  toEmail: string;
  toName: string;
  subject: string;
  templateType: 'EMERGENCY_REQUISITION' | 'DONOR_ACCEPTED' | 'DONOR_WELCOME' | 'REQUEST_FULFILLED';
  metadata: {
    requestId?: string;
    patientName?: string;
    bloodGroup?: BloodGroup;
    component?: BloodComponentType;
    hospitalName?: string;
    locality?: string;
    priority?: EmergencyPriority;
    contactPhone?: string;
    donorName?: string;
  };
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: {
    requestId?: string;
    url?: string;
    bloodGroup?: BloodGroup;
  };
}

export interface NotificationDeliveryRecord {
  id: string;
  channel: NotificationChannel;
  recipient: string;
  recipientRole: 'donor' | 'requester' | 'admin';
  templateName: string;
  status: DeliveryStatus;
  sentAt: string;
  errorMessage?: string;
  summary: string;
}
