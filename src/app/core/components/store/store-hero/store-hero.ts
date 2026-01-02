import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Clock, ArrowRight, Sparkles } from 'lucide-angular';
import { Offer } from '../../../models/store.models';

@Component({
    selector: 'app-store-hero',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './store-hero.html',
    styleUrls: ['./store-hero.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreHeroComponent {
    readonly icons = { Clock, ArrowRight, Sparkles };

    @Input() offer: Offer | null = null;
    @Input() title: string = '¡Bienvenido a la Tienda!';
    @Input() subtitle: string = 'Descubre items exclusivos y mejora tu experiencia';
    @Input() backgroundUrl: string = '';

    @Output() ctaClick = new EventEmitter<void>();
    @Output() offerClick = new EventEmitter<Offer>();

    onCtaClick(): void {
        if (this.offer) {
            this.offerClick.emit(this.offer);
        } else {
            this.ctaClick.emit();
        }
    }
}
