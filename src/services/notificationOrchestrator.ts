import type { DetailedBloodRequest } from '../types/blood.types';
import type { NotificationDeliveryRecord } from '../types/notification.types';
import { dispatchTransactionalSMS } from './smsService';
import { dispatchTransactionalEmail } from './emailService';
import { pushService } from './pushNotificationService';

export interface MultiChannelDispatchResult {
  requestId: string;
  smsCount: number;
  emailCount: number;
  pushSent: boolean;
  logs: NotificationDeliveryRecord[];
}

export async function dispatchEmergencyBroadcastMultiChannel(
  request: DetailedBloodRequest,
  matchedDonorCount: number
): Promise<MultiChannelDispatchResult> {
  const logs: NotificationDeliveryRecord[] = [];

  // 1. Web Push Notification
  const pushRecord = await pushService.sendNotification({
    title: `🚨 EMERGENCY: ${request.bloodGroup} Blood Needed`,
    body: `${request.unitsNeeded} unit(s) of ${request.component} needed at ${request.hospitalName} (${request.locality}). Tap to respond.`,
    tag: `req-${request.id}`,
    data: {
      requestId: request.id,
      bloodGroup: request.bloodGroup,
    },
  });
  logs.push(pushRecord);

  // 2. Transactional SMS Dispatch to Attendant confirmation
  const attendantSms = await dispatchTransactionalSMS({
    toPhone: request.contactPhone,
    templateId: 'DLT_EMERGENCY_BROADCAST',
    variables: {
      bloodGroup: request.bloodGroup,
      patientName: request.patientName,
      hospital: request.hospitalName,
      link: 'lifelink.in/dashboard',
    },
  });
  logs.push(attendantSms);

  // 3. Simulated Transactional Email broadcast to eligible donors
  const emailRecord = await dispatchTransactionalEmail({
    toEmail: 'donor.registry.blr@lifelink.in',
    toName: 'Verified Donors Network',
    subject: `🚨 URGENT: ${request.bloodGroup} Needed at ${request.hospitalName}`,
    templateType: 'EMERGENCY_REQUISITION',
    metadata: {
      requestId: request.id,
      patientName: request.patientName,
      bloodGroup: request.bloodGroup,
      component: request.component,
      hospitalName: request.hospitalName,
      locality: request.locality,
      priority: request.priority,
    },
  });
  logs.push(emailRecord);

  return {
    requestId: request.id,
    smsCount: matchedDonorCount > 0 ? matchedDonorCount : 1,
    emailCount: matchedDonorCount > 0 ? matchedDonorCount : 1,
    pushSent: pushRecord.status === 'DELIVERED',
    logs,
  };
}

export async function dispatchDonorAcceptanceMultiChannel(
  request: DetailedBloodRequest,
  donorName: string,
  donorPhone: string,
  donorBloodGroup: string
): Promise<NotificationDeliveryRecord[]> {
  const logs: NotificationDeliveryRecord[] = [];

  // 1. SMS to Patient Attendant with donor phone
  const attendantSms = await dispatchTransactionalSMS({
    toPhone: request.contactPhone,
    templateId: 'DLT_DONOR_ACCEPTED',
    variables: {
      donorName,
      donorPhone,
      requestId: request.id,
    },
  });
  logs.push(attendantSms);

  // 2. Email to Attendant
  const attendantEmail = await dispatchTransactionalEmail({
    toEmail: 'attendant@lifelink.in',
    toName: request.contactPerson,
    subject: `✅ Donor Accepted Requisition ${request.id}`,
    templateType: 'DONOR_ACCEPTED',
    metadata: {
      requestId: request.id,
      patientName: request.patientName,
      bloodGroup: request.bloodGroup,
      donorName,
      contactPhone: donorPhone,
    },
  });
  logs.push(attendantEmail);

  // 3. Push Notification to Attendant device
  const pushRecord = await pushService.sendNotification({
    title: `Donor Accepted: ${donorName} (${donorBloodGroup})`,
    body: `Donor agreed to donate for ${request.patientName}. Authorized phone number: +91 ${donorPhone}.`,
    tag: `accept-${request.id}`,
    data: {
      requestId: request.id,
    },
  });
  logs.push(pushRecord);

  return logs;
}
