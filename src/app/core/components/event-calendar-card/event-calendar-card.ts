import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Calendar, ChevronLeft, ChevronRight } from 'lucide-angular';
import { EventCalendarModalComponent } from '../event-calendar/event-calendar-modal/event-calendar-modal';
import { CalendarEventService } from '../../services/calendar-event.service';
import { DAY_NAMES_SHORT_ES, EVENT_CATEGORY_CONFIG } from '../../models/calendar-event.models';

@Component({
    selector: 'app-event-calendar-card',
    standalone: true,
    imports: [CommonModule, LucideAngularModule, EventCalendarModalComponent],
    templateUrl: './event-calendar-card.html',
    styleUrl: './event-calendar-card.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventCalendarCardComponent implements OnInit {
    private readonly calendarService = inject(CalendarEventService);

    // Icons
    protected readonly icons = { Calendar, ChevronLeft, ChevronRight };

    // Signals from service
    protected readonly monthData = this.calendarService.monthData;
    protected readonly currentMonth = this.calendarService.currentMonth;
    protected readonly upcomingEvents = this.calendarService.upcomingEvents;
    protected readonly loading = this.calendarService.loading;

    // Computed properties
    protected readonly upcomingCount = computed(() => this.upcomingEvents().length);
    protected readonly DAY_NAMES = DAY_NAMES_SHORT_ES;

    // Modal state
    protected readonly showModal = signal(false);

    ngOnInit(): void {
        // Load events when component initializes
        this.calendarService.loadEvents().subscribe();
    }

    /**
     * Opens the full calendar modal
     */
    openModal(): void {
        this.showModal.set(true);
    }

    /**
     * Closes the calendar modal
     */
    closeModal(): void {
        this.showModal.set(false);
    }

    /**
     * Navigate to previous month
     */
    previousMonth(event: Event): void {
        event.stopPropagation();
        this.calendarService.previousMonth();
    }

    /**
     * Navigate to next month
     */
    nextMonth(event: Event): void {
        event.stopPropagation();
        this.calendarService.nextMonth();
    }

    /**
     * Gets the category color for an event
     */
    getCategoryColor(category: string): string {
        return EVENT_CATEGORY_CONFIG[category as keyof typeof EVENT_CATEGORY_CONFIG]?.color || '#6b7280';
    }
}
