import { Component, Input, Output, EventEmitter, signal, computed, HostListener, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ChevronDown } from 'lucide-angular';

/**
 * Representa un ítem del dropdown
 */
export interface DropdownItem {
    label?: string;
    url?: string;
    icon?: any;
    divider?: boolean;
    action?: () => void;
    external?: boolean; // Para enlaces externos (abre en nueva pestaña)
}

@Component({
    selector: 'app-nav-dropdown',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule],
    templateUrl: './nav-dropdown.html',
    styleUrl: './nav-dropdown.css',
})
export class NavDropdownComponent {
    private readonly elementRef = inject(ElementRef);

    // Inputs
    @Input() label: string = '';
    @Input() items: DropdownItem[] = [];
    @Input() icon: any = null;
    @Input() align: 'left' | 'right' = 'left';
    @Input() triggerClass: string = '';

    // Outputs
    @Output() itemClick = new EventEmitter<DropdownItem>();

    // State
    readonly isOpen = signal(false);
    readonly ChevronDownIcon = ChevronDown;

    // Computed
    readonly ariaExpanded = computed(() => this.isOpen().toString());

    /**
     * Toggle dropdown state
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
    }

    /**
     * Handle item click
     */
    onItemClick(item: DropdownItem, event: Event): void {
        if (item.action) {
            event.preventDefault();
            item.action();
        }
        this.itemClick.emit(item);
        this.close();
    }

    /**
     * Close dropdown when clicking outside
     */
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.close();
        }
    }

    /**
     * Handle keyboard navigation
     */
    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            this.close();
        }
    }
}
