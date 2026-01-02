import { Component, signal, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Navbar } from './core/components/navbar/navbar';
import { NotificationBar } from './core/components/notification-bar/notification-bar';
import { FooterComponent } from './core/components/footer/footer';
import { ToastNotificationComponent } from './core/components/toast-notification/toast-notification';
import { ScrollToTopButtonComponent } from './core/components/scroll-to-top-button/scroll-to-top-button';
import { DailyRewardModalComponent } from './core/components/daily-reward-modal/daily-reward-modal';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, NotificationBar, FooterComponent, ToastNotificationComponent, ScrollToTopButtonComponent, DailyRewardModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  protected readonly title = signal('grivyzom-web');

  // Rutas permitidas sin redirección (auth pages)
  private readonly allowedRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

  ngOnInit(): void {
    const hostname = window.location.hostname;

    // Solo aplicar lógica especial para foro.grivyzom.com
    if (hostname === 'foro.grivyzom.com') {
      this.handleForoSubdomain();
    }
  }

  private handleForoSubdomain(): void {
    const currentPath = window.location.pathname;

    // Si ya está en /foro o en una ruta de auth, no hacer nada
    if (currentPath.startsWith('/foro') || this.isAllowedRoute(currentPath)) {
      return;
    }

    // Si está autenticado, ir a /foro
    // Si no está autenticado, ir a /login con returnUrl
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/foro']);
    } else {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/foro' } });
    }
  }

  private isAllowedRoute(path: string): boolean {
    return this.allowedRoutes.some(route => path.startsWith(route));
  }
}
