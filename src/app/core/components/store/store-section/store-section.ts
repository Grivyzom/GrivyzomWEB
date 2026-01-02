import { Component, Input, ChangeDetectionStrategy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronLeft, ChevronRight } from 'lucide-angular';

@Component({
    selector: 'app-store-section',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './store-section.html',
    styleUrls: ['./store-section.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreSectionComponent {
    @Input() title: string = '';
    @Input() subtitle: string = '';
    @Input() icon: string = '';
    @Input() id: string = '';
    @Input() columns: 2 | 3 | 4 = 3;
    @Input() compact: boolean = false;
    @Input() slider: boolean = false;

    @ViewChild('sliderContainer') sliderContainer!: ElementRef<HTMLDivElement>;

    readonly icons = { ChevronLeft, ChevronRight };

    scrollLeft(): void {
        if (this.sliderContainer) {
            this.sliderContainer.nativeElement.scrollBy({
                left: -320,
                behavior: 'smooth'
            });
        }
    }

    scrollRight(): void {
        if (this.sliderContainer) {
            this.sliderContainer.nativeElement.scrollBy({
                left: 320,
                behavior: 'smooth'
            });
        }
    }
}
