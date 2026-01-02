import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AnimatedButton } from '../../core/components/animated-button/animated-button';
import { AuthService, User } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { PreferencesService } from '../../core/services/preferences.service';
import { GrovsService } from '../../core/services/grovs.service';
import { TRANSACTION_TYPE_LABELS, TRANSACTION_TYPE_ICONS } from '../../core/models/grovs.models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AnimatedButton],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);
  private readonly preferencesService = inject(PreferencesService);
  private readonly grovsService = inject(GrovsService);

  // User data
  user: User | null = null;

  // Account Info
  username = '';
  email = '';
  minecraftName = '';
  discord = '';
  bio = '';

  // Preferences
  timezone = '';
  notifications = {
    email: true,
    server: true,
  };

  // Edit states
  isEditingProfile = false;
  isEditingPassword = false;

  // Password Change
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // Messages
  isLoading = false;

  // Active tab
  activeTab: 'profile' | 'banners' | 'security' | 'preferences' | 'grovs' = 'profile';

  // Grovs
  readonly grovsBalance = this.grovsService.balance;
  readonly totalEarned = this.grovsService.totalEarned;
  readonly totalSpent = this.grovsService.totalSpent;
  readonly currentStreak = this.grovsService.currentStreak;
  readonly longestStreak = this.grovsService.longestStreak;
  readonly transactions = this.grovsService.transactions;
  readonly transactionsLoading = this.grovsService.transactionsLoading;
  readonly transactionTypeLabels = TRANSACTION_TYPE_LABELS;
  readonly transactionTypeIcons = TRANSACTION_TYPE_ICONS;

  // Avatar preview
  avatarPreview: string | null = null;
  selectedAvatarFile: File | null = null;

  timezones$!: Observable<string[]>;

  playerSkinUrl = computed(() => {
    // Usar el minecraft_username del usuario actual para generar la URL de la skin
    const minecraftUsername = this.user?.minecraft_username || 'Steve';
    return `https://minotar.net/avatar/${minecraftUsername}/64`;
  });

  ngOnInit(): void {
    // Cargar datos del usuario
    this.user = this.authService.currentUser();

    if (!this.user) {
      // Si no hay usuario, redirigir al login
      this.router.navigate(['/login']);
      return;
    }

    // Leer el query param 'tab' para activar la pestaña correspondiente
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      if (tab && ['profile', 'banners', 'security', 'preferences', 'grovs'].includes(tab)) {
        this.activeTab = tab as typeof this.activeTab;

        // Si se abre la pestaña de Grovs, cargar transacciones
        if (tab === 'grovs') {
          this.grovsService.getTransactions().subscribe();
        }
      }
    });

    // Inicializar timezones
    this.timezones$ = this.preferencesService.getTimezones();

    // Inicializar campos con datos del usuario
    this.username = this.user.username;
    this.email = this.user.email;
    this.minecraftName = this.user.minecraft_username || '';
    this.discord = this.user.discord_username || '';
    this.bio = this.user.bio || '';
    this.timezone = this.user.timezone || '';
    this.notifications = {
      email: this.user.notifications?.email ?? true,
      server: this.user.notifications?.server ?? true,
    };
  }

  onPreferencesSubmit(): void {
    this.isLoading = true;
    const preferences = {
      timezone: this.timezone,
      notifications: this.notifications,
    };

    this.preferencesService.savePreferences(preferences).subscribe({
      next: () => {
        this.notificationService.success('Preferencias guardadas correctamente');
        // Aquí podrías actualizar el usuario local si el backend devuelve el usuario actualizado
      },
      error: (error) => {
        this.notificationService.error(error.error?.error || 'Error al guardar las preferencias');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  setActiveTab(tab: 'profile' | 'banners' | 'security' | 'preferences' | 'grovs'): void {
    this.activeTab = tab;

    // Si se abre la pestaña de Grovs, cargar transacciones
    if (tab === 'grovs' && this.transactions().length === 0) {
      this.grovsService.getTransactions().subscribe();
    }
  }

  loadMoreTransactions(): void {
    // Cargar más transacciones (implementar paginación en el futuro)
    this.grovsService.getTransactions().subscribe();
  }

  getTransactionIcon(type: string): string {
    return this.transactionTypeIcons[type as keyof typeof this.transactionTypeIcons] || '📊';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  toggleEditProfile(): void {
    this.isEditingProfile = !this.isEditingProfile;
    if (!this.isEditingProfile) {
      // Restaurar valores originales si se cancela
      this.username = this.user?.username || '';
      this.email = this.user?.email || '';
      this.minecraftName = this.user?.minecraft_username || '';
      this.discord = this.user?.discord_username || '';
      this.bio = this.user?.bio || '';
    }
  }

  toggleEditPassword(): void {
    this.isEditingPassword = !this.isEditingPassword;
    if (!this.isEditingPassword) {
      // Limpiar campos de contraseña
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
    }
  }

  onProfilePictureChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar tamaño (máximo 5MB para coincidir con el backend)
      if (file.size > 5242880) {
        this.notificationService.error('La imagen no debe superar 5MB');
        return;
      }

      // Validar tipo
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
        this.notificationService.error('Solo se permiten imágenes JPG, PNG o WebP');
        return;
      }

      this.isLoading = true;

      // Subir avatar directamente al backend
      this.authService.uploadAvatar(file).subscribe({
        next: (response) => {
          if (response.success && response.avatar_url) {
            this.notificationService.success(response.message || 'Avatar actualizado correctamente');
            // Actualizar avatar del usuario
            if (this.user) {
              this.user.avatar_url = response.avatar_url;
            }
            this.avatarPreview = response.avatar_url;
          } else {
            this.notificationService.error(response.error || 'Error al subir el avatar');
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error uploading avatar:', error);
          this.notificationService.error('Error al subir el avatar');
          this.isLoading = false;
        }
      });
    }
  }

  onDeleteAvatar(): void {
    if (!confirm('¿Estás seguro de que deseas eliminar tu avatar?')) {
      return;
    }

    this.isLoading = true;

    this.authService.deleteAvatar().subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.success(response.message || 'Avatar eliminado correctamente');
          // Limpiar avatar del usuario
          if (this.user) {
            this.user.avatar_url = undefined;
          }
          this.avatarPreview = null;
        } else {
          this.notificationService.error(response.error || 'Error al eliminar el avatar');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error deleting avatar:', error);
        this.notificationService.error('Error al eliminar el avatar');
        this.isLoading = false;
      }
    });
  }

  onAccountInfoSubmit(): void {
    this.isLoading = true;

    // Solo enviar campos que hayan cambiado
    const profileData: Partial<User> = {};

    if (this.username !== this.user?.username) {
      profileData.username = this.username;
    }
    if (this.email !== this.user?.email) {
      profileData.email = this.email;
    }
    if (this.minecraftName !== this.user?.minecraft_username) {
      profileData.minecraft_username = this.minecraftName;
    }
    if (this.discord !== (this.user?.discord_username || '')) {
      profileData.discord_username = this.discord;
    }
    if (this.bio !== (this.user?.bio || '')) {
      profileData.bio = this.bio;
    }

    // Si no hay cambios, no hacer la petición
    if (Object.keys(profileData).length === 0) {
      this.notificationService.info('No hay cambios para guardar');
      this.isLoading = false;
      this.isEditingProfile = false;
      return;
    }

    this.authService.updateProfile(profileData).subscribe({
      next: (response) => {
        if (response.success && response.user) {
          this.user = response.user;
          this.notificationService.success('Perfil actualizado correctamente');
          this.isEditingProfile = false;
        } else {
          this.notificationService.error(response.error || 'Ocurrió un error');
        }
      },
      error: (error) => {
        this.notificationService.error(error.error?.error || 'Error de conexión');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onPasswordChangeSubmit(): void {
    // Validar que las contraseñas coincidan
    if (this.newPassword !== this.confirmPassword) {
      this.notificationService.error('Las nuevas contraseñas no coinciden');
      return;
    }

    // Validar longitud de contraseña
    if (this.newPassword.length < 8) {
      this.notificationService.error('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    this.isLoading = true;

    this.authService.changePassword(this.currentPassword, this.newPassword, this.confirmPassword).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.success('Contraseña actualizada correctamente');
          this.isEditingPassword = false;
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
        } else {
          this.notificationService.error(response.error || 'Error al cambiar la contraseña');
        }
      },
      error: (error) => {
        this.notificationService.error(error.error?.error || 'Error de conexión');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  setActiveBanner(bannerId: number | null): void {
    this.isLoading = true;
    this.authService.updateProfile({ active_banner_id: bannerId }).subscribe({
      next: (response) => {
        if (response.success && response.user) {
          this.user = response.user;
          const message = bannerId ? 'Banner activado correctamente' : 'Banner desactivado correctamente';
          this.notificationService.success(message);
        } else {
          this.notificationService.error(response.error || 'Error al cambiar de banner');
        }
      },
      error: (err) => {
        console.error('Error setting active banner:', err);
        this.notificationService.error('Hubo un problema al conectar con el servidor.');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
      }
    });
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    switch (field) {
      case 'current':
        this.showCurrentPassword = !this.showCurrentPassword;
        break;
      case 'new':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirm':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }

  getRoleBadgeClass(): string {
    const role = this.user?.role || 'DEFAULT';
    const roleClasses: { [key: string]: string } = {
      'DEFAULT': 'role-badge-default',
      'USUARIO': 'role-badge-usuario',
      'APRENDIZ': 'role-badge-aprendiz',
      'MIEMBRO': 'role-badge-miembro',
      'VETERANO': 'role-badge-veterano',
      'VIP': 'role-badge-vip',
      'VIP_PLUS': 'role-badge-vip-plus',
      'STREAMER': 'role-badge-streamer',
      'HELPER': 'role-badge-helper',
      'BUILDER': 'role-badge-builder',
      'MODERADOR': 'role-badge-moderador',
      'ADMIN': 'role-badge-admin',
      'DEVELOPER': 'role-badge-developer'
    };
    return roleClasses[role] || 'role-badge-default';
  }

  getMemberSince(): string {
    if (!this.user?.date_joined) return '';
    const date = new Date(this.user.date_joined);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  get collectedBanners() {
    return this.user?.collected_banners || [];
  }

  get hasCollectedBanners(): boolean {
    return this.collectedBanners.length > 0;
  }

  public onAvatarError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/img/placeholder.svg';
  }
}