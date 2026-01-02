import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Users, UserCheck, Shield, ShieldCheck, UserX, UserPlus, Search, Filter, ChevronLeft, ChevronRight, Ban, Award, Mail, Calendar, Clock, MessageSquare, Heart, User, Gamepad2, AtSign } from 'lucide-angular';
import { AdminHeaderComponent, Breadcrumb } from '../../../core/components/admin-header/admin-header';
import { StatCardComponent } from '../../../core/components/stat-card/stat-card';
import { AdminService, AdminUser, AdminUserDetail, UsersStats, PaginatedResponse } from '../../../core/services/admin.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    AdminHeaderComponent,
    StatCardComponent
  ],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class UsersComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  // Icons
  readonly icons = {
    Users, UserCheck, Shield, ShieldCheck, UserX, UserPlus,
    Search, Filter, ChevronLeft, ChevronRight, Ban, Award,
    Mail, Calendar, Clock, MessageSquare, Heart, User, Gamepad2, AtSign
  };

  // Breadcrumbs
  readonly breadcrumbs: Breadcrumb[] = [
    { label: 'Admin', route: '/admin' },
    { label: 'Usuarios' }
  ];

  // Roles disponibles
  readonly roles = [
    { value: '', label: 'Todos los roles' },
    { value: 'DEFAULT', label: 'Default' },
    { value: 'USUARIO', label: 'Usuario' },
    { value: 'APRENDIZ', label: 'Aprendiz' },
    { value: 'MIEMBRO', label: 'Miembro' },
    { value: 'VETERANO', label: 'Veterano' },
    { value: 'VIP', label: 'VIP' },
    { value: 'VIP_PLUS', label: 'VIP+' },
    { value: 'STREAMER', label: 'Streamer' },
    { value: 'HELPER', label: 'Helper' },
    { value: 'BUILDER', label: 'Builder' },
    { value: 'MODERADOR', label: 'Moderador' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'DEVELOPER', label: 'Developer' }
  ];

  // Estados disponibles
  readonly statuses = [
    { value: '', label: 'Todos los estados' },
    { value: 'active', label: 'Activos' },
    { value: 'banned', label: 'Baneados' },
    { value: 'inactive', label: 'Inactivos' }
  ];

  // State signals
  readonly stats = signal<UsersStats | null>(null);
  readonly users = signal<AdminUser[]>([]);
  readonly selectedUser = signal<AdminUserDetail | null>(null);
  readonly isLoading = signal(true);
  readonly isLoadingUsers = signal(false);
  readonly isLoadingDetail = signal(false);

  // Pagination
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly totalUsers = signal(0);

  // Filters
  readonly searchQuery = signal('');
  readonly roleFilter = signal('');
  readonly statusFilter = signal('');

  // Search debounce
  private searchSubject = new Subject<string>();

  // Role change
  readonly isChangingRole = signal(false);
  readonly selectedNewRole = signal('');

  // Ban modal
  readonly showBanModal = signal(false);
  readonly banReason = signal('');
  readonly isProcessingBan = signal(false);

  // Computed stats cards
  readonly statCards = computed(() => {
    const s = this.stats();
    if (!s) return [];

    return [
      {
        title: 'Usuarios Registrados',
        value: s.total_users,
        icon: this.icons.Users,
        iconColor: '#8b5cf6'
      },
      {
        title: 'En Línea',
        value: s.online_users,
        icon: this.icons.UserCheck,
        iconColor: '#22c55e'
      },
      {
        title: 'Staff Conectado',
        value: s.staff_online,
        icon: this.icons.Shield,
        iconColor: '#3b82f6'
      },
      {
        title: 'Staff Total',
        value: s.staff_total,
        icon: this.icons.ShieldCheck,
        iconColor: '#667eea'
      },
      {
        title: 'Baneados',
        value: s.banned_users,
        icon: this.icons.UserX,
        iconColor: '#ef4444'
      },
      {
        title: 'Nuevos Hoy',
        value: s.users_today,
        icon: this.icons.UserPlus,
        iconColor: '#f59e0b'
      }
    ];
  });

  ngOnInit(): void {
    this.loadStats();
    this.loadUsers();

    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.loadUsers();
    });
  }

  loadStats(): void {
    this.adminService.getUsersStats().subscribe(stats => {
      this.stats.set(stats);
      this.isLoading.set(false);
    });
  }

  loadUsers(): void {
    this.isLoadingUsers.set(true);
    this.adminService.getUsers(
      this.currentPage(),
      this.searchQuery(),
      this.roleFilter(),
      this.statusFilter()
    ).subscribe(response => {
      if (response) {
        this.users.set(response.items);
        this.totalPages.set(response.total_pages);
        this.totalUsers.set(response.total);
      }
      this.isLoadingUsers.set(false);
    });
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onRoleFilterChange(role: string): void {
    this.roleFilter.set(role);
    this.currentPage.set(1);
    this.loadUsers();
  }

  onStatusFilterChange(status: string): void {
    this.statusFilter.set(status);
    this.currentPage.set(1);
    this.loadUsers();
  }

  selectUser(user: AdminUser): void {
    this.isLoadingDetail.set(true);
    this.adminService.getUserDetail(user.id).subscribe(detail => {
      this.selectedUser.set(detail);
      this.selectedNewRole.set(detail?.role || '');
      this.isLoadingDetail.set(false);
    });
  }

  clearSelection(): void {
    this.selectedUser.set(null);
  }

  // Pagination
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadUsers();
    }
  }

  previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  // Role management
  changeRole(): void {
    const user = this.selectedUser();
    const newRole = this.selectedNewRole();

    if (!user || !newRole || newRole === user.role) return;

    this.isChangingRole.set(true);
    this.adminService.changeUserRole(user.id, newRole).subscribe(result => {
      if (result.success) {
        // Refresh user detail
        this.selectUser({ id: user.id } as AdminUser);
        this.loadUsers();
        this.loadStats();
      }
      this.isChangingRole.set(false);
    });
  }

  // Ban management
  openBanModal(): void {
    this.banReason.set('');
    this.showBanModal.set(true);
  }

  closeBanModal(): void {
    this.showBanModal.set(false);
  }

  confirmBan(): void {
    const user = this.selectedUser();
    if (!user) return;

    this.isProcessingBan.set(true);
    this.adminService.toggleUserBan(user.id, true, this.banReason()).subscribe(result => {
      if (result.success) {
        this.selectUser({ id: user.id } as AdminUser);
        this.loadUsers();
        this.loadStats();
      }
      this.isProcessingBan.set(false);
      this.closeBanModal();
    });
  }

  unbanUser(): void {
    const user = this.selectedUser();
    if (!user) return;

    this.isProcessingBan.set(true);
    this.adminService.toggleUserBan(user.id, false).subscribe(result => {
      if (result.success) {
        this.selectUser({ id: user.id } as AdminUser);
        this.loadUsers();
        this.loadStats();
      }
      this.isProcessingBan.set(false);
    });
  }

  // Helpers
  getMinecraftAvatar(username: string | null): string {
    if (!username) return 'https://mc-heads.net/avatar/MHF_Steve/48';
    return `https://mc-heads.net/avatar/${username}/48`;
  }

  getRoleColor(role: string): string {
    const colors: Record<string, string> = {
      'DEFAULT': '#718096',
      'USUARIO': '#718096',
      'APRENDIZ': '#22c55e',
      'MIEMBRO': '#3b82f6',
      'VETERANO': '#f59e0b',
      'VIP': '#eab308',
      'VIP_PLUS': '#f97316',
      'STREAMER': '#ec4899',
      'HELPER': '#10b981',
      'BUILDER': '#6366f1',
      'MODERADOR': '#8b5cf6',
      'ADMIN': '#ef4444',
      'DEVELOPER': '#dc2626'
    };
    return colors[role] || '#718096';
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return 'Nunca';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  formatRelativeTime(dateStr: string | null): string {
    if (!dateStr) return 'Nunca';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return this.formatDate(dateStr);
  }
}
