import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AnimatedButton } from '../../core/components/animated-button/animated-button';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AnimatedButton],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPasswordComponent {
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  email = '';
  isLoading = false;

  onForgotPasswordSubmit(): void {
    if (!this.email) {
      this.notificationService.error('Por favor, ingresa tu correo electrónico.');
      return;
    }

    this.isLoading = true;
    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.notificationService.success(response.message || 'Se ha enviado un enlace a tu correo.');
        } else {
          this.notificationService.error(response.error || 'Ocurrió un error.');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.error('Error de conexión con el servidor.');
      }
    });
  }
}
