import { Component, Output, EventEmitter, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseModalComponent } from '../../base-modal/base-modal';
import { CalendarMonthViewComponent } from '../calendar-month-view/calendar-month-view';
import { EventListViewComponent } from '../event-list-view/event-list-view';
import { EventCategoryFilterComponent } from '../event-category-filter/event-category-filter';
import { EventDetailPanelComponent } from '../event-detail-panel/event-detail-panel';
import { CalendarEventService } from '../../../services/calendar-event.service';

@Component({
    selector: 'app-event-calendar-modal',
    standalone: true,
    imports: [
        CommonModule,
        BaseModalComponent,
        CalendarMonthViewComponent,
        EventListViewComponent,
        EventCategoryFilterComponent,
        EventDetailPanelComponent
    ],
    templateUrl: './event-calendar-modal.html',
    styleUrl: './event-calendar-modal.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventCalendarModalComponent implements OnInit {
    @Output() onClose = new EventEmitter<void>();

    private readonly calendarService = inject(CalendarEventService);

    // Service signals
    protected readonly selectedEvent = this.calendarService.selectedEvent;
    protected readonly currentMonth = this.calendarService.currentMonth;

    ngOnInit(): void {
        // Load events and categories when modal opens
        this.calendarService.loadEvents().subscribe();
        this.calendarService.loadCategories().subscribe();
    }

    /**
     * Close the modal
     */
    close(): void {
        // Clear selected event when closing
        this.calendarService.selectEvent(null);
        this.calendarService.selectDate(null);
        this.onClose.emit();
    }

    /**
     * Close the detail panel
     */
    closeDetailPanel(): void {
        this.calendarService.selectEvent(null);
    }
}
