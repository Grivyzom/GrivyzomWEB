import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronLeft, ChevronRight } from 'lucide-angular';
import { CalendarEventService } from '../../../services/calendar-event.service';
import { CalendarDay, EVENT_CATEGORY_CONFIG, DAY_NAMES_SHORT_ES } from '../../../models/calendar-event.models';

@Component({
    selector: 'app-calendar-month-view',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './calendar-month-view.html',
    styleUrl: './calendar-month-view.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarMonthViewComponent {
    private readonly calendarService = inject(CalendarEventService);

    // Icons
    protected readonly icons = { ChevronLeft, ChevronRight };

    // Signals from service
    protected readonly monthData = this.calendarService.monthData;
    protected readonly currentMonth = this.calendarService.currentMonth;
    protected readonly selectedDate = this.calendarService.selectedDate;

    // Constants
    protected readonly DAY_NAMES = DAY_NAMES_SHORT_ES;

    /**
     * Navigate to previous month
     */
    previousMonth(): void {
        this.calendarService.previousMonth();
    }

    /**
     * Navigate to next month
     */
    nextMonth(): void {
        this.calendarService.nextMonth();
    }

    /**
     * Go to today's month
     */
    goToToday(): void {
        this.calendarService.goToToday();
    }

    /**
     * Select a day (if it has events)
     */
    selectDay(day: CalendarDay): void {
        if (day.hasEvents) {
            this.calendarService.selectDate(day.date);
        }
    }

    /**
     * Check if a day is selected
     */
    isDaySelected(day: CalendarDay): boolean {
        const selected = this.selectedDate();
        if (!selected) return false;
        return day.date.getTime() === selected.getTime();
    }

    /**
     * Gets the category color
     */
    getCategoryColor(category: string): string {
        return EVENT_CATEGORY_CONFIG[category as keyof typeof EVENT_CATEGORY_CONFIG]?.color || '#6b7280';
    }
}
