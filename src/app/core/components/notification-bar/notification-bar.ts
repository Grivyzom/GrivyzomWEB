import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-bar',
  imports: [CommonModule],
  templateUrl: './notification-bar.html',
  styleUrl: './notification-bar.css',
})
export class NotificationBar {
  notifications: string[] = [
    'Se ha añadido una nueva modalidad, llamada: ??????',
    'Se ha añadido una nueva modalidad, llamada: ??????',
    'Se ha añadido una nueva modalidad, llamada: ??????'
  ];
}
