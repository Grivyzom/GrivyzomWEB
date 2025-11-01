import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { ServerIpService } from '../../services/server-ip.service';

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-notification.html',
  styleUrls: ['./toast-notification.css'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(400px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(400px)', opacity: 0 }))
      ])
    ])
  ]
})
export class ToastNotificationComponent {
  private readonly serverIpService = inject(ServerIpService);

  // Estado de notificación desde el servicio
  readonly notification = computed(() => this.serverIpService.notification());

  /**
   * Cierra la notificación manualmente
   */
  close(): void {
    this.serverIpService.hideNotification();
  }
}
