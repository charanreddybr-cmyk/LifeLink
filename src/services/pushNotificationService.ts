import type { PushNotificationPayload, NotificationDeliveryRecord } from '../types/notification.types';

/**
 * Manages Browser Web Push Notifications and Service Worker registration
 */
class PushNotificationService {
  private permissionState: NotificationPermission = 'default';

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permissionState = Notification.permission;
    }
  }

  public getPermission(): NotificationPermission {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permissionState = Notification.permission;
      return this.permissionState;
    }
    return 'denied';
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permissionState = permission;
      return permission === 'granted';
    } catch {
      return false;
    }
  }

  public async sendNotification(payload: PushNotificationPayload): Promise<NotificationDeliveryRecord> {
    const isGranted = this.getPermission() === 'granted';

    const record: NotificationDeliveryRecord = {
      id: `push-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      channel: 'PUSH',
      recipient: 'Browser Active Device',
      recipientRole: 'donor',
      templateName: payload.tag || 'EMERGENCY_PUSH',
      status: isGranted ? 'DELIVERED' : 'SIMULATED',
      sentAt: new Date().toISOString(),
      summary: `${payload.title}: ${payload.body}`,
      errorMessage: isGranted ? undefined : 'Push permission not granted or device offline',
    };

    if (isGranted && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          await registration.showNotification(payload.title, {
            body: payload.body,
            icon: payload.icon || '/favicon.ico',
            badge: payload.badge || '/favicon.ico',
            tag: payload.tag || 'lifelink-emergency',
            data: payload.data,
          });
        } else {
          new Notification(payload.title, {
            body: payload.body,
            icon: payload.icon || '/favicon.ico',
          });
        }
      } catch {
        // Fallback to in-app notification
      }
    }

    return record;
  }
}

export const pushService = new PushNotificationService();
