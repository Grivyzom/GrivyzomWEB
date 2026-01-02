import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Users, FileText, Image, Clock, UserPlus, TrendingUp, Activity } from 'lucide-angular';
import { AdminHeaderComponent, Breadcrumb } from '../../../core/components/admin-header/admin-header';
import { StatCardComponent } from '../../../core/components/stat-card/stat-card';
import { AdminService, DashboardStats } from '../../../core/services/admin.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        LucideAngularModule,
        AdminHeaderComponent,
        StatCardComponent
    ],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
    private readonly adminService = inject(AdminService);

    readonly icons = {
        Users,
        FileText,
        Image,
        Clock,
        UserPlus,
        TrendingUp,
        Activity
    };

    readonly breadcrumbs: Breadcrumb[] = [
        { label: 'Admin', route: '/admin' },
        { label: 'Dashboard' }
    ];

    readonly isLoading = signal(true);
    readonly stats = signal<DashboardStats | null>(null);

    ngOnInit(): void {
        this.loadStats();
    }

    loadStats(): void {
        this.isLoading.set(true);
        this.adminService.getDashboardStats().subscribe(data => {
            this.stats.set(data);
            this.isLoading.set(false);
        });
    }

    // Stat cards configuration
    get statCards() {
        const s = this.stats();
        if (!s) return [];

        return [
            {
                title: 'Usuarios Totales',
                value: s.total_users,
                icon: this.icons.Users,
                iconColor: '#8b5cf6',
                trend: 12,
                trendLabel: 'vs mes anterior'
            },
            {
                title: 'Posts',
                value: s.total_posts,
                icon: this.icons.FileText,
                iconColor: '#3b82f6',
                trend: s.posts_today,
                trendLabel: 'hoy'
            },
            {
                title: 'Imágenes Galería',
                value: s.total_gallery_images,
                icon: this.icons.Image,
                iconColor: '#22c55e'
            },
            {
                title: 'Registros Pendientes',
                value: s.pending_registrations,
                icon: this.icons.Clock,
                iconColor: '#f59e0b'
            },
            {
                title: 'Usuarios Hoy',
                value: s.users_today,
                icon: this.icons.UserPlus,
                iconColor: '#ec4899'
            },
            {
                title: 'Activos esta Semana',
                value: s.active_users_week,
                icon: this.icons.Activity,
                iconColor: '#06b6d4'
            }
        ];
    }
}
