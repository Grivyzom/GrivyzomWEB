import { Component, ViewChild, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Menu } from 'lucide-angular';
import { AdminSidebarComponent } from '../../../core/components/admin-sidebar/admin-sidebar';

@Component({
    selector: 'app-admin-layout',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule, AdminSidebarComponent],
    templateUrl: './admin-layout.html',
    styleUrl: './admin-layout.css'
})
export class AdminLayoutComponent {
    @ViewChild(AdminSidebarComponent) sidebar!: AdminSidebarComponent;

    readonly icons = { Menu };
    readonly isMobile = signal(false);

    private readonly MOBILE_BREAKPOINT = 768;

    constructor() {
        this.checkViewport();
    }

    @HostListener('window:resize')
    onResize(): void {
        this.checkViewport();
    }

    private checkViewport(): void {
        this.isMobile.set(window.innerWidth < this.MOBILE_BREAKPOINT);
    }

    openMobileSidebar(): void {
        this.sidebar?.openMobile();
    }
}
