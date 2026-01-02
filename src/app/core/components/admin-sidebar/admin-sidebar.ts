import { Component, signal, computed, inject, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { LucideAngularModule, LayoutDashboard, Users, FileText, Image, Settings, Home, LogOut, ChevronLeft, ChevronRight, Shield, X, Package } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';
import { filter, Subscription } from 'rxjs';

interface NavItem {
    label: string;
    icon: any;
    route: string;
    badge?: number;
}

@Component({
    selector: 'app-admin-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule],
    templateUrl: './admin-sidebar.html',
    styleUrl: './admin-sidebar.css'
})
export class AdminSidebarComponent implements OnInit, OnDestroy {
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private routerSubscription?: Subscription;

    readonly icons = {
        LayoutDashboard,
        Users,
        FileText,
        Image,
        Settings,
        Home,
        LogOut,
        ChevronLeft,
        ChevronRight,
        Shield,
        X,
        Package
    };

    readonly isCollapsed = signal(false);
    readonly isMobileOpen = signal(false);
    readonly isMobile = signal(false);
    readonly currentUser = computed(() => this.authService.currentUser());

    readonly navItems: NavItem[] = [
        { label: 'Dashboard', icon: LayoutDashboard, route: '/admin/dashboard' },
        { label: 'Usuarios', icon: Users, route: '/admin/users' },
        { label: 'Posts', icon: FileText, route: '/admin/posts' },
        { label: 'Galería', icon: Image, route: '/admin/gallery' },
        { label: 'Productos', icon: Package, route: '/admin/products' },
        { label: 'Contenido', icon: Settings, route: '/admin/content' }
    ];

    private readonly MOBILE_BREAKPOINT = 768;

    ngOnInit(): void {
        this.checkViewport();
        // Close sidebar on route change (mobile)
        this.routerSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(() => {
                if (this.isMobile()) {
                    this.closeMobile();
                }
            });
    }

    ngOnDestroy(): void {
        this.routerSubscription?.unsubscribe();
    }

    @HostListener('window:resize')
    onResize(): void {
        this.checkViewport();
    }

    private checkViewport(): void {
        const mobile = window.innerWidth < this.MOBILE_BREAKPOINT;
        this.isMobile.set(mobile);

        // Close mobile menu if viewport becomes larger
        if (!mobile && this.isMobileOpen()) {
            this.isMobileOpen.set(false);
        }
    }

    toggleCollapse(): void {
        if (!this.isMobile()) {
            this.isCollapsed.update(v => !v);
        }
    }

    openMobile(): void {
        if (this.isMobile()) {
            this.isMobileOpen.set(true);
            // Prevent body scroll when mobile menu is open
            document.body.style.overflow = 'hidden';
        }
    }

    closeMobile(): void {
        this.isMobileOpen.set(false);
        document.body.style.overflow = '';
    }

    onNavClick(): void {
        if (this.isMobile()) {
            this.closeMobile();
        }
    }

    goToSite(): void {
        this.closeMobile();
        this.router.navigate(['/']);
    }

    logout(): void {
        this.closeMobile();
        this.authService.logout().subscribe(() => {
            this.router.navigate(['/']);
        });
    }

    getAvatarUrl(): string {
        return this.currentUser()?.avatar_url || '/assets/img/default-avatar.png';
    }
}
