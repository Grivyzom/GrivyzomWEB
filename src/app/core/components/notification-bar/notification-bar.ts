import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export type NotificationType = 'info' | 'success' | 'warning' | 'announcement' | 'event';

export interface Notification {
  message: string;
  type: NotificationType;
}

@Component({
  selector: 'app-notification-bar',
  imports: [CommonModule],
  templateUrl: './notification-bar.html',
  styleUrl: './notification-bar.css',
})
export class NotificationBar {
  isVisible = signal(true);

  notifications: Notification[] = [
    {
      message: 'Se ha añadido una nueva modalidad, llamada: Modo Competitivo',
      type: 'announcement'
    },
    {
      message: 'Evento especial este fin de semana - Recompensas dobles',
      type: 'event'
    },
    {
      message: 'Nueva actualización disponible con mejoras de rendimiento',
      type: 'info'
    }
  ];

  currentNotification = computed(() => this.notifications[0]);

  constructor(private sanitizer: DomSanitizer) {}

  getIcon(type: NotificationType): SafeHtml {
    const icons: Record<NotificationType, string> = {
      info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M12 16V12M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>`,
      success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
      warning: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 9V13M12 17H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53223 19 5.07183 19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
      announcement: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M13 12L3 17V7L13 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M18 15.5C18 17.9853 16.5 22 13 22C13 20 13 18 13 16.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
      event: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`
    };
    return this.sanitizer.bypassSecurityTrustHtml(icons[type] || icons.info);
  }

  closeNotificationBar(): void {
    this.isVisible.set(false);
  }
}
