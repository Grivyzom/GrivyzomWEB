import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ChevronRight } from 'lucide-angular';

export interface Breadcrumb {
    label: string;
    route?: string;
}

@Component({
    selector: 'app-admin-header',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule],
    templateUrl: './admin-header.html',
    styleUrl: './admin-header.css'
})
export class AdminHeaderComponent {
    @Input() title: string = '';
    @Input() subtitle: string = '';
    @Input() breadcrumbs: Breadcrumb[] = [];

    readonly icons = { ChevronRight };
}
