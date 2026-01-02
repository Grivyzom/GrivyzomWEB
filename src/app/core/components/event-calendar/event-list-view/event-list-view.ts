import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Calendar, Clock, MapPin, Trophy, Users } from 'lucide-angular';
import { CalendarEventService } from '../../../services/calendar-event.service';
import { CalendarEvent, EVENT_CATEGORY_CONFIG, formatEventDateShort, formatEventTime } from '../../../models/calendar-event.models';

@Component({
    selector: 'app-event-list-view',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './event-list-view.html',
    styleUrl: './event-list-view.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventListViewComponent {
    private readonly calendarService = inject(CalendarEventService);

    // Icons
    protected readonly icons = { Calendar, Clock, MapPin, Trophy, Users };

    // Signals from service
    protected readonly selectedDate = this.calendarService.selectedDate;
    protected readonly upcomingEvents = this.calendarService.upcomingEvents;

    // Events to display (either for selected date or upcoming)
    protected readonly displayEvents = computed(() => {
        const selectedDate = this.selectedDate();
        if (selectedDate) {
            // Show events for selected date
            return this.calendarService.getEventsForDate(selectedDate);
        }
        // Show upcoming events
        return this.upcomingEvents();
    });

    // Title for the list section
    protected readonly listTitle = computed(() => {
        const selectedDate = this.selectedDate();
        if (selectedDate) {
            return this.formatDate(selectedDate);
        }
        return 'Próximos Eventos';
    });

    /**
     * Select an event to view details
     */
    selectEvent(event: CalendarEvent): void {
        this.calendarService.selectEvent(event);
    }

    /**
     * Clear selected date filter
     */
    clearDateFilter(): void {
        this.calendarService.selectDate(null);
    }

    /**
     * Get category configuration
     */
    getCategoryConfig(category: string) {
        return EVENT_CATEGORY_CONFIG[category as keyof typeof EVENT_CATEGORY_CONFIG] || {
            name: category,
            icon: '📅',
            color: '#6b7280',
            bgColor: '#f9fafb'
        };
    }

    /**
     * Format date for display
     */
    formatDate(date: Date): string {
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    }

    /**
     * Format event date
     */
    formatEventDate(dateString: string): string {
        return formatEventDateShort(dateString);
    }

    /**
     * Format event time
     */
    formatEventTime(startTime: string, endTime?: string): string {
        return formatEventTime(startTime, endTime);
    }

    /**
     * Get status badge class
     */
    getStatusClass(status: string): string {
        const classes: Record<string, string> = {
            'upcoming': 'status-upcoming',
            'ongoing': 'status-ongoing',
            'completed': 'status-completed',
            'cancelled': 'status-cancelled'
        };
        return classes[status] || 'status-upcoming';
    }

    /**
     * Get status label
     */
    getStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            'upcoming': 'Próximamente',
            'ongoing': 'En curso',
            'completed': 'Finalizado',
            'cancelled': 'Cancelado'
        };
        return labels[status] || status;
    }
}
