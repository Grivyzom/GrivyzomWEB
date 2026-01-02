import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  message: string;
  type: NotificationType;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  notifications = signal<Notification[]>([]);

  show(message: string, type: NotificationType = 'info', duration: number = 5000): void {
    const newNotification = { message, type, duration };
    this.notifications.update(notifications => [...notifications, newNotification]);
    
    if (duration > 0) {
      setTimeout(() => this.dismiss(newNotification), duration);
    }
  }

  success(message: string, duration: number = 5000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 5000): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration: number = 5000): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration: number = 5000): void {
    this.show(message, 'warning', duration);
  }

  dismiss(notification: Notification): void {
    this.notifications.update(notifications => notifications.filter(n => n !== notification));
  }

  clear(): void {
    this.notifications.set([]);
  }
}
