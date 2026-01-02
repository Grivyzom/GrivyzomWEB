import { Component, Input, Output, EventEmitter, signal, inject, HostListener, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, User, Settings, LogOut, Crown, Palette, Bell, Shield, ChevronRight, ExternalLink } from 'lucide-angular';
import { AuthService, User as UserType } from '../../services/auth.service';

export interface ProfileMenuItem {
    label: string;
    icon: any;
    route?: string;
    externalUrl?: string;
    action?: () => void;
    badge?: string;
    divider?: boolean;
    danger?: boolean;
}

@Component({
    selector: 'app-profile-dropdown',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule],
    templateUrl: './profile-dropdown.html',
    styleUrls: ['./profile-dropdown.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileDropdownComponent {
    private readonly elementRef = inject(ElementRef);
    private readonly router = inject(Router);
    private readonly authService = inject(AuthService);

    // Icons
    readonly icons = {
        User, Settings, LogOut, Crown, Palette, Bell, Shield, ChevronRight, ExternalLink
    };

    // Input - User data
    @Input() user: UserType | null = null;
    @Input() avatarUrl: string = 'assets/img/placeholder.svg';

    // Output events
    @Output() logout = new EventEmitter<void>();
    @Output() menuClose = new EventEmitter<void>();

    // State
    readonly isOpen = signal(false);

    // Menu items
    readonly menuItems: ProfileMenuItem[] = [
        { label: 'Mi Perfil', icon: User, route: '/profile' },
        { label: 'Mis Banners', icon: Palette, route: '/profile/banners' },
        { label: 'Notificaciones', icon: Bell, route: '/profile/notifications', badge: '3' },
        { divider: true, label: '', icon: null },
        { label: 'Configuración', icon: Settings, route: '/profile/settings' },
    ];

    // Admin menu item (shown conditionally)
    readonly adminItem: ProfileMenuItem = {
        label: 'Panel Admin',
        icon: Shield,
        route: '/admin'
    };

    // Logout item
    readonly logoutItem: ProfileMenuItem = {
        label: 'Cerrar Sesión',
        icon: LogOut,
        danger: true
    };

    /**
     * Toggle dropdown
     */
    toggle(): void {
        this.isOpen.update(v => !v);
    }

    /**
     * Open dropdown
     */
    open(): void {
        this.isOpen.set(true);
    }

    /**
     * Close dropdown
     */
    close(): void {
        this.isOpen.set(false);
        this.menuClose.emit();
    }

    /**
     * Handle menu item click
     */
    onItemClick(item: ProfileMenuItem, event?: Event): void {
        if (item.action) {
            event?.preventDefault();
            item.action();
        } else if (item.route) {
            this.router.navigate([item.route]);
        } else if (item.externalUrl) {
            window.open(item.externalUrl, '_blank');
        }
        this.close();
    }

    /**
     * Handle logout
     */
    onLogout(): void {
        this.logout.emit();
        this.close();
    }

    /**
     * Close on outside click
     */
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.close();
        }
    }

    /**
     * Handle keyboard
     */
    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            this.close();
        }
    }

    /**
     * Get user display name
     */
    get displayName(): string {
        return this.user?.minecraft_username || this.user?.username || 'Usuario';
    }

    /**
     * Get user role display
     */
    get roleDisplay(): string {
        return this.user?.role_display || 'Guest';
    }

    /**
     * Check if user is staff
     */
    get isStaff(): boolean {
        return this.user?.is_staff || false;
    }
}
