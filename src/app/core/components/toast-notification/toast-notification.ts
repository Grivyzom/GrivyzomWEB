import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { Notification, NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-notification.html',
  styleUrl: './toast-notification.css',
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateY(100%)', opacity: 0 })),
      ]),
    ]),
  ],
})
export class ToastNotificationComponent {
  notificationService = inject(NotificationService);

  getIconClass(type: string): string {
    switch (type) {
      case 'success': return 'ci-Check_Circle';
      case 'error': return 'ci-Close_Circle';
      case 'warning': return 'ci-Warning_Triangle';
      case 'info':
      default:
        return 'ci-Info_Circle';
    }
  }

  getContainerClass(type: string): string {
    return `toast-container ${type}`;
  }

  onDismiss(notification: Notification): void {
    this.notificationService.dismiss(notification);
  }
}
