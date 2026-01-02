import { Injectable, signal, computed, inject, Injector, runInInjectionContext } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Banner {
  id: number;
  name: string;
  description?: string;
  image_url: string;
  video_url?: string;  // Optional video for animated banners
}

export interface User {
  id: string;
  username: string;
  minecraft_username: string;
  email: string;
  role: string;
  role_display: string;
  is_staff: boolean;
  is_player?: boolean;
  avatar_url?: string;
  discord_username?: string;
  bio?: string;
  date_joined?: string;
  active_banner?: Banner | null;
  collected_banners?: Banner[];
  password_reset_token?: string | null;
  password_reset_expires?: string | null;
  timezone?: string;
  notifications?: {
    email?: boolean;
    server?: boolean;
  };

  // CAMPOS GROVS (Sistema de Puntos)
  grovs_balance: number;
  total_grovs_earned: number;
  total_grovs_spent: number;
  current_login_streak: number;
  longest_login_streak: number;
  last_daily_reward_claim?: string;
}

interface LoginResponse {
  message: string;
  user: User;
}

interface RegisterResponse {
  message: string;
  user: User;
}

// Nueva interface para registro pendiente (verificación Minecraft)
export interface PendingRegistrationResponse {
  message: string;
  pending_id: number;
  verification_code: string;
  expires_in_minutes: number;
  instructions: string;
}

export interface RegistrationStatusResponse {
  status: 'PENDING' | 'VERIFIED' | 'EXPIRED' | 'CANCELLED';
  status_display: string;
  is_expired: boolean;
  username: string;
  verified?: boolean;
  user?: User;
  auth_token?: string;  // One-Time Token para auto-login
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Callback to initialize grovs after login (set by GrovsService)
  private onLoginCallback: ((user: any) => void) | null = null;
  private onLogoutCallback: (() => void) | null = null;

  /**
   * Register callbacks for grovs initialization (called by GrovsService)
   */
  registerGrovsCallbacks(onLogin: (user: any) => void, onLogout: () => void): void {
    this.onLoginCallback = onLogin;
    this.onLogoutCallback = onLogout;
  }
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly _currentUser = signal<User | null>(null);
  private readonly _isAuthenticated = signal(false);

  // Señales públicas (readonly)
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = this._isAuthenticated.asReadonly();

  constructor() {
    // Verificar si hay una sesión guardada en localStorage al inicializar
    this.checkStoredSession();
  }

