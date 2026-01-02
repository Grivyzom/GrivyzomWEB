import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarEventService } from '../../../services/calendar-event.service';
import { EventCategoryType, EVENT_CATEGORY_CONFIG } from '../../../models/calendar-event.models';

@Component({
    selector: 'app-event-category-filter',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './event-category-filter.html',
    styleUrl: './event-category-filter.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventCategoryFilterComponent {
    private readonly calendarService = inject(CalendarEventService);

    // Signals from service
    protected readonly categories = this.calendarService.categories;
    protected readonly activeCategories = this.calendarService.activeCategories;

    // Computed: Count of active filters
    protected readonly activeFilterCount = computed(() => this.activeCategories().length);

    // Computed: Check if all categories are active (or none)
    protected readonly allCategoriesActive = computed(() => this.activeCategories().length === 0);

    /**
     * Toggle a specific category
     */
    toggleCategory(category: EventCategoryType): void {
        this.calendarService.toggleCategory(category);
    }

    /**
     * Clear all category filters (show all)
     */
    showAllCategories(): void {
        this.calendarService.clearCategoryFilters();
    }

    /**
     * Check if a category is active
     */
    isCategoryActive(category: EventCategoryType): boolean {
        const active = this.activeCategories();
        return active.length === 0 || active.includes(category);
    }

    /**
     * Get category configuration
     */
    getCategoryConfig(category: EventCategoryType) {
        return EVENT_CATEGORY_CONFIG[category];
    }
}
