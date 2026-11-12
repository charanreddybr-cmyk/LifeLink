import type { BloodGroup, BloodComponentType, EmergencyPriority } from './blood.types';

export type RealtimeConnectionStatus = 'CONNECTED' | 'CONNECTING' | 'RECONNECTING' | 'DISCONNECTED';

export type RealtimeNotificationType = 
  | 'EMERGENCY_REQUISITION'
  | 'DONOR_ACCEPTED'
  | 'REQUEST_FULFILLED'
  | 'SYSTEM_BROADCAST';

export interface RealtimeNotification {
  id: string;
  type: RealtimeNotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  bloodGroup?: BloodGroup;
  component?: BloodComponentType;
  hospitalName?: string;
  locality?: string;
  requestId?: string;
  priority?: EmergencyPriority;
  donorName?: string;
  donorPhone?: string;
  distanceKm?: number;
}

export interface RealtimeBroadcastPayload {
  eventId: string;
  eventType: 'NEW_REQUEST' | 'DONOR_RESPONSE' | 'STATUS_UPDATE';
  data: any;
  timestamp: string;
}