  /**
   * Verifica si hay una sesión guardada en localStorage
   */
  private checkStoredSession(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this._updateUserSession(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        this._updateUserSession(null);
      }
    }
  }

  /**
   * Inicia sesión con credenciales
   */
  login(username: string, password: string): Observable<boolean> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login/`, {
      username,
      password
    }, { withCredentials: true }).pipe(
      map(response => {
        this._updateUserSession(response.user);
        // Initialize grovs after login (non-reactive)
        if (this.onLoginCallback) {
          this.onLoginCallback(response.user);
        }
        return true;
      })
      // No catchError here - let errors propagate to the component
    );
  }

  /**
   * Registra un nuevo usuario - Ahora retorna PendingRegistrationResponse
   * El usuario debe verificar en Minecraft antes de poder hacer login
   */
  register(username: string, email: string, password: string): Observable<{ success: boolean, data?: PendingRegistrationResponse, error?: string }> {
    return this.http.post<PendingRegistrationResponse>(`${this.apiUrl}/auth/register/`, {
      username,
      email,
      password
    }, { withCredentials: true }).pipe(
      map(response => {
        return { success: true, data: response };
      }),
      catchError(error => {
        console.error('Register error:', error);
        return of({
          success: false,
          error: error.error?.error || 'Error al registrar usuario'
        });
      })
    );
  }

  /**
   * Consulta el estado de un registro pendiente (para polling)
   * Ahora incluye auth_token para auto-login si está verificado
   */
  getRegistrationStatus(pendingId: number): Observable<{ success: boolean, data?: RegistrationStatusResponse, error?: string }> {
    return this.http.get<RegistrationStatusResponse>(
      `${this.apiUrl}/auth/registration-status/${pendingId}/`,
      { withCredentials: true }
    ).pipe(
      map(response => {
        return { success: true, data: response };
      }),
      catchError(error => {
        console.error('Registration status error:', error);
        return of({
          success: false,
          error: error.error?.error || 'Error al consultar estado'
        });
      })
    );
  }

  /**
   * Auto-login usando One-Time Token (OTT)
   * Intercambia el auth_token por una sesión de usuario
   */
  tokenLogin(authToken: string): Observable<{ success: boolean, user?: User, error?: string }> {
    return this.http.post<{ success: boolean, user: User, message: string }>(
      `${this.apiUrl}/auth/token-login/`,
      { auth_token: authToken },
      { withCredentials: true }
    ).pipe(
      map(response => {
        if (response.success && response.user) {
          this._updateUserSession(response.user);
        }
        return { success: true, user: response.user };
      }),
      catchError(error => {
        console.error('Token login error:', error);
        return of({
          success: false,
          error: error.error?.error || 'Error al iniciar sesión'
        });
      })
    );
  }

  /**
   * Cierra sesión
   */
  logout(): Observable<boolean> {
    return this.http.post(`${this.apiUrl}/auth/logout/`, {}, { withCredentials: true }).pipe(
      map(() => {
        this._updateUserSession(null);
        // Reset grovs on logout (non-reactive)
        if (this.onLogoutCallback) {
          this.onLogoutCallback();
        }
        return true;
      }),
      catchError(error => {
        console.error('Logout error:', error);
        // Limpiar sesión local incluso si falla el backend
        this._updateUserSession(null);
        if (this.onLogoutCallback) {
          this.onLogoutCallback();
        }
        return of(true);
      })
    );
  }

  /**
   * Envia una solicitud para recuperar la contraseña.
   */
  forgotPassword(email: string): Observable<{ success: boolean, message?: string, error?: string }> {
    return this.http.post<{ message: string, error?: string }>(
      `${this.apiUrl}/auth/forgot-password/`,
      { email },
      { withCredentials: true }
    ).pipe(
      map(response => {
        return { success: true, message: response.message };
      }),
      catchError(error => {
        console.error('Forgot password error:', error);
        return of({
          success: false,
          error: error.error?.error || 'Error al solicitar el restablecimiento de contraseña.'
        });
      })
    );
  }

  /**
   * Confirma el restablecimiento de contraseña con un token y una nueva contraseña.
   */
  resetPasswordConfirm(token: string, newPassword: string, confirmPassword: string): Observable<{ success: boolean, message?: string, error?: string }> {
    return this.http.post<{ message: string, error?: string }>(
      `${this.apiUrl}/auth/reset-password-confirm/`,
      { token, new_password: newPassword, confirm_password: confirmPassword },
      { withCredentials: true }
    ).pipe(
      map(response => {
        return { success: true, message: response.message };
      }),
      catchError(error => {
        console.error('Reset password confirm error:', error);
        return of({
          success: false,
          error: error.error?.error || 'Error al restablecer la contraseña.'
        });
      })
    );
  }

  /**
   * Obtiene el perfil del usuario actual desde el backend
   */
  getUserProfile(): Observable<User | null> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/auth/profile/`, { withCredentials: true }).pipe(
      map(response => {
        this._updateUserSession(response.user);
        return response.user;
      }),
      catchError(error => {
        console.error('Get profile error:', error);
        return of(null);
      })
    );
  }

  /**
   * Actualiza la información del perfil del usuario
   */
  updateProfile(profileData: Partial<User> & { active_banner_id?: number | null }): Observable<{ success: boolean, message?: string, user?: User, error?: string }> {
    return this.http.put<{ message: string, user: User, error?: string }>(
      `${this.apiUrl}/auth/update-profile/`,
      profileData,
      { withCredentials: true }
    ).pipe(
      map(response => {
        if (response.user) {
          this._updateUserSession(response.user);
          return { success: true, message: response.message, user: response.user };
        }
        return { success: false, error: 'No se recibió información del usuario' };
      }),
      catchError(error => {
        console.error('Update profile error:', error);
        return of({
          success: false,
          error: error.error?.error || 'Error al actualizar el perfil'
        });
      })
    );
  }

  /**
   * Cambia la contraseña del usuario
   */
  changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Observable<{ success: boolean, message?: string, error?: string }> {
    return this.http.post<{ message: string, error?: string }>(
      `${this.apiUrl}/auth/change-password/`,
      {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      },
      { withCredentials: true }
    ).pipe(
      map(response => {
        return { success: true, message: response.message };
      }),
      catchError(error => {
        console.error('Change password error:', error);
        return of({
          success: false,
          error: error.error?.error || 'Error al cambiar la contraseña'
        });
      })
    );
  }

  /**
   * Sube o actualiza el avatar del usuario
   */
  uploadAvatar(file: File): Observable<{ success: boolean, message?: string, avatar_url?: string, error?: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.http.post<{ message: string, avatar_url: string, error?: string }>(
      `${this.apiUrl}/auth/upload-avatar/`,
      formData,
      { withCredentials: true }
    ).pipe(
      map(response => {
        const currentUserData = this.currentUser();
        if (currentUserData && response.avatar_url) {
          const updatedUser = { ...currentUserData, avatar_url: response.avatar_url };
          this._updateUserSession(updatedUser);
        }
        return { success: true, message: response.message, avatar_url: response.avatar_url };
      }),
      catchError(error => {
        console.error('Upload avatar error:', error);
        return of({
          success: false,
          error: error.error?.error || 'Error al subir el avatar'
        });
      })
    );
  }

  /**
   * Elimina el avatar del usuario
   */
  deleteAvatar(): Observable<{ success: boolean, message?: string, error?: string }> {
    return this.http.delete<{ message: string, error?: string }>(
      `${this.apiUrl}/auth/upload-avatar/`,
      { withCredentials: true }
    ).pipe(
      map(response => {
        const currentUserData = this.currentUser();
        if (currentUserData) {
          const updatedUser = { ...currentUserData, avatar_url: undefined };
          this._updateUserSession(updatedUser);
        }
        return { success: true, message: response.message };
      }),
      catchError(error => {
        console.error('Delete avatar error:', error);
        return of({
          success: false,
          error: error.error?.error || 'Error al eliminar el avatar'
        });
      })
    );
  }

  /**
   * Actualiza la sesión del usuario en memoria y localStorage
   */
  private _updateUserSession(user: User | null): void {
    this._currentUser.set(user);
    this._isAuthenticated.set(!!user);

    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');
    } else {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isAuthenticated');
    }
  }

  /**
   * Obtiene el nombre de usuario actual
   */
  getUsername(): string | null {
    return this._currentUser()?.username || null;
  }

  /**
   * Obtiene el rol del usuario actual
   */
  getUserRole(): string | null {
    return this._currentUser()?.role_display || null;
  }

  /**
   * Verifica si el usuario es staff
   */
  isStaff(): boolean {
    return this._currentUser()?.is_staff || false;
  }
}
