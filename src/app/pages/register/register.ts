import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, User, Mail, Lock, ShieldCheck, Eye, EyeOff, Check, CheckCircle, Circle, XCircle, AlertTriangle, UserPlus, Copy, CheckCheck, Gamepad2, Clock, RefreshCw, Terminal, Server } from 'lucide-angular';
import { AnimatedButton } from '../../core/components/animated-button/animated-button';
import { AuthService, PendingRegistrationResponse } from '../../core/services/auth.service';
import { interval, Subscription, takeWhile } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AnimatedButton, LucideAngularModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent implements OnDestroy {
  // Lucide icons
  readonly icons = {
    User, Mail, Lock, ShieldCheck, Eye, EyeOff, Check, CheckCircle, Circle,
    XCircle, AlertTriangle, UserPlus, Copy, CheckCheck, Gamepad2, Clock, RefreshCw, Terminal, Server
  };

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Form fields
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  acceptTerms = false;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  errorMessage = '';

  // Verification state
  showVerificationPanel = false;
  pendingRegistration: PendingRegistrationResponse | null = null;
  codeCopied = false;
  isVerified = false;
  isPolling = false;
  secondsRemaining = 0;
  private pollingSubscription: Subscription | null = null;
  private timerSubscription: Subscription | null = null;

  // Password strength indicators
  passwordRequirements = {
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false
  };

  ngOnDestroy(): void {
    this.stopPolling();
  }

  onSubmit(): void {
    // Validación frontend antes de enviar
    const validationError = this.validateForm();
    if (validationError) {
      this.errorMessage = validationError;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.username, this.email, this.password).subscribe({
      next: (result) => {
        if (result.success && result.data) {
          console.log('Registration pending, showing verification panel...');
          this.pendingRegistration = result.data;
          this.showVerificationPanel = true;
          this.secondsRemaining = result.data.expires_in_minutes * 60;
          this.startPolling();
          this.startTimer();
        } else {
          this.errorMessage = result.error || 'Error al registrar usuario';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error during registration:', error);
        this.errorMessage = error.error?.error || 'Error al registrar. Intenta nuevamente.';
        this.isLoading = false;
      }
    });
  }

  copyCode(): void {
    if (this.pendingRegistration?.verification_code) {
      const fullCommand = `/verificar ${this.pendingRegistration.verification_code}`;
      navigator.clipboard.writeText(fullCommand).then(() => {
        this.codeCopied = true;
        setTimeout(() => this.codeCopied = false, 2000);
      });
    }
  }

  private startPolling(): void {
    if (this.pollingSubscription) return;

    this.isPolling = true;
    this.pollingSubscription = interval(3000) // Poll every 3 seconds
      .pipe(
        takeWhile(() => this.isPolling && !this.isVerified && this.secondsRemaining > 0)
      )
      .subscribe(() => {
        if (this.pendingRegistration) {
          this.checkVerificationStatus();
        }
      });
  }

  private stopPolling(): void {
    this.isPolling = false;
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }

  private startTimer(): void {
    this.timerSubscription = interval(1000)
      .pipe(takeWhile(() => this.secondsRemaining > 0 && !this.isVerified))
      .subscribe(() => {
        this.secondsRemaining--;
        if (this.secondsRemaining <= 0) {
          this.stopPolling();
        }
      });
  }

  private checkVerificationStatus(): void {
    if (!this.pendingRegistration) return;

    this.authService.getRegistrationStatus(this.pendingRegistration.pending_id).subscribe({
      next: (result) => {
        if (result.success && result.data) {
          if (result.data.status === 'VERIFIED') {
            this.isVerified = true;
            this.stopPolling();

            // Auto-login con One-Time Token
            if (result.data.auth_token) {
              this.performAutoLogin(result.data.auth_token);
            } else {
              // Fallback: redirigir a login si no hay token
              setTimeout(() => {
                this.router.navigate(['/login']);
              }, 2000);
            }
          } else if (result.data.status === 'EXPIRED' || result.data.status === 'CANCELLED') {
            this.stopPolling();
            this.errorMessage = result.data.status === 'EXPIRED'
              ? 'El código ha expirado. Por favor, regístrate de nuevo.'
              : 'El registro fue cancelado.';
          }
        }
      },
      error: (error) => {
        console.error('Error checking verification status:', error);
      }
    });
  }

  private performAutoLogin(authToken: string): void {
    this.authService.tokenLogin(authToken).subscribe({
      next: (result) => {
        if (result.success) {
          console.log('Auto-login successful!');
          // Redirigir a página de registro exitoso
          setTimeout(() => {
            this.router.navigate(['/registro-exitoso']);
          }, 1500);
        } else {
          // Si falla el auto-login, redirigir a login
          console.error('Auto-login failed:', result.error);
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
      },
      error: (error) => {
        console.error('Auto-login error:', error);
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      }
    });
  }

  retryRegistration(): void {
    this.showVerificationPanel = false;
    this.pendingRegistration = null;
    this.isVerified = false;
    this.stopPolling();
  }

  get formattedTime(): string {
    const minutes = Math.floor(this.secondsRemaining / 60);
    const seconds = this.secondsRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  validateForm(): string | null {
    // Validar username
    if (!this.username || this.username.length < 3) {
      return 'El nombre de usuario debe tener al menos 3 caracteres';
    }
    if (this.username.length > 30) {
      return 'El nombre de usuario no puede exceder 30 caracteres';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(this.username)) {
      return 'El nombre de usuario solo puede contener letras, números y guiones bajos';
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.email || !emailRegex.test(this.email)) {
      return 'Por favor ingresa un email válido';
    }

    // Validar contraseña
    if (!this.password || this.password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (!/[A-Z]/.test(this.password)) {
      return 'La contraseña debe contener al menos una letra mayúscula';
    }
    if (!/[a-z]/.test(this.password)) {
      return 'La contraseña debe contener al menos una letra minúscula';
    }
    if (!/\d/.test(this.password)) {
      return 'La contraseña debe contener al menos un número';
    }

    // Validar confirmación de contraseña
    if (this.password !== this.confirmPassword) {
      return 'Las contraseñas no coinciden';
    }

    // Validar términos
    if (!this.acceptTerms) {
      return 'Debes aceptar los términos y condiciones';
    }

    return null;
  }

  onPasswordChange(): void {
    // Actualizar indicadores de requisitos de contraseña
    this.passwordRequirements.minLength = this.password.length >= 8;
    this.passwordRequirements.hasUppercase = /[A-Z]/.test(this.password);
    this.passwordRequirements.hasLowercase = /[a-z]/.test(this.password);
    this.passwordRequirements.hasNumber = /\d/.test(this.password);
  }

  isValidForm(): boolean {
    return this.username.length >= 3 &&
      this.email.length > 0 &&
      this.password.length >= 8 &&
      this.password === this.confirmPassword &&
      this.acceptTerms &&
      this.passwordRequirements.minLength &&
      this.passwordRequirements.hasUppercase &&
      this.passwordRequirements.hasLowercase &&
      this.passwordRequirements.hasNumber;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
