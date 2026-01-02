import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ShoppingCart, Unlock, Clock, Infinity, Terminal } from 'lucide-angular';
import { FeatureProduct, RARITY_COLORS, DURATION_LABELS } from '../../../models/store.models';

@Component({
    selector: 'app-feature-card',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './feature-card.html',
    styleUrls: ['./feature-card.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeatureCardComponent {
    readonly icons = { ShoppingCart, Unlock, Clock, Infinity, Terminal };
    readonly rarityColors = RARITY_COLORS;
    readonly durationLabels = DURATION_LABELS;

    @Input({ required: true }) feature!: FeatureProduct;
    @Output() addToCart = new EventEmitter<FeatureProduct>();

    get durationLabel(): string {
        return this.durationLabels[this.feature.duration] || 'Permanente';
    }

    get durationIcon(): any {
        return this.feature.duration === 'permanent' ? this.icons.Infinity : this.icons.Clock;
    }

    get isPermanent(): boolean {
        return this.feature.duration === 'permanent';
    }

    get rarityBorder(): string {
        return this.rarityColors[this.feature.rarity].border;
    }

    onAddToCart(): void {
        this.addToCart.emit(this.feature);
    }
}
