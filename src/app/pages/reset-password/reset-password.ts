import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AnimatedButton } from '../../core/components/animated-button/animated-button';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AnimatedButton],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPasswordComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  newPassword = '';
  confirmPassword = '';
  showNewPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  token: string | null = null;

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token');
    if (!this.token) {
      this.notificationService.error('Token de restablecimiento de contraseña no encontrado.');
      this.router.navigate(['/login']);
    }
  }

  onResetPasswordSubmit(): void {
    if (!this.token) {
      this.notificationService.error('Token inválido. Intenta de nuevo.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.notificationService.error('Las contraseñas no coinciden.');
      return;
    }

    if (this.newPassword.length < 8) {
      this.notificationService.error('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    this.isLoading = true;
    this.authService.resetPasswordConfirm(this.token, this.newPassword, this.confirmPassword).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.notificationService.success(response.message || 'Contraseña restablecida exitosamente.');
          this.router.navigate(['/login']);
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

  togglePasswordVisibility(field: 'new' | 'confirm'): void {
    if (field === 'new') {
      this.showNewPassword = !this.showNewPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }
}
