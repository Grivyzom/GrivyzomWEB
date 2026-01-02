import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, User, Lock, Eye, EyeOff, Check, LogIn } from 'lucide-angular';
import { AnimatedButton } from '../../core/components/animated-button/animated-button';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AnimatedButton, LucideAngularModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {
  // Lucide icons
  readonly icons = { User, Lock, Eye, EyeOff, Check, LogIn };
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  username = '';
  password = '';
  rememberMe = false;
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  private returnUrl = '/';

  ngOnInit(): void {
    // Obtener returnUrl de los query params
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        console.log('Login successful, navigating to:', this.returnUrl);
        // Small delay to let Angular finish processing auth state changes
        // This prevents page freeze from cascading signal updates
        setTimeout(() => {
          this.router.navigateByUrl(this.returnUrl);
          this.isLoading = false;
        }, 100);
      },
      error: (error) => {
        console.error('Error during login:', error);
        // Extract error message from response
        this.errorMessage = error.error?.error || error.error?.message || 'Error al iniciar sesión. Intenta nuevamente.';
        this.isLoading = false;
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
