import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard que requiere que el usuario sea parte del staff para acceder.
 * Roles permitidos: HELPER, BUILDER, MODERADOR, ADMIN, DEVELOPER
 * Si no es staff, redirige a home.
 */
export const staffGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.currentUser();

    // Verificar que esté autenticado y sea staff
    if (user && user.is_staff) {
        return true;
    }

    // Si no está autenticado, ir a login
    if (!authService.isAuthenticated()) {
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
    }

    // Si está autenticado pero no es staff, ir a home
    router.navigate(['/']);
    return false;
};
