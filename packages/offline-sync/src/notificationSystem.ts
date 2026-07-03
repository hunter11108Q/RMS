export type AppNotificationType = 'TOAST' | 'SOUND' | 'BADGE' | 'PUSH';

export interface AppNotification {
  id: string;
  type: AppNotificationType;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

export class AppNotificationSystem {
  private notifications: AppNotification[] = [];
  private listeners: Set<(notif: AppNotification) => void> = new Set();

  public trigger(type: AppNotificationType, title: string, body: string): AppNotification {
    const notif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      title,
      body,
      timestamp: new Date().toISOString(),
      read: false,
    };

    this.notifications.unshift(notif);
    this.listeners.forEach((listener) => {
      try {
        listener(notif);
      } catch (err) {
        console.warn('Notification listener error:', err);
      }
    });

    return notif;
  }

  public getNotifications(): AppNotification[] {
    return this.notifications;
  }

  public markAllRead(): void {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
  }

  public addListener(callback: (notif: AppNotification) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public clear(): void {
    this.notifications = [];
  }
}
export default AppNotificationSystem;
