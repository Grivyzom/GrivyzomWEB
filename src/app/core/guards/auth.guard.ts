import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard que requiere autenticación para acceder a la ruta.
 * Si no está autenticado, redirige a /login
 */
export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        return true;
    }

    // Guardar URL a la que intentaba acceder para redirect después de login
    const returnUrl = state.url;
    router.navigate(['/login'], { queryParams: { returnUrl } });
    return false;
};
