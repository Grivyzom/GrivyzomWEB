import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    CalendarEvent,
    CalendarEventState,
    EventCategory,
    EventCategoryType,
    CalendarDay,
    MonthData,
    CalendarEventApiResponse,
    EventsResponse,
    CategoriesResponse,
    MONTH_NAMES_ES,
    DAY_NAMES_SHORT_ES,
    EVENT_CATEGORY_CONFIG
} from '../models/calendar-event.models';

@Injectable({
    providedIn: 'root'
})
export class CalendarEventService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/events`;

    // ========================================================================
    // STATE
    // ========================================================================

    private readonly state = signal<CalendarEventState>({
        events: [],
        categories: this.getDefaultCategories(),
        currentMonth: new Date(),
        selectedDate: null,
        selectedEvent: null,
        activeCategories: [],
        showCompletedEvents: false,
        loading: false,
        error: null
    });

    // ========================================================================
    // PUBLIC SELECTORS (Computed Signals)
    // ========================================================================

    readonly events = computed(() => this.state().events);
    readonly categories = computed(() => this.state().categories);
    readonly currentMonth = computed(() => this.state().currentMonth);
    readonly selectedDate = computed(() => this.state().selectedDate);
    readonly selectedEvent = computed(() => this.state().selectedEvent);
    readonly loading = computed(() => this.state().loading);
    readonly error = computed(() => this.state().error);
    readonly activeCategories = computed(() => this.state().activeCategories);

    // Filtered Events (by category and completion status)
    readonly filteredEvents = computed(() => {
        const { events, activeCategories, showCompletedEvents } = this.state();
        let filtered = events;

        // Filter by category
        if (activeCategories.length > 0) {
            filtered = filtered.filter(e => activeCategories.includes(e.category));
        }

        // Filter by status
        if (!showCompletedEvents) {
            filtered = filtered.filter(e => e.status !== 'completed');
        }

        return filtered;
    });

    // Events for current month
    readonly currentMonthEvents = computed(() => {
        const month = this.state().currentMonth;
        return this.getEventsForMonth(month.getFullYear(), month.getMonth());
    });

    // Upcoming events (next 7 days)
    readonly upcomingEvents = computed(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        return this.filteredEvents()
            .filter(e => {
                const eventDate = new Date(e.date);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate >= now && eventDate <= weekFromNow && e.status === 'upcoming';
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    // Month calendar data with events
    readonly monthData = computed(() => this.buildMonthData());

    // ========================================================================
    // API METHODS
    // ========================================================================

    /**
     * Loads all events from API
     */
    loadEvents(): Observable<CalendarEvent[]> {
        this.updateState({ loading: true, error: null });

        return this.http.get<CalendarEventApiResponse<EventsResponse>>(`${this.apiUrl}/`).pipe(
            tap(response => {
                if (response.success) {
                    this.updateState({
                        events: response.data.events,
                        loading: false
                    });
                }
            }),
            map(response => response.data.events),
            catchError(error => {
                console.error('Error loading events:', error);
                this.updateState({
                    loading: false,
                    error: 'No se pudieron cargar los eventos. Por favor, intenta más tarde.'
                });
                return of([]);
            })
        );
    }

    /**
     * Loads events for a specific date range
     */
    loadEventsForRange(startDate: string, endDate: string): Observable<CalendarEvent[]> {
        this.updateState({ loading: true, error: null });

        return this.http.get<CalendarEventApiResponse<EventsResponse>>(
            `${this.apiUrl}/?start_date=${startDate}&end_date=${endDate}`
        ).pipe(
            tap(response => {
                if (response.success) {
                    this.updateState({
                        events: response.data.events,
                        loading: false
                    });
                }
            }),
            map(response => response.data.events),
            catchError(error => {
                console.error('Error loading events for range:', error);
                this.updateState({
                    loading: false,
                    error: 'No se pudieron cargar los eventos.'
                });
                return of([]);
            })
        );
    }

    /**
     * Gets a single event by ID
     */
    getEventById(id: string): Observable<CalendarEvent | null> {
        return this.http.get<CalendarEventApiResponse<{ event: CalendarEvent }>>(`${this.apiUrl}/${id}/`).pipe(
            tap(response => {
                if (response.success) {
                    this.selectEvent(response.data.event);
                }
            }),
            map(response => response.data.event),
            catchError(error => {
                console.error('Error loading event:', error);
                return of(null);
            })
        );
    }

    /**
     * Loads event categories from API
     */
    loadCategories(): Observable<EventCategory[]> {
        return this.http.get<CalendarEventApiResponse<CategoriesResponse>>(`${this.apiUrl}/categories/`).pipe(
            tap(response => {
                if (response.success) {
                    this.updateState({ categories: response.data.categories });
                }
            }),
            map(response => response.data.categories),
            catchError(error => {
                console.error('Error loading categories:', error);
                // Keep default categories if API fails
                return of(this.getDefaultCategories());
            })
        );
    }

    // ========================================================================
    // NAVIGATION & SELECTION
    // ========================================================================

    /**
     * Navigate to next month
     */
    nextMonth(): void {
        const current = this.state().currentMonth;
        const next = new Date(current.getFullYear(), current.getMonth() + 1, 1);
        this.updateState({ currentMonth: next });
    }

    /**
     * Navigate to previous month
     */
    previousMonth(): void {
        const current = this.state().currentMonth;
        const prev = new Date(current.getFullYear(), current.getMonth() - 1, 1);
        this.updateState({ currentMonth: prev });
    }

    /**
     * Go to specific month
     */
    goToMonth(year: number, month: number): void {
        const date = new Date(year, month, 1);
        this.updateState({ currentMonth: date });
    }

    /**
     * Go to today's month
     */
    goToToday(): void {
        this.updateState({ currentMonth: new Date() });
    }

    /**
     * Select a specific date
     */
    selectDate(date: Date | null): void {
        this.updateState({ selectedDate: date });
    }

    /**
     * Select a specific event
     */
    selectEvent(event: CalendarEvent | null): void {
        this.updateState({ selectedEvent: event });
    }

    // ========================================================================
    // FILTERS
    // ========================================================================

    /**
     * Toggle a category filter
     */
    toggleCategory(category: EventCategoryType): void {
        const current = this.state().activeCategories;
        const updated = current.includes(category)
            ? current.filter(c => c !== category)
            : [...current, category];
        this.updateState({ activeCategories: updated });
    }

    /**
     * Set active categories
     */
    setActiveCategories(categories: EventCategoryType[]): void {
        this.updateState({ activeCategories: categories });
    }

    /**
     * Clear all category filters
     */
    clearCategoryFilters(): void {
        this.updateState({ activeCategories: [] });
    }

    /**
     * Toggle show completed events
     */
    toggleShowCompleted(): void {
        this.updateState({ showCompletedEvents: !this.state().showCompletedEvents });
    }

    // ========================================================================
    // HELPER METHODS
    // ========================================================================

    /**
     * Builds calendar grid data for current month
     */
    private buildMonthData(): MonthData {
        const currentMonth = this.state().currentMonth;
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        // Get first day of month and last day of month
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        // Calculate padding days from previous month
        const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
        const lastDayOfPrevMonth = new Date(year, month, 0);

        // Build calendar days array
        const days: CalendarDay[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Add days from previous month (padding)
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const day = lastDayOfPrevMonth.getDate() - i;
            const date = new Date(year, month - 1, day);
            days.push(this.createCalendarDay(date, false, today));
        }

        // Add days from current month
        for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
            const date = new Date(year, month, day);
            days.push(this.createCalendarDay(date, true, today));
        }

        // Add days from next month to complete the grid (6 weeks)
        const remainingDays = 42 - days.length; // 6 weeks * 7 days
        for (let day = 1; day <= remainingDays; day++) {
            const date = new Date(year, month + 1, day);
            days.push(this.createCalendarDay(date, false, today));
        }

        // Split into weeks
        const weeks: CalendarDay[][] = [];
        for (let i = 0; i < days.length; i += 7) {
            weeks.push(days.slice(i, i + 7));
        }

        return {
            year,
            month,
            monthName: MONTH_NAMES_ES[month],
            weeks
        };
    }

    /**
     * Creates a calendar day object
     */
    private createCalendarDay(date: Date, isCurrentMonth: boolean, today: Date): CalendarDay {
        const dateOnly = new Date(date);
        dateOnly.setHours(0, 0, 0, 0);

        const eventsForDay = this.getEventsForDate(dateOnly);

        return {
            date: dateOnly,
            dayNumber: date.getDate(),
            isCurrentMonth,
            isToday: dateOnly.getTime() === today.getTime(),
            isPast: dateOnly < today,
            hasEvents: eventsForDay.length > 0,
            events: eventsForDay
        };
    }

    /**
     * Gets events for a specific month
     */
    private getEventsForMonth(year: number, month: number): CalendarEvent[] {
        return this.filteredEvents().filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getFullYear() === year && eventDate.getMonth() === month;
        });
    }

    /**
     * Gets events for a specific date
     */
    getEventsForDate(date: Date): CalendarEvent[] {
        const dateOnly = new Date(date);
        dateOnly.setHours(0, 0, 0, 0);

        return this.filteredEvents().filter(event => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate.getTime() === dateOnly.getTime();
        });
    }

    /**
     * Gets default categories configuration
     */
    private getDefaultCategories(): EventCategory[] {
        return Object.entries(EVENT_CATEGORY_CONFIG).map(([id, config]) => ({
            id: id as EventCategoryType,
            name: config.name,
            icon: config.icon,
            color: config.color
        }));
    }

    /**
     * Updates partial state
     */
    private updateState(partialState: Partial<CalendarEventState>): void {
        this.state.update(current => ({ ...current, ...partialState }));
    }
}
