import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { LucideAngularModule, X, Calendar, Clock, MapPin, Users, Trophy, ExternalLink } from 'lucide-angular';
import { CalendarEvent, EVENT_CATEGORY_CONFIG, RARITY_COLORS, formatEventDate, formatEventTime } from '../../../models/calendar-event.models';
import { EventCompletionButtonComponent } from '../event-completion-button/event-completion-button';

@Component({
    selector: 'app-event-detail-panel',
    standalone: true,
    imports: [CommonModule, LucideAngularModule, EventCompletionButtonComponent],
    templateUrl: './event-detail-panel.html',
    styleUrl: './event-detail-panel.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('slideInRight', [
            transition(':enter', [
                style({ transform: 'translateX(100%)', opacity: 0 }),
                animate('400ms cubic-bezier(0.16, 1, 0.3, 1)', style({ transform: 'translateX(0)', opacity: 1 }))
            ]),
            transition(':leave', [
                animate('300ms cubic-bezier(0.4, 0, 1, 1)', style({ transform: 'translateX(100%)', opacity: 0 }))
            ])
        ])
    ]
})
export class EventDetailPanelComponent {
    @Input({ required: true }) event!: CalendarEvent;
    @Output() onClose = new EventEmitter<void>();

    // Icons
    protected readonly icons = { X, Calendar, Clock, MapPin, Users, Trophy, ExternalLink };

    /**
     * Close the detail panel
     */
    close(): void {
        this.onClose.emit();
    }

    /**
     * Get category configuration
     */
    getCategoryConfig() {
        return EVENT_CATEGORY_CONFIG[this.event.category];
    }

    /**
     * Format event date
     */
    get formattedDate(): string {
        return formatEventDate(this.event.date);
    }

    /**
     * Format event time
     */
    get formattedTime(): string {
        return formatEventTime(this.event.startTime, this.event.endTime);
    }

    /**
     * Get status label
     */
    get statusLabel(): string {
        const labels: Record<string, string> = {
            'upcoming': 'Próximamente',
            'ongoing': 'En curso',
            'completed': 'Finalizado',
            'cancelled': 'Cancelado'
        };
        return labels[this.event.status] || this.event.status;
    }

    /**
     * Get rarity colors for a prize
     */
    getRarityColors(rarity?: string) {
        if (!rarity) return RARITY_COLORS.common;
        return RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] || RARITY_COLORS.common;
    }

    /**
     * Get rarity label
     */
    getRarityLabel(rarity?: string): string {
        const labels: Record<string, string> = {
            'common': 'Común',
            'rare': 'Raro',
            'epic': 'Épico',
            'legendary': 'Legendario'
        };
        return labels[rarity || 'common'] || 'Común';
    }

    /**
     * Get position label for prizes
     */
    getPositionLabel(position?: number): string {
        if (!position) return '';
        const labels: Record<number, string> = {
            1: '🥇 1er Lugar',
            2: '🥈 2do Lugar',
            3: '🥉 3er Lugar'
        };
        return labels[position] || `${position}º Lugar`;
    }

    /**
     * Handle registration click
     */
    register(): void {
        if (this.event.registrationUrl) {
            window.open(this.event.registrationUrl, '_blank');
        }
    }

    /**
     * Handle event completion
     */
    onEventCompleted(): void {
        // Update event state locally
        this.event.user_has_completed = true;
        this.event.user_participation_status = 'claimed';
    }
}
